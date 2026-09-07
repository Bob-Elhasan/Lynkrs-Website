import { InView } from '@/components/motion-primitives/in-view';
import { Section, SectionHeading } from '@/components/sections/section';
import { features } from '@/lib/site';

export function Features() {
  return (
    <Section id="features">
      <SectionHeading
        eyebrow="What it does"
        title="Strategy, work and proof on the same spine"
        description="Most stacks lose the thread between the plan and what actually ships. These are the joins Lynkrs holds together."
      />

      <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <InView
            key={feature.title}
            as="div"
            once
            viewOptions={{ margin: '0px 0px -80px 0px' }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: index * 0.06 }}
            className="bg-card hover:bg-muted/40 group relative p-7 outline outline-border transition-colors"
          >
            <span className="text-primary text-xs font-semibold tabular-nums">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="mt-3 text-lg font-semibold tracking-tight">{feature.title}</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{feature.body}</p>
          </InView>
        ))}
      </div>
    </Section>
  );
}
