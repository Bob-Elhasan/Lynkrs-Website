import { Link } from 'react-router-dom';

import { Lede, MirrorSection, Prose } from '@/components/mirror/primitives';
import { Seo } from '@/components/seo';
import { method } from '@/content/method';
import { services, servicesIndex } from '@/content/services';
import { NumberedList } from '@/components/mirror/primitives';

export default function ServicesIndexPage() {
  return (
    <>
      <Seo
        title="What we run"
        path="/services"
        description={servicesIndex.lede}
      />

      <MirrorSection className="pt-24 pb-8">
        <p className="text-brand-gold text-xs font-semibold tracking-[0.22em] uppercase">
          {servicesIndex.number} {servicesIndex.title}
        </p>
        <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Three modules that run as one system
        </h1>
        <Prose>{servicesIndex.lede}</Prose>
      </MirrorSection>

      <MirrorSection>
        <ul className="grid gap-8 sm:grid-cols-2">
          {services.map((service) => (
            <li key={service.slug} className="border-border/70 border-t pt-5">
              <span className="text-brand text-xs font-semibold" aria-hidden="true">
                {service.code}
              </span>
              <h2 className="mt-1.5 text-xl font-semibold tracking-tight">
                <Link to={`/services/${service.slug}`} className="hover:text-brand">
                  {service.name}
                </Link>
              </h2>
              <p className="mt-2">{service.lede}</p>
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                {service.emphasis}
              </p>
              <Link
                to={`/services/${service.slug}`}
                className="text-brand mt-4 inline-block text-sm underline underline-offset-4"
              >
                What this involves
              </Link>
            </li>
          ))}
        </ul>
      </MirrorSection>

      <MirrorSection number={method.number} title={method.title}>
        <Lede>{method.lede}</Lede>
        <Prose>{method.body}</Prose>
        <NumberedList items={method.steps} />
      </MirrorSection>
    </>
  );
}
