'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

const SESSION_KEY = 'fex-intro-seen';

/**
 * Total time the intro is on screen before the exit transition starts.
 * 150 ms settle + 700 ms for the wordmark lift + counter run to 100.
 */
const INTRO_MS = 1150;

/** The wordmark the loader reveals. */
const WORD = 'F-EX';

/**
 * Typographic intro: the F-EX wordmark in Bodoni lifts in letter by letter out
 * of a mask, a peach counter runs 00 → 100 in the corner, then the whole screen
 * wipes upward to reveal the hero.
 *
 * Skipped for reduced-motion users and after the first visit in a session, so
 * it never taxes repeat navigation.
 *
 * ROBUSTNESS — this overlay covers the entire viewport, so it must be
 * impossible for it to outlive its own timer:
 *   1. `useReducedMotion()` returns `boolean | null` (null on first paint).
 *      Using that directly as a dependency re-ran the mount effect, whose
 *      cleanup cancelled the dismiss timer while the overlay stayed mounted.
 *   2. React StrictMode invokes effects twice (mount → cleanup → mount). If the
 *      second pass bails out early — because `sessionStorage` now says the intro
 *      was seen — the first pass's timer is gone and the overlay hangs forever.
 * So the decision to *start* the intro is made once (guarded), and the
 * *dismissal* is driven by state in its own effect: whenever `show` is true a
 * timer exists, regardless of how many times effects re-run.
 */
export function Loader() {
  const [show, setShow] = useState(false);
  const reduced = Boolean(useReducedMotion());
  const started = useRef(false);
  const counterRef = useRef<HTMLSpanElement | null>(null);
  const barRef = useRef<HTMLSpanElement | null>(null);

  // 1 — decide once whether this session gets the intro.
  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (reduced) return;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* private mode — just show once */
    }
    setShow(true);
  }, [reduced]);

  // 2 — while it is on screen, it always has an exit.
  useEffect(() => {
    if (!show) return;
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    const t = setTimeout(() => setShow(false), INTRO_MS);
    return () => {
      clearTimeout(t);
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [show]);

  // 3 — counter + progress bar, driven off one rAF loop and written straight to
  // the DOM. Doing this in React state would re-render ~60 times per second for
  // a number that is on screen for a second.
  useEffect(() => {
    if (!show) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / (INTRO_MS * 0.82));
      const value = Math.round(p * 100);
      if (counterRef.current) counterRef.current.textContent = String(value).padStart(3, '0');
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[95] flex items-center justify-center overflow-hidden bg-ink-deep"
          initial={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.62, ease: [0.76, 0, 0.24, 1] }}
          role="status"
          aria-live="polite"
          aria-label="Loading F-Ex Store"
        >
          {/* hairline rules — the same framing grammar as the hero stage */}
          <span aria-hidden className="absolute inset-y-0 left-[12%] w-px bg-peach/10" />
          <span aria-hidden className="absolute inset-y-0 right-[12%] w-px bg-peach/10" />

          <div className="relative z-10 flex w-full max-w-[1100px] flex-col items-center px-6">
            {/* the wordmark, revealed per letter out of a clipping mask */}
            <div className="flex items-baseline overflow-hidden pb-2 font-display leading-[0.85]">
              {WORD.split('').map((ch, i) => (
                <motion.span
                  key={`${ch}-${i}`}
                  className={ch === '-' ? 'text-peach/70' : 'text-cream'}
                  style={{ fontSize: 'clamp(3.2rem, 13vw, 10rem)' }}
                  initial={{ y: '108%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  transition={{ duration: 0.62, delay: 0.06 + i * 0.075, ease: [0.22, 1, 0.36, 1] }}
                >
                  {ch}
                </motion.span>
              ))}
            </div>

            <motion.p
              className="mt-4 font-sans text-[9px] uppercase tracking-[0.5em] text-peach/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.42, duration: 0.45 }}
            >
              Guwahati · Est. 2024
            </motion.p>
          </div>

          {/* counter, bottom-right — aria-hidden, the overlay carries the label */}
          <div
            aria-hidden
            className="absolute inset-x-[6%] bottom-7 flex items-end justify-between font-sans text-[10px] uppercase tracking-[0.32em] text-cream/45"
          >
            <span>Mobile dealer</span>
            <span className="flex items-baseline gap-2 text-cream/80">
              <span ref={counterRef} className="tabular-nums text-[11px] tracking-[0.18em] text-peach">
                000
              </span>
              <span className="text-cream/30">/ 100</span>
            </span>
          </div>

          {/* progress hairline */}
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-cream/10">
            <span
              ref={barRef}
              className="block h-px origin-left scale-x-0 bg-peach"
              style={{ willChange: 'transform' }}
            />
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
