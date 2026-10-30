'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

/**
 * ReadableBelt — the scanner section (home, §2).
 *
 * Six miniature F-Ex pages ride a conveyor past a vertical scanner. Right of the
 * line each card is a real little website; at the line it dissolves into a cloud
 * of peach pixels; left of the line the same area shows that page's actual HTML
 * — the token-light source an agent receives. The counter above the line counts
 * the tokens removed from the card that is currently crossing.
 *
 * Everything is real code: the cards are DOM, the source is text, and the
 * dissolve is a 2D canvas drawn every frame in sync with the belt positions.
 * No video, no libraries.
 */

type CardId = 'home' | 'emi' | 'story' | 'atelier' | 'product' | 'journal';

type CardMeta = {
  id: CardId;
  original: number;
  distilled: number;
  url: string;
};

const META: CardMeta[] = [
  { id: 'home', original: 70_411, distilled: 6_140, url: 'fexstore.in/' },
  { id: 'emi', original: 41_208, distilled: 4_960, url: 'fexstore.in/emi-payments' },
  { id: 'story', original: 98_432, distilled: 6_300, url: 'fexstore.in/repairs' },
  { id: 'atelier', original: 55_870, distilled: 8_215, url: 'fexstore.in/repairs' },
  { id: 'product', original: 63_904, distilled: 5_512, url: 'fexstore.in/product/iphone-15-pro' },
  { id: 'journal', original: 47_316, distilled: 7_602, url: 'fexstore.in/journal' },
];

const fmt = (n: number) => n.toLocaleString('en-US');

/** The plain-HTML twin of each card — what an agent actually receives. */
const SOURCE: Record<CardId, string> = {
  home: `<h1>F-Ex Store — Phones in Guwahati</h1>
<p>New and pre-owned smartphones,
accessories and same-day repairs
at two branches in Guwahati.</p>
<h2>At a glance</h2>
<ul>
  <li>Branches: Lokhra, Basistha</li>
  <li>Open: 10 AM — 10 PM, daily</li>
  <li>Delivery: same day, free</li>
  <li>Since: 2024</li>
</ul>
<h2>Shop</h2>
<ul>
  <li>New phones — sealed, boxed</li>
  <li>Pre-owned — graded A to C</li>
  <li>Accessories — cases, audio</li>
</ul>
<a href="/new-phones">Browse phones</a>`,
  emi: `<h1>F-Ex Store — EMI &amp; Payments</h1>
<p>No-cost EMI on selected models,
UPI, cards and exchange. Pay
monthly, walk out today.</p>
<h2>iPhone 15 — ₹4,999 / mo</h2>
<ul>
  <li>Tenure: 6 / 9 / 12 months</li>
  <li>Down payment: from ₹0</li>
  <li>Docs: Aadhaar + PAN</li>
</ul>
<h2>Pixel 8 — ₹3,299 / mo</h2>
<ul>
  <li>Tenure: 6 / 9 / 12 months</li>
  <li>Down payment: from ₹0</li>
  <li>Approval: 4 minutes</li>
</ul>`,
  story: `<h1>Case study: Lokhra counter</h1>
<p>A cracked iPhone 15 Pro, rebuilt
and back in the owner's hand in
forty minutes.</p>
<h2>The problem</h2>
<p>Screen shattered, face ID dead,
no backup and a flight at 6 PM.</p>
<h2>The result</h2>
<ul>
  <li>40 min door to door</li>
  <li>0 bytes of data lost</li>
  <li>12 month warranty</li>
</ul>
<p>"It was done before my coffee
went cold." — Owner, Beltola</p>`,
  atelier: `<article>
  <h1>The F-Ex atelier</h1>
  <p>Every phone is opened, cleaned
  and graded before it earns a price.</p>
  <p>We work where the parts are real
  and the buyer can watch: two
  benches, one closed loop.</p>
  <h2>Bench rules</h2>
  <ol>
    <li>Open it before you price it</li>
    <li>Original parts, or say so</li>
    <li>Publish every fault we find</li>
  </ol>
</article>`,
  product: `<h1>iPhone 15 Pro</h1>
<p>Titanium frame, 6.1" OLED.</p>
<h2>Specification</h2>
<ul>
  <li>Display: 6.1" Super Retina</li>
  <li>Storage: 256 GB</li>
  <li>Battery health: 94%</li>
  <li>Box: sealed, with invoice</li>
</ul>
<h2>Buying</h2>
<ul>
  <li>EMI from ₹4,999 / mo</li>
  <li>Exchange: up to ₹38,000</li>
</ul>
<a href="/emi-payments">Check EMI</a>`,
  journal: `<h1>F-Ex Journal</h1>
<p>Notes from the counter.</p>
<article>
  <h2>How to check a battery</h2>
  <time>2026-03-14</time>
</article>
<article>
  <h2>Screen or battery?</h2>
  <time>2026-02-02</time>
</article>
<article>
  <h2>Why prices differ</h2>
  <time>2026-01-09</time>
</article>`,
};

const comments = (m: CardMeta) => `<!-- distilled: ${fmt(m.distilled)} tokens -->
<!-- original: ${fmt(m.original)} tokens -->
<!-- ${m.url} -->`;

/* ------------------------------------------------------------------ */
/* the mini pages                                                      */
/* ------------------------------------------------------------------ */

function KNav({ active }: { active: string }) {
  return (
    <header className="rb-knav">
      <div className="rb-klogo">
        <svg viewBox="0 0 54 42" fill="none" stroke="currentColor" strokeWidth="3.2" aria-hidden="true">
          <path d="M4 38 20 8l16 30" />
          <path d="M20 38 34 12l16 26" />
        </svg>
        <span>F-Ex</span>
      </div>
      <nav className="rb-kmenu">
        {['Phones', 'Emi', 'Repairs'].map((item) => (
          <span key={item} className={item === active ? 'on' : undefined}>
            {item}
          </span>
        ))}
      </nav>
    </header>
  );
}

function CardHome() {
  return (
    <div className="rb-body rb-c1">
      <KNav active="Phones" />
      <div className="rb-c1__stats">
        <div>
          <b>2</b>
          <span>branches</span>
        </div>
        <div>
          <b>4.9</b>
          <span>google rating</span>
        </div>
      </div>
      <p className="rb-c1__line">New, pre-owned and repaired phones. Lokhra &amp; Basistha, open till 10 PM.</p>
    </div>
  );
}

function CardEmi() {
  return (
    <div className="rb-body rb-c2">
      <KNav active="Emi" />
      <p className="rb-c2__price">
        <span className="rb-cur">₹</span>
        4,999
      </p>
      <p className="rb-c2__kick">Per month · no-cost emi</p>
      <ul className="rb-c2__plans">
        <li>
          <span>iPhone 15</span>
          <b>₹4,999</b>
        </li>
        <li>
          <span>Pixel 8</span>
          <b>₹3,299</b>
        </li>
        <li>
          <span>Pre-owned</span>
          <b>₹1,899</b>
        </li>
      </ul>
      <span className="rb-c2__pill">Check eligibility</span>
    </div>
  );
}

function CardStory() {
  return (
    <div className="rb-body rb-c3">
      <KNav active="Repairs" />
      <p className="rb-c3__kick">Customer story · Lokhra</p>
      <h3 className="rb-c3__title">A cracked iPhone 15 Pro, rebuilt and back in forty minutes</h3>
      <div className="rb-c3__stats">
        <div>
          <b>40min</b>
          <span>turnaround</span>
        </div>
        <div>
          <b>0</b>
          <span>data lost</span>
        </div>
        <div>
          <b>12mo</b>
          <span>warranty</span>
        </div>
      </div>
    </div>
  );
}

function CardAtelier() {
  return (
    <div className="rb-body rb-c4">
      <KNav active="Repairs" />
      <div className="rb-c4__tiles">
        <div className="rb-tile rb-tile--macro" />
        <div className="rb-tile rb-tile--flat" />
        <p className="rb-c4__quote">
          The F-Ex rule: <em>we open every phone before we sell it.</em>
        </p>
      </div>
      <div className="rb-c4__foot">
        <span>How we open an iPhone without a scratch</span>
        <span>Atelier · 6 min</span>
      </div>
    </div>
  );
}

function CardProduct() {
  return (
    <div className="rb-body rb-c5">
      <KNav active="Phones" />
      <div className="rb-c5__title">
        <span>The titanium</span>
        <em>frame.</em>
      </div>
      <ul className="rb-c5__specs">
        <li>
          <span>Model</span>
          <b>iPhone 15 Pro</b>
        </li>
        <li>
          <span>Display</span>
          <b>6.1&quot; OLED</b>
        </li>
        <li>
          <span>Warranty</span>
          <b>12 months</b>
        </li>
      </ul>
    </div>
  );
}

function CardJournal() {
  return (
    <div className="rb-body rb-c6">
      <KNav active="Journal" />
      <h3 className="rb-c6__title">
        Journal
        <em>notes from the counter</em>
      </h3>
      <div className="rb-c6__posts">
        <article>
          <div className="rb-thumb rb-tile--hand" />
          <p>Guides</p>
          <h4>How to check a pre-owned battery in 30 seconds</h4>
        </article>
        <article>
          <div className="rb-thumb rb-tile--micro" />
          <p>Repairs</p>
          <h4>Screen or battery? A 60-second diagnosis</h4>
        </article>
        <article>
          <div className="rb-thumb rb-tile--store" />
          <p>Prices</p>
          <h4>Why we don&apos;t match every online price</h4>
        </article>
      </div>
    </div>
  );
}

const PAGES: Record<CardId, () => JSX.Element> = {
  home: CardHome,
  emi: CardEmi,
  story: CardStory,
  atelier: CardAtelier,
  product: CardProduct,
  journal: CardJournal,
};

/* ------------------------------------------------------------------ */
/* the engine                                                          */
/* ------------------------------------------------------------------ */

type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; color: string };

const PALETTE = ['#A56F63', '#B87C69', '#C98D77', '#D99B7F', '#E3AC91', '#F0CDB7', '#FDF3EA'];
const mod = (n: number, m: number) => ((n % m) + m) % m;
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

/** 32-bit integer hash → [0,1). The dissolve's whole character lives here. */
function hash(a: number, b: number, c: number) {
  let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0;
  h = ((h ^ (h >>> 13)) * 1274126177) | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function ReadableBelt() {
  const stageRef = useRef<HTMLElement | null>(null);
  const beltRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<(HTMLElement | null)[]>([]);
  const codesRef = useRef<(HTMLElement | null)[]>([]);
  const fxRef = useRef<HTMLCanvasElement | null>(null);
  const numRef = useRef<HTMLElement | null>(null);
  const pctRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const belt = beltRef.current;
    const canvas = fxRef.current;
    const stage = stageRef.current;
    if (!belt || !canvas || !stage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cards = cardsRef.current.filter(Boolean) as HTMLElement[];
    const codes = codesRef.current.filter(Boolean) as HTMLElement[];
    if (cards.length !== 6) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --gap is authored in vw; parseFloat would read "4.75vw" as 4.75, so measure
    // it through a throwaway element that inherits the custom property.
    const gapProbe = document.createElement('div');
    gapProbe.setAttribute('aria-hidden', 'true');
    gapProbe.style.cssText =
      'position:absolute;left:0;top:0;width:var(--gap);height:0;visibility:hidden;pointer-events:none;';
    belt.appendChild(gapProbe);
    const readGap = () => gapProbe.offsetWidth;

    let cw = cards[0].offsetWidth;
    let ch = cards[0].offsetHeight;
    let gap = readGap();
    let span = cw + gap;
    let period = span * 6;
    let Lx = window.innerWidth / 2;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = belt.offsetWidth;
    let H = belt.offsetHeight;

    const state = {
      off: 0,
      vel: 0,
      hover: 0,
      over: false,
      dragging: false,
      dragX: 0,
      dragT: 0,
      pseudoVel: 0,
      shown: 0,
      index: -1,
      pct: 0,
    };

    const sparks: Spark[] = [];

    const resize = () => {
      cw = cards[0].offsetWidth;
      ch = cards[0].offsetHeight;
      gap = readGap();
      span = cw + gap;
      period = span * 6;
      Lx = window.innerWidth / 2;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = belt.offsetWidth;
      H = belt.offsetHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
    };

    resize();
    // start with the first card already ~12% past the line
    state.off = window.innerWidth / 2 - 0.62 * cw;
    state.vel = reduced ? 0 : -0.075 * window.innerWidth;

    window.addEventListener('resize', resize);
    const ro = new ResizeObserver(resize);
    ro.observe(belt);

    /* ---- interaction ---- */
    const onEnter = () => {
      state.over = true;
    };
    const onLeave = () => {
      state.over = false;
    };
    belt.addEventListener('pointerenter', onEnter);
    belt.addEventListener('pointerleave', onLeave);

    const onDown = (e: PointerEvent) => {
      state.dragging = true;
      state.dragX = e.clientX;
      state.dragT = performance.now();
      state.pseudoVel = 0;
      belt.setPointerCapture(e.pointerId);
      belt.classList.add('is-dragging');
    };
    const onMove = (e: PointerEvent) => {
      if (!state.dragging) return;
      const now = performance.now();
      const dx = e.clientX - state.dragX;
      const dt = Math.max(8, now - state.dragT);
      state.off += dx;
      state.pseudoVel = clamp((dx / dt) * 1000, -4000, 4000) * 0.8 + state.pseudoVel * 0.2;
      state.dragX = e.clientX;
      state.dragT = now;
    };
    const onUp = (e: PointerEvent) => {
      if (!state.dragging) return;
      state.dragging = false;
      state.vel = state.pseudoVel;
      belt.releasePointerCapture?.(e.pointerId);
      belt.classList.remove('is-dragging');
    };
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        state.vel += -e.deltaX * 6;
        e.preventDefault();
      }
    };
    belt.addEventListener('pointerdown', onDown);
    belt.addEventListener('pointermove', onMove);
    belt.addEventListener('pointerup', onUp);
    belt.addEventListener('pointercancel', onUp);
    belt.addEventListener('wheel', onWheel, { passive: false });

    /* ---- the dissolve ---- */
    const drawFx = (t: number, dt: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const top = 70;
      const rows = Math.round(ch / 3);

      for (let i = 0; i < cards.length; i++) {
        const x = mod(state.off + i * span + span, period) - span;
        const cut = clamp(Lx - x, 0, cw);
        if (cut <= 0) continue;
        const right = x + cw;
        if (right <= Lx) continue;

        /* 1. haze off the line */
        const hw = Math.min(150, right - Lx);
        if (hw > 0) {
          const grad = ctx.createLinearGradient(Lx, 0, Lx + 150, 0);
          grad.addColorStop(0, 'rgba(217,155,127,0.42)');
          grad.addColorStop(1, 'rgba(217,155,127,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(Lx, top, hw, ch);
        }

        /* 2. dithered pixels fixed to the card surface */
        const R = cw * 0.3;
        const gxFrom = Math.floor(cut / 3);
        // never dither past the card's own right edge: the cloud must sit on the card
        const gxTo = Math.ceil(Math.min(cut + R, cw) / 3);
        const blink = Math.floor(t * 9) + 97;

        for (let gx = gxFrom; gx <= gxTo; gx++) {
          const sx = x + gx * 3;
          const d = sx - Lx;
          if (d < 0) continue;
          const p = Math.pow(1 - d / R, 1.7);
          if (p <= 0.008) continue;

          for (let row = -5; row <= rows + 5; row++) {
            const inside = row >= 0 && row < rows;
            let pr = inside ? p * 0.92 : p * 0.16;
            if (!inside) {
              const spill = row < 0 ? -row : row - rows;
              pr *= Math.max(0, 1 - spill / 5);
            }
            if (hash(gx, row, i) >= pr) continue;
            const h2 = hash(row, gx, i + 31);

            if (!reduced) {
              // ~a fifth of the dots blink, nine times a second
              if (hash(gx, row, blink) < 0.22) continue;
            }

            const near = d < 10;
            const color = near
              ? PALETTE[4 + Math.floor(h2 * 3)]
              : PALETTE[Math.floor(h2 * h2 * 7)];
            const size = 1.1 + h2 * 1.7;
            const jx = (hash(gx, row, i + 7) - 0.5) * 1.6 * (reduced ? 0 : 1);
            const jy = (hash(row, gx, i + 11) - 0.5) * 1.6 * (reduced ? 0 : 1);

            ctx.fillStyle = color;
            ctx.fillRect(
              Math.round(sx + jx),
              Math.round(top + row * 3 + jy),
              Math.round(size),
              Math.round(size)
            );
          }
        }

        /* 3. free sparks */
        if (!reduced) {
          for (let s = 0; s < 3; s++) {
            if (Math.random() > 0.7) continue;
            sparks.push({
              x: Lx + Math.random() * 30,
              y: top + Math.random() * (ch + 20) - 10,
              vx: -30 + Math.random() * 70 + state.vel * 0.6,
              vy: (Math.random() - 0.5) * 50,
              life: 0,
              max: 0.3 + Math.random() * 0.8,
              size: 0.8 + Math.random() * 1.8,
              color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
            });
          }
        }
      }

      for (let s = sparks.length - 1; s >= 0; s--) {
        const sp = sparks[s];
        sp.life += dt;
        if (sp.life >= sp.max) {
          sparks.splice(s, 1);
          continue;
        }
        sp.x += sp.vx * dt;
        sp.y += sp.vy * dt;
        ctx.globalAlpha = Math.min(1, sp.life * 2.2) * (1 - sp.life / sp.max);
        ctx.fillStyle = sp.color;
        ctx.fillRect(Math.round(sp.x), Math.round(sp.y), Math.round(sp.size), Math.round(sp.size));
        ctx.globalAlpha = 1;
      }
    };

    /* ---- the loop ---- */
    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;

      state.hover += ((state.over ? 1 : 0) - state.hover) * (1 - Math.exp(-4 * dt));

      const auto = reduced ? 0 : -0.075 * window.innerWidth;
      const target = auto * (1 - 0.65 * state.hover);
      if (!state.dragging) {
        state.vel += (target - state.vel) * (1 - Math.exp(-2.2 * dt));
        state.off += state.vel * dt;
      }

      let crossing = -1;
      let crossingCut = 0;

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const code = codes[i];
        const x = mod(state.off + i * span + span, period) - span;
        const cut = clamp(Lx - x, 0, cw);

        card.style.transform = `translate3d(${x}px,0,0)`;
        if (cut > 0) {
          card.style.clipPath = `inset(0 0 0 ${cut}px round 0 1.6vw 1.6vw 0)`;
          card.style.maskImage = `linear-gradient(90deg, transparent ${cut}px, #000 ${cut + 26}px)`;
          card.style.webkitMaskImage = card.style.maskImage;
        } else {
          card.style.clipPath = '';
          card.style.maskImage = '';
          card.style.webkitMaskImage = '';
        }

        code.style.transform = `translate3d(${x}px,0,0)`;
        code.style.clipPath = `inset(0 ${cw - cut}px 0 0)`;
        code.style.visibility = cut > 0 ? 'visible' : 'hidden';

        if (cut > 0 && cut < cw) {
          crossing = i;
          crossingCut = cut;
        }
      }

      /* the counter */
      const num = numRef.current;
      const pct = pctRef.current;
      if (crossing >= 0 && num && pct) {
        const m = META[crossing];
        const progress = crossingCut / cw;
        if (crossing !== state.index) {
          state.index = crossing;
          state.pct = Math.round(((m.original - m.distilled) / m.original) * 100);
          pct.textContent = `${state.pct}% less`;
          state.shown = (m.original - m.distilled) * progress;
        }
        const targetNum = Math.round((m.original - m.distilled) * progress);
        state.shown += (targetNum - state.shown) * Math.min(1, dt * 14);
        num.textContent = `\u2212${fmt(Math.round(state.shown))}`;
      }

      drawFx(t, dt);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      gapProbe.remove();
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      ro.disconnect();
      belt.removeEventListener('pointerenter', onEnter);
      belt.removeEventListener('pointerleave', onLeave);
      belt.removeEventListener('pointerdown', onDown);
      belt.removeEventListener('pointermove', onMove);
      belt.removeEventListener('pointerup', onUp);
      belt.removeEventListener('pointercancel', onUp);
      belt.removeEventListener('wheel', onWheel);
    };
  }, []);

  return (
    <section ref={stageRef} className="rb" aria-label="Every F-Ex page, readable by machines">
      <div className="rb-head">
        <div>
          <p className="rb-eyebrow">Machine readable</p>
          <h2 className="rb-title">
            Built for people.
            <br />
            <em>Read by machines.</em>
          </h2>
        </div>
        <div className="rb-head__right">
          <p className="rb-lede">
            Every F-Ex page ships its content as plain, token-light HTML — price, stock, branch
            hours — so search engines and AI assistants read what you read. Not a pixel changes on
            screen.
          </p>
          <Link href="/new-phones" className="rb-cta">
            Explore the store
          </Link>
        </div>
      </div>

      <div ref={beltRef} className="rb-belt">
        <div className="rb-codes">
          {META.map((m, i) => (
            <div
              key={m.id}
              className="rb-code"
              ref={(el) => {
                codesRef.current[i] = el;
              }}
            >
              <pre className="rb-code__html">{SOURCE[m.id]}</pre>
              <pre className="rb-code__meta">{comments(m)}</pre>
            </div>
          ))}
        </div>

        <div className="rb-cards">
          {META.map((m, i) => {
            const Page = PAGES[m.id];
            return (
              <article
                key={m.id}
                className="rb-card"
                ref={(el) => {
                  cardsRef.current[i] = el;
                }}
              >
                <Page />
              </article>
            );
          })}
        </div>

        <canvas ref={fxRef} className="rb-fx" aria-hidden="true" />
      </div>

      <div className="rb-scan" aria-hidden="true">
        <b />
        <i />
      </div>

      <div className="rb-badge">
        <span className="rb-badge__label">Token reduction</span>
        <div className="rb-pill">
          <b ref={numRef}>&minus;0</b>
          <span ref={pctRef}>0% less</span>
        </div>
      </div>
    </section>
  );
}
