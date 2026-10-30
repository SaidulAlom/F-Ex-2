'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, useGsap } from '@/hooks/use-gsap';
import { useReducedMotion } from '@/hooks/use-reduced-motion';


/**
 * Scroll-scrubbed exploded phone: screen, battery, board and speaker separate
 * and reassemble while the repair steps light up in sync.
 *
 * TIMING: the scrub is pinned for 3 viewport heights; edit `end` to change.
 * Positions live in the style objects below (translate only — no layout).
 */
export function RepairAtelier() {
  const reduced = useReducedMotion();
  const scope = useGsap(({ gsap: g }) => {
    if (reduced) return;

    const tl = g.timeline({
      scrollTrigger: {
        trigger: '[data-atelier-stage]',
        start: 'top top',
        end: '+=2400',
        scrub: 0.8,
        pin: true,
        anticipatePin: 1,
      },
    });

    // 0 → 0.45 : explode outward
    tl.to('[data-part="screen"]', { yPercent: -34, z: 200, rotateX: 12, ease: 'none' }, 0)
      .to('[data-part="back"]', { yPercent: 26, rotateX: -8, ease: 'none' }, 0)
      .to('[data-part="battery"]', { xPercent: -52, yPercent: 12, ease: 'none' }, 0)
      .to('[data-part="board"]', { xPercent: 48, yPercent: -14, ease: 'none' }, 0)
      .to('[data-part="camera"]', { xPercent: 34, yPercent: -36, ease: 'none' }, 0)
      .to('[data-part="speaker"]', { xPercent: -40, yPercent: 34, ease: 'none' }, 0)
      // 0.45 → 0.8 : hold, reveal callouts
      .fromTo('[data-callout]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, stagger: 0.12, ease: 'power2.out' }, 0.35)
      // 0.8 → 1 : reassemble
      .to('[data-part="screen"]', { yPercent: 0, z: 0, rotateX: 0, ease: 'power2.inOut' }, 0.82)
      .to('[data-part="back"]', { yPercent: 0, rotateX: 0, ease: 'power2.inOut' }, 0.82)
      .to('[data-part="battery"]', { xPercent: 0, yPercent: 0, ease: 'power2.inOut' }, 0.82)
      .to('[data-part="board"]', { xPercent: 0, yPercent: 0, ease: 'power2.inOut' }, 0.82)
      .to('[data-part="camera"]', { xPercent: 0, yPercent: 0, ease: 'power2.inOut' }, 0.82)
      .to('[data-part="speaker"]', { xPercent: 0, yPercent: 0, ease: 'power2.inOut' }, 0.82)
      .to('[data-callout]', { opacity: 0.25, ease: 'none' }, 0.86);
  }, [reduced]);

  if (reduced) {
    // static, fully legible fallback
    return (
      <section className="bg-ink py-20">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-5 md:grid-cols-2">
          <div className="relative mx-auto h-[420px] w-[220px] rounded-3xl border border-peach/40 bg-plum/40">
            <div className="absolute inset-3 rounded-2xl border border-peach/30 bg-ink" />
            <div className="absolute inset-x-6 bottom-8 rounded-xl bg-peach/20 p-3 text-center text-[10px] uppercase tracking-[0.2em] text-peach">
              Internals
            </div>
          </div>
          <ol className="space-y-4">
            {steps.map((s) => (
              <li key={s.title} className="border-l border-peach/30 pl-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-peach/70">{s.n}</p>
                <p className="font-display text-xl text-cream">{s.title}</p>
                <p className="text-xs text-cream/50">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section ref={scope} className="relative bg-ink-deep">
      <div data-atelier-stage className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-5 py-16 md:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_45%_at_70%_45%,rgba(217,155,127,0.16),transparent_70%)]" />

        <div className="relative mx-auto grid w-full max-w-[1200px] items-center gap-10 md:grid-cols-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-peach/70">The repair atelier</p>
            <h2 className="mt-3 font-display text-5xl leading-[0.9] text-cream md:text-6xl">
              We take it
              <br />
              <span className="italic text-peach">apart.</span>
            </h2>
            <ol className="mt-8 space-y-5">
              {steps.map((s) => (
                <li key={s.n} data-callout className="border-l border-peach/25 pl-4">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-peach/60">{s.n}</p>
                  <p className="font-display text-xl text-cream">{s.title}</p>
                  <p className="mt-0.5 max-w-sm text-xs leading-relaxed text-cream/45">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* exploded phone */}
          <div className="relative mx-auto h-[460px] w-[240px]" style={{ perspective: '1200px' }}>
            <div data-part="back" className="absolute inset-0 rounded-[34px] border border-rose/40 bg-gradient-to-br from-rose/70 to-peach/50 will-change-transform" />
            <div data-part="battery" className="absolute left-8 right-8 top-[38%] h-28 rounded-lg bg-peach/30 will-change-transform" />
            <div data-part="board" className="absolute left-8 right-12 top-[16%] h-16 rounded-lg bg-plum will-change-transform">
              <span className="absolute inset-1 rounded border border-peach/30" />
            </div>
            <div data-part="camera" className="absolute left-6 top-6 h-14 w-14 rounded-xl border border-peach/60 bg-ink-deep will-change-transform">
              <span className="absolute left-2 top-2 h-4 w-4 rounded-full bg-peach/70" />
              <span className="absolute bottom-2 right-2 h-4 w-4 rounded-full bg-peach/70" />
            </div>
            <div data-part="speaker" className="absolute bottom-10 left-12 h-6 w-24 rounded bg-plum/80 will-change-transform" />
            <div data-part="screen" className="absolute inset-0 rounded-[34px] border border-peach/60 bg-gradient-to-b from-[#0a2130] to-[#1b2f3a] will-change-transform">
              <span className="absolute inset-x-8 top-1/2 -translate-y-1/2 text-center font-display text-3xl tracking-[0.2em] text-peach">
                F-EX
              </span>
            </div>
          </div>
        </div>

        <p className="relative mt-10 text-center text-[10px] uppercase tracking-[0.24em] text-cream/35">
          Free diagnosis at both branches · Genuine parts · 45–90 minutes on most screens
        </p>
      </div>
    </section>
  );
}

const steps = [
  {
    n: 'Step 01',
    title: 'Diagnosis',
    body: 'Free, at the counter. We open the phone, photograph it, and tell you what is actually wrong before quoting.',
  },
  {
    n: 'Step 02',
    title: 'Quote & approval',
    body: 'One price, including parts. Nothing starts until you approve it — no surprise line items at pickup.',
  },
  {
    n: 'Step 03',
    title: 'The repair',
    body: 'Genuine or OEM-grade parts, micro-soldering where needed, most screens finished in 45–90 minutes.',
  },
  {
    n: 'Step 04',
    title: 'Testing & handover',
    body: 'Touch, cameras, sensors, charging and battery health re-tested. Warranty card issued with the phone.',
  },
] as const;

export const repairStepList = steps;
