import { NumberedSteps } from '@/components/marketing/numbered-step';
import { Reveal } from '@/components/marketing/reveal';
import { Prose, Stamp } from '@/components/marketing/typography';
import { Section, SectionHeading } from '@/components/sections/section';
import { together } from '@/content/journey';

export function TogetherSection() {
  return (
    <Section id="together" tone="muted">
      <Reveal>
        <SectionHeading eyebrow={`${together.number} · ${together.title}`} title={together.title} />
        <Stamp>{together.stamp}</Stamp>
        <Prose>{together.lede}</Prose>
        <Prose>{together.body}</Prose>
      </Reveal>
      <NumberedSteps steps={together.steps} />
    </Section>
  );
}
