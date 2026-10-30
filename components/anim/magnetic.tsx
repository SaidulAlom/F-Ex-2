'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

/**
 * Magnetic hover: the child drifts toward the pointer.
 * Tweak `strength` (0.35) and `spring` (stiffness 220 / damping 18).
 */
export function Magnetic({
  children,
  className = '',
  strength = 0.35,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
  as?: 'div' | 'span';
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });
  const Comp = motion[as] as typeof motion.div;

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <Comp
      ref={ref}
      className={className}
      style={{ x: sx, y: sy }}
      onPointerMove={(e: React.PointerEvent) => {
        const el = ref.current;
        if (!el || e.pointerType !== 'mouse') return;
        const r = el.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </Comp>
  );
}
