import { Reveal } from '@/components/marketing/reveal';
import { RevealGroup } from '@/components/marketing/reveal-group';
import { PrincipleCard } from '@/components/marketing/principle-card';
import { Section, SectionHeading } from '@/components/sections/section';
import { principles } from '@/content/journey';

export function PrinciplesSection() {
  return (
    <Section id="principles" tone="muted">
      <Reveal>
        <SectionHeading
          eyebrow={`${principles.number} · ${principles.title}`}
          title={principles.title}
        />
      </Reveal>
      <RevealGroup className="mt-10 grid gap-6 sm:grid-cols-2">
        {principles.items.map((item) => (
          <PrincipleCard
            key={item.number}
            number={item.number}
            title={item.title}
            caption={item.caption}
          />
        ))}
      </RevealGroup>
    </Section>
  );
}
