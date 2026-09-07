import { services, servicesIndex } from '@/content/services';
import { CARD_STAGGER, revealFromFocus, staggeredReveal } from '@/xr/motion';
import { PALETTE } from '@/xr/palette';
import { StationFrame } from '@/xr/stations/station-frame';
import { SIZE, Stack, Surface, body, eyebrow, headline, numbered } from '@/xr/ui/panel';
import { InteractiveCard } from '@/xr/ui/interactive-card';

/** Rough footprint of a module card, generous enough that hovering the gaps
 * between lines still registers rather than only the glyphs themselves. */
const CARD_HITBOX: [number, number] = [4.4, 3.3];

export function ModulesStation({
  animate,
  focus,
  navigate,
}: {
  animate: boolean;
  focus: number;
  navigate: (path: string) => void;
}) {
  const reveal = revealFromFocus(focus);
  return (
    <StationFrame position={[-2, -10.4, -216]} animate={animate} seed={7.6} focus={focus}>
      <group position={[-10.2, 4.2, 1.5]}>
        <Stack
          reveal={reveal}
          blocks={[
            eyebrow(`${servicesIndex.number} ${servicesIndex.title}`),
            headline(servicesIndex.lede, SIZE.headline, 11),
          ]}
        />
      </group>

      {services.map((service, i) => {
        const cardReveal = staggeredReveal(reveal, i, CARD_STAGGER);
        return (
          <InteractiveCard
            key={service.slug}
            position={[-10.2 + i * 4.5, -0.6, 0]}
            onSelect={() => navigate(`/services/${service.slug}`)}
            light={{
              color: PALETTE.blueBright,
              baseIntensity: 0,
              hoverIntensity: 9,
              position: [2.1, -1.4, 1.4],
              distance: 6,
            }}
          >
            <Surface width={CARD_HITBOX[0]} height={CARD_HITBOX[1]} padding={0.22} reveal={cardReveal} />
            <Stack
              gap={0.1}
              reveal={cardReveal}
              blocks={[
                eyebrow(service.code, 4.2),
                body(service.name, 4.2),
                body(service.lede, 4.2, true),
                ...service.deliverables
                  .slice(0, 3)
                  .map((d) => numbered(d.number, d.title, undefined, 4.2)),
              ]}
            />
          </InteractiveCard>
        );
      })}

      <pointLight position={[0, 1, 3]} intensity={16} color={PALETTE.blue} distance={28} />
    </StationFrame>
  );
}
