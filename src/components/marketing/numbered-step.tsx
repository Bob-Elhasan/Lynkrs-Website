import { cn } from '@/lib/utils';

type Step = { number: string; title: string; body?: string };

/**
 * A connected step list: a numbered marker with a vertical line joining
 * them on mobile (where they stack), a plain grid on wider screens (where
 * a connecting line across wrapping columns gets fiddly for little payoff).
 */
export function NumberedSteps({
  steps,
  className,
}: {
  steps: readonly Step[];
  className?: string;
}) {
  return (
    <ol className={cn('mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {steps.map((step, i) => (
        <li key={step.number} className="relative pl-9 sm:pl-0">
          <span className="border-brand text-brand bg-background absolute top-0 left-0 flex size-7 items-center justify-center rounded-full border text-xs font-semibold sm:static">
            {i + 1}
          </span>
          <h3 className="mt-0 font-semibold tracking-tight sm:mt-3">{step.title}</h3>
          {step.body ? (
            <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{step.body}</p>
          ) : null}
          {i < steps.length - 1 ? (
            <span
              aria-hidden="true"
              className="bg-border absolute top-7 left-3.5 h-[calc(100%-1.75rem)] w-px sm:hidden"
            />
          ) : null}
        </li>
      ))}
    </ol>
  );
}
