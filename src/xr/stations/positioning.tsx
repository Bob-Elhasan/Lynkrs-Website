import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';

import { positioning } from '@/content/journey';
import { clamp } from '@/xr/motion';
import { PALETTE } from '@/xr/palette';
import { StationFrame } from '@/xr/stations/station-frame';
import { SIZE, Stack, body, eyebrow, headline, stamp } from '@/xr/ui/panel';

/** The answer to the problem: the same shards converge into one lit system. */
function Assembly({ assembly, animate }: { assembly: number; animate: boolean }) {
  const group = useRef<Group>(null);
  const seats: [number, number, number][] = [
    [-0.6, 0.6, 0], [0.6, 0.6, 0], [-0.6, -0.6, 0], [0.6, -0.6, 0],
  ];
  // Kept behind the seats: a scatter that reaches towards the camera reads as
  // a wall of geometry rather than pieces waiting to come together.
  const scattered: [number, number, number][] = [
    [-3.2, 2.4, -3.4], [3.4, 1.9, -4.2], [-2.8, -2.2, -3.8], [3.0, -2.6, -2.9],
  ];

  useFrame((state) => {
    if (!group.current) return;
    const t = clamp(assembly);
    group.current.children.forEach((child, i) => {
      const from = scattered[i];
      const to = seats[i];
      child.position.set(
        from[0] + (to[0] - from[0]) * t,
        from[1] + (to[1] - from[1]) * t,
        from[2] + (to[2] - from[2]) * t,
      );
      child.rotation.z =
        (1 - t) * 1.2 + (animate ? Math.sin(state.clock.elapsedTime * 0.2 + i) * 0.02 : 0);
    });
  });

  return (
    <group ref={group} position={[-6, 0.2, -3]}>
      {seats.map((_, i) => (
        <mesh key={i}>
          <boxGeometry args={[1.15, 1.15, 0.09]} />
          <meshStandardMaterial
            color={PALETTE.navy}
            emissive={PALETTE.blueBright}
            emissiveIntensity={0.15 + clamp(assembly) * 0.5}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

export function PositioningStation({
  animate,
  progress,
  focus,
}: {
  animate: boolean;
  progress: number;
  focus: number;
}) {
  return (
    <StationFrame position={[2, -3.4, -72]} animate={animate} seed={2.7} focus={focus}>
      <group position={[0.6, 3.4, 0]}>
        <Stack
          blocks={[
            eyebrow(`${positioning.number} ${positioning.title}`),
            headline(positioning.lede, SIZE.headline),
            body(positioning.body, 8.28, true),
            stamp(positioning.stamp),
          ]}
        />
      </group>
      <Assembly assembly={progress} animate={animate} />
      <pointLight
        position={[-6, 0.2, -1]}
        intensity={16 + progress * 26}
        color={PALETTE.blueBright}
        distance={16}
      />
    </StationFrame>
  );
}
