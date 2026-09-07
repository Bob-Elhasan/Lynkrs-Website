import { InfiniteSlider } from '@/components/motion-primitives/infinite-slider';
import { ProgressiveBlur } from '@/components/motion-primitives/progressive-blur';
import { logoStrip } from '@/lib/site';

/**
 * Wordmark strip. Swap the text nodes for <img> logos once real assets land in
 * /public — the slider and edge fade work the same either way.
 */
export function LogoMarquee() {
  return (
    <section className="border-border border-y py-10">
      <p className="text-muted-foreground mb-8 text-center text-xs font-medium tracking-[0.18em] uppercase">
        Trusted by teams running more than one brand
      </p>

      <div className="relative mx-auto max-w-6xl">
        <InfiniteSlider gap={72} speed={40} speedOnHover={12}>
          {logoStrip.map((name) => (
            <span
              key={name}
              className="text-muted-foreground/70 hover:text-foreground text-xl font-semibold tracking-tight whitespace-nowrap transition-colors"
            >
              {name}
            </span>
          ))}
        </InfiniteSlider>

        <ProgressiveBlur
          className="pointer-events-none absolute top-0 left-0 h-full w-24"
          direction="left"
          blurIntensity={1}
        />
        <ProgressiveBlur
          className="pointer-events-none absolute top-0 right-0 h-full w-24"
          direction="right"
          blurIntensity={1}
        />
      </div>
    </section>
  );
}
