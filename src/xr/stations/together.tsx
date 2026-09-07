import { closing, together } from '@/content/journey';
import { revealFromFocus } from '@/xr/motion';
import { PALETTE } from '@/xr/palette';
import { StationFrame } from '@/xr/stations/station-frame';
import { SIZE, Stack, body, eyebrow, headline, numbered, stamp } from '@/xr/ui/panel';

/** The partnership model — the sharpest differentiator in the whole pitch. */
export function TogetherStation({
  animate,
  focus,
}: {
  animate: boolean;
  focus: number;
}) {
  const reveal = revealFromFocus(focus);
  return (
    <StationFrame position={[0, -12.4, -252]} animate={animate} seed={8.8} focus={focus}>
      <group position={[-8.6, 5.2, 0]}>
        <Stack
          reveal={reveal}
          blocks={[
            eyebrow(`${together.number} ${together.title}`),
            stamp(together.stamp, 7.92),
            body(together.lede, 7.92, true),
            body(together.body, 7.92),
            ...together.steps.map((s) => numbered(s.number, s.title, undefined, 7.56)),
          ]}
        />
      </group>

      <group position={[2.4, 2.4, -2.2]}>
        <Stack
          reveal={reveal}
          blocks={[
            eyebrow(closing.eyebrow, 6.12),
            headline(closing.headline, SIZE.headline),
            body(closing.body, 6.12, true),
          ]}
        />
      </group>

      <pointLight position={[1, 0, 2]} intensity={18} color={PALETTE.gold} distance={20} />
    </StationFrame>
  );
}
