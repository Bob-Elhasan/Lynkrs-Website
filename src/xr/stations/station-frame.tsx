import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';

import { AMBIENT } from '@/xr/motion';

type StationFrameProps = {
  position: [number, number, number];
  children: React.ReactNode;
  /** Ambient drift. Disabled under reduced motion. */
  animate?: boolean;
  seed?: number;
  /**
   * How near the camera is to this station on the journey, 0–1.
   *
   * Used only for the mount/unmount culling gate below. The visible
   * fade/scale-in itself is each station's own responsibility: every station
   * derives `revealFromFocus(focus)` and threads it into its own Stacks and
   * geometry (see motion.ts), so content fades in and out smoothly instead of
   * this component switching it on and off.
   */
  focus?: number;
};

/**
 * Well below the reveal band's start (0.2, see motion.ts) so a station is
 * always fully invisible — reveal already at 0 — for a comfortable margin
 * before it mounts and after it unmounts. That margin is what keeps the
 * mount/unmount boundary itself from ever being the moment something pops:
 * by the time a station is culled, revealFromFocus(focus) already resolved
 * it to zero several frames earlier.
 */
const UNMOUNT_THRESHOLD = 0.06;

export function StationFrame({
  position,
  children,
  animate = true,
  seed = 0,
  focus = 1,
}: StationFrameProps) {
  const group = useRef<Group>(null);
  const baseY = position[1];

  useFrame((state) => {
    if (!animate || !group.current) return;
    const t = state.clock.elapsedTime + seed;
    group.current.position.y = baseY + Math.sin(t * AMBIENT.bob) * AMBIENT.bobAmplitude;
    group.current.rotation.y = Math.sin(t * AMBIENT.rotate) * 0.04;
  });

  if (focus < UNMOUNT_THRESHOLD) return null;

  return (
    <group ref={group} position={position}>
      {children}
    </group>
  );
}
