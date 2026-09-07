import { services, servicesIndex } from '@/content/services';
import { PALETTE } from '@/xr/palette';
import { StationFrame } from '@/xr/stations/station-frame';
import { SIZE, Stack, body, eyebrow, headline, numbered } from '@/xr/ui/panel';

/** M/01–M/04 as volumes in space, each a doorway into its service page. */
export function ModulesStation({
  animate,
  focus,
}: {
  animate: boolean;
  focus: number;
}) {
  return (
    <StationFrame position={[-2, -10.4, -216]} animate={animate} seed={7.6} focus={focus}>
      <group position={[-10.2, 4.2, 1.5]}>
        <Stack
          blocks={[
            eyebrow(`${servicesIndex.number} ${servicesIndex.title}`),
            headline(servicesIndex.lede, SIZE.headline, 11),
          ]}
        />
      </group>

      {services.map((service, i) => (
        <group key={service.slug} position={[-10.2 + i * 4.5, -0.6, 0]}>
          <Stack
            gap={0.1}
            blocks={[
              eyebrow(service.code, 4.2),
              body(service.name, 4.2),
              body(service.lede, 4.2, true),
              ...service.deliverables
                .slice(0, 3)
                .map((d) => numbered(d.number, d.title, undefined, 4.2)),
            ]}
          />
        </group>
      ))}

      <pointLight position={[0, 1, 3]} intensity={16} color={PALETTE.blue} distance={28} />
    </StationFrame>
  );
}
