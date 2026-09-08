import { Link } from 'react-router-dom';

import { BundleCard } from '@/components/marketing/bundle-card';
import { MagneticCta } from '@/components/layout/magnetic-cta';
import { Reveal } from '@/components/marketing/reveal';
import { Section, SectionHeading } from '@/components/sections/section';
import { Seo } from '@/components/seo';
import { Button } from '@/components/ui/button';
import { bundles, suiteIndex } from '@/content/bundles';
import { ctas } from '@/content/site';

/** All four Growth Suite products on one page, in stage order. */
export default function BundlesPage() {
  return (
    <>
      <Seo
        title="The Growth Suite"
        path="/bundles"
        description={`${suiteIndex.lede} ${suiteIndex.body}`}
      />

      <Section className="pt-28 pb-8 sm:pt-36">
        <Reveal>
          <SectionHeading
            as="h1"
            eyebrow={`${suiteIndex.number} · ${suiteIndex.title}`}
            title={suiteIndex.lede}
            description={suiteIndex.body}
          />
        </Reveal>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-8">
          {bundles.map((bundle, i) => (
            <Reveal key={bundle.slug} delay={Math.min(i * 0.05, 0.15)}>
              <BundleCard bundle={bundle} variant="full" />
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="deep" className="text-center">
        <Reveal>
          <MagneticCta>
            <Button asChild size="lg" className="h-11 px-5">
              <Link to={ctas.primary.href}>{ctas.primary.label}</Link>
            </Button>
          </MagneticCta>
        </Reveal>
      </Section>
    </>
  );
}
