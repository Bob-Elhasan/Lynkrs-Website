import { Seo } from '@/components/seo';
import { Cta } from '@/components/sections/cta';
import { Features } from '@/components/sections/features';
import { HowItWorks } from '@/components/sections/how-it-works';
import { Section, SectionHeading } from '@/components/sections/section';
import { TextEffect } from '@/components/motion-primitives/text-effect';

export default function PlatformPage() {
  return (
    <>
      <Seo
        title="Platform"
        path="/platform"
        description="How Lynkrs models your brands, wires the workflow to the strategy, and closes the measurement loop."
      />

      <Section id="about" className="pt-16 pb-8 sm:pt-20 sm:pb-10">
        <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">Platform</p>
        <TextEffect
          as="h1"
          per="word"
          preset="blur"
          speedReveal={1.7}
          className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl"
        >
          The layer that makes your existing stack agree with itself
        </TextEffect>
        <p className="text-muted-foreground mt-5 max-w-2xl text-lg leading-relaxed text-pretty">
          Lynkrs does not ask you to abandon the tools your team already knows. It models the
          strategy once and connects everything else to it, so the plan, the work and the numbers
          stop drifting apart.
        </p>
      </Section>

      <Features />
      <HowItWorks />

      <Section>
        <SectionHeading
          eyebrow="Built for"
          title="Marketing leads who own more than one plate"
          description="Fractional CMOs, in-house leads running a house of brands, and agencies who want the strategy to survive the handoff."
        />
      </Section>

      <Cta />
    </>
  );
}
