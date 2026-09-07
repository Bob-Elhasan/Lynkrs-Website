import { method } from '@/content/method';
import { clamp } from '@/xr/motion';
import { PALETTE } from '@/xr/palette';
import { StationFrame } from '@/xr/stations/station-frame';
import { SIZE, Stack, body, eyebrow, headline, numbered } from '@/xr/ui/panel';

/** Five steps laid along the direction of travel; each lights as it is reached. */
export function MethodStation({
  animate,
  progress,
  focus,
}: {
  animate: boolean;
  progress: number;
  focus: number;
}) {
  return (
    <StationFrame position={[0, -6.4, -140]} animate={animate} seed={5.1} focus={focus}>
      <group position={[-8.6, 5, 2]}>
        <Stack
          blocks={[
            eyebrow(`${method.number} ${method.title}`),
            headline(method.lede, SIZE.headline),
            body(method.body, 7.92, true),
          ]}
        />
      </group>

      {method.steps.map((step, i) => {
        const reached = clamp((progress - i * 0.16) * 5);
        return (
          <group key={step.number} position={[1.4, 3 - i * 2.4, -i * 2.4]}>
            <Stack blocks={[numbered(step.number, step.title, step.body, 7.2)]} />
            <pointLight
              position={[1, -0.4, 1.2]}
              intensity={reached * 9}
              color={PALETTE.blueBright}
              distance={7}
            />
          </group>
        );
      })}
    </StationFrame>
  );
}
