import { bundles, suiteIndex } from '@/content/bundles';
import { PALETTE } from '@/xr/palette';
import { StationFrame } from '@/xr/stations/station-frame';
import { SIZE, Stack, body, eyebrow, headline, stamp } from '@/xr/ui/panel';

/** Four pylons, one per Growth Suite product, ascending as the stages do. */
export function SuiteStation({
  animate,
  focus,
}: {
  animate: boolean;
  focus: number;
}) {
  return (
    <StationFrame position={[3, -8.4, -178]} animate={animate} seed={6.3} focus={focus}>
      <group position={[-10.2, 4.2, 1]}>
        <Stack
          blocks={[
            eyebrow(`${suiteIndex.number} ${suiteIndex.title}`),
            headline(suiteIndex.lede, SIZE.headline, 11),
            body(suiteIndex.body, 7.92, true),
          ]}
        />
      </group>

      {bundles.map((bundle, i) => (
        <group key={bundle.slug} position={[-10.2 + i * 4.5, -0.6, 0]}>
          <Stack
            gap={0.1}
            blocks={[
              eyebrow(`${bundle.label} ${bundle.order}`, 4.2),
              body(bundle.name, 4.2),
              stamp(`“${bundle.quote}”`, 4.2),
            ]}
          />
          <pointLight
            position={[1, -0.5, 1]}
            intensity={6}
            color={i === bundles.length - 1 ? PALETTE.gold : PALETTE.blue}
            distance={6}
          />
        </group>
      ))}
    </StationFrame>
  );
}
