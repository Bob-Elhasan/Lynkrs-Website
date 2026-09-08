import { NumberedSteps } from '@/components/marketing/numbered-step';
import { Reveal } from '@/components/marketing/reveal';
import { RevealGroup } from '@/components/marketing/reveal-group';
import { ServiceCard } from '@/components/marketing/service-card';
import { Section, SectionHeading } from '@/components/sections/section';
import { Seo } from '@/components/seo';
import { method } from '@/content/method';
import { services, servicesIndex } from '@/content/services';

export default function ServicesIndexPage() {
  return (
    <>
      <Seo title="What we run" path="/services" description={servicesIndex.lede} />

      <Section className="pt-28 pb-8 sm:pt-36">
        <Reveal>
          <SectionHeading
            as="h1"
            eyebrow={`${servicesIndex.number} · ${servicesIndex.title}`}
            title={servicesIndex.lede}
          />
        </Reveal>
      </Section>

      <Section className="pt-0">
        <RevealGroup className="grid gap-6 sm:grid-cols-2">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} variant="full" />
          ))}
        </RevealGroup>
      </Section>

      <Section tone="muted">
        <Reveal>
          <SectionHeading
            eyebrow={`${method.number} · ${method.title}`}
            title={method.lede}
            description={method.body}
          />
        </Reveal>
        <NumberedSteps steps={method.steps} />
      </Section>
    </>
  );
}
