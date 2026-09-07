import { Link, Navigate, useParams } from 'react-router-dom';

import { Lede, MirrorSection, NumberedList, Prose, Stamp } from '@/components/mirror/primitives';
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

      <MirrorSection className="pt-24 pb-8">
        <p className="text-brand-gold text-xs font-semibold tracking-[0.22em] uppercase">
          {service.code}
        </p>
        <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {service.name}
        </h1>
        <Lede>{service.lede}</Lede>
        <Stamp>{service.emphasis}</Stamp>
      </MirrorSection>

      <MirrorSection title="What this involves">
        <Prose>{service.detail.intro}</Prose>
        <NumberedList items={service.deliverables} />
      </MirrorSection>

      <MirrorSection title="What you get out of it">
        <Lede>{service.detail.outcome}</Lede>
      </MirrorSection>

      <MirrorSection title="This is for you if">
        <ul className="mt-2 space-y-3">
          {service.detail.forYouIf.map((line) => (
            <li key={line} className="border-border/70 text-muted-foreground border-t pt-3">
              {line}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" className="h-11 px-5">
            <Link to={ctas.primary.href}>{ctas.primary.label}</Link>
          </Button>
        </div>
      </MirrorSection>

      <MirrorSection title="The other modules">
        <ul className="grid gap-4 sm:grid-cols-3">
          {others.map((other) => (
            <li key={other.slug} className="border-border/70 border-t pt-3">
              <span className="text-brand text-xs font-semibold" aria-hidden="true">
                {other.code}
              </span>
              <Link
                to={`/services/${other.slug}`}
                className="hover:text-brand mt-1 block font-semibold tracking-tight"
              >
                {other.name}
              </Link>
            </li>
          ))}
        </ul>
      </MirrorSection>
    </>
  );
}
