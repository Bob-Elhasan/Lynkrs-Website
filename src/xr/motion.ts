/**
 * The motion character of the whole site, in one place.
 *
 * Reference is Tubik Studio: long, coordinated, eased depth moves. Nothing
 * snappy, nothing that bounces. Every scene imports from here so the site
 * moves as one hand rather than a pile of separately-tuned animations.
 */

/** Critically damped — reaches the target and stops. No overshoot, no wobble. */
export const CAMERA_SPRING = {
  stiffness: 42,
  damping: 13,
  mass: 1.1,
} as const;

export const DURATION = {
  /** Micro-feedback: hover, focus. */
  fast: 0.24,
  /** Standard element reveal. */
  base: 0.6,
  /** Section-scale transitions. */
  slow: 1.1,
  /** Camera flights between stations. */
  flight: 1.8,
} as const;

/** Cubic-bezier control points, eased in and out. Deliberately unhurried. */
export const EASE = {
  /** Default for almost everything. */
  soft: [0.32, 0.72, 0, 1] as const,
  /** Entrances: settles late. */
  enter: [0.16, 1, 0.3, 1] as const,
  /** Exits: leaves early. */
  exit: [0.7, 0, 0.84, 0] as const,
} as const;

/** Ambient drift speeds, in radians or units per second. */
export const AMBIENT = {
  rotate: 0.06,
  bob: 0.18,
  bobAmplitude: 0.08,
} as const;

/**
 * Frame-rate independent damping factor.
 *
 * `lerp(current, target, damp(0.12, dt))` behaves the same at 30fps and 144fps,
 * where a raw `lerp(a, b, 0.12)` would move twice as fast on a 144Hz display.
 */
export function damp(lambda: number, dt: number): number {
  return 1 - Math.exp(-lambda * Math.min(dt, 0.1) * 60);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(v: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, v));
}

/** Maps a value from one range to another, clamped. */
export function mapRange(
  v: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  if (inMax === inMin) return outMin;
  return outMin + clamp((v - inMin) / (inMax - inMin)) * (outMax - outMin);
}
