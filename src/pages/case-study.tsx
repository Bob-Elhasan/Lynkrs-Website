import { Link, Navigate, useParams } from 'react-router-dom';

import { Lede, MirrorSection, Prose } from '@/components/mirror/primitives';
import { Seo } from '@/components/seo';
import { getCaseStudy } from '@/content/portfolio';

export default function CaseStudyPage() {
  const { slug } = useParams<{ slug: string }>();
  const study = slug ? getCaseStudy(slug) : undefined;

  if (!study) return <Navigate to="/portfolio" replace />;

  return (
    <>
      <Seo title={study.title} path={`/portfolio/${study.slug}`} description={study.summary} />

      <MirrorSection className="pt-24 pb-8">
        <p className="text-muted-foreground text-xs tracking-wide uppercase">
          {study.client} · {study.sector}
        </p>
        <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {study.title}
        </h1>
        <Lede>{study.summary}</Lede>

        <dl className="mt-10 grid gap-6 sm:grid-cols-3">
          {study.metrics.map((metric) => (
            <div key={metric.label} className="border-border/70 border-t pt-4">
              <dt className="sr-only">{metric.label}</dt>
              <dd>
                <span className="font-display block text-4xl font-semibold tabular-nums">
                  {metric.value}
                </span>
                <span className="text-muted-foreground mt-1 block text-sm">{metric.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </MirrorSection>

      <MirrorSection title="The challenge">
        <Prose>{study.challenge}</Prose>
      </MirrorSection>

      <MirrorSection title="What we did">
        <ol className="mt-2 space-y-3">
          {study.approach.map((step, i) => (
            <li key={step} className="border-border/70 border-t pt-3">
              <span className="text-brand mr-3 text-xs font-semibold tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </MirrorSection>

      <MirrorSection title="The result">
        <Lede>{study.result}</Lede>
        <p className="mt-8">
          <Link to="/portfolio" className="text-brand text-sm underline underline-offset-4">
            Back to portfolio
          </Link>
        </p>
      </MirrorSection>
    </>
  );
}
