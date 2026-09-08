import { ClosingCtaSection } from '@/components/sections/closing-cta';
import { Hero } from '@/components/sections/hero';
import { MethodSection } from '@/components/sections/method';
import { ModulesPreviewSection } from '@/components/sections/modules-preview';
import { PositioningSection } from '@/components/sections/positioning';
import { PrinciplesSection } from '@/components/sections/principles';
import { ProblemSection } from '@/components/sections/problem';
import { SuitePreviewSection } from '@/components/sections/suite-preview';
import { TogetherSection } from '@/components/sections/together';
import { Seo } from '@/components/seo';
import { siteConfig } from '@/content/site';

export default function HomePage() {
  return (
    <>
      <Seo path="/" description={siteConfig.description} />
      <Hero />
      <ProblemSection />
      <PositioningSection />
      <PrinciplesSection />
      <MethodSection />
      <SuitePreviewSection />
      <ModulesPreviewSection />
      <TogetherSection />
      <ClosingCtaSection />
    </>
  );
}
