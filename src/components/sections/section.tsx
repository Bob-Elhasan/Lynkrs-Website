import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

const TONE = {
  default: '',
  muted: 'bg-muted/40',
  deep: 'bg-brand-deep text-brand-foreground',
} as const;

/** Shared page-section shell so vertical rhythm stays consistent site-wide. */
export function Section({
  children,
  className,
  id,
  tone = 'default',
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  /** Alternates section background weight so the page doesn't read as one flat rhythm. */
  tone?: keyof typeof TONE;
}) {
  return (
    <section id={id} className={cn('pt-20 pb-20 sm:pt-28 sm:pb-28', TONE[tone], className)}>
      <div className="mx-auto w-full max-w-6xl px-5 lg:px-8">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  /** Use "h1" for the heading that opens a page, "h2" elsewhere. */
  as: Heading = 'h2',
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  as?: 'h1' | 'h2';
}) {
  return (
    <div className={cn('max-w-2xl', className)}>
      {eyebrow ? (
        <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">{eyebrow}</p>
      ) : null}
      <Heading className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </Heading>
      {description ? (
        <p className="text-muted-foreground mt-4 text-base leading-relaxed text-pretty sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
