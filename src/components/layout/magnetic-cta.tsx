import type { ReactNode } from 'react';

import { BorderTrail } from '@/components/motion-primitives/border-trail';
import { Magnetic } from '@/components/motion-primitives/magnetic';
import { cn } from '@/lib/utils';

/**
 * Wraps a primary CTA button with the two chrome effects that make it read
 * as *the* button to press: a magnetic pull toward the cursor and a light
 * that runs the border on loop. Both are already-vendored motion primitives
 * (see components/motion-primitives) — this only composes them around the
 * button markup at each call site, which stays in full control of its own
 * Link/submit/disabled behaviour.
 */
export function MagneticCta({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Magnetic range={90} intensity={0.35}>
      <div className={cn('relative inline-flex rounded-lg', className)}>
        {children}
        <BorderTrail size={44} className="bg-brand-gold/80" />
      </div>
    </Magnetic>
  );
}
