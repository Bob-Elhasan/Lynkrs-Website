import { TriangleAlert } from 'lucide-react';

import { CaseStudyCard } from '@/components/marketing/case-study-card';
import { Reveal } from '@/components/marketing/reveal';
import { RevealGroup } from '@/components/marketing/reveal-group';
import { Lede, Prose } from '@/components/marketing/typography';
import { Section, SectionHeading } from '@/components/sections/section';
import { Seo } from '@/components/seo';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { caseStudies, clients, portfolioIndex, portfolioIsPlaceholder } from '@/content/portfolio';

export default function PortfolioPage() {
  return (
    <>
      <Seo title="Portfolio" path="/portfolio" description={portfolioIndex.lede} />

      <Section className="pt-28 pb-8 sm:pt-36">
        <Reveal>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {portfolioIndex.title}
          </h1>
          <Lede className="mt-4">{portfolioIndex.lede}</Lede>
          <Prose>{portfolioIndex.body}</Prose>
          {portfolioIsPlaceholder ? (
            <Alert className="border-brand-gold/40 bg-brand-gold/10 mt-6 max-w-2xl">
              <TriangleAlert className="text-brand-gold" />
              <AlertTitle className="text-brand-gold">Running on placeholder data</AlertTitle>
              <AlertDescription>
                Replace the entries in <code className="mx-1">src/content/portfolio.ts</code> with
                real clients and results before launch.
              </AlertDescription>
            </Alert>
          ) : null}
        </Reveal>
      </Section>

      <Section tone="muted">
        <Reveal>
          <SectionHeading title="Clients" />
        </Reveal>
        <RevealGroup className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {clients.map((client) => (
            <Card
              key={client}
              className="text-muted-foreground flex min-h-16 items-center justify-center px-4 text-center text-sm"
            >
              {client}
            </Card>
          ))}
        </RevealGroup>
      </Section>

      <Section>
        <Reveal>
          <SectionHeading title="Case studies" />
        </Reveal>
        <RevealGroup className="mt-8 grid gap-6 md:grid-cols-3">
          {caseStudies.map((study) => (
            <CaseStudyCard key={study.slug} study={study} />
          ))}
        </RevealGroup>
      </Section>
    </>
  );
}
