import { Link } from 'react-router-dom';

import { MagneticCta } from '@/components/layout/magnetic-cta';
import { GlowEffect } from '@/components/motion-primitives/glow-effect';
import { Button } from '@/components/ui/button';
import { arrival } from '@/content/journey';
import { ctas } from '@/content/site';

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <GlowEffect
          mode="breathe"
          blur="strongest"
          duration={10}
          colors={['var(--brand)', 'var(--brand-gold)']}
          className="absolute top-1/2 left-1/2 h-[70vw] max-h-[560px] w-[70vw] max-w-[560px] -translate-x-1/2 -translate-y-1/2 opacity-15"
        />
      </div>

      <div className="mx-auto w-full max-w-6xl px-5 pt-28 pb-20 sm:pt-36 sm:pb-28 lg:px-8">
        <p className="text-brand-gold text-xs font-semibold tracking-[0.22em] uppercase">
          {arrival.tagline}
        </p>
        <h1 className="font-display mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
          {arrival.headline.join(' ')}
        </h1>
        <p className="text-muted-foreground mt-5 max-w-2xl text-lg leading-relaxed text-pretty">
          {arrival.subhead}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <MagneticCta>
            <Button asChild size="lg" className="h-11 px-5">
              <Link to={ctas.primary.href}>{ctas.primary.label}</Link>
            </Button>
          </MagneticCta>
          <Button asChild variant="outline" size="lg" className="h-11 px-5">
            <Link to={ctas.secondary.href}>{ctas.secondary.label}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
