import { Link } from 'react-router-dom';

import { Lede, MirrorSection, Prose } from '@/components/mirror/primitives';
import { Seo } from '@/components/seo';
import { Badge } from '@/components/ui/badge';
import { caseStudies, clients, portfolioIndex, portfolioIsPlaceholder } from '@/content/portfolio';

export default function PortfolioPage() {
  return (
    <>
      <Seo title="Portfolio" path="/portfolio" description={portfolioIndex.lede} />

      <MirrorSection className="pt-24 pb-8">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {portfolioIndex.title}
        </h1>
        <Lede>{portfolioIndex.lede}</Lede>
        <Prose>{portfolioIndex.body}</Prose>
        {portfolioIsPlaceholder ? (
          <p
            role="note"
            className="border-brand-gold/40 bg-brand-gold/10 text-brand-gold mt-6 rounded-lg border px-4 py-3 text-sm"
          >
            This page is running on placeholder data. Replace the entries in
            <code className="mx-1">src/content/portfolio.ts</code> with real clients and results
            before launch.
          </p>
        ) : null}
      </MirrorSection>

      <MirrorSection title="Clients">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {clients.map((client) => (
            <li
              key={client}
              className="border-border/70 text-muted-foreground flex min-h-16 items-center rounded-lg border px-4 text-sm"
            >
              {client}
            </li>
          ))}
        </ul>
      </MirrorSection>

      <MirrorSection title="Case studies">
        <ul className="grid gap-6 md:grid-cols-3">
          {caseStudies.map((study) => (
            <li key={study.slug} className="border-border/70 border-t pt-4">
              <p className="text-muted-foreground text-xs tracking-wide uppercase">
                {study.sector}
              </p>
              <h3 className="mt-2 font-semibold tracking-tight">
                <Link to={`/portfolio/${study.slug}`} className="hover:text-brand">
                  {study.title}
                </Link>
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {study.summary}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {study.services.map((service) => (
                  <Badge key={service} variant="secondary">
                    {service}
                  </Badge>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </MirrorSection>
    </>
  );
}
