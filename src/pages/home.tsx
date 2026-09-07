import { Seo } from '@/components/seo';
import { Cta } from '@/components/sections/cta';
import { Faq } from '@/components/sections/faq';
import { Features } from '@/components/sections/features';
import { Hero } from '@/components/sections/hero';
import { HowItWorks } from '@/components/sections/how-it-works';
import { LogoMarquee } from '@/components/sections/logo-marquee';
import { Stats } from '@/components/sections/stats';

export default function HomePage() {
  return (
    <>
      <Seo path="/" />
      <Hero />
      <LogoMarquee />
      <Features />
      <Stats />
      <HowItWorks />
      <Faq />
      <Cta />
    </>
  );
}
