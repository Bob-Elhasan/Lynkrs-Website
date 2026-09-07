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

/**
 * Reveal choreography.
 *
 * Every station and every text block inside it fades/scales in through this
 * shared curve rather than the old hard `if (focus < threshold) return null`
 * cutoff — that cutoff was the literal cause of stations popping in and out
 * instead of appearing. `revealFromFocus` reproduces roughly the same
 * "fully on" window the original 0.34 cutoff was tuned to (so the readable
 * framing doesn't change), but as a smooth ramp instead of a cliff.
 *
 * The start of the ramp is tuned against scene.tsx's focus falloff radius
 * (span * 0.6): each station's reveal-nonzero band is only
 * radius * (1 - REVEAL_START) wide on either side of its centre, and that
 * band has to reach at least half the inter-station spacing or neighbouring
 * stations leave a stretch of scroll — measured at ~4% of the gap between
 * stations — where nothing has started revealing yet, a blank beat that
 * reads as its own small "pop." 0.2 left that gap; 0.16 just closes it, at
 * the cost of a faint (~8% opacity) double-exposure right at the midpoint —
 * far short of the near-full-opacity bleed-through the falloff radius was
 * narrowed to fix.
 */
const REVEAL_START = 0.16;
const REVEAL_FULL = 0.4;

/** Eases a linear 0-1 ramp so it settles late, matching EASE.enter's character. */
function easeOutCubic(t: number): number {
  const x = clamp(t);
  return 1 - (1 - x) ** 3;
}

/** How a station's own visibility ramps in and out as the camera approaches. */
export function revealFromFocus(focus: number): number {
  return easeOutCubic(mapRange(focus, REVEAL_START, REVEAL_FULL, 0, 1));
}

/**
 * Delays and eases one item's reveal by its index, so a row of blocks or
 * cards arrives in sequence instead of all at once. `staggerDelay` is a
 * fraction of the 0-1 reveal range consumed per item; capped so a long list
 * can never push the last item's start past 0.85 and fail to resolve.
 */
export function staggeredReveal(reveal: number, index: number, staggerDelay: number): number {
  const start = Math.min(index * staggerDelay, 0.85);
  return easeOutCubic(mapRange(reveal, start, 1, 0, 1));
}

/** Default stagger for lines within one text block. */
export const LINE_STAGGER = 0.06;

/** Default stagger for a row of sibling cards (costs, steps, bundles, modules). */
export const CARD_STAGGER = 0.09;

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
