'use client';

import { useReducedMotion } from '@/hooks/use-reduced-motion';

/**
 * Infinite marquee. Two instances with `reverse` run in opposite directions.
 * Speed is controlled with the CSS var --marquee-duration (default 38s).
 */
export function Marquee({
  items,
  reverse = false,
  duration = 38,
  className = '',
  separator = '•',
  variant = 'dark',
}: {
  items: readonly string[];
  reverse?: boolean;
  duration?: number;
  className?: string;
  separator?: string;
  variant?: 'dark' | 'light' | 'outline';
}) {
  const reduced = useReducedMotion();
  const loop = [...items, ...items];

  const tone =
    variant === 'light'
      ? 'text-ink/80'
      : variant === 'outline'
        ? 'text-transparent [-webkit-text-stroke:1px_rgba(217,155,127,0.45)]'
        : 'text-cream/85';

  return (
    <div className={`group relative w-full overflow-hidden py-3 ${className}`} aria-hidden="true">
      <div
        className="flex w-max items-center gap-6 whitespace-nowrap will-change-transform"
        style={{
          animation: reduced ? 'none' : `marquee ${duration}s linear infinite${reverse ? ' reverse' : ''}`,
        }}
      >
        {loop.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center gap-6">
            <span className={`font-display text-lg tracking-[0.03em] md:text-2xl ${tone}`}>{item}</span>
            <span className="text-peach/70">{separator}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Static grid variant used inside the footer strip. */
export function MarqueeStrip({
  lines,
}: {
  lines: { items: readonly string[]; reverse?: boolean; variant?: 'dark' | 'light' | 'outline' }[];
}) {
  return (
    <div className="border-y border-peach/15 bg-ink-deep/60">
      {lines.map((l, i) => (
        <Marquee key={i} items={l.items} reverse={l.reverse} variant={l.variant} duration={i === 0 ? 42 : 56} />
      ))}
    </div>
  );
}
