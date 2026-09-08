import { Reveal } from '@/components/marketing/reveal';
import { NumberedSteps } from '@/components/marketing/numbered-step';
import { Section, SectionHeading } from '@/components/sections/section';
import { method } from '@/content/method';

export function MethodSection() {
  return (
    <Section id="method">
      <Reveal>
        <SectionHeading
          eyebrow={`${method.number} · ${method.title}`}
          title={method.lede}
          description={method.body}
        />
      </Reveal>
      <NumberedSteps steps={method.steps} />
    </Section>
  );
}
