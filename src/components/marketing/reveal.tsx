import type { ReactNode } from 'react';

import { InView } from '@/components/motion-primitives/in-view';

/**
 * The site's one house style for "this appeared as you scrolled to it":
 * a small fade plus an upward drift, never anything gimmicky. Every section
 * imports this rather than InView directly, so the tuning lives in one
 * place. Reduced motion is handled globally by MotionConfig in App.tsx, not
 * here — this component doesn't need to know about it.
 */
const HIDDEN = { opacity: 0, y: 14 };
const VISIBLE = { opacity: 1, y: 0 };

export function Reveal({
  children,
  className,
  delay = 0,
  as,
}: {
  children: ReactNode;
  className?: string;
  /** Stagger a handful of reveals by hand outside of RevealGroup. */
  delay?: number;
  as?: React.ElementType;
}) {
  return (
    <InView
      as={as}
      className={className}
      variants={{ hidden: HIDDEN, visible: VISIBLE }}
      transition={{ duration: 0.45, delay, ease: 'easeOut' }}
      viewOptions={{ once: true, margin: '0px 0px -80px 0px' }}
    >
      {children}
    </InView>
  );
}
