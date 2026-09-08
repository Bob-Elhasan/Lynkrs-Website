import type { ReactNode } from 'react';
import type { Variants } from 'motion/react';

import { AnimatedGroup } from '@/components/motion-primitives/animated-group';

/**
 * Reveal's sibling for a grid of cards: the same fade-and-drift, staggered
 * child to child so a row of cards arrives in sequence instead of at once.
 * Deliberately restricted to this one look — no flip/bounce/rotate/zoom.
 */
const containerVariants: Variants = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

export function RevealGroup({
  children,
  className,
  as,
}: {
  children: ReactNode;
  className?: string;
  as?: React.ElementType;
}) {
  return (
    <AnimatedGroup
      as={as}
      className={className}
      variants={{ container: containerVariants, item: itemVariants }}
    >
      {children}
    </AnimatedGroup>
  );
}
