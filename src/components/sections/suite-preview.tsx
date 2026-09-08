import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { BundleCard } from '@/components/marketing/bundle-card';
import { Reveal } from '@/components/marketing/reveal';
import { RevealGroup } from '@/components/marketing/reveal-group';
import { Section, SectionHeading } from '@/components/sections/section';
import { bundles, suiteIndex } from '@/content/bundles';

export function SuitePreviewSection() {
  return (
    <Section id="suite" tone="muted">
      <Reveal>
        <SectionHeading
          eyebrow={`${suiteIndex.number} · ${suiteIndex.title}`}
          title={suiteIndex.lede}
          description={suiteIndex.body}
        />
      </Reveal>

      <RevealGroup className="mt-10 grid gap-6 sm:grid-cols-2">
        {bundles.map((bundle) => (
          <BundleCard key={bundle.slug} bundle={bundle} variant="preview" />
        ))}
      </RevealGroup>

      <p className="mt-8">
        <Link
          to="/bundles"
          className="text-brand inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4"
        >
          See the Growth Suite in full
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </p>
    </Section>
  );
}
