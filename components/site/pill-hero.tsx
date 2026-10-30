'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * PillHero — the home hero.
 *
 * "F" and "EX" sit either side of a hairline. The hairline is the closed pill:
 * it opens into a slit, then a circle, then a 2:1 stadium, pushing the halves
 * apart as the reel inside is revealed. One Web Animations timeline (2.1 s)
 * drives every part, so nothing can drift out of sync.
 *
 * Adapted from the "Wild" one-screen reveal to F-Ex: the word is the store's
 * own split wordmark (the hairline *is* the hyphen in F-EX), the "paper" is the
 * site's deep ink with cream strokes, the footage is a self-hosted product reel
 * built from the store's own photography, and the nav that drops in is the real
 * site header rather than a duplicated copy.
 */

const DURATION = 2100;
const REDUCED = '(prefers-reduced-motion: reduce)';
const PHONE = '(max-width: 720px)';

type Stroke = { d: string; w: number; o: number; peach: boolean };

/**
 * ~15 long S-curves sweeping up and to the right. Deterministic (seeded LCG) so
 * the server and the client draw identical paths — no hydration mismatch.
 */
function buildStrokes(count = 15, seed = 20_240_913): Stroke[] {
  let s = seed;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  const out: Stroke[] = [];
  for (let i = 0; i < count; i++) {
    // long, shallow sweeps: they enter bottom-left and leave top-right, with the
    // curl of each S varied so the set never reads as a hatch pattern
    const run = 1250 + rnd() * 700;
    const rise = 380 + rnd() * 360;
    const x0 = -560 + rnd() * 720;
    const y0 = 940 + rnd() * 260;
    const x1 = x0 + run;
    const y1 = y0 - rise;
    const a = 0.16 + rnd() * 0.3; // how flat the entry is
    const b = 0.22 + rnd() * 0.38; // how steep the exit is
    const c1x = x0 + run * a;
    const c1y = y0 - rise * (0.04 + rnd() * 0.14);
    const c2x = x1 - run * (0.18 + rnd() * 0.26);
    const c2y = y1 + rise * b;
    out.push({
      d: `M${x0.toFixed(1)} ${y0.toFixed(1)} C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(
        1
      )} ${c2y.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`,
      w: +(1.2 + rnd() * 2.7).toFixed(2),
      o: +(0.55 + rnd() * 0.3).toFixed(3),
      peach: i % 5 === 1,
    });
  }
  return out;
}

const easeA = 'cubic-bezier(0.5, 0, 0.3, 1)';
const easeB = 'cubic-bezier(0.45, 0, 0.3, 1)';
const easeC = 'cubic-bezier(0.4, 0, 0.2, 1)';
const easeNav = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

export function PillHero() {
  const rootRef = useRef<HTMLElement | null>(null);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const pillRef = useRef<HTMLDivElement | null>(null);
  const hairRef = useRef<HTMLSpanElement | null>(null);
  const paperRef = useRef<HTMLDivElement | null>(null);
  const linesRef = useRef<SVGSVGElement | null>(null);
  const eyebrowRef = useRef<HTMLParagraphElement | null>(null);
  const iconsRef = useRef<HTMLDivElement | null>(null);
  const footRef = useRef<HTMLDivElement | null>(null);
  const ruleRef = useRef<HTMLSpanElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const anims = useRef<Animation[]>([]);
  const [videoPlaying, setVideoPlaying] = useState(true);

  const strokes = useMemo(() => buildStrokes(), []);

  /** Cancel every animation and drop the references. */
  const cancelAll = useCallback(() => {
    for (const a of anims.current) {
      try {
        a.cancel();
      } catch {
        /* already gone */
      }
    }
    anims.current = [];
  }, []);

  /** Snap to the finished state — reduced motion, resize, and the safety net. */
  const applyFinal = useCallback(() => {
    cancelAll();
    const root = rootRef.current;
    const pill = pillRef.current;
    const row = rowRef.current;
    const header = document.querySelector<HTMLElement>('[data-site-header]');
    if (header) header.style.removeProperty('transform');
    if (!root || !pill || !row) return;

    const phone = window.matchMedia(PHONE).matches;
    const fs = parseFloat(getComputedStyle(root).fontSize) || 180;

    if (phone) {
      const width = window.innerWidth - 40;
      pill.style.width = `${width}px`;
      pill.style.height = `${width / 1.85}px`;
      row.style.gap = `${0.1 * fs}px`;
    } else {
      pill.style.width = `${3.62 * fs}px`;
      pill.style.height = `${1.81 * fs}px`;
      row.style.gap = `${0.085 * fs}px`;
    }
    pill.style.clipPath = 'inset(0)';
    if (hairRef.current) hairRef.current.style.opacity = '0';
    if (paperRef.current) paperRef.current.style.opacity = '1';
    if (linesRef.current) linesRef.current.style.opacity = '1';
    if (eyebrowRef.current) eyebrowRef.current.style.opacity = '1';
    if (iconsRef.current) iconsRef.current.style.opacity = '0.85';
    if (footRef.current) footRef.current.style.transform = 'translateY(0)';
    if (ruleRef.current) ruleRef.current.style.transform = 'scaleX(1)';
  }, [cancelAll]);

  /** Build and play the one timeline. */
  const run = useCallback(() => {
    const root = rootRef.current;
    const row = rowRef.current;
    const pill = pillRef.current;
    if (!root || !row || !pill) return;

    cancelAll();
    const phone = window.matchMedia(PHONE).matches;
    const fs = parseFloat(getComputedStyle(root).fontSize) || 180;
    const finalPillWidth = window.innerWidth - 40;
    const finalPillHeight = finalPillWidth / 1.85;

    const win = (from: number, to: number, easing?: string): KeyframeAnimationOptions => ({
      duration: DURATION * (to - from),
      delay: DURATION * from,
      easing,
      fill: 'both',
    });

    const push = (el: Element | null, frames: Keyframe[], opts: KeyframeAnimationOptions) => {
      if (!el) return;
      anims.current.push(el.animate(frames, opts));
    };

    /* ---- the pill ---- */
    if (phone) {
      // Opens vertically: the hairline draws from the centre, then it grows.
      push(
        pill,
        [
          { height: '1.5px', offset: 0, easing: easeA },
          { height: '1.5px', offset: 0.14, easing: easeB },
          { height: `${finalPillHeight * 0.1}px`, offset: 0.3, easing: easeC },
          { height: `${finalPillHeight * 0.55}px`, offset: 0.58, easing: easeC },
          { height: `${finalPillHeight}px`, offset: 1 },
        ],
        win(0, 1)
      );
      push(
        pill,
        [
          { clipPath: 'inset(0 50%)', offset: 0 },
          { clipPath: 'inset(0 0)', offset: 0.14 },
          { clipPath: 'inset(0 0)', offset: 1 },
        ],
        win(0, 1, easeA)
      );
      push(
        row,
        [
          { gap: `${0.03 * fs}px`, offset: 0, easing: easeB },
          { gap: `${0.03 * fs}px`, offset: 0.14, easing: easeC },
          { gap: `${0.1 * fs}px`, offset: 0.7 },
          { gap: `${0.1 * fs}px`, offset: 1 },
        ],
        win(0, 1)
      );
    } else {
      push(
        pill,
        [
          { width: `${0.012 * fs}px`, offset: 0, easing: easeA },
          { width: `${0.012 * fs}px`, offset: 0.14, easing: easeB },
          { width: `${0.16 * fs}px`, offset: 0.3, easing: easeC },
          { width: `${1.81 * fs}px`, offset: 0.58, easing: easeC },
          { width: `${3.62 * fs}px`, offset: 1 },
        ],
        win(0, 1)
      );
      push(
        pill,
        [
          { clipPath: 'inset(40% 0)', offset: 0 },
          { clipPath: 'inset(0)', offset: 0.14 },
          { clipPath: 'inset(0)', offset: 1 },
        ],
        win(0, 1, easeA)
      );
      push(
        row,
        [
          { gap: `${0.026 * fs}px`, offset: 0, easing: easeB },
          { gap: `${0.026 * fs}px`, offset: 0.14, easing: easeC },
          { gap: `${0.05 * fs}px`, offset: 0.58, easing: easeC },
          { gap: `${0.085 * fs}px`, offset: 1 },
        ],
        win(0, 1)
      );
    }

    /* ---- the grey hairline inside the pill (never on the video) ---- */
    push(
      hairRef.current,
      [
        { opacity: 1, offset: 0 },
        { opacity: 1, offset: 0.14 },
        { opacity: 0, offset: 0.3 },
        { opacity: 0, offset: 1 },
      ],
      win(0, 1)
    );

    /* ---- paper + flowing strokes ---- */
    push(
      paperRef.current,
      [
        { opacity: 0, offset: 0 },
        { opacity: 0, offset: 0.45 },
        { opacity: 1, offset: 0.78 },
        { opacity: 1, offset: 1 },
      ],
      win(0, 1, easeC)
    );
    push(
      linesRef.current,
      [
        { opacity: 0, offset: 0 },
        { opacity: 0, offset: 0.5 },
        { opacity: 1, offset: 0.85 },
        { opacity: 1, offset: 1 },
      ],
      win(0, 1, easeC)
    );

    /* ---- the site's own header drops in ---- */
    const header = document.querySelector<HTMLElement>('[data-site-header]');
    if (header) {
      header.style.transform = 'translateY(-140%)';
      push(header, [{ transform: 'translateY(-140%)' }, { transform: 'translateY(0)' }], win(0.5, 0.86, easeNav));
    }

    /* ---- footer bar rises, rule draws, icons last ---- */
    push(footRef.current, [
      { transform: 'translateY(160%)', offset: 0 },
      { transform: 'translateY(0)', offset: 1 },
    ], win(0.52, 0.9, easeNav));
    push(ruleRef.current, [
      { transform: 'scaleX(0)', offset: 0 },
      { transform: 'scaleX(1)', offset: 1 },
    ], win(0.4, 0.95, easeC));
    push(eyebrowRef.current, [
      { opacity: 0, offset: 0 },
      { opacity: 1, offset: 1 },
    ], win(0.55, 0.9, easeC));
    push(iconsRef.current, [
      { opacity: 0, offset: 0 },
      { opacity: 0.85, offset: 1 },
    ], win(0.8, 1, easeC));

    for (const a of anims.current) a.play();

    /* once the longest has finished, hand the header its own transform back */
    let end = 0;
    let longest: Animation | null = null;
    for (const a of anims.current) {
      const timing = a.effect?.getComputedTiming();
      const t = Number(timing?.endTime ?? 0);
      if (t >= end) {
        end = t;
        longest = a;
      }
    }
    longest?.finished
      .then(() => header?.style.removeProperty('transform'))
      .catch(() => header?.style.removeProperty('transform'));
  }, [cancelAll]);

  /** Replay: collapse the whole timeline, then open it again. */
  const replay = useCallback(() => {
    if (window.matchMedia(REDUCED).matches) {
      videoRef.current?.play().catch(() => {});
      return;
    }
    if (!anims.current.length) {
      run();
      return;
    }
    const list = anims.current;
    for (const a of list) {
      try {
        a.reverse();
      } catch {
        /* finished animations can still reverse */
      }
    }
    // when the collapse lands, open it back up
    const longest = list.reduce((acc, a) => {
      const t = Number(a.effect?.getComputedTiming().endTime ?? 0);
      const bt = Number(acc.effect?.getComputedTiming().endTime ?? 0);
      return t > bt ? a : acc;
    }, list[0]);
    longest.finished
      .then(() => {
        for (const a of list) a.play();
      })
      .catch(() => {});
  }, [run]);

  useEffect(() => {
    const root = rootRef.current;
    const video = videoRef.current;
    if (!root) return;

    if (window.matchMedia(REDUCED).matches) {
      video?.pause();
      applyFinal();
      return;
    }

    /* Recording mode: reveal at 0 s, collapse at 4.9 s. */
    if (new URLSearchParams(window.location.search).get('rec') === '1') {
      window.__recVideo = (t: number) => {
        const v = videoRef.current;
        if (!v || !v.duration) return 0;
        return (t % v.duration) + 1 / 120;
      };
      run();
      video?.play().catch(() => {});
      const collapse = window.setTimeout(() => {
        for (const a of anims.current) a.reverse();
      }, 4900);
      return () => {
        window.clearTimeout(collapse);
        cancelAll();
      };
    }

    video?.play().catch(() => {});

    let started = false;
    let observer: MutationObserver | null = null;
    let failsafe = 0;

    const begin = () => {
      if (started) return;
      started = true;
      run();
      // never leave the real header hidden if the timeline threw
      failsafe = window.setTimeout(() => {
        document.querySelector<HTMLElement>('[data-site-header]')?.style.removeProperty('transform');
      }, DURATION + 700);
    };

    // The site's intro loader owns the first ~1.2 s; starting behind it would
    // waste the whole reveal.
    if (!document.querySelector('[role="status"]')) {
      begin();
    } else {
      observer = new MutationObserver(() => {
        if (!document.querySelector('[role="status"]')) {
          observer?.disconnect();
          begin();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      observer?.disconnect();
      window.clearTimeout(failsafe);
      cancelAll();
      document.querySelector<HTMLElement>('[data-site-header]')?.style.removeProperty('transform');
    };
  }, [applyFinal, cancelAll, run]);

  /* Resize: finish what is running and re-measure (the spec's reset). */
  useEffect(() => {
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(applyFinal);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
    };
  }, [applyFinal]);

  const toggleVideo = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setVideoPlaying(true);
    } else {
      v.pause();
      setVideoPlaying(false);
    }
  }, []);

  return (
    <section ref={rootRef} className="pill-hero" aria-label="F-Ex Store">
      {/* no-JS fallback: the revealed state, since the timeline cannot run */}
      <noscript>
        <style>{`
          .pill-hero__pill{width:3.62em!important;height:1.81em!important;clip-path:inset(0)!important}
          .pill-hero__hair{opacity:0!important}
          .pill-hero__icons{opacity:.85!important}
          .pill-hero__paper,.pill-hero__lines,.pill-hero__eyebrow{opacity:1!important}
          .pill-hero__foot{transform:none!important}
          .pill-hero__rule{transform:scaleX(1)!important}
          @media (max-width:720px){
            .pill-hero__pill{width:calc(100vw - 40px)!important;height:calc((100vw - 40px)/1.85)!important}
          }
        `}</style>
      </noscript>

      <div ref={paperRef} className="pill-hero__paper" aria-hidden="true" />
      <svg
        ref={linesRef}
        className="pill-hero__lines"
        aria-hidden="true"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
      >
        <g fill="none" strokeLinecap="round">
          {strokes.map((s, i) => (
            <path
              key={i}
              d={s.d}
              stroke={s.peach ? '#D99B7F' : '#F6EBE3'}
              strokeWidth={s.w}
              strokeOpacity={+(s.o * 0.13).toFixed(3)}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
      </svg>

      <div className="pill-hero__stage">
        <div ref={rowRef} className="pill-hero__row">
          <span className="pill-hero__half">F</span>

          <div ref={pillRef} className="pill-hero__pill">
            <video
              ref={videoRef}
              className="pill-hero__video"
              poster="/video/hero-pill.jpg"
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              tabIndex={-1}
            >
              {/* VP9 first: smaller, and the only codec some builds decode */}
              <source src="/video/hero-pill.webm" type="video/webm" />
              <source src="/video/hero-pill.mp4" type="video/mp4" />
            </video>
            <span ref={hairRef} className="pill-hero__hair" aria-hidden="true" />
            <div ref={iconsRef} className="pill-hero__icons">
              <span className="pill-hero__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                  <path d="M3 8.5c2.2-1.6 4.4-1.6 6.6 0s4.4 1.6 6.6 0" />
                  <path d="M3 12.5c2.2-1.6 4.4-1.6 6.6 0s4.4 1.6 6.6 0" />
                  <path d="M3 16.5c2.2-1.6 4.4-1.6 6.6 0s4.4 1.6 6.6 0" />
                </svg>
              </span>
              <button
                type="button"
                className="pill-hero__icon pill-hero__icon--btn"
                onClick={toggleVideo}
                aria-pressed={!videoPlaying}
                aria-label={videoPlaying ? 'Pause the reel' : 'Play the reel'}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                  {videoPlaying ? (
                    <>
                      <path d="M9.5 7.5v9" />
                      <path d="M14.5 7.5v9" />
                    </>
                  ) : (
                    <path d="M9 7.2 16.5 12 9 16.8z" strokeLinejoin="round" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          <span className="pill-hero__half">EX</span>
        </div>

        <p ref={eyebrowRef} className="pill-hero__eyebrow">
          Store · Guwahati — new, pre-owned &amp; repaired
        </p>
      </div>

      <div ref={footRef} className="pill-hero__foot">
        <p className="pill-hero__lead">
          <span className="pill-hero__dropcap">E</span>very phone on our counter is opened, tested and
          graded before it earns a price. Two branches in Guwahati, same-day delivery, and a repair
          bench that still answers the phone.
        </p>
        <span ref={ruleRef} className="pill-hero__rule" aria-hidden="true" />
        <button type="button" className="pill-hero__cta" onClick={replay}>
          Play it again
        </button>
      </div>
    </section>
  );
}

declare global {
  interface Window {
    __recVideo?: (t: number) => number;
  }
}
