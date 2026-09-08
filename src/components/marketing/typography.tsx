import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/** Shared body-copy building blocks used across every section and page. */

export function Lede({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn('text-foreground/90 max-w-2xl text-lg leading-relaxed text-pretty', className)}
    >
      {children}
    </p>
  );
}

export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn('text-muted-foreground mt-3 max-w-2xl leading-relaxed text-pretty', className)}
    >
      {children}
    </p>
  );
}

/** A pull-quote-style callout line, used for punchy single-sentence copy. */
export function Stamp({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        'text-brand border-brand/40 mt-6 max-w-2xl border-l-2 pl-5 text-xl font-semibold text-balance sm:text-2xl',
        className,
      )}
    >
      {children}
    </p>
  );
}
