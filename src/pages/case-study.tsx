import { Link, Navigate, useParams } from 'react-router-dom';

import { NumberedSteps } from '@/components/marketing/numbered-step';
import { Reveal } from '@/components/marketing/reveal';
import { RevealGroup } from '@/components/marketing/reveal-group';
import { StatMetric } from '@/components/marketing/stat-metric';
import { Lede } from '@/components/marketing/typography';
import { Section, SectionHeading } from '@/components/sections/section';
import { Seo } from '@/components/seo';
import { getCaseStudy } from '@/content/portfolio';

export default function CaseStudyPage() {
  const { slug } = useParams<{ slug: string }>();
  const study = slug ? getCaseStudy(slug) : undefined;

  if (!study) return <Navigate to="/portfolio" replace />;

  const approachSteps = study.approach.map((step, i) => ({ number: String(i + 1), title: step }));

  return (
    <>
      <Seo title={study.title} path={`/portfolio/${study.slug}`} description={study.summary} />

      <Section className="pt-28 pb-8 sm:pt-36">
        <Reveal>
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            {study.client} · {study.sector}
          </p>
          <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {study.title}
          </h1>
          <Lede className="mt-4">{study.summary}</Lede>
        </Reveal>

        <RevealGroup className="mt-10 grid gap-6 sm:grid-cols-3">
          {study.metrics.map((metric) => (
            <StatMetric key={metric.label} value={metric.value} label={metric.label} />
          ))}
        </RevealGroup>
      </Section>

      <Section tone="muted">
        <Reveal>
          <SectionHeading title="The challenge" description={study.challenge} />
        </Reveal>
      </Section>

      <Section>
        <Reveal>
          <SectionHeading title="What we did" />
        </Reveal>
        <NumberedSteps steps={approachSteps} />
      </Section>

      <Section tone="muted">
        <Reveal>
          <SectionHeading title="The result" description={study.result} />
          <Link
            to="/portfolio"
            className="text-brand mt-6 inline-block text-sm underline underline-offset-4"
          >
            Back to portfolio
          </Link>
        </Reveal>
      </Section>
    </>
  );
}
