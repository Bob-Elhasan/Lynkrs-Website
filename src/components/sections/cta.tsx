import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { BorderTrail } from '@/components/motion-primitives/border-trail';
import { Magnetic } from '@/components/motion-primitives/magnetic';
import { Section } from '@/components/sections/section';
import { Button } from '@/components/ui/button';

export function Cta() {
  return (
    <Section>
      <div className="bg-card relative overflow-hidden rounded-3xl border px-7 py-16 text-center sm:px-16">
        <BorderTrail
          className="bg-primary/70"
          size={140}
          transition={{ repeat: Infinity, duration: 7, ease: 'linear' }}
        />
        <div
          aria-hidden="true"
          className="bg-primary/10 pointer-events-none absolute -top-24 left-1/2 size-[28rem] -translate-x-1/2 rounded-full blur-[120px]"
        />

        <h2 className="relative text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Stop running five plans that disagree
        </h2>
        <p className="text-muted-foreground relative mx-auto mt-4 max-w-xl text-base leading-relaxed text-pretty">
          Bring one brand or the whole house. We will map the spine on the call and you will see
          exactly where the current setup is leaking.
        </p>

        <div className="relative mt-9 flex justify-center">
          <Magnetic intensity={0.3} range={120}>
            <Button asChild size="lg" className="h-12 px-6 text-[0.95rem]">
              <Link to="/contact">
                Book a walkthrough
                <ArrowRight />
              </Link>
            </Button>
          </Magnetic>
        </div>
      </div>
    </Section>
  );
}
