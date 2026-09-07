import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';

import { arrival } from '@/content/journey';
import { AMBIENT } from '@/xr/motion';
import { PALETTE } from '@/xr/palette';
import { StationFrame } from '@/xr/stations/station-frame';
import { SIZE, Stack, body, headline, stamp } from '@/xr/ui/panel';

/** The brand object: one form, lit from within, slowly turning. */
function GrowthCore({ animate }: { animate: boolean }) {
  const mesh = useRef<Mesh>(null);
  useFrame((state, delta) => {
    if (!animate || !mesh.current) return;
    mesh.current.rotation.y += delta * AMBIENT.rotate * 3;
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.14) * 0.14;
  });
  return (
    <mesh ref={mesh} position={[6.4, 0.6, -2.5]}>
      <icosahedronGeometry args={[1.5, 1]} />
      <meshStandardMaterial
        color={PALETTE.blue}
        emissive={PALETTE.blue}
        emissiveIntensity={0.55}
        metalness={0.75}
        roughness={0.22}
        flatShading
      />
    </mesh>
  );
}

export function ArrivalStation({
  animate,
  focus,
}: {
  animate: boolean;
  focus: number;
}) {
  return (
    <StationFrame position={[0, 0, -8]} animate={animate} seed={0} focus={focus}>
      <group position={[-7.4, 2.8, 0]}>
        <Stack
          blocks={[
            stamp(arrival.tagline),
            headline(arrival.headline.join(' '), SIZE.headlineLarge),
            body(arrival.subhead, 8.28, true),
          ]}
        />
      </group>
      <GrowthCore animate={animate} />
      <pointLight position={[6.4, 0.6, -0.5]} intensity={22} color={PALETTE.blue} distance={18} />
    </StationFrame>
  );
}
