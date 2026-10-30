'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { promises } from '@/lib/config';
import { CountUp } from '@/components/anim/reveal';

/**
 * Pinned three-chapter story. As you scroll, the background morphs
 * Deep Teal → Slate Plum → Dusty Rose tint → back to Deep Teal and the
 * big chapter numbers count up.
 *
 * TIMING: each chapter takes 100vh of scroll (see `h-[300vh]`).
 */
export function PromisePinned() {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  const bg = useTransform(
    scrollYProgress,
    [0, 0.33, 0.66, 1],
    ['#0F3040', '#464858', '#4a3b41', '#0F3040']
  );
  const glow = useTransform(scrollYProgress, [0, 0.5, 1], [0.12, 0.35, 0.12]);

  if (reduced) {
    return (
      <section className="bg-ink py-24">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-5 md:grid-cols-3">
          {promises.map((p) => (
            <div key={p.number}>
              <p className="font-display text-5xl text-peach/40">{p.number}</p>
              <h3 className="mt-2 font-display text-3xl text-cream">{p.title}</h3>
              <p className="mt-2 text-sm text-cream/55">{p.body}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} data-section-label="The promise" className="relative h-[300vh] bg-ink">
      <motion.div className="sticky top-0 flex h-[100svh] items-center overflow-hidden" style={{ backgroundColor: bg }}>
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ opacity: glow, background: 'radial-gradient(50% 50% at 50% 45%, rgba(217,155,127,0.55), transparent 70%)' }}
        />
        <div className="relative mx-auto grid w-full max-w-[1200px] gap-10 px-5 md:grid-cols-[auto_1fr] md:items-center md:gap-16 md:px-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-peach/70">The F-Ex promise</p>
            <h2 className="mt-3 font-display text-[13vw] leading-[0.85] text-cream sm:text-7xl">
              Three
              <br />
              <span className="italic text-peach">promises.</span>
            </h2>
            <div className="mt-8 flex gap-8">
              <div>
                <p className="font-display text-4xl text-cream">
                  <CountUp to={32} suffix="" />
                </p>
                <p className="text-[9px] uppercase tracking-[0.2em] text-cream/45">point inspection</p>
              </div>
              <div>
                <p className="font-display text-4xl text-cream">
                  <CountUp to={12} suffix="h" />
                </p>
                <p className="text-[9px] uppercase tracking-[0.2em] text-cream/45">open daily</p>
              </div>
              <div>
                <p className="font-display text-4xl text-cream">
                  <CountUp to={2024} suffix="" />
                </p>
                <p className="text-[9px] uppercase tracking-[0.2em] text-cream/45">established</p>
              </div>
            </div>
          </div>

          <ol className="space-y-6">
            {promises.map((p, i) => (
              <Chapter key={p.number} promise={p} index={i} progress={scrollYProgress} total={promises.length} />
            ))}
          </ol>
        </div>
      </motion.div>
    </section>
  );
}

function Chapter({
  promise,
  index,
  progress,
  total,
}: {
  promise: (typeof promises)[number];
  index: number;
  progress: ReturnType<typeof useScroll>['scrollYProgress'];
  total: number;
}) {
  const start = index / total;
  const end = (index + 1) / total;
  const opacity = useTransform(progress, [start, start + 0.08, end - 0.08, end], [0.15, 1, 1, 0.15]);
  const x = useTransform(progress, [start, start + 0.1], [24, 0]);

  return (
    <motion.li style={{ opacity, x }} className="grid grid-cols-[auto_1fr] gap-4 border-l border-peach/25 pl-5 md:gap-6">
      <span className="font-display text-4xl leading-none text-peach/60 md:text-5xl">{promise.number}</span>
      <div>
        <p className="text-[9px] uppercase tracking-[0.26em] text-peach/60">{promise.kicker}</p>
        <h3 className="mt-1 font-display text-2xl text-cream md:text-4xl">{promise.title}</h3>
        <p className="mt-2 max-w-lg text-xs leading-relaxed text-cream/55 md:text-sm">{promise.body}</p>
      </div>
    </motion.li>
  );
}
