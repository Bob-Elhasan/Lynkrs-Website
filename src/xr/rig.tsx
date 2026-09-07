import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

import { CAMERA_SPRING, damp } from '@/xr/motion';
import { sampleJourney } from '@/xr/spline';

type RigProps = {
  /** Normalised target position along the journey, 0–1. */
  target: number;
  /** When true the camera snaps instead of flying. */
  reducedMotion: boolean;
};

const _pos = new Vector3();
const _look = new Vector3();

/**
 * Drives the camera along the journey curve.
 *
 * Scroll and routing both write a single normalised target; this smooths
 * towards it every frame. Smoothing the *curve parameter* rather than the
 * camera's xyz keeps the camera on the path at all times — lerping position
 * directly would cut corners and clip through the scenery on fast jumps.
 */
export function Rig({ target, reducedMotion }: RigProps) {
  const camera = useThree((state) => state.camera);
  const current = useRef(target);

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

    const { position, lookAt } = sampleJourney(current.current);
    _pos.copy(position);
    _look.copy(lookAt);

    camera.position.copy(_pos);
    camera.lookAt(_look);
  });

  return null;
}
