import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Reveal } from '@/components/marketing/reveal';
import { Seo } from '@/components/seo';
import { Section } from '@/components/sections/section';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <>
      <Seo title="Page not found" path="/404" description="That page does not exist." />

      <Section className="pt-32 pb-32 text-center sm:pt-32 sm:pb-32">
        <Reveal>
          <Compass className="text-muted-foreground mx-auto size-10" aria-hidden="true" />
          <p className="text-primary mt-4 text-7xl font-semibold tracking-tight tabular-nums">
            404
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">This link is broken</h1>
          <p className="text-muted-foreground mx-auto mt-3 max-w-md text-base leading-relaxed">
            Fitting, for a company called Lynkrs. The page you asked for is not here.
          </p>
          <Button asChild size="lg" className="mt-8 h-11 px-5">
            <Link to="/">Back to home</Link>
          </Button>
        </Reveal>
      </Section>
    </>
  );
}
