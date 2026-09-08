import { CircleCheck } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { ServiceCard } from '@/components/marketing/service-card';
import { ServiceIcon } from '@/components/marketing/service-icon';
import { Reveal } from '@/components/marketing/reveal';
import { RevealGroup } from '@/components/marketing/reveal-group';
import { Lede, Stamp } from '@/components/marketing/typography';
import { Section, SectionHeading } from '@/components/sections/section';
import { Seo } from '@/components/seo';
import { Button } from '@/components/ui/button';
import { getService, services } from '@/content/services';
import { ctas } from '@/content/site';

/** One layout renders every service page, driven entirely by content data. */
export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const service = slug ? getService(slug) : undefined;

  if (!service) return <Navigate to="/services" replace />;

  const others = services.filter((s) => s.slug !== service.slug);

  return (
    <>
      <Seo
        title={service.name}
        path={`/services/${service.slug}`}
        description={`${service.lede} ${service.emphasis}`}
      />

      <Section className="pt-28 pb-8 sm:pt-36">
        <Reveal>
          <ServiceIcon slug={service.slug} className="text-brand size-8" />
          <p className="text-brand-gold mt-4 text-xs font-semibold tracking-[0.22em] uppercase">
            {service.code}
          </p>
          <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {service.name}
          </h1>
          <Lede className="mt-4">{service.lede}</Lede>
          <Stamp>{service.emphasis}</Stamp>
        </Reveal>
      </Section>

      <Section tone="muted">
        <Reveal>
          <SectionHeading title="What this involves" description={service.detail.intro} />
        </Reveal>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {service.deliverables.map((d) => (
            <li key={d.number} className="flex items-start gap-3">
              <CircleCheck className="text-brand mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <span className="font-medium tracking-tight">{d.title}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <Reveal>
          <SectionHeading title="What you get out of it" description={service.detail.outcome} />
        </Reveal>
      </Section>

      <Section tone="muted">
        <Reveal>
          <SectionHeading title="This is for you if" />
          <ul className="mt-6 space-y-3">
            {service.detail.forYouIf.map((line) => (
              <li key={line} className="flex items-start gap-3">
                <CircleCheck className="text-brand mt-0.5 size-5 shrink-0" aria-hidden="true" />
                <span className="text-muted-foreground">{line}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-11 px-5">
              <Link to={ctas.primary.href}>{ctas.primary.label}</Link>
            </Button>
          </div>
        </Reveal>
      </Section>

      <Section>
        <Reveal>
          <SectionHeading title="The other modules" />
        </Reveal>
        <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-3">
          {others.map((other) => (
            <ServiceCard key={other.slug} service={other} variant="compact" />
          ))}
        </RevealGroup>
      </Section>
    </>
  );
}
