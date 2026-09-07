import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';

import { problem } from '@/content/journey';
import { CARD_STAGGER, revealFromFocus, staggeredReveal } from '@/xr/motion';
import { PALETTE } from '@/xr/palette';
import { StationFrame } from '@/xr/stations/station-frame';
import { SIZE, Stack, body, eyebrow, headline, numbered, stamp } from '@/xr/ui/panel';

/**
 * Four shards that pull apart as you approach — the fragmentation the whole
 * pitch is about, shown rather than described. Driven by journey position, so
 * the separation happens under the visitor's own scroll.
 */
function Shards({
  spread,
  animate,
  reveal,
}: {
  spread: number;
  animate: boolean;
  reveal: number;
}) {
  const group = useRef<Group>(null);
  const offsets: [number, number, number][] = [
    [-1.5, 1.1, 0],
    [1.6, 0.7, -0.6],
    [-1.2, -1.0, -1.1],
    [1.3, -1.2, 0.4],
  ];

  useFrame((state) => {
    if (!group.current) return;
    group.current.children.forEach((child, i) => {
      const base = offsets[i];
      const drift = spread * 1.9;
      const wobble = animate ? Math.sin(state.clock.elapsedTime * 0.3 + i) * 0.06 : 0;
      child.position.set(
        base[0] * (1 + drift) + wobble,
        base[1] * (1 + drift * 0.6),
        base[2] * (1 + drift),
      );
      child.rotation.z = base[0] * 0.2 + spread * 0.5;
    });
  });

  return (
    <group ref={group} position={[6.4, -1.4, -7]} scale={reveal}>
      {offsets.map((_, i) => (
        <mesh key={i}>
          <boxGeometry args={[1.15, 1.15, 0.09]} />
          <meshStandardMaterial
            color={PALETTE.slate}
            emissive={PALETTE.blue}
            emissiveIntensity={0.14}
            metalness={0.6}
            roughness={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

export function ProblemStation({
  animate,
  progress,
  focus,
}: {
  animate: boolean;
  progress: number;
  focus: number;
}) {
  const reveal = revealFromFocus(focus);
  return (
    <StationFrame position={[0, -2, -42]} animate={animate} seed={1.4} focus={focus}>
      <group position={[-8.4, 3.6, 0]}>
        <Stack
          reveal={reveal}
          blocks={[
            eyebrow(`${problem.number} ${problem.title}`),
            headline(problem.lede, SIZE.headline, 7.6),
            body(problem.body, 7.6, true),
            stamp(problem.resolution, 7.6),
          ]}
        />
      </group>

      {/* The four costs sit beside the argument rather than under it: stacked,
          the panel ran past the bottom of the frame. */}
      {problem.costs.map((cost, i) => (
        <group
          key={cost.number}
          position={[0.4 + (i % 2) * 4.9, 3.2 - Math.floor(i / 2) * 3.4, -0.4]}
        >
          <Stack
            reveal={staggeredReveal(reveal, i, CARD_STAGGER)}
            blocks={[numbered(cost.number, cost.title, cost.body, 4.5)]}
          />
        </group>
      ))}
      <Shards spread={progress} animate={animate} reveal={reveal} />
    </StationFrame>
  );
}
