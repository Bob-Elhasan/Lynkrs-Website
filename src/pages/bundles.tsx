import { Link } from 'react-router-dom';

import { Lede, MirrorSection, Prose } from '@/components/mirror/primitives';
import { Seo } from '@/components/seo';
import { Button } from '@/components/ui/button';
import { bundles, suiteIndex } from '@/content/bundles';
import { ctas } from '@/content/site';

/** All four Growth Suite products on one page, in stage order. */
export default function BundlesPage() {
  return (
    <>
      <Seo
        title="The Growth Suite"
        path="/bundles"
        description={`${suiteIndex.lede} ${suiteIndex.body}`}
      />

      <MirrorSection className="pt-24 pb-8">
        <p className="text-brand-gold text-xs font-semibold tracking-[0.22em] uppercase">
          {suiteIndex.number} {suiteIndex.title}
        </p>
        <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {suiteIndex.lede}
        </h1>
        <Prose>{suiteIndex.body}</Prose>
      </MirrorSection>

      {bundles.map((bundle) => (
        <MirrorSection key={bundle.slug} id={bundle.slug}>
          <article className="border-border/70 border-t pt-6">
            <p className="text-brand text-xs font-semibold tracking-wide uppercase">
              {bundle.label} {bundle.order}
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              {bundle.name}
            </h2>
            <p className="text-brand/90 mt-3 text-lg italic">“{bundle.quote}”</p>
            <Lede>{bundle.summary}</Lede>

            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold tracking-wide uppercase">Overview</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {bundle.overview}
                </p>
                <h3 className="mt-6 text-sm font-semibold tracking-wide uppercase">
                  What it produces
                </h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {bundle.output}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-wide uppercase">
                  What is included
                </h3>
                {bundle.inherits ? (
                  <p className="text-brand mt-2 text-sm">
                    Everything in {bundle.inherits}, plus:
                  </p>
                ) : null}
                <ul className="text-muted-foreground mt-2 space-y-1.5 text-sm">
                  {bundle.includes.map((item) => (
                    <li key={item} className="border-border/50 border-b pb-1.5">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        </MirrorSection>
      ))}

      <MirrorSection>
        <Button asChild size="lg" className="h-11 px-5">
          <Link to={ctas.primary.href}>{ctas.primary.label}</Link>
        </Button>
      </MirrorSection>
    </>
  );
}
