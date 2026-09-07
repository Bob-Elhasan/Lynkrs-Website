/* eslint-disable react-hooks/immutability --
 * Every frame this rig mutates the R3F-owned camera in place (position,
 * lookAt, rotateZ, and — the one direct property write — fov). That is
 * the standard, intended R3F pattern: the camera is a persistent Three.js
 * object, not React state, and re-creating it every frame to satisfy
 * immutability would defeat the point of useFrame. The compiler's check
 * doesn't have a carve-out for this, so it's disabled for the file rather
 * than peppering every mutating line below.
 */
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Vector3 } from 'three';

import { CAMERA_SPRING, clamp, damp } from '@/xr/motion';
import { journeyCurve, sampleJourney } from '@/xr/spline';

type RigProps = {
  /** Normalised target position along the journey, 0–1. */
  target: number;
  /** When true the camera snaps instead of flying, and parallax/bank are off. */
  reducedMotion: boolean;
};

const _pos = new Vector3();
const _look = new Vector3();
const _tangentNow = new Vector3();
const _tangentAhead = new Vector3();

/** How far the camera nudges toward the pointer, in world units. */
const PARALLAX_X = 0.55;
const PARALLAX_Y = 0.32;
/** How quickly the parallax offset and the bank angle settle, per damp(). */
const PARALLAX_LAMBDA = 6;
const BANK_LAMBDA = 3;
/**
 * Clamp on roll, in radians, and the gain that turns curvature into it.
 *
 * Both tuned against this specific spline (see spline.ts): a centred tangent
 * difference at BANK_STEP peaks around 0.45 over the whole journey, and 0.1
 * rad (~5.7°) is the most roll this corridor ever calls for at that peak —
 * enough to read as banking into a turn, nowhere near aerobatic. The clamp
 * is a safety net, not the normal operating point; recompute both constants
 * if the station positions in spline.ts change materially.
 */
const BANK_MAX = 0.1;
const BANK_SENSITIVITY = 0.22;
/**
 * How far ahead/behind the current point the tangent is sampled to find
 * curvature. Catmull-Rom tangents wobble at a short range — a forward
 * difference at a tight step picked up swings of 50°+ between adjacent
 * frames on some segments of this path. A wider, centred window averages
 * that local noise into the actual shape of the turn.
 */
const BANK_STEP = 0.025;

/**
 * Field-of-view widen on fast scroll, eased back down at rest.
 *
 * Diffs the raw `target` prop frame to frame rather than the spring-smoothed
 * `current` position — `current` already lags the input on purpose (that is
 * what makes the flight feel weighted), so it would underreport exactly the
 * fast-scroll moments this is meant to catch. The result is heavily damped
 * (FOV_LAMBDA) precisely because the raw per-frame diff is noisy — scroll
 * position only updates once per scroll-handler rAF, not every render frame,
 * so a single frame's diff can spike even mid-scroll. Damping means only a
 * *sustained* fast scroll actually shows it, not one noisy sample.
 */
const FOV_BASE = 50;
const FOV_BOOST_MAX = 3;
/** target-units-per-second that maxes out the boost — roughly a hard fling. */
const FOV_VELOCITY_FOR_MAX = 0.5;
const FOV_LAMBDA = 1.2;

/**
 * Drives the camera along the journey curve.
 *
 * Scroll and routing both write a single normalised target; this smooths
 * towards it every frame. Smoothing the *curve parameter* rather than the
 * camera's xyz keeps the camera on the path at all times — lerping position
 * directly would cut corners and clip through the scenery on fast jumps.
 *
 * Two things layer on top of the base flight, both off under reduced motion:
 *
 * - **Pointer parallax**: a small camera offset toward wherever the pointer
 *   is, applied to position only (the look-at target is untouched), so the
 *   view nudges around a fixed point rather than translating rigidly — the
 *   corridor responds to the visitor instead of running on rails regardless
 *   of them.
 * - **Banking**: rolls the camera into lateral turns in the spline, sampled
 *   from the curve's own tangent a small step ahead of the current position.
 *   Without it, turns in the path are invisible as turns — the camera just
 *   translates sideways with no sense of a curve being flown.
 */
export function Rig({ target, reducedMotion }: RigProps) {
  const camera = useThree((state) => state.camera);
  const pointer = useThree((state) => state.pointer);
  const current = useRef(target);
  const parallax = useRef({ x: 0, y: 0 });
  const bank = useRef(0);
  const previousTarget = useRef(target);
  const fovBoost = useRef(0);

  // A route jump while reduced motion is on should land immediately.
  useEffect(() => {
    if (reducedMotion) current.current = target;
  }, [reducedMotion, target]);

  useFrame((_state, delta) => {
    if (reducedMotion) {
      current.current = target;
    } else {
      const lambda = CAMERA_SPRING.stiffness / (CAMERA_SPRING.mass * 100);
      current.current += (target - current.current) * damp(lambda, delta);
    }

    const t = clamp(current.current);
    const { position, lookAt } = sampleJourney(t);
    _pos.copy(position);
    _look.copy(lookAt);

    if (reducedMotion) {
      parallax.current.x = 0;
      parallax.current.y = 0;
      bank.current = 0;
    } else {
      parallax.current.x += (pointer.x * PARALLAX_X - parallax.current.x) * damp(PARALLAX_LAMBDA, delta);
      parallax.current.y += (pointer.y * PARALLAX_Y - parallax.current.y) * damp(PARALLAX_LAMBDA, delta);
      _pos.x += parallax.current.x;
      _pos.y += parallax.current.y;

      // Curvature via the tangent's lateral change across a centred window —
      // a straight run has near-identical tangents and banks to ~0; a turn
      // opens a gap between them that we read as "how hard are we turning."
      journeyCurve.getTangentAt(clamp(t - BANK_STEP), _tangentNow).normalize();
      journeyCurve.getTangentAt(clamp(t + BANK_STEP), _tangentAhead).normalize();
      const targetBank = clamp(
        (_tangentAhead.x - _tangentNow.x) * BANK_SENSITIVITY,
        -BANK_MAX,
        BANK_MAX,
      );
      bank.current += (targetBank - bank.current) * damp(BANK_LAMBDA, delta);
    }

    if (reducedMotion) {
      fovBoost.current = 0;
    } else {
      const rawVelocity = delta > 0 ? Math.abs(target - previousTarget.current) / delta : 0;
      const boostTarget = clamp(rawVelocity / FOV_VELOCITY_FOR_MAX) * FOV_BOOST_MAX;
      fovBoost.current += (boostTarget - fovBoost.current) * damp(FOV_LAMBDA, delta);
    }
    previousTarget.current = target;

    if (camera instanceof PerspectiveCamera) {
      const nextFov = FOV_BASE + fovBoost.current;
      if (Math.abs(camera.fov - nextFov) > 0.001) {
        camera.fov = nextFov;
        camera.updateProjectionMatrix();
      }
    }

    camera.position.copy(_pos);
    camera.lookAt(_look);
    if (bank.current !== 0) camera.rotateZ(bank.current);
  });

  return null;
}
