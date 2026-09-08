import { Lock, RotateCcw, TrendingUp, Wallet } from 'lucide-react';

import { Reveal } from '@/components/marketing/reveal';
import { RevealGroup } from '@/components/marketing/reveal-group';
import { Stamp } from '@/components/marketing/typography';
import { Section, SectionHeading } from '@/components/sections/section';
import { Card, CardContent } from '@/components/ui/card';
import { problem } from '@/content/journey';

const ICONS = [Wallet, TrendingUp, RotateCcw, Lock];

export function ProblemSection() {
  return (
    <Section id="problem" tone="muted">
      <Reveal>
        <SectionHeading
          eyebrow={`${problem.number} · ${problem.title}`}
          title={problem.lede}
          description={problem.body}
        />
      </Reveal>

      <RevealGroup className="mt-10 grid gap-6 sm:grid-cols-2">
        {problem.costs.map((cost, i) => {
          const Icon = ICONS[i] ?? Wallet;
          return (
            <Card key={cost.number} className="h-full">
              <CardContent>
                <Icon className="text-brand size-6" aria-hidden="true" />
                <h3 className="mt-3 font-semibold tracking-tight">{cost.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{cost.body}</p>
              </CardContent>
            </Card>
          );
        })}
      </RevealGroup>

      <Reveal delay={0.1}>
        <Stamp>{problem.resolution}</Stamp>
      </Reveal>
    </Section>
  );
}
