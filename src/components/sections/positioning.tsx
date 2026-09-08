import { Reveal } from '@/components/marketing/reveal';
import { Prose, Stamp } from '@/components/marketing/typography';
import { Section, SectionHeading } from '@/components/sections/section';
import { positioning } from '@/content/journey';

export function PositioningSection() {
  return (
    <Section id="positioning">
      <Reveal>
        <SectionHeading
          eyebrow={`${positioning.number} · ${positioning.title}`}
          title={positioning.lede}
        />
        <Prose>{positioning.body}</Prose>
        <Stamp>{positioning.stamp}</Stamp>
      </Reveal>
    </Section>
  );
}
