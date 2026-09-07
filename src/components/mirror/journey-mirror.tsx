import { Link } from 'react-router-dom';

import { bundles, suiteIndex } from '@/content/bundles';
import { arrival, positioning, principles, problem, together, closing } from '@/content/journey';
import { method } from '@/content/method';
import { services, servicesIndex } from '@/content/services';
import { ctas } from '@/content/site';
import { Lede, MirrorSection, NumberedList, Prose, Stamp } from '@/components/mirror/primitives';
import { MagneticCta } from '@/components/layout/magnetic-cta';
import { Button } from '@/components/ui/button';

/**
 * The complete homepage journey as semantic HTML, in the same 01–07 order as
 * the 3D corridor. This is what a crawler indexes and what a screen reader
 * announces, so it carries every word — not a summary.
 */
export function JourneyMirror() {
  return (
    <>
      <MirrorSection className="pt-24 pb-10">
        <p className="text-brand-gold text-xs font-semibold tracking-[0.22em] uppercase">
          {arrival.tagline}
        </p>
        <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
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
      </MirrorSection>

      <MirrorSection id="problem" number={problem.number} title={problem.title}>
        <Lede>{problem.lede}</Lede>
        <Prose>{problem.body}</Prose>
        <NumberedList items={problem.costs} />
        <Stamp>{problem.resolution}</Stamp>
      </MirrorSection>

      <MirrorSection id="positioning" number={positioning.number} title={positioning.title}>
        <Lede>{positioning.lede}</Lede>
        <Prose>{positioning.body}</Prose>
        <Stamp>{positioning.stamp}</Stamp>
      </MirrorSection>

      <MirrorSection id="principles" number={principles.number} title={principles.title}>
        <NumberedList items={principles.items} />
      </MirrorSection>

      <MirrorSection id="method" number={method.number} title={method.title}>
        <Lede>{method.lede}</Lede>
        <Prose>{method.body}</Prose>
        <NumberedList items={method.steps} />
      </MirrorSection>

      <MirrorSection id="suite" number={suiteIndex.number} title={suiteIndex.title}>
        <Lede>{suiteIndex.lede}</Lede>
        <Prose>{suiteIndex.body}</Prose>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2">
          {bundles.map((bundle) => (
            <li key={bundle.slug} className="border-border/70 border-t pt-4">
              <span className="text-brand text-xs font-semibold" aria-hidden="true">
                {bundle.label} {bundle.order}
              </span>
              <h3 className="mt-1.5 font-semibold tracking-tight">{bundle.name}</h3>
              <p className="text-brand/90 mt-2 text-sm italic">“{bundle.quote}”</p>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {bundle.summary}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-8">
          <Link to="/bundles" className="text-brand text-sm underline underline-offset-4">
            See the Growth Suite in full
          </Link>
        </p>
      </MirrorSection>

      <MirrorSection id="modules" number={servicesIndex.number} title={servicesIndex.title}>
        <Lede>{servicesIndex.lede}</Lede>
        <ul className="mt-8 grid gap-8 sm:grid-cols-2">
          {services.map((service) => (
            <li key={service.slug} className="border-border/70 border-t pt-4">
              <span className="text-brand text-xs font-semibold" aria-hidden="true">
                {service.code}
              </span>
              <h3 className="mt-1.5 font-semibold tracking-tight">
                <Link to={`/services/${service.slug}`} className="hover:text-brand">
                  {service.name}
                </Link>
              </h3>
              <p className="mt-2 text-sm">{service.lede}</p>
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                {service.emphasis}
              </p>
              <ul className="text-muted-foreground mt-3 space-y-1 text-sm">
                {service.deliverables.map((d) => (
                  <li key={d.number}>
                    <span className="text-brand/80 mr-2 tabular-nums" aria-hidden="true">
                      {d.number}
                    </span>
                    {d.title}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </MirrorSection>

      <MirrorSection id="together" number={together.number} title={together.title}>
        <Stamp>{together.stamp}</Stamp>
        <Prose>{together.lede}</Prose>
        <Prose>{together.body}</Prose>
        <NumberedList items={together.steps} />
      </MirrorSection>

      <MirrorSection id="contact">
        <p className="text-brand-gold text-xs font-semibold tracking-[0.22em] uppercase">
          {closing.eyebrow}
        </p>
        <h2 className="font-display mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {closing.headline}
        </h2>
        <Prose>{closing.body}</Prose>
        <div className="mt-8 flex flex-wrap gap-3">
          <MagneticCta>
            <Button asChild size="lg" className="h-11 px-5">
              <Link to={ctas.primary.href}>{ctas.primary.label}</Link>
            </Button>
          </MagneticCta>
        </div>
      </MirrorSection>
    </>
  );
}
