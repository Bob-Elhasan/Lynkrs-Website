import * as THREE from 'three';

export const EYE_HEIGHT = 1.62;

/**
 * A first-person rig: the camera is a head at eye height that can be told
 * where to stand and what to look at, and eases into both.
 *
 * Everything in the scene drives this rather than calling lookAt directly,
 * which is what lets a floor selection "force" the view onto the doors, and
 * lets the corridor swing the view onto each door as it is passed.
 */
export class CameraRig {
  readonly camera: THREE.PerspectiveCamera;

  private position = new THREE.Vector3(0, EYE_HEIGHT, 6);
  private targetPosition = new THREE.Vector3(0, EYE_HEIGHT, 6);
  private yaw = 0;
  private targetYaw = 0;
  private pitch = 0;
  private targetPitch = 0;

  /** Amplitude of the idle breathing sway, in metres. */
  private sway = 0.0016;
  /** Extra shake, ramped up while the car is moving. */
  private shake = 0;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.camera.rotation.order = 'YXZ';
    this.apply(0);
  }

  /** Jump to a pose with no easing — used behind a fade. */
  snapTo(position: THREE.Vector3Like, yaw: number, pitch = 0) {
    this.position.set(position.x, position.y, position.z);
    this.targetPosition.copy(this.position);
    this.yaw = this.targetYaw = yaw;
    this.pitch = this.targetPitch = pitch;
    this.apply(0);
  }

  setTarget(position: THREE.Vector3Like, yaw: number, pitch = 0) {
    this.targetPosition.set(position.x, position.y, position.z);
    this.targetYaw = yaw;
    this.targetPitch = pitch;
  }

  setTargetPosition(position: THREE.Vector3Like) {
    this.targetPosition.set(position.x, position.y, position.z);
  }

  setTargetYaw(yaw: number) {
    this.targetYaw = yaw;
  }

  setShake(amount: number) {
    this.shake = amount;
  }

  getPosition() {
    return this.position;
  }

  /**
   * Yaw that puts a world point dead-centre in frame. Forward is -Z at yaw 0,
   * so +X (the right-hand wall) sits at -90 degrees.
   */
  static yawToward(from: THREE.Vector3Like, to: THREE.Vector3Like) {
    return Math.atan2(-(to.x - from.x), -(to.z - from.z));
  }

  /** Shortest signed angle from a to b, so the head never spins the long way. */
  private static shortestAngle(a: number, b: number) {
    let delta = (b - a) % (Math.PI * 2);
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;
    return delta;
  }

  /**
   * @param damping 0..1 per-frame ease. Frame-rate corrected so a slow frame
   *   doesn't leave the camera lagging behind the scroll.
   */
  update(dt: number, damping = 0.085) {
    const k = 1 - Math.pow(1 - damping, Math.min(dt, 0.1) * 60);

    this.position.lerp(this.targetPosition, k);
    this.yaw += CameraRig.shortestAngle(this.yaw, this.targetYaw) * k;
    this.pitch += (this.targetPitch - this.pitch) * k;

    this.apply(performance.now() * 0.001);
  }

  private apply(time: number) {
    const swayX = Math.sin(time * 0.62) * this.sway;
    const swayY = Math.cos(time * 0.81) * this.sway * 0.75;
    const shakeX = this.shake ? (Math.random() - 0.5) * this.shake : 0;
    const shakeY = this.shake ? (Math.random() - 0.5) * this.shake * 0.7 : 0;

    this.camera.position.set(
      this.position.x + swayX + shakeX,
      this.position.y + swayY + shakeY,
      this.position.z,
    );
    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
  }
}
