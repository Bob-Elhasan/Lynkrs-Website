import { Reveal } from '@/components/marketing/reveal';
import { RevealGroup } from '@/components/marketing/reveal-group';
import { ServiceCard } from '@/components/marketing/service-card';
import { Section, SectionHeading } from '@/components/sections/section';
import { services, servicesIndex } from '@/content/services';

export function ModulesPreviewSection() {
  return (
    <Section id="modules">
      <Reveal>
        <SectionHeading
          eyebrow={`${servicesIndex.number} · ${servicesIndex.title}`}
          title={servicesIndex.lede}
        />
      </Reveal>
      <RevealGroup className="mt-10 grid gap-6 sm:grid-cols-2">
        {services.map((service) => (
          <ServiceCard key={service.slug} service={service} variant="preview" />
        ))}
      </RevealGroup>
    </Section>
  );
}
