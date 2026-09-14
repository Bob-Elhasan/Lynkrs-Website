import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import gsap from 'gsap';

import { applyThemeToMaterials, buildMaterials, disposeMaterials, type SceneMaterials } from './materials';
import { createProceduralEnvMap, createSlideTexture, setTextureQuality } from './textures';
import { loadAssets, type SceneAssets } from './assets';
import { buildElevator, setDoorOpen, CAB, type ElevatorBuild } from './elevator';
import { buildCorridor, CORRIDOR, type CorridorBuild, type CorridorDoor } from './corridor';
import { floors, type DoorContent, type FloorContent } from './content';
import { SoundManager } from './audio';
import { disposeObject3D } from './dispose';
import { CameraRig, EYE_HEIGHT } from './cameraRig';
import { DARK_THEME, LIGHT_THEME, lerpTheme, type Theme, type ThemeName } from './theme';

export type Phase = 'lobby' | 'entering' | 'panel' | 'travelling' | 'corridor' | 'room';

export type ElevatorCallbacks = {
  onLoadingProgress: (pct: number) => void;
  onReady: () => void;
  onPhaseChange: (phase: Phase) => void;
  onFloorChange: (floor: FloorContent | null) => void;
  onDoorChange: (door: DoorContent | null) => void;
  onSlideChange: (index: number, total: number) => void;
  onFadeChange: (opacity: number) => void;
  onThemeChange: (theme: ThemeName) => void;
  onContactRequest: () => void;
};

const SCROLL_SPEED = 0.00085;
const TOUCH_SPEED = 0.0032;
const TOUCH_DEADZONE = 12;
const LOBBY_MAX = 3;

function smoothstep(t: number) {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

/**
 * Frame-rate corrected easing. A flat per-frame fraction makes the whole
 * journey run at half speed on a 30fps phone and double on a 120Hz panel.
 */
function ease(current: number, target: number, rate: number, dt: number) {
  return current + (target - current) * (1 - Math.pow(1 - rate, Math.min(dt, 0.1) * 60));
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

  private assets!: SceneAssets;
  private materials!: SceneMaterials;
  private elevator!: ElevatorBuild;
  private corridors = new Map<FloorContent['id'], CorridorBuild>();
  private activeCorridor: CorridorBuild | null = null;
  private openDoor: CorridorDoor | null = null;

  // ─── Lighting, held so a theme change can re-level it ───
  private hemi!: THREE.HemisphereLight;
  private ambient!: THREE.AmbientLight;
  private key!: THREE.DirectionalLight;
  private cabLight!: THREE.PointLight;
  private panelFill!: THREE.PointLight;
  private lobbyLight!: THREE.PointLight;
  private envMaps: Partial<Record<ThemeName, THREE.Texture>> = {};

  private theme: Theme = LIGHT_THEME;
  private themeTween: gsap.core.Tween | null = null;

  private sound = new SoundManager();
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();

  private phase: Phase = 'lobby';
  private lobbyProgress = 0;
  private lobbyTarget = 0;
  private corridorProgress = 0;
  private corridorTarget = 0;
  /** Continuous position through the open room's slide deck. */
  private roomProgress = 0;
  private roomTarget = 0;
  private slideIndex = -1;
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

    this.scene.background = new THREE.Color(this.theme.background);
    this.scene.fog = new THREE.Fog(this.theme.fog.colour, this.theme.fog.near, this.theme.fog.far);

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
    this.renderer.toneMappingExposure = this.theme.exposure;
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

    // Restrained: bloom is here to bleed the fixtures and the projection, not
    // to glaze the whole image.
    const bloomScale = this.isMobile ? 0.5 : 1;
    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(w * bloomScale, h * bloomScale), 0.22, 0.5, 0.95);
    this.composer.addPass(this.bloomPass);

    this.fxaaPass = new ShaderPass(FXAAShader);
    this.fxaaPass.material.uniforms['resolution'].value.set(1 / (w * pixelRatio), 1 / (h * pixelRatio));
    this.composer.addPass(this.fxaaPass);

    this.composer.addPass(new OutputPass());
  }

  private async boot() {
    this.callbacks.onLoadingProgress(6);

    // Real PBR maps, fetched up front — they are what stop surfaces reading
    // as flat colour.
    this.assets = await loadAssets(this.renderer, (f) => this.callbacks.onLoadingProgress(6 + f * 54));

    this.envMaps.light = createProceduralEnvMap(this.renderer, LIGHT_THEME);
    this.envMaps.dark = createProceduralEnvMap(this.renderer, DARK_THEME);
    this.scene.environment = this.envMaps[this.theme.name]!;
    this.callbacks.onLoadingProgress(72);

    this.materials = buildMaterials(this.assets, this.scene.environment, this.theme);
    this.buildLighting();
    this.callbacks.onLoadingProgress(84);

    this.elevator = buildElevator(this.materials, floors, this.theme, this.assets);
    this.scene.add(this.elevator.group);

    void this.sound.init();
    this.callbacks.onLoadingProgress(100);
    this.callbacks.onReady();

    this.clock.start();
    this.animate();
  }

  private buildLighting() {
    const l = this.theme.light;
    this.hemi = new THREE.HemisphereLight(l.hemiSky, l.hemiGround, l.hemiIntensity);
    this.ambient = new THREE.AmbientLight(0xffffff, l.ambient);
    this.scene.add(this.hemi, this.ambient);

    this.key = new THREE.DirectionalLight(0xfff4e6, l.keyIntensity);
    this.key.position.set(4, 7, 7);
    this.key.castShadow = true;
    this.key.shadow.mapSize.set(this.isMobile ? 1024 : 2048, this.isMobile ? 1024 : 2048);
    this.key.shadow.camera.near = 0.5;
    this.key.shadow.camera.far = 34;
    this.key.shadow.camera.left = -9;
    this.key.shadow.camera.right = 9;
    this.key.shadow.camera.top = 9;
    this.key.shadow.camera.bottom = -9;
    this.key.shadow.bias = -0.0009;
    this.key.shadow.normalBias = 0.022;
    this.key.shadow.radius = 3;
    this.scene.add(this.key, this.key.target);

    this.cabLight = new THREE.PointLight(l.colour, l.fixtureIntensity * 1.5, 9, 2);
    this.cabLight.position.set(0, CAB.height - 0.45, CAB.centerZ);
    this.cabLight.castShadow = true;
    this.cabLight.shadow.mapSize.set(512, 512);
    this.scene.add(this.cabLight);

    // A single ceiling source left the cab walls falling off to black. This
    // fill sits near the panel and keeps the whole car readable.
    this.panelFill = new THREE.PointLight(l.colour, l.fixtureIntensity * 1.6, 7, 2);
    this.panelFill.position.set(-0.2, 1.55, CAB.centerZ + 0.5);
    this.scene.add(this.panelFill);

    this.lobbyLight = new THREE.PointLight(0xffffff, l.fixtureIntensity * 1.2, 14, 2);
    this.lobbyLight.position.set(0, 3.1, 3.5);
    this.scene.add(this.lobbyLight);
  }

  // ─── Theme ───────────────────────────────────────────────────────────
  getTheme() {
    return this.theme.name;
  }

  /** Crossfades every themed value, so the switch dissolves rather than cuts. */
  toggleTheme() {
    const from = this.theme;
    const to = from.name === 'light' ? DARK_THEME : LIGHT_THEME;
    this.theme = to;
    this.callbacks.onThemeChange(to.name);
    this.sound.playClick();

    this.activeCorridor?.switches.forEach((sw) => {
      gsap.to(sw.rocker.rotation, { x: to.name === 'dark' ? 0.32 : -0.32, duration: 0.25, ease: 'power2.out' });
      sw.lamp.visible = to.name === 'dark';
    });

    // Environment swaps at the midpoint, where it is least visible.
    let swapped = false;
    this.themeTween?.kill();
    const state = { t: 0 };
    this.themeTween = gsap.to(state, {
      t: 1,
      duration: 0.9,
      ease: 'power2.inOut',
      onUpdate: () => {
        const v = lerpTheme(from, to, state.t);
        applyThemeToMaterials(this.materials, v.surface, v.light.colour, v.light.panelEmissive);

        this.hemi.color.setHex(v.light.hemiSky);
        this.hemi.groundColor.setHex(v.light.hemiGround);
        this.hemi.intensity = v.light.hemiIntensity;
        this.ambient.intensity = v.light.ambient;
        this.key.intensity = v.light.keyIntensity;
        this.cabLight.color.setHex(v.light.colour);
        this.cabLight.intensity = v.light.fixtureIntensity * 1.5;
        this.panelFill.color.setHex(v.light.colour);
        this.panelFill.intensity = v.light.fixtureIntensity * 1.6;
        this.lobbyLight.intensity = v.light.fixtureIntensity * 1.2;
        if (this.openDoor && this.activeCorridor) {
          this.activeCorridor.roomSpill.intensity = v.light.fixtureIntensity * 0.72;
        }
        this.corridors.forEach((c) =>
          c.bulbs.forEach((b) => {
            if (!b.userData.keepColour) b.color.setHex(v.light.colour);
            b.intensity = v.light.fixtureIntensity * ((b.userData.scale as number) ?? 1);
          }),
        );

        (this.scene.fog as THREE.Fog).color.setHex(v.fog.colour);
        (this.scene.fog as THREE.Fog).near = v.fog.near;
        (this.scene.fog as THREE.Fog).far = v.fog.far;
        (this.scene.background as THREE.Color).setHex(v.background);
        this.renderer.toneMappingExposure = v.exposure;

        if (!swapped && state.t > 0.5) {
          swapped = true;
          const env = this.envMaps[to.name];
          if (env) {
            this.scene.environment = env;
            Object.values(this.materials).forEach((m) => {
              const std = m as THREE.MeshStandardMaterial;
              if ('envMap' in std && std.envMap) std.envMap = env;
            });
          }
        }
      },
    });
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

  private interactiveTargets(): THREE.Object3D[] {
    if (this.phase === 'panel') {
      return [...this.elevator.buttons.map((b) => b.hitMesh), this.elevator.telephone.hitMesh];
    }
    if (this.phase === 'corridor' && this.activeCorridor) {
      const targets: THREE.Object3D[] = [
        ...this.activeCorridor.doors.map((d) => d.hitMesh),
        ...this.activeCorridor.switches.map((s) => s.hitMesh),
      ];
      // Only once the visitor is actually near it.
      if (this.corridorProgress > 0.68) targets.push(this.activeCorridor.returnLiftHit);
      return targets;
    }
    if (this.phase === 'room' && this.openDoor) {
      return [this.openDoor.phoneHit];
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

    if (data.kind === 'floorButton' && data.floorId) this.selectFloor(data.floorId);
    else if (data.kind === 'telephone') {
      this.sound.playClick();
      this.callbacks.onContactRequest();
    } else if (data.kind === 'lightSwitch') this.toggleTheme();
    else if (data.kind === 'corridorDoor' && data.roomCode) {
      const door = this.activeCorridor?.doors.find((d) => d.content.roomCode === data.roomCode);
      if (door) this.enterRoom(door);
    } else if (data.kind === 'returnLift') this.returnToLobby();
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

  /**
   * Deep link straight to a floor, skipping the lobby walk. Used by ?floor=
   * so a corridor can be linked to directly.
   */
  visitFloor(floorId: string) {
    if (this.phase !== 'lobby' && this.phase !== 'entering' && this.phase !== 'panel') return;
    const floor = floors.find((f) => f.id === floorId);
    if (!floor) return;
    this.lobbyProgress = LOBBY_MAX;
    this.lobbyTarget = LOBBY_MAX;
    setDoorOpen(this.elevator.frontDoors, 0);
    this.elevator.logoPlane.visible = false;
    this.elevator.taglinePlane.visible = false;
    this.rig.snapTo(new THREE.Vector3(-0.62, EYE_HEIGHT, CAB.centerZ), -Math.PI / 2, -0.1);
    this.setPhase('panel');
    this.selectFloor(floor.id);
  }

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
      const built = buildCorridor(this.materials, floor, this.theme);
      built.group.position.z = CAB.backZ;
      // Visible from the moment it is built, but behind closed doors: the
      // shaders compile during the ride instead of hitching on the reveal.
      built.group.visible = true;
      this.scene.add(built.group);
      this.corridors.set(floorId, built);
      built.switches.forEach((sw) => {
        sw.rocker.rotation.x = this.theme.name === 'dark' ? 0.32 : -0.32;
      });
    }

    this.setPhase('travelling');

    const doorState = { front: 1, back: 0 };
    const tl = gsap.timeline({ onComplete: () => (this.inputLocked = false) });

    // Turn square onto the doors before they move.
    tl.call(() => this.rig.setTarget(new THREE.Vector3(0, EYE_HEIGHT, CAB.centerZ + 0.1), 0, 0));
    tl.to({}, { duration: 0.7 });

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

    // A settle rather than a rattle: the old amplitude read as a fairground
    // ride. This is just enough to register as motion.
    const travel = { shake: 0 };
    tl.to(travel, {
      shake: 0.0035,
      duration: 0.8,
      ease: 'sine.inOut',
      onUpdate: () => this.rig.setShake(travel.shake),
    });
    tl.to(travel, {
      shake: 0,
      duration: 1.4,
      ease: 'sine.inOut',
      onUpdate: () => this.rig.setShake(travel.shake),
    });

    tl.call(() => {
      const corridor = this.corridors.get(floorId)!;
      if (this.activeCorridor && this.activeCorridor !== corridor) this.activeCorridor.group.visible = false;
      this.activeCorridor = corridor;
      corridor.group.visible = true;
      this.corridors.forEach((c) => {
        if (c !== corridor) c.group.visible = false;
      });
      // Start the walk from inside the car, so the doors open on the corridor
      // ahead and the visitor steps out under their own scroll.
      this.corridorProgress = 0;
      this.corridorTarget = 0;
      this.sound.playDing();
    });
    tl.call(() => this.sound.playDoor());
    tl.to(doorState, {
      back: 1,
      duration: 1.4,
      ease: 'power3.out',
      onUpdate: () => setDoorOpen(this.elevator.backDoors, doorState.back),
    });
    tl.call(() => {
      this.setPhase('corridor');
      this.lastFootstepZ = CAB.centerZ;
    }, undefined, '-=0.9');
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
      this.slideIndex = -1;
      this.callbacks.onDoorChange(null);
      this.callbacks.onSlideChange(0, 0);
      if (this.activeCorridor) {
        this.activeCorridor.roomSpill.intensity = 0;
        this.activeCorridor.group.visible = false;
      }
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
      this.lobbyProgress = LOBBY_MAX;
      this.lobbyTarget = LOBBY_MAX;
      this.rig.snapTo(new THREE.Vector3(-0.62, EYE_HEIGHT, CAB.centerZ), -Math.PI / 2, -0.1);
      this.setPhase('panel');
    });
    tl.call(() => this.sound.playDing());
    tl.add(this.fade(1, 0, 0.6));
  }

  // ─── Rooms ───────────────────────────────────────────────────────────
  private setSlide(door: CorridorDoor, index: number) {
    const clamped = clamp(index, 0, door.content.slides.length - 1);
    if (clamped === this.slideIndex) return;
    this.slideIndex = clamped;
    const material = door.projected.material;
    material.map?.dispose();
    material.map = createSlideTexture(
      door.content.slides[clamped],
      this.theme,
      clamped,
      door.content.slides.length,
    );
    material.needsUpdate = true;
    this.callbacks.onSlideChange(clamped, door.content.slides.length);
  }

  private enterRoom(door: CorridorDoor) {
    if (this.inputLocked) return;
    this.inputLocked = true;
    this.openDoor = door;
    door.isOpen = true;
    this.roomProgress = 0;
    this.roomTarget = 0;
    this.slideIndex = -1;
    this.callbacks.onDoorChange(door.content);
    this.setPhase('room');

    // One spill light serves every room; park it in this one.
    const corridor = this.activeCorridor;
    if (corridor) {
      corridor.roomSpill.position.copy(door.spillPoint);
      gsap.to(corridor.roomSpill, {
        intensity: this.theme.light.fixtureIntensity * 0.72,
        duration: 0.7,
        ease: 'power2.out',
      });
    }
    this.sound.playCreak(door.side * 0.5);
    this.setSlide(door, 0);

    const tl = gsap.timeline({ onComplete: () => (this.inputLocked = false) });
    tl.to(door.pivot.rotation, { y: -Math.PI * 0.62, duration: 0.9, ease: 'power2.out' });
    tl.call(
      () =>
        this.rig.setTarget(
          new THREE.Vector3(door.viewPosition.x, EYE_HEIGHT, door.viewPosition.z + CAB.backZ),
          door.viewYaw,
          0,
        ),
      undefined,
      0.25,
    );
    tl.to({}, { duration: 1.3 });
  }

  private closeRoomDoor(door: CorridorDoor) {
    gsap.to(door.pivot.rotation, { y: 0, duration: 0.7, ease: 'power2.inOut' });
    door.isOpen = false;
  }

  /** Deck finished (or backed out of): look to the door, then step out. */
  private exitRoom() {
    const door = this.openDoor;
    if (!door) return;
    this.inputLocked = true;
    this.openDoor = null;
    this.callbacks.onDoorChange(null);
    this.callbacks.onSlideChange(0, 0);
    if (this.activeCorridor) {
      gsap.to(this.activeCorridor.roomSpill, { intensity: 0, duration: 0.6, ease: 'power2.in' });
    }

    const corridorZ = CAB.backZ + door.z;
    const doorWorld = new THREE.Vector3(door.focusPoint.x, EYE_HEIGHT, corridorZ);

    const tl = gsap.timeline({
      onComplete: () => {
        this.inputLocked = false;
        this.setPhase('corridor');
      },
    });

    // Pan to the door first, then walk back through it into the corridor.
    tl.call(() =>
      this.rig.setTarget(
        new THREE.Vector3(door.viewPosition.x, EYE_HEIGHT, door.viewPosition.z + CAB.backZ),
        CameraRig.yawToward(door.viewPosition, doorWorld),
        0,
      ),
    );
    tl.to({}, { duration: 0.85 });
    tl.call(() => {
      this.corridorTarget = this.progressForZ(corridorZ);
      this.corridorProgress = this.corridorTarget;
      this.sound.playCreak(door.side * 0.5);
    });
    tl.to({}, { duration: 0.5 });
    tl.call(() => this.closeRoomDoor(door));
    tl.to({}, { duration: 0.6 });
  }

  private progressForZ(z: number) {
    const corridor = this.activeCorridor;
    if (!corridor) return 0;
    const startZ = CAB.centerZ;
    const endZ = CAB.backZ + corridor.endZ + 3.2;
    return clamp((z - startZ) / (endZ - startZ), 0, 1);
  }

  // ─── Per-frame ───────────────────────────────────────────────────────
  private updateLobbyCamera(progress: number) {
    const doorT = smoothstep(clamp(progress, 0, 1));
    setDoorOpen(this.elevator.frontDoors, doorT);
    this.elevator.logoPlane.material.opacity = 1 - doorT;
    this.elevator.taglinePlane.material.opacity = 1 - doorT;
    this.elevator.logoPlane.visible = doorT < 0.98;
    this.elevator.taglinePlane.visible = doorT < 0.98;

    if (progress < 1) {
      this.setPhase('lobby');
      this.rig.setTarget(new THREE.Vector3(0, EYE_HEIGHT, 6.2 - doorT * 2.6), 0, 0);
    } else if (progress < 2) {
      this.setPhase('entering');
      const t = smoothstep(progress - 1);
      this.rig.setTarget(new THREE.Vector3(0, EYE_HEIGHT, 3.6 - t * (3.6 - CAB.centerZ)), 0, 0);
      if (t > 0.35) this.sound.startMusic();
    } else {
      this.setPhase('panel');
      const t = smoothstep(progress - 2);
      this.rig.setTarget(
        new THREE.Vector3(-t * 0.62, EYE_HEIGHT, CAB.centerZ),
        -t * (Math.PI / 2),
        -t * 0.1,
      );
      this.sound.startMusic();
    }
  }

  private updateCorridorCamera(progress: number) {
    const corridor = this.activeCorridor;
    if (!corridor) return;

    // The walk now begins where the visitor is actually standing: inside the
    // car. Scrolling carries them out through the open doors.
    const startZ = CAB.centerZ;
    const endZ = CAB.backZ + corridor.endZ + 3.2;
    const z = startZ + (endZ - startZ) * smoothstep(progress);
    const position = new THREE.Vector3(0, EYE_HEIGHT, z);

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

    let yaw = 0;
    if (nearest) {
      let influence = 1 - smoothstep(clamp((nearestDistance - 0.4) / 2.4, 0, 1));
      influence *= 1 - smoothstep(clamp((progress - 0.84) / 0.16, 0, 1));
      // Hold the view straight ahead while still inside the car, so the
      // corridor is revealed head-on through the opening doors.
      influence *= smoothstep(clamp((z - (CAB.backZ - 0.4)) / -1.6, 0, 1));

      // Ease across to the far side as the door comes up: standing on the
      // centre line put the camera close enough that the frame overflowed.
      position.x = -nearest.side * (CORRIDOR.halfWidth - 1.5) * influence;

      const focus = nearest.focusPoint.clone().add(new THREE.Vector3(0, 0, CAB.backZ));
      yaw = CameraRig.yawToward(position, focus) * influence;
    }

    this.rig.setTarget(position, yaw, 0);

    if (Math.abs(z - this.lastFootstepZ) > 0.9) {
      this.lastFootstepZ = z;
      this.sound.playFootstep((Math.random() - 0.5) * 0.35);
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
      this.lobbyProgress = ease(this.lobbyProgress, this.lobbyTarget, 0.12, dt);
      this.updateLobbyCamera(this.lobbyProgress);
    } else if (this.phase === 'corridor') {
      this.corridorTarget = clamp(this.corridorTarget + wheel * 0.5, 0, 1);
      this.corridorProgress = ease(this.corridorProgress, this.corridorTarget, 0.1, dt);
      this.updateCorridorCamera(this.corridorProgress);
    } else if (this.phase === 'room' && this.openDoor && !this.inputLocked) {
      const door = this.openDoor;
      const total = door.content.slides.length;
      // One slide per notch of scroll; running off the end leaves the room.
      this.roomTarget = clamp(this.roomTarget + wheel * 1.6, 0, total);
      this.roomProgress = ease(this.roomProgress, this.roomTarget, 0.16, dt);
      if (this.roomProgress >= total - 0.02 && this.roomTarget >= total) {
        this.exitRoom();
      } else {
        this.setSlide(door, Math.floor(this.roomProgress));
      }
    }

    const t = performance.now() * 0.001;
    this.elevator.buttons.forEach((b) => {
      if (!b.lit) return;
      const mat = b.dotMesh.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.95 + Math.sin(t * 2.4) * 0.25;
    });

    this.rig.update(dt, this.phase === 'room' ? 0.055 : 0.08);
    this.composer.render();
  };

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    this.resizeObserver.disconnect();
    this.unbindInput();
    this.themeTween?.kill();
    gsap.killTweensOf('*');
    this.sound.dispose();
    disposeObject3D(this.scene);
    if (this.materials) disposeMaterials(this.materials);
    Object.values(this.envMaps).forEach((t) => t?.dispose());
    this.assets?.dispose();
    this.renderer.dispose();
    this.composer?.dispose();
    if (this.renderer.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}

export { CORRIDOR };
