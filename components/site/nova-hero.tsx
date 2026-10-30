'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CircularCarousel from './circular-carousel';
import type { RobotApi, FaceMode } from './nova-robot';
import '@/app/nova.css';

/**
 * The paper hero (§1) and the services panel (§2) of the home page.
 *
 * A boxy white-ceramic counter robot stands on a charcoal pedestal on a warm
 * paper sheet ruled with three hairlines. Scrolling eases the camera from a full
 * figure to a close-up of its face. Everything is drawn in code — the robot is
 * three.js primitives, the face and the gradient ring are canvases.
 *
 * three.js is imported on demand, and skipped for reduced-motion or low-power
 * devices (they get a single still frame instead of a render loop).
 */

const PROMPTS = [
  'Show me a pre-owned iPhone 15 Pro under \u20b970,000 at Lokhra.',
  'What EMI plan fits a \u20b945,000 budget on a Pixel 8?',
  'My screen cracked \u2014 how long will the repair take?',
  'Compare battery health across your pre-owned units.',
];

const FEATURES = ['NEW PHONES', 'PRE-OWNED', 'EMI & EXCHANGE', 'REPAIRS & MORE'];

/* §2 — the F-Ex story told in six chapters, one per card on the ring. */
const STORIES = [
  {
    src: '/images/store-interior.jpg',
    alt: 'The F-Ex counter in Lokhra, glass cases of phones under warm light',
    title: 'The counter',
    subtitle: 'Lokhra · Basistha',
    href: '/branches',
  },
  {
    src: '/images/photo-1695048133142-1a20484d2569.jpg',
    alt: 'A graded pre-owned iPhone photographed on a dark bench',
    title: 'Graded A',
    subtitle: 'Every pre-owned phone, opened first',
    href: '/second-hand',
  },
  {
    src: '/images/photo-1616348436168-de43ad0db179.jpg',
    alt: 'A sealed new iPhone resting on a matte surface',
    title: 'Sealed stock',
    subtitle: 'New phones, box and invoice',
    href: '/new-phones',
  },
  {
    src: '/images/photo-1632661674596-df8be070a5c5.jpg',
    alt: 'A customer holding a phone at the F-Ex counter',
    title: 'Try, then pay',
    subtitle: 'No-cost EMI from ₹1,899 a month',
    href: '/emi-payments',
  },
  {
    src: '/images/repair-macro.jpg',
    alt: 'A screwdriver lifting the screen off an opened phone',
    title: 'Forty minutes',
    subtitle: 'Screen repairs, same day',
    href: '/repairs',
  },
  {
    src: '/images/repair-microscope.jpg',
    alt: 'A technician soldering a phone board under a microscope',
    title: 'Bench rules',
    subtitle: 'Original parts · 12-month warranty',
    href: '/repairs',
  },
];

/* the logo: a C-shaped outline stroked with the brand gradient + two eyes */
function NovaMark() {
  return (
    <svg viewBox="0 0 27 27" width="27" height="27" aria-hidden="true" className="nv-mark">
      <defs>
        <linearGradient id="nv-mark-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff8a3d" />
          <stop offset="0.55" stopColor="#ff5a5f" />
          <stop offset="1" stopColor="#ff3d8b" />
        </linearGradient>
      </defs>
      <path
        d="M20.5 6.6A10 10 0 1 0 20.5 20.4"
        fill="none"
        stroke="url(#nv-mark-grad)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="11.4" cy="11.6" r="1.35" fill="#141414" />
      <circle cx="16.6" cy="11.6" r="1.35" fill="#141414" />
    </svg>
  );
}

export function NovaHero() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const robot = useRef<RobotApi | null>(null);
  const faceTimer = useRef<number | null>(null);

  const [typed, setTyped] = useState(PROMPTS[0].slice(0, 0));
  const [nextPrompt, setNextPrompt] = useState(1);
  const [chapters, setChapters] = useState(0);
  const [rail, setRail] = useState<'intro' | 'product'>('intro');
  const router = useRouter();

  /* ---- three.js, on demand ------------------------------------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nav = navigator as Navigator & { deviceMemory?: number; hardwareConcurrency?: number };
    const lowPower = (nav.deviceMemory ?? 8) <= 4 || (nav.hardwareConcurrency ?? 8) <= 4;
    let disposed = false;
    let observer: ResizeObserver | null = null;

    import('./nova-robot')
      .then(({ createNovaRobot }) => {
        if (disposed) return;
        const api = createNovaRobot(canvas, { still: reduced || lowPower });
        if (!api) return;
        robot.current = api;
        if (stageRef.current) {
          observer = new ResizeObserver(() => api.resize());
          observer.observe(stageRef.current);
        }
        api.setProgress(currentProgress());
      })
      .catch(() => {
        /* no WebGL — the paper sheet alone is a complete composition */
      });

    return () => {
      disposed = true;
      observer?.disconnect();
      robot.current?.dispose();
      robot.current = null;
    };
  }, []);

  /* ---- scroll → camera + rail ---------------------------------------- */
  const currentProgress = () => {
    const stage = stageRef.current;
    if (!stage) return 0;
    const y = window.scrollY - stage.offsetTop;
    return Math.max(0, Math.min(1, y / Math.max(1, window.innerHeight)));
  };

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const stage = stageRef.current;
        if (!stage) return;
        const p = currentProgress();
        robot.current?.setProgress(p);
        setRail(p > 0.5 ? 'product' : 'intro');

        /* the site header is cream-on-teal; over paper it needs ink */
        document.body.dataset.paperHero = window.scrollY < 60 ? '1' : '';

        /* the rail only belongs to the two paper panels */
        const r = stage.getBoundingClientRect();
        const inView = r.bottom > window.innerHeight * 0.35 && r.top < 0;
        document.documentElement.dataset.novaRail = inView ? '1' : '';
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      delete document.body.dataset.paperHero;
      delete document.documentElement.dataset.novaRail;
    };
  }, []);

  /* ---- pointer ------------------------------------------------------- */
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      robot.current?.setPointer(x, y);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  /* ---- the typing prompt --------------------------------------------- */
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTyped(PROMPTS[0]);
      return;
    }
    let cancelled = false;
    let timer: number;

    const type = (index: number, text: string) => {
      if (cancelled) return;
      if (text.length < PROMPTS[index].length) {
        setTyped(PROMPTS[index].slice(0, text.length + 1));
        timer = window.setTimeout(() => type(index, PROMPTS[index].slice(0, text.length + 1)), 38);
      } else {
        setNextPrompt((index + 1) % PROMPTS.length);
        timer = window.setTimeout(() => erase(index, PROMPTS[index]), 2600);
      }
    };

    const erase = (index: number, text: string) => {
      if (cancelled) return;
      if (text.length > 0) {
        const cut = text.slice(0, Math.max(0, text.length - 2));
        setTyped(cut);
        timer = window.setTimeout(() => erase(index, cut), 14);
      } else {
        timer = window.setTimeout(() => type((index + 1) % PROMPTS.length, ''), 250);
      }
    };

    setTyped('');
    timer = window.setTimeout(() => type(0, ''), 400);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  /* ---- the face: a quote mark when the services panel settles -------- */
  useEffect(() => {
    if (rail !== 'product') return;
    const api = robot.current;
    if (!api) return;
    if (faceTimer.current) window.clearTimeout(faceTimer.current);
    api.setFace('quote' as FaceMode);
    faceTimer.current = window.setTimeout(() => robot.current?.setFace('eyes'), 2400);
    return () => {
      if (faceTimer.current) window.clearTimeout(faceTimer.current);
    };
  }, [rail]);

  return (
    <div className="nv" ref={stageRef}>
      {/* fixed-ish stage: the robot + the ruled paper */}
      <div className="nv-hold" aria-hidden="true">
        <div className="nv-canvas">
          <canvas ref={canvasRef} />
        </div>
        <div className="nv-guides">
          <i />
          <i />
          <i />
        </div>
      </div>

      {/* ---- §1 intro -------------------------------------------------- */}
      <section className="nv-intro" aria-label="F-Ex Store">
        <div className="nv-prompt">
          <span className="nv-prompt__tab font-display">&ldquo;</span>
          <div className="nv-prompt__box">
            <span className="nv-prompt__text">
              {typed}
              <i className="nv-caret" aria-hidden="true" />
            </span>
            <b className="nv-corner nv-corner--tl" />
            <b className="nv-corner nv-corner--tr" />
            <b className="nv-corner nv-corner--bl" />
            <b className="nv-corner nv-corner--br" />
          </div>
          <p className="nv-prompt__next">{PROMPTS[nextPrompt]}</p>
        </div>

        <span className="nv-rule" aria-hidden="true" />

        <ul className="nv-features">
          {FEATURES.map((f, i) => (
            <li key={f} className={i === FEATURES.length - 1 ? 'is-dim' : undefined}>
              {f}
            </li>
          ))}
        </ul>

        <div className="nv-copy">
          <div className="nv-headline">
            <p className="nv-kicker">F-EX STORE &middot; GUWAHATI</p>
            <h1>
              <span className="nv-line nv-line--a">Phones</span>
              <span className="nv-line nv-line--b">Honestly.</span>
            </h1>
          </div>

          <p className="nv-sub">
            New, pre-owned and repaired phones &mdash; priced in the open, with EMI on the counter.
          </p>
        </div>

        <a className="nv-scroll" href="#nova-product">
          <span>SCROLL</span>
          <b className="nv-scroll__arrow" aria-hidden="true">
            <svg viewBox="0 0 14 14" width="14" height="14">
              <path d="M7 2v9M3.4 7.6 7 11.2l3.6-3.6" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </b>
          <i className="nv-corner nv-corner--tl" />
          <i className="nv-corner nv-corner--tr" />
          <i className="nv-corner nv-corner--bl" />
          <i className="nv-corner nv-corner--br" />
        </a>

        <span className="nv-rule nv-rule--bottom" aria-hidden="true" />
      </section>

      {/* ---- §2 the F-Ex story ---------------------------------- */}
      <section className="nv-product" id="nova-product" aria-label="The F-Ex story">
        <div className="nv-story__top">
          <p className="nv-eyebrow">F-EX STORY</p>
          <p className="nv-story__count">
            {String(chapters + 1).padStart(2, '0')} / {String(STORIES.length).padStart(2, '0')}
          </p>
        </div>

        <div className="nv-story__stage">
          <CircularCarousel
            items={STORIES.map(({ src, alt, title, subtitle }) => ({ src, alt, title, subtitle }))}
            preset="cylinder"
            intro="rise"
            cardWidth={252}
            aspectRatio={1.16}
            gap={26}
            tilt={-7}
            perspective={2400}
            autoplay="drift"
            speed={11}
            direction="left"
            momentum={0.65}
            snap
            pauseOnHover
            focusOnClick
            parallax={0.35}
            stretch={0.45}
            depthFade={0.42}
            fadeColor="#efece6"
            innerShade={0.72}
            cornerRadius={10}
            captions
            onChange={setChapters}
            onItemClick={(_item, index) => router.push(STORIES[index].href)}
            ariaLabel="The F-Ex story, chapter by chapter"
            className="nv-ring"
          />
        </div>

        <div className="nv-product__head">
          <p className="nv-dots" aria-hidden="true">
            &middot;&middot;
          </p>
          <h2>
            <span className="nv-line nv-line--c">Your Next</span>
            <span className="nv-line nv-line--d">Phone, Sorted.</span>
          </h2>
          <p className="nv-product__lede">
            Six chapters from one counter: what we sell, how we grade it, and what happens when you
            bring it back cracked.
          </p>
          <Link href="/about" className="nv-cta">
            <span aria-hidden="true">&bull;&bull;</span> READ THE STORY
          </Link>
        </div>
      </section>

      {/* ---- right rail ------------------------------------------------- */}
      <aside className="nv-rail" aria-hidden="true">
        <div className="nv-rail__dots">
          {Array.from({ length: 14 }).map((_, i) => (
            <i key={i} />
          ))}
          <span className="nv-rail__label" data-pos={rail}>
            <svg viewBox="0 0 14 14" width="11" height="11">
              <circle cx="7" cy="7" r="5.2" fill="none" stroke="currentColor" strokeWidth="1.1" />
              <path d="M7 4.4V7l1.9 1.2" fill="none" stroke="currentColor" strokeWidth="1.1" />
            </svg>
            {rail === 'intro' ? 'INTRO' : 'PRODUCT'}
          </span>
        </div>
        <span className="nv-rail__menu">&#8801; MENU</span>
      </aside>
    </div>
  );
}
