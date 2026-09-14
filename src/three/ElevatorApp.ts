import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import gsap from 'gsap';

import { buildMaterials, disposeMaterials, type SceneMaterials } from './materials';
import { createProceduralEnvMap } from './textures';
import { buildElevator, ELEVATOR_CONSTANTS, type ElevatorBuild } from './elevator';
import { buildCorridor, type CorridorBuild, type CorridorDoor } from './corridor';
import { floors, type DoorContent, type FloorContent } from './content';
import { SoundManager } from './audio';
import { disposeObject3D } from './dispose';

export type Phase = 'intro' | 'inside' | 'buttons' | 'transitioning' | 'corridor' | 'doorDetail';

export type ElevatorCallbacks = {
  onLoadingProgress: (pct: number) => void;
  onReady: () => void;
  onPhaseChange: (phase: Phase) => void;
  onFloorChange: (floor: FloorContent | null) => void;
  onDoorChange: (door: DoorContent | null) => void;
  onFadeChange: (opacity: number) => void;
};

const LERP_FACTOR = 0.08;
const SCROLL_SPEED = 0.0009;
const TOUCH_SPEED = 0.0034;
const TOUCH_DEADZONE = 15;
const INTRO_MAX = 3;

function smoothstep(t: number) {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export class ElevatorApp {
  private container: HTMLElement;
  private callbacks: ElevatorCallbacks;
  private isMobile: boolean;

  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private composer!: EffectComposer;
  private bloomPass!: UnrealBloomPass;
  private fxaaPass!: ShaderPass;

  private materials!: SceneMaterials;
  private elevator!: ElevatorBuild;
  private corridors = new Map<FloorContent['id'], CorridorBuild>();
  private activeCorridor: CorridorBuild | null = null;
  private openDoor: CorridorDoor | null = null;

  private sound = new SoundManager();

  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();

  private phase: Phase = 'intro';
  private introProgress = 0;
  private introTarget = 0;
  private corridorProgress = 0;
  private corridorTarget = 0;
  private selectedFloor: FloorContent | null = null;
  private inputLocked = false;

  private touchStartY = 0;
  private touchLastY = 0;
  private touchVelocity = 0;
  private touchActive = false;
  private wheelAccum = 0;

  private disposed = false;
  private frameId = 0;
  private resizeObserver: ResizeObserver;

  constructor(container: HTMLElement, callbacks: ElevatorCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.isMobile = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

    this.scene.background = new THREE.Color(0x0a0a0a);
    this.scene.fog = new THREE.Fog(0x0a0a0a, 8, 25);

    this.camera = new THREE.PerspectiveCamera(
      this.isMobile ? 65 : 55,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.1,
      100,
    );
    this.camera.position.set(0, 1.6, 5);

    // The renderer's own antialias flag does nothing once post-processing is
    // in play — EffectComposer renders into a non-multisampled target — so
    // real AA comes from the FXAA pass in setupComposer() instead.
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.domElement.style.touchAction = 'none';
    container.appendChild(this.renderer.domElement);

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(container);

    this.setupComposer();
    this.bindInput();
    void this.boot();
  }

  private setupComposer() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    const pixelRatio = this.renderer.getPixelRatio();

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    // Bloom runs at a lower internal resolution on mobile — it stays a soft
    // glow either way, so the extra samples on a phone GPU aren't worth it.
    const bloomScale = this.isMobile ? 0.5 : 1;
    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(w * bloomScale, h * bloomScale), 0.35, 0.4, 0.78);
    this.composer.addPass(this.bloomPass);

    this.fxaaPass = new ShaderPass(FXAAShader);
    this.fxaaPass.material.uniforms['resolution'].value.set(1 / (w * pixelRatio), 1 / (h * pixelRatio));
    this.composer.addPass(this.fxaaPass);

    this.composer.addPass(new OutputPass());
  }

  private async boot() {
    this.callbacks.onLoadingProgress(8);

    const envMap = createProceduralEnvMap(this.renderer);
    this.scene.environment = envMap;
    this.callbacks.onLoadingProgress(28);

    this.materials = buildMaterials(envMap);
    this.callbacks.onLoadingProgress(48);

    this.buildLighting();
    this.elevator = buildElevator(this.materials, floors);
    this.scene.add(this.elevator.group);
    this.callbacks.onLoadingProgress(68);

    const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), this.materials.floorPolished);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    this.scene.add(floorMesh);

    const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(3, 3.5, 0.2), this.materials.wallDark);
    wallLeft.position.set(-2.8, 1.5, 0);
    const wallRight = new THREE.Mesh(new THREE.BoxGeometry(3, 3.5, 0.2), this.materials.wallDark);
    wallRight.position.set(2.8, 1.5, 0);
    const wallAbove = new THREE.Mesh(new THREE.BoxGeometry(8, 1.5, 0.2), this.materials.wallDark);
    wallAbove.position.set(0, 3.75, 0);
    this.scene.add(wallLeft, wallRight, wallAbove);

    this.callbacks.onLoadingProgress(85);

    // Warm up the audio synthesis in the background; it never blocks the
    // preloader since sound stays opt-in and muted until the user asks for it.
    void this.sound.init();

    this.callbacks.onLoadingProgress(100);
    this.callbacks.onReady();

    this.animate();
  }

  private buildLighting() {
    const ambient = new THREE.AmbientLight(0x222222, 0.4);
    this.scene.add(ambient);

    const mainLight = new THREE.SpotLight(0xfff5e0, 6, 20, Math.PI / 4, 0.5, 1.5);
    mainLight.position.set(0, 4, 3);
    mainLight.castShadow = true;
    const shadowSize = this.isMobile ? 512 : 1024;
    mainLight.shadow.mapSize.set(shadowSize, shadowSize);
    this.scene.add(mainLight, mainLight.target);

    const fillLight = new THREE.PointLight(0xc8a85c, 1.2, 10);
    fillLight.position.set(0, 3, 0);
    this.scene.add(fillLight);

    const elevatorLight = new THREE.PointLight(0xfff5e0, 2.2, 6);
    elevatorLight.position.set(0, 2.4, -2);
    this.scene.add(elevatorLight);
  }

  // ─── Input ───────────────────────────────────────────────────────────
  private onWheel = (e: WheelEvent) => {
    if (this.inputLocked) return;
    e.preventDefault();
    this.wheelAccum += e.deltaY * SCROLL_SPEED;
  };

  private onTouchStart = (e: TouchEvent) => {
    this.touchStartY = e.touches[0].clientY;
    this.touchLastY = this.touchStartY;
    this.touchActive = true;
    this.touchVelocity = 0;
  };

  private onTouchMove = (e: TouchEvent) => {
    if (!this.touchActive) return;
    e.preventDefault();
    if (this.inputLocked) return;
    const y = e.touches[0].clientY;
    const totalDelta = this.touchStartY - y;
    if (Math.abs(totalDelta) < TOUCH_DEADZONE) return;
    const delta = this.touchLastY - y;
    this.touchLastY = y;
    this.touchVelocity = delta;
    this.wheelAccum += delta * TOUCH_SPEED;
  };

  private onTouchEnd = () => {
    this.touchActive = false;
    // A short momentum tail on release, matching the "inertia" requirement.
    let vel = this.touchVelocity;
    const step = () => {
      if (Math.abs(vel) < 0.05 || this.inputLocked) return;
      this.wheelAccum += vel * TOUCH_SPEED * 0.6;
      vel *= 0.9;
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  private onPointerMove = (e: PointerEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    if (e.pointerType !== 'mouse') return;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    let hovering = false;
    if (this.phase === 'buttons') {
      hovering = this.raycaster.intersectObjects(this.elevator.buttons.map((b) => b.hitMesh)).length > 0;
    } else if (this.phase === 'corridor' && this.activeCorridor) {
      hovering = this.raycaster.intersectObjects(this.activeCorridor.doors.map((d) => d.panelMesh)).length > 0;
    }
    this.renderer.domElement.style.cursor = hovering ? 'pointer' : 'default';
  };

  private onClick = (e: MouseEvent | TouchEvent) => {
    if (this.inputLocked) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    const point =
      'changedTouches' in e && e.changedTouches.length > 0
        ? e.changedTouches[0]
        : (e as MouseEvent);
    this.pointer.x = ((point.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((point.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);

    if (this.phase === 'buttons') {
      const hits = this.raycaster.intersectObjects(this.elevator.buttons.map((b) => b.hitMesh));
      if (hits.length > 0) {
        const floorId = hits[0].object.userData.floorId as FloorContent['id'];
        this.selectFloor(floorId);
      }
    } else if (this.phase === 'corridor' && this.activeCorridor) {
      const hits = this.raycaster.intersectObjects(this.activeCorridor.doors.map((d) => d.panelMesh));
      if (hits.length > 0) {
        const roomCode = hits[0].object.userData.roomCode as string;
        const door = this.activeCorridor.doors.find((d) => d.content.roomCode === roomCode);
        if (door) this.openCorridorDoor(door);
      }
    }
  };

  private bindInput() {
    const el = this.renderer.domElement;
    window.addEventListener('wheel', this.onWheel, { passive: false });
    el.addEventListener('touchstart', this.onTouchStart, { passive: true });
    el.addEventListener('touchmove', this.onTouchMove, { passive: false });
    el.addEventListener('touchend', this.onTouchEnd, { passive: true });
    el.addEventListener('pointermove', this.onPointerMove);
    el.addEventListener('click', this.onClick);
    el.addEventListener('touchend', this.onClick);
  }

  private unbindInput() {
    const el = this.renderer.domElement;
    window.removeEventListener('wheel', this.onWheel);
    el.removeEventListener('touchstart', this.onTouchStart);
    el.removeEventListener('touchmove', this.onTouchMove);
    el.removeEventListener('touchend', this.onTouchEnd);
    el.removeEventListener('pointermove', this.onPointerMove);
    el.removeEventListener('click', this.onClick);
    el.removeEventListener('touchend', this.onClick);
  }

  private onResize() {
    const w = this.container.clientWidth;
    const h = Math.max(1, this.container.clientHeight);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);

    // EffectComposer.setSize resets every pass to the full resolution, so
    // the mobile-scaled bloom target and the FXAA uniform need reapplying.
    const bloomScale = this.isMobile ? 0.5 : 1;
    this.bloomPass.setSize(w * bloomScale, h * bloomScale);
    const pixelRatio = this.renderer.getPixelRatio();
    this.fxaaPass.material.uniforms['resolution'].value.set(1 / (w * pixelRatio), 1 / (h * pixelRatio));
  }

  // ─── Public API for the React shell ─────────────────────────────────
  setSoundEnabled(enabled: boolean) {
    this.sound.setEnabled(enabled);
  }

  isSoundEnabled() {
    return this.sound.isEnabled();
  }

  /** Global back control: closes an open door, exits a corridor, or no-ops in the lobby. */
  goBack() {
    if (this.inputLocked) return;
    if (this.phase === 'doorDetail' && this.openDoor) {
      this.closeCorridorDoor();
      return;
    }
    if (this.phase === 'corridor') {
      this.returnToLobby();
    }
  }

  private setPhase(phase: Phase) {
    if (this.phase === phase) return;
    this.phase = phase;
    this.callbacks.onPhaseChange(phase);
  }

  private selectFloor(floorId: FloorContent['id']) {
    if (this.inputLocked) return;
    const floor = floors.find((f) => f.id === floorId);
    if (!floor) return;

    this.inputLocked = true;
    this.selectedFloor = floor;
    this.callbacks.onFloorChange(floor);
    this.sound.playClick();

    this.elevator.buttons.forEach((b) => {
      const lit = b.floorId === floorId;
      b.lit = lit;
      b.dotMesh.material = (lit ? this.materials.buttonLit : this.materials.buttonOff).clone();
    });

    if (!this.corridors.has(floorId)) {
      this.corridors.set(floorId, buildCorridor(this.materials, floor));
      this.scene.add(this.corridors.get(floorId)!.group);
      this.corridors.get(floorId)!.group.visible = false;
    }

    this.setPhase('transitioning');
    const tl = gsap.timeline({ onComplete: () => (this.inputLocked = false) });
    const fadeState = { v: 0 };
    tl.call(() => this.sound.playDoor());
    tl.to(this.elevator.interiorDoorLeft.position, { x: -ELEVATOR_CONSTANTS.DOOR_HALF_WIDTH * 0.15, duration: 0.6, ease: 'power2.inOut' }, 0);
    tl.to(this.elevator.interiorDoorRight.position, { x: ELEVATOR_CONSTANTS.DOOR_HALF_WIDTH * 0.15, duration: 0.6, ease: 'power2.inOut' }, 0);
    tl.call(() => this.sound.playRumble());
    tl.to({}, { duration: 1.1, onUpdate: () => this.shakeCamera(0.012) });
    tl.to(fadeState, { v: 1, duration: 0.35, onUpdate: () => this.callbacks.onFadeChange(fadeState.v) });
    tl.call(() => {
      if (this.activeCorridor) this.activeCorridor.group.visible = false;
      this.activeCorridor = this.corridors.get(floorId)!;
      this.activeCorridor.group.visible = true;
      this.corridorProgress = 0;
      this.corridorTarget = 0;
      this.camera.position.set(0, 1.6, -1.4);
      this.camera.lookAt(0, 1.5, -8);
    });
    tl.to(fadeState, { v: 0, duration: 0.45, onUpdate: () => this.callbacks.onFadeChange(fadeState.v) });
    tl.to(this.elevator.interiorDoorLeft.position, { x: -ELEVATOR_CONSTANTS.DOOR_HALF_WIDTH * 1.05, duration: 0.5, ease: 'power2.out' }, '<');
    tl.to(this.elevator.interiorDoorRight.position, { x: ELEVATOR_CONSTANTS.DOOR_HALF_WIDTH * 1.05, duration: 0.5, ease: 'power2.out' }, '<');
    tl.call(() => {
      this.sound.playDing();
      this.setPhase('corridor');
    });
  }

  private returnToLobby() {
    if (!this.selectedFloor) return;
    this.inputLocked = true;
    const tl = gsap.timeline({ onComplete: () => (this.inputLocked = false) });
    const fadeState = { v: 0 };
    tl.call(() => this.sound.playDoor());
    tl.to(fadeState, { v: 1, duration: 0.4, onUpdate: () => this.callbacks.onFadeChange(fadeState.v) });
    tl.call(() => {
      if (this.activeCorridor) this.activeCorridor.group.visible = false;
      this.activeCorridor = null;
      this.selectedFloor = null;
      this.callbacks.onFloorChange(null);
      this.elevator.buttons.forEach((b) => {
        b.lit = false;
        b.dotMesh.material = this.materials.buttonOff.clone();
      });
      this.introProgress = INTRO_MAX;
      this.introTarget = INTRO_MAX;
      this.camera.position.set(0.3, 1.65, -1.8);
      this.camera.lookAt(0.85, 1.35, -2);
    });
    tl.to(fadeState, { v: 0, duration: 0.45, onUpdate: () => this.callbacks.onFadeChange(fadeState.v) });
    tl.call(() => {
      this.sound.playDing();
      this.setPhase('buttons');
    });
  }

  private openCorridorDoor(door: CorridorDoor) {
    if (this.openDoor === door) {
      this.closeCorridorDoor();
      return;
    }
    if (this.openDoor) this.closeCorridorDoor(true);

    this.sound.playCreak(door.side);
    this.openDoor = door;
    door.isOpen = true;
    this.callbacks.onDoorChange(door.content);
    this.setPhase('doorDetail');

    gsap.to(door.panelMesh.position, { x: door.openX, duration: 0.7, ease: 'power2.inOut' });
    door.revealMesh.visible = true;
    gsap.to(door.revealMesh.material, { opacity: 1, duration: 0.8, delay: 0.15 });
  }

  private closeCorridorDoor(skipPhaseChange = false) {
    const door = this.openDoor;
    if (!door) return;
    this.sound.playCreak(door.side);
    gsap.to(door.panelMesh.position, { x: door.closedX, duration: 0.6, ease: 'power2.inOut' });
    gsap.to(door.revealMesh.material, {
      opacity: 0,
      duration: 0.4,
      onComplete: () => {
        door.revealMesh.visible = false;
      },
    });
    door.isOpen = false;
    this.openDoor = null;
    this.callbacks.onDoorChange(null);
    if (!skipPhaseChange) this.setPhase('corridor');
  }

  private shakeCamera(amp: number) {
    const t = performance.now() * 0.02;
    this.camera.position.x += Math.sin(t * 3.1) * amp;
    this.camera.position.y += Math.cos(t * 2.7) * amp * 0.6;
  }

  // ─── Animation loop ──────────────────────────────────────────────────
  private animate = () => {
    if (this.disposed) return;
    this.frameId = requestAnimationFrame(this.animate);

    const wheel = this.wheelAccum;
    this.wheelAccum = 0;

    if (this.phase === 'intro' || this.phase === 'inside' || this.phase === 'buttons') {
      this.introTarget = clamp(this.introTarget + wheel, 0, INTRO_MAX);
      this.introProgress += (this.introTarget - this.introProgress) * LERP_FACTOR;
      this.updateLobbyCamera(this.introProgress);
    } else if (this.phase === 'corridor') {
      const maxProgress = this.activeCorridor ? 1 : 0;
      this.corridorTarget = clamp(this.corridorTarget + wheel * 0.55, 0, maxProgress);
      this.corridorProgress += (this.corridorTarget - this.corridorProgress) * LERP_FACTOR;
      this.updateCorridorCamera(this.corridorProgress, wheel);
    }

    const now = performance.now() * 0.001;
    this.camera.position.x += Math.sin(now * 0.5) * 0.002;
    this.camera.position.y += Math.cos(now * 0.7) * 0.001;

    this.elevator.buttons.forEach((b) => {
      if (b.lit) {
        const mat = b.dotMesh.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.6 + Math.sin(now * 3) * 0.3;
      }
    });

    this.composer.render();
  };

  private updateLobbyCamera(progress: number) {
    if (progress < 1) {
      this.setPhase('intro');
      const doorT = smoothstep(progress);
      this.elevator.doorLeft.position.x = -ELEVATOR_CONSTANTS.DOOR_HALF_WIDTH - doorT * 0.6;
      this.elevator.doorRight.position.x = ELEVATOR_CONSTANTS.DOOR_HALF_WIDTH + doorT * 0.6;
      this.elevator.seam.visible = doorT < 0.1;
      this.elevator.logoPlane.material.opacity = 1 - doorT;
      this.elevator.taglinePlane.material.opacity = 1 - doorT;
      this.camera.position.set(0, 1.6, 5 - doorT);
      this.camera.lookAt(0, 1.5, -1);
    } else if (progress < 2) {
      this.setPhase('inside');
      const moveT = smoothstep(progress - 1);
      this.elevator.doorLeft.position.x = -1.15;
      this.elevator.doorRight.position.x = 1.15;
      this.elevator.logoPlane.material.opacity = 0;
      this.elevator.taglinePlane.material.opacity = 0;
      this.camera.position.set(0, 1.6, 4 - moveT * 5.5);
      this.camera.lookAt(0, 1.5 + moveT * 0.2, -3);
    } else {
      this.setPhase('buttons');
      const btnT = smoothstep(progress - 2);
      this.camera.position.set(btnT * 0.15, 1.6 + btnT * 0.03, -1.5 + btnT * 0.15);
      this.camera.lookAt(btnT * 0.85, 1.35, -3 + btnT * 1.15);
    }
  }

  private updateCorridorCamera(progress: number, wheel: number) {
    if (this.openDoor) return; // camera holds steady while a door panel is being read
    const corridor = this.activeCorridor;
    if (!corridor) return;
    const eased = smoothstep(progress);
    const targetZ = -1.4 - eased * (corridor.length - 3);
    this.camera.position.set(0, 1.6, targetZ);
    this.camera.lookAt(0, 1.5, targetZ - 6);

    if (Math.abs(wheel) > 0.0001 && Math.random() < 0.15) {
      this.sound.playFootstep((Math.random() - 0.5) * 0.6);
    }
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    this.resizeObserver.disconnect();
    this.unbindInput();
    gsap.killTweensOf('*');
    this.sound.dispose();
    // Disposing the whole scene graph also covers the elevator group and
    // every built corridor, since both live under it.
    disposeObject3D(this.scene);
    if (this.materials) disposeMaterials(this.materials);
    this.scene.environment?.dispose();
    this.renderer.dispose();
    this.composer?.dispose();
    if (this.renderer.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
