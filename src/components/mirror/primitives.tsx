import { cn } from '@/lib/utils';

/**
 * DOM mirror primitives.
 *
 * This layer renders the same content as the 3D corridor as real, semantic
 * HTML. It serves three audiences at once: search crawlers, screen readers,
 * and anyone whose device cannot run WebGL2. Content parity with the 3D scenes
 * is the rule — it mirrors, it never says something different.
 *
 * When the 3D stage is live this sits behind it, reachable by keyboard and
 * assistive tech but not competing visually.
 */

export function MirrorSection({
  id,
  number,
  title,
  children,
  className,
}: {
  id?: string;
  number?: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn('mx-auto w-full max-w-5xl px-5 py-16 lg:px-8', className)}>
      {title ? (
        <h2 className="font-display mb-6 text-2xl font-semibold tracking-tight sm:text-3xl">
          {number ? (
            <span className="text-brand mr-3 tabular-nums" aria-hidden="true">
              {number}
            </span>
          ) : null}
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}

export function Lede({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-foreground/90 max-w-3xl text-lg leading-relaxed text-pretty">
      {children}
    </p>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground mt-3 max-w-3xl leading-relaxed text-pretty">
      {children}
    </p>
  );
}

export function Stamp({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-brand mt-6 max-w-3xl text-xl font-semibold text-balance">
      {children}
    </p>
  );
}

/** The numbered list device that runs through the whole site. */
export function NumberedList({
  items,
  className,
}: {
  items: readonly { number: string; title: string; body?: string; caption?: string }[];
  className?: string;
}) {
  return (
    <ol className={cn('mt-8 grid gap-6 sm:grid-cols-2', className)}>
      {items.map((item) => (
        <li key={item.number} className="border-border/70 border-t pt-4">
          <span className="text-brand text-xs font-semibold tabular-nums" aria-hidden="true">
            {item.number}
          </span>
          <h3 className="mt-1.5 font-semibold tracking-tight">{item.title}</h3>
          {item.caption ? (
            <p className="text-muted-foreground mt-1 text-xs tracking-wide uppercase">
              {item.caption}
            </p>
          ) : null}
          {item.body ? (
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{item.body}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
