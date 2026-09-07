import { bundles, suiteIndex } from '@/content/bundles';
import { CARD_STAGGER, revealFromFocus, staggeredReveal } from '@/xr/motion';
import { PALETTE } from '@/xr/palette';
import { StationFrame } from '@/xr/stations/station-frame';
import { SIZE, Stack, Surface, body, eyebrow, headline, stamp } from '@/xr/ui/panel';
import { InteractiveCard } from '@/xr/ui/interactive-card';

const CARD_HITBOX: [number, number] = [4.4, 2.4];

/** Four pylons, one per Growth Suite product, ascending as the stages do. */
export function SuiteStation({
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
    <StationFrame position={[3, -8.4, -178]} animate={animate} seed={6.3} focus={focus}>
      <group position={[-10.2, 4.2, 1]}>
        <Stack
          reveal={reveal}
          blocks={[
            eyebrow(`${suiteIndex.number} ${suiteIndex.title}`),
            headline(suiteIndex.lede, SIZE.headline, 11),
            body(suiteIndex.body, 7.92, true),
          ]}
        />
      </group>

      {bundles.map((bundle, i) => {
        const cardReveal = staggeredReveal(reveal, i, CARD_STAGGER);
        const cardColor = i === bundles.length - 1 ? PALETTE.gold : PALETTE.blue;
        return (
          <InteractiveCard
            key={bundle.slug}
            position={[-10.2 + i * 4.5, -0.6, 0]}
            onSelect={() => navigate(`/bundles#${bundle.slug}`)}
            light={{
              color: cardColor,
              baseIntensity: 6,
              hoverIntensity: 16,
              position: [1, -0.5, 1],
              distance: 6,
            }}
          >
            <Surface width={CARD_HITBOX[0]} height={CARD_HITBOX[1]} padding={0.22} reveal={cardReveal} />
            <Stack
              gap={0.1}
              reveal={cardReveal}
              blocks={[
                eyebrow(`${bundle.label} ${bundle.order}`, 4.2),
                body(bundle.name, 4.2),
                stamp(`“${bundle.quote}”`, 4.2),
              ]}
            />
          </InteractiveCard>
        );
      })}
    </StationFrame>
  );
}
