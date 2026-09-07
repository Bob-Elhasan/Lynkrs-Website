import { useMemo } from 'react';

import { clamp, mapRange } from '@/xr/motion';
import { FOG, PALETTE } from '@/xr/palette';
import { Rig } from '@/xr/rig';
import { stationT } from '@/xr/spline';
import { ArrivalStation } from '@/xr/stations/arrival';
import { ContactStation } from '@/xr/stations/contact';
import { MethodStation } from '@/xr/stations/method';
import { ModulesStation } from '@/xr/stations/modules';
import { PositioningStation } from '@/xr/stations/positioning';
import { PrinciplesStation } from '@/xr/stations/principles';
import { ProblemStation } from '@/xr/stations/problem';
import { SuiteStation } from '@/xr/stations/suite';
import { TogetherStation } from '@/xr/stations/together';

type SceneProps = {
  target: number;
  reducedMotion: boolean;
};

/**
 * Everything in the corridor, plus the camera that flies it.
 *
 * Stations receive a local 0–1 `progress` derived from the global journey
 * position, so effects like the shards separating are driven by the visitor's
 * own scroll rather than a timer.
 */
export function Scene({ target, reducedMotion }: SceneProps) {
  const animate = !reducedMotion;

  const local = useMemo(
    () => ({
      problem: clamp(mapRange(target, stationT.arrival, stationT.problem, 0, 1)),
      positioning: clamp(
        mapRange(target, stationT.problem, stationT.positioning, 0, 1),
      ),
      method: clamp(mapRange(target, stationT.principles, stationT.method, 0, 1)),
    }),
    [target],
  );

  /**
   * Per-station focus: 1 at the station, falling to 0 roughly one station away.
   * Stations below the threshold unmount, so only the one you are reading (and
   * its immediate neighbour, mid-transition) is ever drawn.
   */
  const focus = useMemo(() => {
    const span = 1 / (Object.keys(stationT).length - 1);
    const at = (id: keyof typeof stationT) =>
      clamp(1 - Math.abs(target - stationT[id]) / (span * 1.35));
    return {
      arrival: at('arrival'),
      problem: at('problem'),
      positioning: at('positioning'),
      principles: at('principles'),
      method: at('method'),
      suite: at('suite'),
      modules: at('modules'),
      together: at('together'),
      contact: at('contact'),
    };
  }, [target]);

  return (
    <>
      <Rig target={target} reducedMotion={reducedMotion} />

      <color attach="background" args={[PALETTE.canvas]} />
      <fog attach="fog" args={[FOG.color, FOG.near, FOG.far]} />

      <ambientLight intensity={0.55} color={PALETTE.offWhite} />
      <directionalLight
        position={[4, 8, 6]}
        intensity={1.1}
        color={PALETTE.offWhite}
      />
      {/* Rim light in brand blue — the "light source" of the whole design. */}
      <directionalLight
        position={[-6, -2, -10]}
        intensity={1.4}
        color={PALETTE.blue}
      />

      <ArrivalStation animate={animate} focus={focus.arrival} />
      <ProblemStation animate={animate} progress={local.problem} focus={focus.problem} />
      <PositioningStation animate={animate} progress={local.positioning} focus={focus.positioning} />
      <PrinciplesStation animate={animate} focus={focus.principles} />
      <MethodStation animate={animate} progress={local.method} focus={focus.method} />
      <SuiteStation animate={animate} focus={focus.suite} />
      <ModulesStation animate={animate} focus={focus.modules} />
      <TogetherStation animate={animate} focus={focus.together} />
      <ContactStation animate={animate} focus={focus.contact} />

      <Starfield />
    </>
  );
}

/** Faint depth cues so the corridor reads as a space, not a void. */
function Starfield() {
  const positions = useMemo(() => {
    const count = 420;
    const array = new Float32Array(count * 3);
    // Deterministic so the field does not reshuffle between renders.
    let seed = 7;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < count; i += 1) {
      array[i * 3] = (random() - 0.5) * 70;
      array[i * 3 + 1] = (random() - 0.5) * 46 - 6;
      array[i * 3 + 2] = -random() * 300 + 10;
    }
    return array;
  }, []);

  // Positions are already in world space along the corridor, so the points
  // object stays at the origin rather than offsetting them a second time.
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color={PALETTE.blueBright}
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}
