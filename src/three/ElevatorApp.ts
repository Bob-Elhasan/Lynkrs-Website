import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import gsap from 'gsap';

import { buildMaterials, disposeMaterials, type SceneMaterials } from './materials';
import { createProceduralEnvMap, setTextureQuality } from './textures';
import { buildElevator, setDoorOpen, CAB, type ElevatorBuild } from './elevator';
import { buildCorridor, CORRIDOR, type CorridorBuild, type CorridorDoor } from './corridor';
import { floors, type DoorContent, type FloorContent } from './content';
import { SoundManager } from './audio';
import { disposeObject3D } from './dispose';
import { CameraRig, EYE_HEIGHT } from './cameraRig';
import { PALETTE } from './palette';

export type Phase = 'lobby' | 'entering' | 'panel' | 'travelling' | 'corridor' | 'room';

export type ElevatorCallbacks = {
  onLoadingProgress: (pct: number) => void;
  onReady: () => void;
  onPhaseChange: (phase: Phase) => void;
  onFloorChange: (floor: FloorContent | null) => void;
  onDoorChange: (door: DoorContent | null) => void;
  onFadeChange: (opacity: number) => void;
  onContactRequest: () => void;
};

const SCROLL_SPEED = 0.00085;
const TOUCH_SPEED = 0.0032;
const TOUCH_DEADZONE = 12;

/** Lobby scroll runs 0 → 3: doors open, walk in, turn to the panel. */
const LOBBY_MAX = 3;

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
  private rig: CameraRig;
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

  private phase: Phase = 'lobby';
  private lobbyProgress = 0;
  private lobbyTarget = 0;
  private corridorProgress = 0;
  private corridorTarget = 0;
  private selectedFloor: FloorContent | null = null;
  private inputLocked = false;
  private lastFootstepZ = 0;

  private touchStartY = 0;
  private touchLastY = 0;
  private touchVelocity = 0;
  private touchActive = false;
  private wheelAccum = 0;

  private disposed = false;
  private frameId = 0;
  private clock = new THREE.Clock();
  private resizeObserver: ResizeObserver;

  constructor(container: HTMLElement, callbacks: ElevatorCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.isMobile = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

    // A light room, not a void: the fog now tints toward cream so distance
    // reads as air rather than darkness.
    this.scene.background = new THREE.Color(0xc4ccd6);
    this.scene.fog = new THREE.Fog(0xc4ccd6, 20, 64);

    const camera = new THREE.PerspectiveCamera(
      this.isMobile ? 68 : 58,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.05,
      120,
    );
    this.rig = new CameraRig(camera);
    this.rig.snapTo(new THREE.Vector3(0, EYE_HEIGHT, 6.2), 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.75 : 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // Light scene, so exposure sits under 1: the cream needs headroom or it
    // clips to white and the whole set flattens out.
    this.renderer.toneMappingExposure = 0.88;
    this.renderer.domElement.style.touchAction = 'none';
    container.appendChild(this.renderer.domElement);

    setTextureQuality(this.renderer);

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(container);

    this.setupComposer();
    this.bindInput();
    void this.boot();
  }

  private get camera() {
    return this.rig.camera;
  }

  private setupComposer() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    const pixelRatio = this.renderer.getPixelRatio();

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    // Light scene, so bloom is a soft lift on the fixtures only.
    const bloomScale = this.isMobile ? 0.5 : 1;
    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(w * bloomScale, h * bloomScale), 0.22, 0.5, 0.92);
    this.composer.addPass(this.bloomPass);

    this.fxaaPass = new ShaderPass(FXAAShader);
    this.fxaaPass.material.uniforms['resolution'].value.set(1 / (w * pixelRatio), 1 / (h * pixelRatio));
    this.composer.addPass(this.fxaaPass);

    this.composer.addPass(new OutputPass());
  }

  private async boot() {
    this.callbacks.onLoadingProgress(10);

    const envMap = createProceduralEnvMap(this.renderer);
    this.scene.environment = envMap;
    this.callbacks.onLoadingProgress(30);

    this.materials = buildMaterials(envMap);
    this.callbacks.onLoadingProgress(55);

    this.buildLighting();
    this.elevator = buildElevator(this.materials, floors);
    this.scene.add(this.elevator.group);
    this.callbacks.onLoadingProgress(85);

    void this.sound.init();

    this.callbacks.onLoadingProgress(100);
    this.callbacks.onReady();

    this.clock.start();
    this.animate();
  }

  private buildLighting() {
    // A soft sky/ground fill does most of the work; everything else is
    // deliberately restrained so surfaces keep their separation.
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x9aa6b4, 0.55));
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.12));

    const key = new THREE.DirectionalLight(0xfff6ea, 1.55);
    key.position.set(3.5, 6, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(this.isMobile ? 1024 : 2048, this.isMobile ? 1024 : 2048);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 30;
    key.shadow.camera.left = -8;
    key.shadow.camera.right = 8;
    key.shadow.camera.top = 8;
    key.shadow.camera.bottom = -8;
    key.shadow.bias = -0.0012;
    key.shadow.normalBias = 0.02;
    this.scene.add(key, key.target);

    // Cool bounce from the lobby glazing, warm fill inside the car.
    const bounce = new THREE.DirectionalLight(PALETTE.blueLight, 0.22);
    bounce.position.set(-5, 3, 4);
    this.scene.add(bounce);

    const cabLight = new THREE.PointLight(PALETTE.lightWarm, 2.4, 7, 2);
    cabLight.position.set(0, CAB.height - 0.45, CAB.centerZ);
    this.scene.add(cabLight);

    const lobbyLight = new THREE.PointLight(0xffffff, 2.2, 13, 2);
    lobbyLight.position.set(0, 3.1, 3.5);
    this.scene.add(lobbyLight);
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
    if (Math.abs(this.touchStartY - y) < TOUCH_DEADZONE) return;
    const delta = this.touchLastY - y;
    this.touchLastY = y;
    this.touchVelocity = delta;
    this.wheelAccum += delta * TOUCH_SPEED;
  };

  private onTouchEnd = () => {
    this.touchActive = false;
    let vel = this.touchVelocity;
    const step = () => {
      if (Math.abs(vel) < 0.05 || this.inputLocked || this.disposed) return;
      this.wheelAccum += vel * TOUCH_SPEED * 0.55;
      vel *= 0.92;
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /** Everything the visitor can click, for the current phase. */
  private interactiveTargets(): THREE.Object3D[] {
    if (this.phase === 'panel') {
      return [...this.elevator.buttons.map((b) => b.hitMesh), this.elevator.telephone.hitMesh];
    }
    if (this.phase === 'corridor' && this.activeCorridor) {
      return [...this.activeCorridor.doors.map((d) => d.hitMesh), this.activeCorridor.returnLiftHit];
    }
    return [];
  }

  private onPointerMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObjects(this.interactiveTargets()).length > 0;
    this.renderer.domElement.style.cursor = hit ? 'pointer' : 'default';
  };

  private onClick = (e: MouseEvent | TouchEvent) => {
    if (this.inputLocked) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    const point = 'changedTouches' in e && e.changedTouches.length ? e.changedTouches[0] : (e as MouseEvent);
    this.pointer.x = ((point.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((point.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);

    const hits = this.raycaster.intersectObjects(this.interactiveTargets());
    if (!hits.length) return;
    const data = hits[0].object.userData as { kind?: string; floorId?: FloorContent['id']; roomCode?: string };

    if (data.kind === 'floorButton' && data.floorId) {
      this.selectFloor(data.floorId);
    } else if (data.kind === 'telephone') {
      this.sound.playClick();
      this.callbacks.onContactRequest();
    } else if (data.kind === 'corridorDoor' && data.roomCode) {
      const door = this.activeCorridor?.doors.find((d) => d.content.roomCode === data.roomCode);
      if (door) this.enterRoom(door);
    } else if (data.kind === 'returnLift') {
      this.returnToLobby();
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
    this.camera.fov = this.isMobile || w < 620 ? 68 : 58;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);

    const bloomScale = this.isMobile ? 0.5 : 1;
    this.bloomPass.setSize(w * bloomScale, h * bloomScale);
    const pixelRatio = this.renderer.getPixelRatio();
    this.fxaaPass.material.uniforms['resolution'].value.set(1 / (w * pixelRatio), 1 / (h * pixelRatio));
  }

  // ─── Public API ──────────────────────────────────────────────────────
  setSoundEnabled(enabled: boolean) {
    this.sound.setEnabled(enabled);
  }

  isSoundEnabled() {
    return this.sound.isEnabled();
  }

  /** Back control: leaves a room, or rides the lift back to the lobby. */
  goBack() {
    if (this.inputLocked) return;
    if (this.phase === 'room') this.exitRoom();
    else if (this.phase === 'corridor') this.returnToLobby();
  }

  private setPhase(phase: Phase) {
    if (this.phase === phase) return;
    this.phase = phase;
    this.callbacks.onPhaseChange(phase);
  }

  private fade(from: number, to: number, duration: number) {
    const state = { v: from };
    return gsap.to(state, {
      v: to,
      duration,
      ease: 'power2.inOut',
      onUpdate: () => this.callbacks.onFadeChange(state.v),
    });
  }

  // ─── Floor selection ─────────────────────────────────────────────────
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
      const built = buildCorridor(this.materials, floor);
      // The corridor starts where the car's rear doors are.
      built.group.position.z = CAB.backZ;
      built.group.visible = false;
      this.scene.add(built.group);
      this.corridors.set(floorId, built);
    }

    this.setPhase('travelling');

    const doorState = { front: 1, back: 0 };
    const tl = gsap.timeline({ onComplete: () => (this.inputLocked = false) });

    // 1. Turn to face the doors we are about to leave through. This is the
    //    "force the camera to face the door" beat — the visitor is looking
    //    straight at the opening before it starts to move.
    tl.call(() => {
      this.rig.setTarget(new THREE.Vector3(0, EYE_HEIGHT, CAB.centerZ + 0.15), 0);
    });
    tl.to({}, { duration: 0.75 });

    // 2. Front doors close, car sets off.
    tl.call(() => this.sound.playDoor());
    tl.to(doorState, {
      front: 0,
      duration: 1.1,
      ease: 'power2.inOut',
      onUpdate: () => setDoorOpen(this.elevator.frontDoors, doorState.front),
    });
    tl.call(() => {
      this.sound.playRumble();
      this.elevator.setFloorReadout(floor.floorNumber);
    });

    // 3. Travel: a settle-in shake that eases off as the car arrives.
    const travel = { shake: 0 };
    tl.to(travel, {
      shake: 0.014,
      duration: 0.5,
      ease: 'power2.out',
      onUpdate: () => this.rig.setShake(travel.shake),
    });
    tl.to(travel, {
      shake: 0,
      duration: 1.2,
      ease: 'power2.in',
      onUpdate: () => this.rig.setShake(travel.shake),
    });

    // 4. Arrive, reveal the corridor behind the rear doors, open them.
    tl.call(() => {
      const corridor = this.corridors.get(floorId)!;
      if (this.activeCorridor && this.activeCorridor !== corridor) this.activeCorridor.group.visible = false;
      this.activeCorridor = corridor;
      corridor.group.visible = true;
      this.corridorProgress = 0;
      this.corridorTarget = 0;
      this.sound.playDing();
    });
    tl.call(() => this.sound.playDoor());
    tl.to(doorState, {
      back: 1,
      duration: 1.3,
      ease: 'power3.out',
      onUpdate: () => setDoorOpen(this.elevator.backDoors, doorState.back),
    });

    // 5. Step out into the corridor as the doors finish opening.
    tl.call(() => {
      this.setPhase('corridor');
      this.lastFootstepZ = CAB.backZ;
    }, undefined, '-=0.6');
  }

  private returnToLobby() {
    if (!this.selectedFloor || this.inputLocked) return;
    this.inputLocked = true;

    const tl = gsap.timeline({ onComplete: () => (this.inputLocked = false) });
    tl.call(() => this.sound.playDoor());
    tl.add(this.fade(0, 1, 0.55));
    tl.call(() => {
      if (this.openDoor) this.closeRoomDoor(this.openDoor);
      this.openDoor = null;
      this.callbacks.onDoorChange(null);
      if (this.activeCorridor) this.activeCorridor.group.visible = false;
      this.activeCorridor = null;
      this.selectedFloor = null;
      this.callbacks.onFloorChange(null);
      this.elevator.setFloorReadout('G');
      this.elevator.buttons.forEach((b) => {
        b.lit = false;
        b.dotMesh.material = this.materials.buttonOff.clone();
      });
      setDoorOpen(this.elevator.backDoors, 0);
      setDoorOpen(this.elevator.frontDoors, 1);
      // Put the visitor back inside the car, facing the panel.
      this.lobbyProgress = LOBBY_MAX;
      this.lobbyTarget = LOBBY_MAX;
      this.rig.snapTo(new THREE.Vector3(0, EYE_HEIGHT, CAB.centerZ), -Math.PI / 2);
      this.setPhase('panel');
    });
    tl.call(() => this.sound.playDing());
    tl.add(this.fade(1, 0, 0.6));
  }

  // ─── Rooms ───────────────────────────────────────────────────────────
  private enterRoom(door: CorridorDoor) {
    if (this.inputLocked) return;
    this.inputLocked = true;
    this.openDoor = door;
    door.isOpen = true;
    this.callbacks.onDoorChange(door.content);
    this.setPhase('room');
    this.sound.playCreak(door.side * 0.5);

    const tl = gsap.timeline({ onComplete: () => (this.inputLocked = false) });
    // The leaf swings inward, away from the visitor.
    tl.to(door.pivot.rotation, { y: -Math.PI * 0.62, duration: 0.9, ease: 'power2.out' });
    // Walk in, and let the board settle dead centre. The door's stored pose
    // is corridor-local, so it needs the corridor's own offset applying.
    tl.call(() => {
      this.rig.setTarget(
        new THREE.Vector3(door.viewPosition.x, EYE_HEIGHT, door.viewPosition.z + CAB.backZ),
        door.viewYaw,
      );
    }, undefined, 0.25);
    tl.to({}, { duration: 1.2 });
  }

  private closeRoomDoor(door: CorridorDoor) {
    gsap.to(door.pivot.rotation, { y: 0, duration: 0.7, ease: 'power2.inOut' });
    door.isOpen = false;
  }

  private exitRoom() {
    const door = this.openDoor;
    if (!door) return;
    this.inputLocked = true;
    this.openDoor = null;
    this.callbacks.onDoorChange(null);
    this.sound.playCreak(door.side * 0.5);

    const tl = gsap.timeline({
      onComplete: () => {
        this.inputLocked = false;
        this.setPhase('corridor');
      },
    });
    // Back into the corridor first, then swing the door shut behind us.
    tl.call(() => {
      this.corridorTarget = this.progressForZ(door.z);
      this.corridorProgress = this.corridorTarget;
    });
    tl.to({}, { duration: 0.5 });
    tl.call(() => this.closeRoomDoor(door));
    tl.to({}, { duration: 0.6 });
  }

  /** Inverse of the corridor camera curve: scroll progress that sits at z. */
  private progressForZ(z: number) {
    const corridor = this.activeCorridor;
    if (!corridor) return 0;
    const startZ = CAB.backZ - 1.2;
    const endZ = CAB.backZ + corridor.endZ + 3.2;
    return clamp((z - startZ) / (endZ - startZ), 0, 1);
  }

  // ─── Per-frame camera ────────────────────────────────────────────────
  private updateLobbyCamera(progress: number) {
    const doorT = smoothstep(clamp(progress, 0, 1));
    setDoorOpen(this.elevator.frontDoors, doorT);
    this.elevator.logoPlane.material.opacity = 1 - doorT;
    this.elevator.taglinePlane.material.opacity = 1 - doorT;
    this.elevator.logoPlane.visible = doorT < 0.98;
    this.elevator.taglinePlane.visible = doorT < 0.98;

    if (progress < 1) {
      this.setPhase('lobby');
      // Approach: drift toward the threshold, doors opening ahead.
      this.rig.setTarget(new THREE.Vector3(0, EYE_HEIGHT, 6.2 - doorT * 2.6), 0);
    } else if (progress < 2) {
      this.setPhase('entering');
      const t = smoothstep(progress - 1);
      // Walk through the threshold to the middle of the car.
      this.rig.setTarget(new THREE.Vector3(0, EYE_HEIGHT, 3.6 - t * (3.6 - CAB.centerZ)), 0);
      if (t > 0.35) this.sound.startMusic();
    } else {
      this.setPhase('panel');
      const t = smoothstep(progress - 2);
      // Turn to face the panel wall square on and tip the head down a little,
      // so the panel and the telephone beneath it both sit in frame.
      this.rig.setTarget(
        new THREE.Vector3(-t * 0.3, EYE_HEIGHT, CAB.centerZ),
        -t * (Math.PI / 2),
        -t * 0.2,
      );
      this.sound.startMusic();
    }
  }

  private updateCorridorCamera(progress: number) {
    const corridor = this.activeCorridor;
    if (!corridor) return;

    const startZ = CAB.backZ - 1.2;
    const endZ = CAB.backZ + corridor.endZ + 3.2;
    const z = startZ + (endZ - startZ) * smoothstep(progress);
    const position = new THREE.Vector3(0, EYE_HEIGHT, z);

    // Look at whichever door we are closest to, so each one gets its own
    // moment centre-frame; fall back to straight ahead between doors and at
    // the very end, where the return lift is.
    let yaw = 0;
    let nearest: CorridorDoor | null = null;
    let nearestDistance = Infinity;
    for (const door of corridor.doors) {
      const doorZ = CAB.backZ + door.z;
      const distance = Math.abs(doorZ - z);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = door;
      }
    }

    if (nearest) {
      const focus = nearest.focusPoint.clone().add(new THREE.Vector3(0, 0, CAB.backZ));
      const doorYaw = CameraRig.yawToward(position, focus);
      // Blend in over a ~2.4m window either side, so the head turns smoothly
      // toward the door and releases again once it is behind us.
      const influence = 1 - smoothstep(clamp((nearestDistance - 0.4) / 2.4, 0, 1));
      yaw = doorYaw * influence;
    }

    this.rig.setTarget(position, yaw);

    // Footsteps keyed to distance walked, not to frame count.
    if (Math.abs(z - this.lastFootstepZ) > 0.85) {
      this.lastFootstepZ = z;
      this.sound.playFootstep((Math.random() - 0.5) * 0.4);
    }
  }

  private animate = () => {
    if (this.disposed) return;
    this.frameId = requestAnimationFrame(this.animate);

    const dt = Math.min(this.clock.getDelta(), 0.1);
    const wheel = this.wheelAccum;
    this.wheelAccum = 0;

    if (this.phase === 'lobby' || this.phase === 'entering' || this.phase === 'panel') {
      this.lobbyTarget = clamp(this.lobbyTarget + wheel, 0, LOBBY_MAX);
      this.lobbyProgress += (this.lobbyTarget - this.lobbyProgress) * 0.12;
      this.updateLobbyCamera(this.lobbyProgress);
    } else if (this.phase === 'corridor') {
      this.corridorTarget = clamp(this.corridorTarget + wheel * 0.5, 0, 1);
      this.corridorProgress += (this.corridorTarget - this.corridorProgress) * 0.1;
      this.updateCorridorCamera(this.corridorProgress);
    }

    // Lit buttons breathe.
    const t = performance.now() * 0.001;
    this.elevator.buttons.forEach((b) => {
      if (!b.lit) return;
      const mat = b.dotMesh.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.15 + Math.sin(t * 2.6) * 0.35;
    });

    this.rig.update(dt, this.phase === 'room' ? 0.055 : 0.085);
    this.composer.render();
  };

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    this.resizeObserver.disconnect();
    this.unbindInput();
    gsap.killTweensOf('*');
    this.sound.dispose();
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

export { CORRIDOR };
