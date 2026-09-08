import { AnimatedNumber } from '@/components/motion-primitives/animated-number';
import { cn } from '@/lib/utils';

/** Pulls a leading number out of a metric string like "42%" or "3x". */
function parseLeadingNumber(value: string): { number: number; suffix: string } | null {
  const match = /^(-?\d+(?:\.\d+)?)(.*)$/.exec(value);
  if (!match) return null;
  return { number: Number(match[1]), suffix: match[2] };
}

/**
 * A case-study headline metric. Animates the numeric portion up when it
 * scrolls into view; falls back to plain static text for a value with no
 * parseable leading number, which today's placeholder values ("0%", "0x")
 * make a real path, not a hypothetical one — counting up to zero would be
 * pointless motion for no payoff.
 */
export function StatMetric({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className?: string;
}) {
  const parsed = parseLeadingNumber(value);
  return (
    <div className={cn('border-border/70 border-t pt-4', className)}>
      <p className="font-display text-4xl font-semibold tabular-nums">
        {parsed ? (
          <>
            <AnimatedNumber value={parsed.number} />
            {parsed.suffix}
          </>
        ) : (
          value
        )}
      </p>
      <p className="text-muted-foreground mt-1 text-sm">{label}</p>
    </div>
  );
}
