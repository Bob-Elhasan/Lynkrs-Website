import { type ReactNode, useMemo, useRef } from 'react';
import {
  motion,
  useInView,
  type Transition,
  type UseInViewOptions,
  type Variant,
} from 'motion/react';

export type InViewProps = {
  children: ReactNode;
  variants?: {
    hidden: Variant;
    visible: Variant;
  };
  transition?: Transition;
  viewOptions?: UseInViewOptions;
  as?: React.ElementType;
  /** Reveal once and stay revealed, instead of re-hiding when scrolled away. */
  once?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

const defaultVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export function InView({
  children,
  variants = defaultVariants,
  transition,
  viewOptions,
  as = 'div',
  once,
  className,
  style,
}: InViewProps) {
  const ref = useRef(null);

  // `once` is handed to useInView rather than latched on animation completion.
  // Latching on completion means a fast scroll past an element that has a
  // stagger delay never finishes its animation, so the element re-hides.
  const isInView = useInView(ref, {
    ...viewOptions,
    once: once ?? viewOptions?.once,
  });

  const MotionComponent = useMemo(
    () =>
      motion.create(
        as as keyof React.JSX.IntrinsicElements
      ) as typeof motion.div,
    [as]
  );

  return (
    <MotionComponent
      ref={ref}
      initial='hidden'
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={transition}
      className={className}
      style={style}
    >
      {children}
    </MotionComponent>
  );
}
