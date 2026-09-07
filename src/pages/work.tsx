import { InView } from '@/components/motion-primitives/in-view';
import { Tilt } from '@/components/motion-primitives/tilt';
import { Seo } from '@/components/seo';
import { Cta } from '@/components/sections/cta';
import { Section, SectionHeading } from '@/components/sections/section';
import { Badge } from '@/components/ui/badge';

// Placeholder case studies. Replace with real engagements and swap the gradient
// blocks for cover images once the assets exist.
const caseStudies = [
  {
    client: 'Employment ecosystem, MENA',
    title: 'Four platforms, one positioning spine',
    summary:
      'Unified separate product brands under a single strategic frame without flattening the voices that made each one work.',
    tags: ['Brand architecture', 'Positioning'],
  },
  {
    client: 'Fitness, Egypt',
    title: 'A 90-day content engine that held its shape',
    summary:
      'Built a seasonal calendar wired to business objectives, so the team could publish fast without re-litigating the strategy each week.',
    tags: ['Content system', 'Campaign planning'],
  },
  {
    client: 'Wellness, New Cairo',
    title: 'Premium clinic, ecosystem positioning',
    summary:
      'Repositioned a service business as a lifestyle brand, with cross-promotion built into the architecture rather than bolted on.',
    tags: ['Brand strategy', 'Go-to-market'],
  },
];

export default function WorkPage() {
  return (
    <>
      <Seo
        title="Work"
        path="/work"
        description="Selected engagements: brand architecture, content systems and go-to-market work built to outlast the quarter."
      />

      <Section className="pt-16 pb-4 sm:pt-20 sm:pb-6">
        <SectionHeading
          as="h1"
          eyebrow="Work"
          title="Systems we built that are still running"
          description="A sample of engagements. The through-line is the same every time: make the strategy something the team can actually work inside."
        />
      </Section>

      <Section className="pt-6 sm:pt-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {caseStudies.map((study, index) => (
            <InView
              key={study.title}
              as="div"
              once
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.08 }}
            >
              <Tilt rotationFactor={5} className="h-full">
                <article className="bg-card flex h-full flex-col overflow-hidden rounded-2xl border">
                  <div className="from-primary/25 to-primary/5 aspect-[16/10] bg-gradient-to-br via-transparent" />
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      {study.client}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold tracking-tight text-balance">
                      {study.title}
                    </h3>
                    <p className="text-muted-foreground mt-3 flex-1 text-sm leading-relaxed">
                      {study.summary}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {study.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </article>
              </Tilt>
            </InView>
          ))}
        </div>
      </Section>

      <Cta />
    </>
  );
}
