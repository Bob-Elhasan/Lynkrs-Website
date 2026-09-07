import { JourneyMirror } from '@/components/mirror/journey-mirror';
import { Seo } from '@/components/seo';
import { siteConfig } from '@/content/site';

export default function HomePage() {
  return (
    <>
      <Seo path="/" description={siteConfig.description} />
      <JourneyMirror />
    </>
  );
}
