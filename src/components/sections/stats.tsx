import { InView } from '@/components/motion-primitives/in-view';
import { Section } from '@/components/sections/section';
import { stats } from '@/lib/site';

export function Stats() {
  return (
    <Section className="pt-16 pb-16 sm:pt-20 sm:pb-20">
      <dl className="grid gap-10 sm:grid-cols-3">
        {stats.map((stat, index) => (
          <InView
            key={stat.label}
            as="div"
            once
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: index * 0.08 }}
          >
            <dt className="sr-only">{stat.label}</dt>
            <dd>
              <span className="block text-5xl font-semibold tracking-tight tabular-nums">
                {stat.value}
              </span>
              <span className="text-muted-foreground mt-2 block text-sm">{stat.label}</span>
            </dd>
          </InView>
        ))}
      </dl>
    </Section>
  );
}
