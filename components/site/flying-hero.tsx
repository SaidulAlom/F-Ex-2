/**
 * ARCHIVED 2026-10-29 — not imported by any route.
 * The home hero is now `components/site/pill-hero.tsx` (the F-EX wordmark splits
 * around a reel). This 3D handset hero, `components/ui/phone-flyer.ts` and
 * `components/ui/phone-three.ts` are kept for reference and cost nothing while
 * nothing imports them; swap HomePage back to <FlyingHero /> to restore it.
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, MessageCircle, Phone } from 'lucide-react';
import { site } from '@/lib/config';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { telLink, whatsappLink } from '@/lib/utils';
import type { FlyerHandle } from '@/components/ui/phone-flyer';

/**
 * Home hero.
 *
 * A real three.js handset (`phone-flyer.ts`) flies through a keyframed path
 * while the headline stays pinned: the section is ~2 screens tall and the stage
 * inside it is `sticky`, so scrolling drives the flight instead of moving the
 * canvas. Once the stage releases, the phone dives out and fades — it never
 * floats over the sections below, where it would sit on top of body copy.
 *
 * Fallbacks, in order: no WebGL / reduced motion / narrower than 1024px → the
 * canvas never mounts and the hero is a composed photograph (the same
 * per-scene stills the rest of the site uses below 1024px).
 */

type Pose = { x: number; y: number; s: number; yaw: number; pitch: number; roll: number };

/**
 * Keyframes across the hero's scroll span (0 → 1). `x`/`y` are fractions of the
 * visible half-width / half-height, `s` scales the handset, angles are degrees.
 * x stays right of 0.3 so the phone never crosses the copy column.
 */
const KEYS: Pose[] = [
  { x: 0.52, y: -0.04, s: 0.94, yaw: 34, pitch: 4, roll: -3 },
  { x: 0.3, y: 0.08, s: 0.86, yaw: -28, pitch: 9, roll: 6 },
  { x: 0.54, y: -0.1, s: 0.9, yaw: 58, pitch: -6, roll: -7 },
  { x: 0.44, y: 0.02, s: 0.82, yaw: 18, pitch: 3, roll: 2 },
];

/** Handset height as a fraction of viewport height. */
const SIZE = 0.5;
const MODEL_HEIGHT = 2.06;

const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/** Shortest-path angle interpolation — the phone never spins the long way. */
const lerpAngle = (a: number, b: number, t: number) => a + ((((b - a + 540) % 360) - 180) * t);

const CHIPS = ['New Phones', 'Pre-Owned', 'Accessories', 'Repairs', 'EMI', 'Same-Day Delivery'];

export function FlyingHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => setLoaded(true), []);

  const heroLabel = useCallback(() => sectionRef.current, []);

  useEffect(() => {
    if (reduced || typeof window === 'undefined') return;
    // Below 1024 the hero is photography, matching the rest of the site.
    if (window.innerWidth < 1024) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const probe = document.createElement('canvas');
    if (!probe.getContext('webgl2')) return;

    // three.js (~150 kB) is fetched only after mount, and only on a viewport that
    // will actually show the canvas — it never touches the first-load bundle.
    let flyer: FlyerHandle | null = null;
    let disposed = false;

    let raf = 0;
    let last = performance.now();
    const cur: Pose = { ...KEYS[0] };
    let velX = 0;
    let velY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let smoothX = 0;
    let smoothY = 0;
    let running = true;
    let heroTop = 0;
    let heroSpan = 1;

    const measure = () => {
      const el = heroLabel();
      const vh = window.innerHeight;
      if (el) {
        const r = el.getBoundingClientRect();
        heroTop = r.top + window.scrollY;
        heroSpan = Math.max(1, r.height - vh);
      }
      flyer?.resize(window.innerWidth, vh, Math.min(window.devicePixelRatio || 1, 2));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);

    const onMouse = (e: PointerEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onVisibility = () => {
      running = !document.hidden;
      last = performance.now();
    };
    window.addEventListener('pointermove', onMouse, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('resize', measure);

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!running || !flyer) return;

      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const time = now / 1000;
      const vh = window.innerHeight;

      // 0 → 1 across the sticky stage, then the exit run.
      const p = clamp((window.scrollY - heroTop) / heroSpan);
      const i = Math.min(KEYS.length - 2, Math.floor(p * (KEYS.length - 1)));
      const f = p * (KEYS.length - 1) - i;
      const t = ease(clamp((f - 0.12) / 0.76));
      const A = KEYS[i];
      const B = KEYS[i + 1];
      const dive = Math.sin(t * Math.PI) * -0.18;
      const target: Pose = {
        x: lerp(A.x, B.x, t),
        y: lerp(A.y, B.y, t) + dive,
        s: lerp(A.s, B.s, t) * (1 + Math.sin(t * Math.PI) * 0.1),
        yaw: lerpAngle(A.yaw, B.yaw, t),
        pitch: lerp(A.pitch, B.pitch, t),
        roll: lerp(A.roll, B.roll, t),
      };

      // Smooth follow: the phone lags the scroll slightly, then settles.
      const k = 1 - Math.exp(-dt * 3.2);
      const kYaw = 1 - Math.exp(-dt * 2.6);
      const prevX = cur.x;
      const prevY = cur.y;
      cur.x = lerp(cur.x, target.x, k);
      cur.y = lerp(cur.y, target.y, k);
      cur.s = lerp(cur.s, target.s, k);
      cur.pitch = lerp(cur.pitch, target.pitch, k);
      cur.roll = lerp(cur.roll, target.roll, k);
      cur.yaw = lerpAngle(cur.yaw, target.yaw, kYaw);
      velX = dt > 0 ? (cur.x - prevX) / dt : 0;
      velY = dt > 0 ? (cur.y - prevY) / dt : 0;

      smoothX = lerp(smoothX, mouseX, 1 - Math.exp(-dt * 2));
      smoothY = lerp(smoothY, mouseY, 1 - Math.exp(-dt * 2));

      // Hand-off: past the stage the phone dives down and dissolves.
      const exit = clamp((window.scrollY - (heroTop + heroSpan)) / (vh * 0.55));
      canvas.style.opacity = String(clamp(1 - exit * 1.8));

      const halfH = Math.tan((30 * Math.PI) / 180 / 2) * 10;
      const halfW = halfH * (window.innerWidth / Math.max(1, vh));
      const hover = Math.sin(time * 2.1) * 0.045 + Math.sin(time * 3.7) * 0.015;

      flyer.render({
        x: cur.x * halfW + Math.sin(time * 1.3) * 0.04 + smoothX * 0.1,
        y: cur.y * halfH + hover * halfH * 0.5 + smoothY * 0.07 - exit * halfH * 1.4,
        scale: ((halfH * 2 * SIZE) / MODEL_HEIGHT) * cur.s * (1 - exit * 0.25),
        yaw: -(cur.yaw + smoothX * 12),
        // Nose down when diving, bank into lateral movement.
        pitch: cur.pitch - clamp(velY * 22, -28, 28) + Math.sin(time * 2.1 + 1) * 3 + smoothY * 6,
        roll: cur.roll + clamp(velX * 18, -30, 30) + Math.sin(time * 1.7) * 4,
        time,
      });
    };
    import('@/components/ui/phone-flyer')
      .then(({ createPhoneFlyer }) => {
        if (disposed) return;
        flyer = createPhoneFlyer({
          canvas,
          ink: '#0F3040',
          bone: '#F6EBE3',
          accent: '#D99B7F',
          accentSecondary: '#A56F63',
          dprCap: 2,
          brand: 'F-Ex',
        });
        if (!flyer) return;
        measure();
        last = performance.now();
        canvas.classList.add('is-ready');
        raf = requestAnimationFrame(tick);
      })
      .catch(() => {
        /* chunk blocked or WebGL unavailable — the photo hero stands alone */
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onMouse);
      window.removeEventListener('resize', measure);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.classList.remove('is-ready');
      flyer?.dispose();
      flyer = null;
    };
  }, [reduced, heroLabel]);

  return (
    <>
      {/* Fixed so the handset stays put while its section scrolls under it;
          parked under the header (z-60) and above page content. */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="flyer-canvas pointer-events-none fixed inset-0 z-30 hidden h-full w-full lg:block"
      />

      <section
        ref={sectionRef}
        data-section-label="The store"
        aria-label={`${site.name} — phones, repairs and accessories in Guwahati`}
        className={`relative h-[100svh] bg-ink-deep lg:h-[175svh] ${loaded ? 'is-loaded' : ''}`}
      >
        <div className="sticky top-0 flex h-[100svh] w-full items-center overflow-hidden">
          {/* Real photography, scrimmed from the left so the copy column holds
              AA contrast while the still reads on the right. */}
          <picture className="absolute inset-0 block">
            <source srcSet="/mobile/scene-1-fade.webp" type="image/webp" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/photo-1695048133142-1a20484d2569.jpg"
              alt=""
              className="h-full w-full object-cover opacity-90"
            />
          </picture>
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(100deg, rgba(8,28,39,0.97) 0%, rgba(8,28,39,0.9) 38%, rgba(8,28,39,0.5) 62%, rgba(8,28,39,0.62) 100%)',
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink-deep to-transparent" />
          <div className="absolute inset-0 grain" />

          <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 pb-20 pt-28 md:px-10 lg:pl-20">
            <p className="text-[10px] uppercase tracking-[0.42em] text-peach/80 md:text-xs">
              {site.name} · Guwahati
            </p>

            <h1 className="mt-5 max-w-[13ch] font-display text-[clamp(2.5rem,6.2vw,5.6rem)] font-normal leading-[0.94] tracking-[-0.02em] text-cream">
              <span className="hero-line block overflow-hidden pb-[0.04em]">
                <span>Imagine your next</span>
              </span>
              <span className="hero-line block overflow-hidden pb-[0.04em]">
                <span>
                  <em className="not-italic text-peach">phone</em> built like this
                </span>
              </span>
            </h1>

            <p className="mt-7 max-w-[24rem] text-[15px] leading-relaxed text-cream/75 md:text-base">
              New and pre-owned smartphones, accessories and expert repairs at two Guwahati
              branches. Sealed boxes, honest grading, and a technician who answers the phone.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/new-phones"
                className="tap group inline-flex items-center gap-2.5 rounded-full bg-peach px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-deep transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-16px_rgba(217,155,127,0.85)]"
              >
                Shop phones
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href={telLink(site.phone)}
                className="tap inline-flex items-center gap-2.5 rounded-full border border-cream/25 px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-cream/90 transition-colors hover:border-peach/60 hover:text-peach"
              >
                <Phone className="h-3.5 w-3.5" />
                Call the counter
              </a>
              <a
                href={whatsappLink({ model: 'a phone' })}
                target="_blank"
                rel="noopener noreferrer"
                className="tap inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-peach/80 transition-colors hover:text-peach"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </a>
            </div>

            <ul className="mt-10 flex max-w-[26rem] flex-wrap gap-x-5 gap-y-2 text-[9px] uppercase tracking-[0.2em] text-cream/40 md:text-[10px]">
              {CHIPS.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between px-5 pb-6 text-[9px] uppercase tracking-[0.28em] text-cream/35 md:px-10">
            <span>
              Est. {site.established} · Lokhra &amp; Basistha
            </span>
            <span className="hidden md:inline">Scroll</span>
          </div>
        </div>
      </section>
    </>
  );
}
