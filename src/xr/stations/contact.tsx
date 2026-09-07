import { closing } from '@/content/journey';
import { siteConfig } from '@/content/site';
import { PALETTE } from '@/xr/palette';
import { StationFrame } from '@/xr/stations/station-frame';
import { SIZE, Stack, body, eyebrow, headline, stamp } from '@/xr/ui/panel';

/**
 * The end of the corridor.
 *
 * The spatial panel states the invitation; the form itself is DOM. Leads are
 * the business outcome, so capture never depends on WebGL input working — it
 * runs on a real, focusable, autofillable form.
 */
export function ContactStation({
  animate,
  focus,
}: {
  animate: boolean;
  focus: number;
}) {
  return (
    <StationFrame position={[0, -13.2, -284]} animate={animate} seed={9.9} focus={focus}>
      <group position={[-8, 3.2, 0]}>
        <Stack
          blocks={[
            eyebrow(closing.eyebrow),
            headline(closing.headline, SIZE.headline),
            body(closing.body, 8.28, true),
            stamp(siteConfig.email),
          ]}
        />
      </group>
      <pointLight position={[0, 0, 3]} intensity={20} color={PALETTE.blueBright} distance={22} />
    </StationFrame>
  );
}
