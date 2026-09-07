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
   * Stations sit close enough together that two are in frame at once, which
   * makes distant text read as noise across the one you are meant to be
   * reading. Below the threshold the station is unmounted from the render
   * entirely — cheaper and cleaner than fading, which would need transparency
   * sorting across every material in the scene.
   */
  focus?: number;
};

const VISIBLE_THRESHOLD = 0.34;

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

  if (focus < VISIBLE_THRESHOLD) return null;

  return (
    <group ref={group} position={position}>
      {children}
    </group>
  );
}
