import { InView } from '@/components/motion-primitives/in-view';
import { Section, SectionHeading } from '@/components/sections/section';
import { steps } from '@/lib/site';

export function HowItWorks() {
  return (
    <Section id="how-it-works" className="bg-muted/30 border-border border-y">
      <SectionHeading
        eyebrow="How it works"
        title="Three moves, then it compounds"
        description="Onboarding is not a migration project. It is agreeing on the spine once, then letting everything downstream inherit it."
      />

      <ol className="mt-14 grid gap-8 md:grid-cols-3">
        {steps.map((item, index) => (
          <InView
            key={item.step}
            as="li"
            once
            variants={{
              hidden: { opacity: 0, y: 24 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.1 }}
            className="relative"
          >
            <div className="border-primary/40 text-primary flex size-11 items-center justify-center rounded-xl border text-sm font-semibold tabular-nums">
              {item.step}
            </div>
            <h3 className="mt-5 text-xl font-semibold tracking-tight">{item.title}</h3>
            <p className="text-muted-foreground mt-2.5 text-sm leading-relaxed">{item.body}</p>
          </InView>
        ))}
      </ol>
    </Section>
  );
}
