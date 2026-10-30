'use client';

import { useState, type ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

/**
 * Masked line-by-line / letter-by-letter reveal.
 * Tweak: `stagger` (0.06) and `duration` (0.9) control the theatricality.
 */
export function RevealText({
  text,
  as: Tag = 'h2',
  className = '',
  mode = 'words',
  delay = 0,
  stagger = 0.045,
  once = true,
}: {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  className?: string;
  mode?: 'words' | 'lines' | 'letters';
  delay?: number;
  stagger?: number;
  once?: boolean;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <Tag className={className}>{text}</Tag>;

  const lines = text.split('\n');
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
  const item: Variants = {
    hidden: { y: '110%', opacity: 0 },
    show: { y: '0%', opacity: 1, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <Tag className={className}>
      <motion.span
        className="block"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once, margin: '-12% 0px' }}
        aria-label={text}
      >
        {lines.map((line, li) => {
          const units = mode === 'letters' ? Array.from(line) : line.split(' ');
          return (
            <span key={li} className="block overflow-hidden pb-[0.08em]">
              {units.map((unit, ui) => (
                <span
                  key={`${li}-${ui}`}
                  className="inline-block overflow-hidden align-bottom"
                  // NOTE: trailing spaces inside an inline-block are trimmed by
                  // CSS, so word gaps come from padding on the wrapper instead.
                  style={{ paddingRight: mode !== 'letters' && ui < units.length - 1 ? '0.26em' : undefined }}
                >
                  <motion.span variants={item} className="inline-block will-change-transform">
                    {unit}
                  </motion.span>
                </span>
              ))}
            </span>
          );
        })}
      </motion.span>
    </Tag>
  );
}

/** Simple fade + rise used for body copy, cards, images. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className = '',
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-10% 0px' }}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Clip-path wipe for images. */
export function ClipReveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Count-up number for the pinned promise section. */
export function CountUp({ to, suffix = '', className = '' }: { to: number; suffix?: string; className?: string }) {
  return <Counter to={to} suffix={suffix} className={className} />;
}

function Counter({ to, suffix, className = '' }: { to: number; suffix: string; className?: string }) {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);

  const start = () => {
    if (reduced) {
      setValue(to);
      return;
    }
    const t0 = performance.now();
    const dur = 1400;
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      setValue(Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  return (
    <motion.span
      className={className}
      onViewportEnter={start}
      viewport={{ once: true, margin: '-10% 0px' }}
      aria-label={`${to}${suffix}`}
    >
      {reduced ? to : value}
      {suffix}
    </motion.span>
  );
}
