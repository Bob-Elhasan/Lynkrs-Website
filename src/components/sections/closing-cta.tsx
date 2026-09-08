import { Link } from 'react-router-dom';

import { MagneticCta } from '@/components/layout/magnetic-cta';
import { Reveal } from '@/components/marketing/reveal';
import { Section } from '@/components/sections/section';
import { Button } from '@/components/ui/button';
import { closing } from '@/content/journey';
import { ctas } from '@/content/site';

export function ClosingCtaSection() {
  return (
    <Section id="contact" tone="deep" className="text-center">
      <Reveal>
        <p className="text-brand-gold text-xs font-semibold tracking-[0.22em] uppercase">
          {closing.eyebrow}
        </p>
        <h2 className="font-display mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {closing.headline}
        </h2>
        <p className="text-brand-foreground/80 mx-auto mt-4 max-w-xl text-base leading-relaxed text-pretty">
          {closing.body}
        </p>
        <div className="mt-8 flex justify-center">
          <MagneticCta>
            <Button asChild size="lg" className="h-11 px-5">
              <Link to={ctas.primary.href}>{ctas.primary.label}</Link>
            </Button>
          </MagneticCta>
        </div>
      </Reveal>
    </Section>
  );
}
