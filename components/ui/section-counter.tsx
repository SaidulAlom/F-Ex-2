'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

/**
 * Fixed side counter: "01 / 09".
 * Any section with [data-section-label] is counted in document order.
 */
export function SectionCounter() {
  const [index, setIndex] = useState(0);
  const [total, setTotal] = useState(0);
  const [label, setLabel] = useState('');
  const reduced = useReducedMotion();

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section-label]'));
    setTotal(sections.length);
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const i = sections.indexOf(visible.target as HTMLElement);
        if (i >= 0) {
          setIndex(i);
          setLabel(visible.target.getAttribute('data-section-label') ?? '');
        }
      },
      { threshold: [0.25, 0.5, 0.75], rootMargin: '-20% 0px -20% 0px' }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  if (!total) return null;

  return (
    <div
      className="pointer-events-none fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex"
      aria-hidden="true"
    >
      <span className="font-display text-sm text-peach">{String(index + 1).padStart(2, '0')}</span>
      <span className="h-14 w-px bg-gradient-to-b from-peach/70 via-cream/20 to-transparent" />
      <span className="font-sans text-[10px] tracking-[0.2em] text-cream/40">{String(total).padStart(2, '0')}</span>
      {!reduced && label && (
        <span
          className="mt-2 font-sans text-[9px] uppercase tracking-[0.28em] text-cream/35"
          style={{ writingMode: 'vertical-rl' }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
