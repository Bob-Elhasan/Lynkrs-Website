import { CircleCheck } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Bundle } from '@/content/bundles';

export function BundleCard({
  bundle,
  variant = 'preview',
}: {
  bundle: Bundle;
  variant?: 'preview' | 'full';
}) {
  if (variant === 'preview') {
    return (
      <Card className="h-full">
        <CardHeader>
          <p className="text-brand text-xs font-semibold tracking-wide uppercase">
            {bundle.label} {bundle.order}
          </p>
          <CardTitle className="text-lg">{bundle.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-brand/90 text-sm italic">&ldquo;{bundle.quote}&rdquo;</p>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{bundle.summary}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id={bundle.slug} className="scroll-mt-24">
      <CardHeader>
        <p className="text-brand text-xs font-semibold tracking-wide uppercase">
          {bundle.label} {bundle.order}
        </p>
        <CardTitle className="text-2xl">{bundle.name}</CardTitle>
        <p className="text-brand/90 mt-2 text-lg italic">&ldquo;{bundle.quote}&rdquo;</p>
      </CardHeader>
      <CardContent>
        <p className="text-lg leading-relaxed text-pretty">{bundle.summary}</p>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold tracking-wide uppercase">Overview</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{bundle.overview}</p>
            <h3 className="mt-6 text-sm font-semibold tracking-wide uppercase">What it produces</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{bundle.output}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wide uppercase">What is included</h3>
            {bundle.inherits ? (
              <p className="text-brand mt-2 text-sm font-medium">
                Everything in {bundle.inherits}, plus:
              </p>
            ) : null}
            <ul className="mt-3 space-y-2">
              {bundle.includes.map((item) => (
                <li key={item} className="text-muted-foreground flex items-start gap-2 text-sm">
                  <CircleCheck className="text-brand mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
