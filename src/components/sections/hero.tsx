import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { AnimatedGroup } from '@/components/motion-primitives/animated-group';
import { Spotlight } from '@/components/motion-primitives/spotlight';
import { TextEffect } from '@/components/motion-primitives/text-effect';
import { TextLoop } from '@/components/motion-primitives/text-loop';
import { Button } from '@/components/ui/button';
import { heroContent } from '@/lib/site';

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Ambient grid + glow behind the headline. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:64px_64px] opacity-40 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
      />
      <div
        aria-hidden="true"
        className="bg-primary/20 pointer-events-none absolute top-[-14rem] left-1/2 -z-10 size-[36rem] -translate-x-1/2 rounded-full blur-[140px]"
      />
      <Spotlight
        className="from-primary/25 via-primary/10 to-transparent blur-3xl"
        size={520}
      />

      <div className="mx-auto w-full max-w-6xl px-5 pt-20 pb-24 lg:px-8 lg:pt-28 lg:pb-32">
        <AnimatedGroup preset="blur-slide" className="max-w-3xl">
          <p className="border-border bg-muted/40 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
            <span className="bg-primary size-1.5 rounded-full" />
            {heroContent.eyebrow}
          </p>
        </AnimatedGroup>

        <TextEffect
          as="h1"
          per="word"
          preset="blur"
          speedReveal={1.6}
          delay={0.15}
          className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl"
        >
          {heroContent.headline}
        </TextEffect>

        <AnimatedGroup preset="slide" className="mt-7 max-w-2xl">
          <p className="text-muted-foreground text-lg leading-relaxed text-pretty">
            {heroContent.subhead}
          </p>

          <div className="text-muted-foreground mt-5 flex items-center gap-2 text-sm">
            <span>One system for</span>
            <TextLoop
              className="text-foreground font-medium"
              interval={2.2}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              {heroContent.rotatingWords.map((word) => (
                <span key={word}>{word}</span>
              ))}
            </TextLoop>
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="h-11 px-5 text-[0.95rem]">
              <Link to={heroContent.primaryCta.href}>
                {heroContent.primaryCta.label}
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 px-5 text-[0.95rem]">
              <Link to={heroContent.secondaryCta.href}>{heroContent.secondaryCta.label}</Link>
            </Button>
          </div>
        </AnimatedGroup>
      </div>
    </section>
  );
}
