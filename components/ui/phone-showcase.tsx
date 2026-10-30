/**
 * ARCHIVED 2026-10-29 — not imported by any route.
 * Superseded on the home page by `components/site/flying-hero.tsx`.
 * `phone-three.ts` below is still the reference studio build; this stage is kept for reference
 * (or to remount on another page) and costs nothing while nothing imports it.
 */
'use client';

/* ============================================================================
 * PhoneShowcase — scroll-scrubbed 3D smartphone stage (three.js)
 * ============================================================================
 * Six keyframed scenes, driven entirely by scroll position inside a sticky
 * stage. No GSAP pin (the stage is CSS-sticky). The studio itself is a real
 * three.js scene — see components/ui/phone-three.ts — mounted on the same
 * canvas this component sizes and pauses.
 *
 *   Scene 1  Cover      — giant F-EX word, phone floats centre
 *   Scene 2  Crown      — camera island close-up
 *   Scene 3  Catalogue  — brand chips, phone small above the grid
 *   Scene 4  Atelier    — exploded view (explode = 1)
 *   Scene 5  Promise    — large phone right, tagline left
 *   Scene 6  Branches   — phone drops, branch cards rise
 *
 * TUNING KNOBS
 *   - KEYS / KEYS_TALL ....... camera framing per scene (radius, theta, phi,
 *                              target, roll, explode). Edit to reframe.
 *   - HOLD ................... how long a scene "holds" before morphing (0-1)
 *   - IDLE_SPIN / TILT_MAX ... idle rotation speed and pointer tilt range
 *   - explode uniform ........ separation distance of internal parts
 *   - COLOURS ................ ink / bone / accent props (brand palette)
 *
 * Falls back to a canvas-2D phone illustration without WebGL, and to a still
 * poster (no WebGL at all) for prefers-reduced-motion or low-end devices.
 * ========================================================================== */

import * as React from 'react';
import { getLenis } from '@/hooks/use-lenis';
import { createThreePhone, type ThreePhoneHandle } from '@/components/ui/phone-three';

/* ------------------------------- types ---------------------------------- */

export type ShowcaseChip = { label: string; href: string; meta?: string };
export type ShowcaseBranch = {
  name: string;
  address: string;
  hours: string;
  open: boolean;
  phone: string;
  phoneDisplay: string;
  directions: string;
};

export type PhoneShowcaseProps = {
  /** Brand name shown in the cover eyebrow. */
  name?: string;
  /** Sub-line under the brand name. */
  tagline?: string;
  /** Branch cards used by scene 6 (live open/closed is computed by caller). */
  branches?: ShowcaseBranch[];
  /** Spec list in scene 1. */
  specs?: string[];
  /** Left/right chip columns in scene 3. */
  brands?: ShowcaseChip[];
  /** Bottom chip row in scene 3. */
  accessories?: ShowcaseChip[];
  /** Call / WhatsApp / catalogue links. */
  ctaLinks?: {
    call: string;
    whatsapp: string;
    newPhones?: string;
    preOwned?: string;
    repairs?: string;
  };
  /** Price chips used by scene 5 → /second-hand?price=... */
  priceRanges?: { label: string; href: string }[];
  ink?: string;
  bone?: string;
  accent?: string;
  /** Secondary stroke colour (dusty rose). */
  accentSecondary?: string;
  /** Stage height (CSS length or vh multiplier via sceneScroll). */
  height?: string | number;
  /** Viewport-heights of scrolling per scene transition (mobile 0.8). */
  sceneScroll?: number;
  /** Idle spin on/off. */
  alive?: boolean;
  className?: string;
  /** Display serif passed from next/font. */
  fontFamily?: string;
  /** When null, no external stylesheet is injected. */
  fontHref?: string | null;
};

/* ---------------------------- small helpers ----------------------------- */

const clamp = (v: number, min = 0, max = 1) => (v < min ? min : v > max ? max : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const smooth01 = (t: number) => smooth(clamp(t));

const SCENE_COUNT = 6;
/** How long each scene holds before morphing to the next (0–1 of a scene). */
const HOLD = 0.42;
// Idle motion is a slow sway around the front view (never edge-on unless the
// visitor drags), because the screen is the product. Raise the amplitude for a
// more theatrical turn; the drag offset still allows a full 360°.
/** World-space point. */
type Vec3 = [number, number, number];

const IDLE_SWAY_AMP = 0.55; // radians
const IDLE_SWAY_SPEED = 0.32; // radians / second
const TILT_MAX = 0.28; // radians — pointer tilt range

type Key = {
  radius: number;
  theta: number; // azimuth, 0 = front of the phone
  phi: number; // elevation, + = camera above
  target: [number, number, number];
  roll: number;
  explode: number;
};

/** Landscape / desktop framing. */
const KEYS: Key[] = [
  // 1 · full front view — dead centre, flanked by F and X
  { radius: 6.4, theta: -0.42, phi: 0.1, target: [0, 0, 0], roll: -0.02, explode: 0 },
  // 2 · camera island macro — phone pushed right so the caption breathes
  { radius: 3.5, theta: Math.PI * 0.92, phi: 0.62, target: [-0.5, 0.5, 0], roll: 0.08, explode: 0 },
  // 3 · small phone floating high above the catalogue chips
  { radius: 9.4, theta: -0.34, phi: 0.2, target: [0, -1.25, 0], roll: -0.05, explode: 0 },
  // 4 · low angle from below, exploded (words overlap on purpose)
  { radius: 5.6, theta: 0.42, phi: -1.02, target: [0, 0.04, 0], roll: 0.12, explode: 1 },
  // 5 · large phone offset RIGHT (negative target.x = object sits right)
  { radius: 5.6, theta: -0.3, phi: 0.06, target: [-1.15, 0, 0], roll: -0.03, explode: 0.06 },
  // 6 · phone drops past the bottom edge while the branch cards rise
  { radius: 6.2, theta: 0.06, phi: 0.34, target: [0, 3.5, 0], roll: 0, explode: 0 },
];

/** Portrait framing — the PRIMARY layout for this site (mobile-first). */
const KEYS_TALL: Key[] = [
  // Positive target.y pushes the handset DOWN the frame; negative lifts it.
  // Every portrait key keeps the phone in the upper ~55% so the copy band
  // (and its scrim) along the bottom stays clear and legible.
  { radius: 24.0, theta: 0.0, phi: 0.02, target: [0, -3.5, 0], roll: 0, explode: 0 },
  { radius: 6.2, theta: Math.PI * 0.93, phi: 0.5, target: [-0.22, -0.6, 0], roll: 0.06, explode: 0 },
  { radius: 19.0, theta: -0.36, phi: 0.22, target: [0, -2.9, 0], roll: -0.04, explode: 0 },
  { radius: 12.4, theta: 0.5, phi: -0.62, target: [0, -1.45, 0], roll: 0.1, explode: 1 },
  { radius: 12.6, theta: -0.26, phi: 0.02, target: [0, -1.05, 0], roll: -0.02, explode: 0.05 },
  { radius: 13.4, theta: 0.05, phi: 0.2, target: [0, -0.5, 0], roll: 0, explode: 0 },
];

/**
 * Portrait/landscape cutover. MUST equal the Tailwind breakpoint used for the
 * scene composition in this file (`lg`, i.e. 1024px): below it the stage uses
 * the stacked portrait layout + KEYS_TALL framing, at or above it the flanking
 * layout + KEYS framing. Keeping the JS and CSS cutovers identical is what stops
 * copy from landing on top of the handset.
 */
const PORTRAIT_MAX = 1024;

/**
 * Real photography, one frame per scene, used on phones and tablets instead of
 * the 3D model. A handset in the hand of a real scene reads as a product; a
 * rendered slab with a drawn wallpaper reads as a placeholder — which is what
 * mobile visitors were getting. Files are self-hosted under /public.
 *
 * `-fade.webp` are alpha-vignetted copies of the same frames (see README §15),
 * so each photo melts into the ink backdrop instead of sitting in a rectangle.
 */
const SCENE_PHOTOS = [
  '/images/photo-1695048133142-1a20484d2569.jpg', // 1 cover — glossy handset
  '/images/photo-1592750475338-74b7b21085ab.jpg', // 2 crown — camera macro
  '/images/accessories-flatlay.jpg', //              3 catalogue — phones + audio
  '/images/repair-teardown.jpg', //                  4 atelier — torn down
  '/images/repair-macro.jpg', //                     5 promise — technician at work
  '/images/store-interior.jpg', //                   6 branches — the shop floor
] as const;

/** Scene photos are landscape or square; the feathered webp is the primary. */
const photoFor = (scene: number) => SCENE_PHOTOS[Math.max(0, Math.min(SCENE_PHOTOS.length - 1, scene))];
const photoFadeFor = (scene: number) => `/mobile/scene-${Math.max(1, Math.min(SCENE_PHOTOS.length, scene + 1))}-fade.webp`;

type SceneCoord = number; // 0 .. SCENE_COUNT-1

/** Scroll progress (0–1) → continuous scene coordinate. */
const sceneCoord = (p: number): SceneCoord => clamp(p) * (SCENE_COUNT - 1);

/** Pick + smooth the camera keyframe for a scene coordinate. */
/**
 * The raw-WebGL build framed the handset noticeably larger. Pulling every
 * keyframe's orbit radius in by this factor reproduces that crop uniformly,
 * instead of hand-editing six keyframes in two arrays.
 */
const FRAMING = 0.88;

function keyAt(c: number, keys: Key[]): Key {
  const lo = Math.max(0, Math.min(keys.length - 1, Math.floor(c)));
  const hi = Math.min(keys.length - 1, lo + 1);
  const t = smooth01(c - lo);
  const a = keys[lo];
  const b = keys[hi];
  return {
    radius: lerp(a.radius, b.radius, t) * FRAMING,
    theta: lerp(a.theta, b.theta, t),
    phi: lerp(a.phi, b.phi, t),
    target: [
      lerp(a.target[0], b.target[0], t),
      lerp(a.target[1], b.target[1], t),
      lerp(a.target[2], b.target[2], t),
    ],
    roll: lerp(a.roll, b.roll, t),
    explode: lerp(a.explode, b.explode, t),
  };
}

/** Per-scene visibility weight (1 = fully visible, 0 = gone). */
function sceneWeights(c: number): number[] {
  return Array.from({ length: SCENE_COUNT }, (_, i) => {
    const d = Math.abs(c - i);
    return smooth01(1 - d / (0.35 + HOLD));
  });
}

/* --------------------------- geometry builder ---------------------------- */

/** Interleaved layout: position(3) normal(3) kind(1) explode(3) = 10 floats. */
const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [parseInt(v.slice(0, 2), 16) / 255, parseInt(v.slice(2, 4), 16) / 255, parseInt(v.slice(4, 6), 16) / 255];
};

/* ------------------------- 2D canvas fallback ---------------------------- */

function drawPhone2D(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  c: number,
  tilt: { x: number; y: number },
  colours: { ink: string; accent: string; accent2: string; bone: string }
) {
  ctx.clearRect(0, 0, w, h);
  const key = keyAt(c, w < PORTRAIT_MAX ? KEYS_TALL : KEYS);
  const scale = Math.min(w, h) / (key.radius * 1.15);
  const pw = 0.95 * scale;
  const ph = 2.0 * scale;
  const cx = w / 2 + tilt.y * scale * 0.18 - key.target[0] * scale * 0.25;
  const cy = h * 0.5 + key.target[1] * scale * 0.3 - tilt.x * scale * 0.12;

  const explode = key.explode;
  const rot = Math.sin(key.theta) * 0.35;

  const rr = (x: number, y: number, ww: number, hh: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + ww, y, x + ww, y + hh, r);
    ctx.arcTo(x + ww, y + hh, x, y + hh, r);
    ctx.arcTo(x, y + hh, x, y, r);
    ctx.arcTo(x, y, x + ww, y, r);
    ctx.closePath();
  };

  // shadow
  ctx.save();
  ctx.shadowColor = 'rgba(217,155,127,0.35)';
  ctx.shadowBlur = 60;
  rr(cx - pw / 2, cy - ph / 2, pw, ph, pw * 0.2);
  ctx.fillStyle = colours.accent2;
  ctx.fill();
  ctx.restore();

  // back glass (offset when exploded)
  ctx.save();
  ctx.translate(cx + rot * 6, cy + explode * -70);
  rr(-pw / 2, -ph / 2, pw, ph, pw * 0.2);
  const g = ctx.createLinearGradient(-pw / 2, -ph / 2, pw / 2, ph / 2);
  g.addColorStop(0, colours.accent);
  g.addColorStop(1, colours.accent2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();

  // screen
  ctx.save();
  ctx.translate(cx, cy + explode * 40);
  rr(-pw / 2, -ph / 2, pw, ph, pw * 0.2);
  const sg = ctx.createLinearGradient(0, -ph / 2, 0, ph / 2);
  sg.addColorStop(0, '#081C27');
  sg.addColorStop(1, '#2a3b46');
  ctx.fillStyle = sg;
  ctx.fill();
  ctx.fillStyle = colours.accent;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.round(pw * 0.2)}px Georgia, serif`;
  ctx.fillText('F-EX', 0, 0);
  ctx.restore();
}

/* ------------------------------- component ------------------------------ */

export default function PhoneShowcase({
  name = 'F-Ex Store',
  tagline = 'Mobile Dealer · Guwahati',
  branches = [],
  specs = ['New Phones', 'Pre-Owned', 'Accessories', 'Expert Repairs', 'EMI & Same-Day Delivery'],
  brands = [],
  accessories = [],
  ctaLinks = { call: 'tel:+918511822537', whatsapp: 'https://wa.me/918511822537' },
  priceRanges = [],
  ink = '#0F3040',
  bone = '#F6EBE3',
  accent = '#D99B7F',
  accentSecondary = '#A56F63',
  height,
  sceneScroll = 1,
  alive = true,
  className = '',
  fontFamily,
  fontHref = null,
}: PhoneShowcaseProps) {
  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const stickyRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const sceneRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const navRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const letterRefs = React.useRef<(HTMLSpanElement | null)[]>([]);
  const progressRef = React.useRef(0);
  const [activeScene, setActiveScene] = React.useState(0);
  const [mode, setMode] = React.useState<'webgl' | 'canvas2d' | 'poster'>('webgl');
  const [ready, setReady] = React.useState(false);
  /** Capability probe finished — the render loop must not start before this. */
  const [probed, setProbed] = React.useState(false);
  const [hoveredBrand, setHoveredBrand] = React.useState<ShowcaseChip | null>(null);

  // Mobile-first: 0.8 viewport-heights per scene under 820px, 1.0 above.
  // (Overridable with the sceneScroll prop; `height` wins over both.)
  const [effectiveSceneScroll, setEffectiveSceneScroll] = React.useState(sceneScroll);
  React.useEffect(() => {
    const apply = () => setEffectiveSceneScroll(window.innerWidth < 820 ? Math.min(sceneScroll, 0.8) : sceneScroll);
    apply();
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  }, [sceneScroll]);

  const stageHeight =
    height ?? `calc((1 + ${Math.max(0.4, effectiveSceneScroll) * (SCENE_COUNT - 1)}) * 100vh)`;

  /* ------------------------- fonts (optional) ------------------------- */
  React.useEffect(() => {
    if (fontHref === null || typeof document === 'undefined') return;
    if (document.querySelector(`link[href="${fontHref}"]`)) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = fontHref;
    document.head.appendChild(l);
  }, [fontHref]);

  /* ----------------------- environment probing ------------------------ */
  React.useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const phoneOrTablet = window.innerWidth < PORTRAIT_MAX;
    // Deliberate product decision: below PORTRAIT_MAX the hero shows real
    // photography for every scene, not the 3D model. The stage is tall and
    // narrow there, the model costs the most GPU on the weakest hardware, and a
    // real handset photographs better than a rendered one at that size.
    if (phoneOrTablet) {
      setMode('poster');
      setReady(true);
      setProbed(true);
      return;
    }
    if (reduced) {
      setMode('poster');
      setReady(true);
      setProbed(true);
      return;
    }
    // three.js r163+ renders WebGL2 only, so probe for that and fall back to
    // the 2D canvas renderer on WebGL1-only devices.
    const probe = document.createElement('canvas');
    const gl2 = probe.getContext('webgl2');
    setMode(gl2 ? 'webgl' : 'canvas2d');
    setProbed(true);
  }, []);

  /* ------------- poster mode: still switch frames per scene ------------ */
  React.useEffect(() => {
    if (!probed || mode !== 'poster') return;
    const stage = stageRef.current;
    if (!stage) return;
    let raf = 0;
    let last = -1;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const rect = stage.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
      const total = stage.offsetHeight - window.innerHeight;
      const p = total > 0 ? clamp(-rect.top / total) : 0;
      const c = sceneCoord(p);
      const weights = sceneWeights(c);
      let best = 0;
      let bestW = -1;
      weights.forEach((w, i) => {
        const el = sceneRefs.current[i];
        if (!el) return;
        el.style.opacity = String(w);
        el.style.transform = `translate3d(0, ${((1 - w) * 26).toFixed(2)}px, 0)`;
        el.style.visibility = w < 0.02 ? 'hidden' : 'visible';
        el.style.pointerEvents = 'none';
        if (w > bestW) {
          bestW = w;
          best = i;
        }
      });
      if (best !== last) {
        last = best;
        setActiveScene(best);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode, probed]);

  /* --------------------------- render loop ---------------------------- */
  React.useEffect(() => {
    // Without this guard the loop mounts once with the default 'webgl' mode
    // before the probe has run, so on a WebGL-less device three.js would log a
    // context-creation error before the fallback engaged.
    if (!probed || mode === 'poster') return;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    const mobile = window.innerWidth < PORTRAIT_MAX;
    const keys = mobile ? KEYS_TALL : KEYS;
    const detail = mobile ? 10 : 28;
    const dprCap = mobile ? 1.5 : 2;
    const colours = {
      ink: hexToRgb(ink),
      bone: hexToRgb(bone),
      accent: hexToRgb(accent),
      accent2: hexToRgb(accentSecondary),
      plum: hexToRgb('#464858'),
    };

    let raf = 0;
    let running = true;
    let visible = true;
    let t0 = performance.now();
    let spin = 0; // sway angle (rad) — driven by time, plus drag
    let tiltX = 0;
    let tiltY = 0;
    let targetTiltX = 0;
    let targetTiltY = 0;
    let dragOffset = 0;
    let dragging = false;
    let lastX = 0;

    /* ---------------- three.js studio ---------------- */
    // Real geometry + PBR materials + a lit environment (see phone-three.ts).
    // The code below only feeds it the same numbers the old shader took.
    let three: ThreePhoneHandle | null = null;
    let ctx2d: CanvasRenderingContext2D | null = null;

    if (mode === 'webgl') {
      three = createThreePhone({
        canvas,
        ink,
        bone,
        accent,
        accentSecondary,
        lowDetail: mobile,
        dprCap,
        brand: name,
      });
      if (!three) {
        // No usable context/renderer → poster frame, never a broken canvas.
        setMode('poster');
        setReady(true);
        return;
      }
      setReady(true);
    }
    if (mode === 'canvas2d') {
      ctx2d = canvas.getContext('2d');
      setReady(true);
    }

    /* ---------------- sizing ---------------- */
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (three) {
        // three owns canvas.width/height once it is in charge of the context.
        three.resize(w, h, dpr);
      } else {
        canvas.width = Math.max(1, Math.round(w * dpr));
        canvas.height = Math.max(1, Math.round(h * dpr));
      }
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /* ---------------- scroll progress ---------------- */
    const updateProgress = () => {
      const rect = stage.getBoundingClientRect();
      const total = stage.offsetHeight - window.innerHeight;
      const p = total > 0 ? clamp(-rect.top / total) : 0;
      progressRef.current = p;
    };

    /* ---------------- scene overlays ---------------- */
    let lastPainted = Number.NaN;
    const paintScenes = (c: number) => {
      if (Math.abs(c - lastPainted) < 0.0015) return;
      lastPainted = c;
      const weights = sceneWeights(c);
      let best = 0;
      let bestW = -1;
      weights.forEach((w, i) => {
        const el = sceneRefs.current[i];
        if (el) {
          el.style.opacity = String(w);
          el.style.transform = `translate3d(0, ${((1 - w) * 26).toFixed(2)}px, 0)`;
          el.style.visibility = w < 0.02 ? 'hidden' : 'visible';
          // the overlay never captures the pointer — only its links/buttons do
          el.style.pointerEvents = 'none';
        }
        if (w > bestW) {
          bestW = w;
          best = i;
        }
      });
      // Cover wordmark: F and X part sideways, E scales away — driven by the
      // cover scene weight (w0), so scrolling splits the headline apart.
      const w0 = weights[0];
      const [fEl, eEl, xEl] = letterRefs.current;
      if (fEl && eEl && xEl) {
        const t = 1 - w0;
        fEl.style.transform = `translate3d(${-t * 16}vw, ${t * 4}vh, 0) rotate(${-t * 6}deg)`;
        xEl.style.transform = `translate3d(${t * 16}vw, ${t * 4}vh, 0) rotate(${t * 6}deg)`;
        eEl.style.transform = `translate3d(0, ${-t * 6}vh, 0) scale(${1 + t * 0.45})`;
      }
      if (bestW > 0.6) setActiveScene((prev) => (prev === best ? prev : best));
    };

    /* ---------------- pointer / drag ---------------- */
    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetTiltX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      targetTiltY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      if (dragging) {
        dragOffset += (e.clientX - lastX) * 0.006;
        lastX = e.clientX;
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      canvas.setPointerCapture?.(e.pointerId);
    };
    const onPointerUp = () => {
      dragging = false;
    };
    const onPointerLeave = () => {
      targetTiltX = 0;
      targetTiltY = 0;
    };

    canvas.addEventListener('pointermove', onPointerMove, { passive: true });
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerLeave);

    /* ---------------- context loss ---------------- */
    const onContextLost = (e: Event) => {
      e.preventDefault();
      running = false;
      setMode('canvas2d');
    };
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', () => window.location.reload());

    /* ---------------- pause off-screen ---------------- */
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    }, { rootMargin: '100px' });
    io.observe(stage);

    /* ---------------- frame ---------------- */
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const dt = Math.min(0.05, (now - t0) / 1000);
      t0 = now;

      updateProgress();
      const c = sceneCoord(progressRef.current);
      paintScenes(c);
      const weights = sceneWeights(c);

      // eased tilt + idle spin
      tiltX = lerp(tiltX, targetTiltX, 0.06);
      tiltY = lerp(tiltY, targetTiltY, 0.06);
      spin = alive ? Math.sin((now / 1000) * IDLE_SWAY_SPEED) * IDLE_SWAY_AMP : 0;

      const key = keyAt(c, keys);
      const theta = key.theta + tiltX * TILT_MAX + dragOffset;
      const phi = clamp(key.phi + tiltY * TILT_MAX * 0.6, -1.35, 1.35);
      const eye: Vec3 = [
        key.target[0] + key.radius * Math.sin(theta) * Math.cos(phi),
        key.target[1] + key.radius * Math.sin(phi),
        key.target[2] + key.radius * Math.cos(theta) * Math.cos(phi),
      ];

      if (three) {
        three.render({
          eye,
          target: key.target as unknown as [number, number, number],
          roll: key.roll,
          // A small resting yaw keeps the chamfer and side wall in view at all
          // times; a dead-flat 0° read as a printed card, not an object.
          modelY: spin + dragOffset * 0.4 + tiltX * 0.2 + 0.24,
          modelX: tiltY * 0.16,
          explode: key.explode,
          accessories: weights[2] ?? 0,
          time: now / 1000,
        });
      } else if (ctx2d) {
        const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
        ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawPhone2D(
          ctx2d,
          canvas.clientWidth,
          canvas.clientHeight,
          c,
          { x: tiltY, y: tiltX },
          { ink, accent, accent2: accentSecondary, bone }
        );
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      // Free GPU resources but keep the context alive: React StrictMode
      // remounts effects in dev, and a canvas cannot be re-initialised after
      // forceContextLoss() — that is what blanked the hero before.
      three?.dispose();
    };
  }, [mode, probed, alive, accent, accentSecondary, ink, bone, name]);

  /* --------------------------- nav / jump ----------------------------- */
  const jumpTo = React.useCallback(
    (index: number) => {
      const stage = stageRef.current;
      if (!stage) return;
      const top = stage.getBoundingClientRect().top + window.scrollY;
      const scrollable = stage.offsetHeight - window.innerHeight;
      const p = index / (SCENE_COUNT - 1);
      const target = top + scrollable * p;
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(target, { duration: 1.4 });
      else window.scrollTo({ top: target, behavior: 'smooth' });
    },
    []
  );

  const onNavKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      jumpTo(Math.min(SCENE_COUNT - 1, index + 1));
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      jumpTo(Math.max(0, index - 1));
    }
  };

  const displayFont = fontFamily ? { fontFamily } : { fontFamily: 'Bodoni Moda, Georgia, serif' };
  const sceneLabels = ['Cover', 'Crown', 'Catalogue', 'Atelier', 'Promise', 'Branches'];

  /* ------------------------------ render ------------------------------ */
  return (
    <section
      ref={stageRef}
      className={`relative w-full ${className}`}
      style={{ height: stageHeight, background: ink }}
      aria-label="F-Ex Store — an interactive look at our phones"
    >
      <div ref={stickyRef} className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* The warm bloom behind the phone is now a real additive glow sprite and
            point light inside the three.js scene (phone-three.ts), not a CSS
            radial-gradient. The 2D/poster fallbacks keep their own painted glow,
            so nothing here needs to replace it. Grain stays: it is a texture
            that hides banding in the rendered gradient, not a light source. */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.045] mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22140%22%20height%3D%22140%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.86%22%20numOctaves%3D%224%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22140%22%20height%3D%22140%22%20filter%3D%22url(%23n)%22%2F%3E%3C%2Fsvg%3E')]" />

        {/* 3D stage / poster */}
        <div className="absolute inset-0">
          {mode === 'poster' ? (
            <PosterFrame scene={activeScene} ink={ink} accent={accent} accentSecondary={accentSecondary} />
          ) : (
            <canvas
              key={mode}
              ref={canvasRef}
              className="absolute inset-0 h-full w-full touch-pan-y"
              aria-hidden="true"
              style={{ cursor: mode === 'webgl' ? 'grab' : 'default' }}
            />
          )}
          {!ready && mode !== 'poster' && (
            <div className="absolute inset-0 grid place-items-center">
              <PosterFrame scene={0} ink={ink} accent={accent} accentSecondary={accentSecondary} />
            </div>
          )}
        </div>

        {/*
          Portrait legibility band. On phones the phone mesh occupies the upper
          half of the stage, so all six scenes park their copy in the lower half
          and this gradient guarantees AA contrast there. Hidden from md up,
          where each scene composes around the phone instead.
        */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[6] h-[72%] bg-gradient-to-t from-ink from-35% via-ink/92 via-65% to-transparent lg:hidden"
        />

        {/* --------------------------- SCENE 1 · COVER --------------------------- */}
        <div
          ref={(el) => { sceneRefs.current[0] = el; }}
          className="absolute inset-0 z-10 flex flex-col justify-between px-5 pb-6 pt-24 [@media(max-height:560px)]:pt-16 [@media(max-height:560px)]:pb-4 lg:px-10 lg:pb-10 lg:pt-28"
          style={{ opacity: 1 }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-sans text-[10px] uppercase tracking-[0.42em] text-peach/80 lg:text-xs">{name}</p>
              <p className="mt-1 font-sans text-[10px] uppercase tracking-[0.32em] text-cream/45 lg:text-xs">{tagline}</p>
            </div>
            <div className="hidden text-right lg:block">
              {['Buy', 'Sell', 'Repair'].map((word) => (
                <p key={word} className="font-display text-2xl leading-tight text-cream/85 lg:text-3xl">
                  {word}
                </p>
              ))}
            </div>
          </div>

          {/* giant flanking wordmark — sits behind the copy, never under it */}
          <div className="pointer-events-none absolute inset-x-0 top-[36%] z-0 -translate-y-1/2 [@media(max-height:560px)]:hidden lg:top-1/2 lg:-translate-y-[62%]">
            <div className="flex w-full items-center justify-between px-2 lg:px-8" style={displayFont}>
              <span
                ref={(el) => { letterRefs.current[0] = el; }}
                className="text-[26vw] leading-none text-cream/90 will-change-transform lg:text-[15vw]"
              >
                F
              </span>
              <span
                ref={(el) => { letterRefs.current[1] = el; }}
                className="relative text-[22vw] leading-none will-change-transform lg:text-[13vw]"
                style={{ WebkitTextStroke: '1px rgba(217,155,127,0.55)', color: 'transparent' }}
              >
                E
              </span>
              <span
                ref={(el) => { letterRefs.current[2] = el; }}
                className="text-[26vw] leading-none text-cream/90 will-change-transform lg:text-[15vw]"
              >
                X
              </span>
            </div>
          </div>

          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <p className="max-w-[22rem] text-sm leading-relaxed text-cream/75 [@media(max-height:560px)]:text-[13px] [@media(max-height:560px)]:leading-snug lg:max-w-sm lg:text-[15px] lg:leading-relaxed">
              New and pre-owned smartphones, accessories and expert repairs in Guwahati. Two branches, open every
              day till 10 PM.
            </p>
            <ul className="flex max-w-[24rem] flex-wrap gap-x-4 gap-y-1 text-[10px] uppercase tracking-[0.18em] text-peach/70 lg:justify-end lg:text-right lg:text-[11px]">
              {specs.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="flex items-end justify-between text-[10px] uppercase tracking-[0.3em] text-cream/40">
            <span>Est. 2024</span>
            <span>{branches.length ? branches.map((b) => b.name).join(' · ') : 'Lokhra · Basistha'}</span>
          </div>
        </div>

        {/* --------------------------- SCENE 2 · CROWN --------------------------- */}
        <div
          ref={(el) => { sceneRefs.current[1] = el; }}
          className="absolute inset-0 z-10 flex flex-col justify-between px-5 py-24 lg:px-10"
          style={{ opacity: 0, visibility: 'hidden' }}
        >
          <div className="flex justify-between">
            <p className="text-[10px] uppercase tracking-[0.4em] text-cream/40">02 — Look closer</p>
            <span className="rotate-0 rounded-full border border-peach/40 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-peach">
              Genuine Parts
            </span>
          </div>
          <div className="max-w-md">
            <p className="font-display text-4xl leading-[0.95] text-cream lg:text-6xl">
              Every phone,<br />
              <span className="italic text-peach">inspected.</span>
            </p>
            <p className="mt-4 text-sm text-cream/60">
              Camera glass, sensors and lens rings checked at both branches before a handset reaches the shelf.
            </p>
          </div>
        </div>

        {/* ------------------------- SCENE 3 · CATALOGUE ------------------------- */}
        <div
          ref={(el) => { sceneRefs.current[2] = el; }}
          className="absolute inset-0 z-10 flex flex-col justify-between px-4 py-24 lg:px-10"
          style={{ opacity: 0, visibility: 'hidden' }}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.4em] text-cream/40">03 — The catalogue</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-peach/70">Hover a name</p>
          </div>

          <div className="mt-auto grid grid-cols-2 items-end gap-x-3 gap-y-2 pt-6 lg:mt-0 lg:flex-1 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-10 lg:pt-0">
            <ul className="space-y-1 lg:space-y-2">
              {brands.slice(0, Math.ceil(brands.length / 2)).map((b) => (
                <li key={b.label}>
                  <ChipLink chip={b} onHover={setHoveredBrand} align="left" />
                </li>
              ))}
            </ul>

            <div className="pointer-events-none order-first col-span-2 flex flex-col items-center justify-center pb-1 text-center lg:order-none lg:col-span-1 lg:mb-[26vh] lg:min-h-[26vh] lg:pb-0">
              <p className="text-[10px] uppercase tracking-[0.3em] text-cream/35">Selected</p>
              <p
                className="mt-2 max-w-[15ch] font-display text-3xl leading-[0.95] text-peach lg:text-5xl"
                style={displayFont}
              >
                {hoveredBrand?.label ?? 'Phones'}
              </p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-cream/45">
                {hoveredBrand?.meta ?? 'Apple · Vivo · Samsung'}
              </p>
            </div>

            <ul className="space-y-1 text-right lg:space-y-2">
              {brands.slice(Math.ceil(brands.length / 2)).map((b) => (
                <li key={b.label}>
                  <ChipLink chip={b} onHover={setHoveredBrand} align="right" />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-3 h-px w-full bg-gradient-to-r from-transparent via-peach/40 to-transparent" />
            <ul className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-cream/55">
              {accessories.map((a) => (
                <li key={a.label}>
                  <ChipLink chip={a} onHover={setHoveredBrand} align="left" compact />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* -------------------------- SCENE 4 · ATELIER -------------------------- */}
        <div
          ref={(el) => { sceneRefs.current[3] = el; }}
          className="absolute inset-0 z-10 flex flex-col justify-between px-5 py-24 lg:px-10"
          style={{ opacity: 0, visibility: 'hidden' }}
        >
          <p className="text-[10px] uppercase tracking-[0.4em] text-cream/40">04 — The repair atelier</p>

          <div className="relative">
            <div className="space-y-0" style={displayFont}>
              {['Screen', 'Battery', 'Motherboard'].map((word, i) => (
                <p
                  key={word}
                  className="text-[10.5vw] leading-[0.82] text-cream/90 sm:text-[12vw] lg:text-[7vw]"
                  style={{
                    WebkitTextStroke: i === 1 ? '1px rgba(217,155,127,0.65)' : undefined,
                    color: i === 1 ? 'transparent' : undefined,
                    marginLeft: `${i * 3}vw`,
                  }}
                >
                  {word}
                </p>
              ))}
            </div>
            <ul className="absolute right-0 top-2 hidden space-y-2 text-right text-[10px] uppercase tracking-[0.28em] text-peach/70 lg:block">
              <li>Camera</li>
              <li>Speaker</li>
              <li>Fingerprint</li>
            </ul>
          </div>

          <p className="text-[11px] uppercase tracking-[0.26em] text-cream/45">
            Free diagnosis at both branches
          </p>
        </div>

        {/* -------------------------- SCENE 5 · PROMISE -------------------------- */}
        <div
          ref={(el) => { sceneRefs.current[4] = el; }}
          className="absolute inset-0 z-10 flex flex-col justify-end px-5 pb-10 pt-24 lg:justify-center lg:px-10 lg:py-24"
          style={{ opacity: 0, visibility: 'hidden' }}
        >
          <p className="text-[10px] uppercase tracking-[0.4em] text-cream/40">05 — The promise</p>
          <h2 className="mt-4 max-w-[16ch] font-display text-5xl leading-[0.9] text-cream lg:text-7xl" style={displayFont}>
            Your next phone,
            <br />
            <span className="italic font-foil">today.</span>
          </h2>
          <p className="mt-4 text-[11px] uppercase tracking-[0.26em] text-peach/80">Certified pre-owned</p>
          <p className="text-[11px] uppercase tracking-[0.26em] text-cream/45">Warranty on selected phones</p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href={ctaLinks.call}
              data-cursor="Call"
              className="pointer-events-auto rounded-full bg-peach px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-deep transition-transform duration-300 hover:scale-[1.03]"
            >
              Call
            </a>
            <a
              href={ctaLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="WhatsApp"
              className="pointer-events-auto rounded-full border border-peach/50 px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-cream transition-colors duration-300 hover:bg-peach/10"
            >
              WhatsApp
            </a>
          </div>

          <ul className="mt-6 flex flex-wrap gap-2">
            {priceRanges.map((r) => (
              <li key={r.label}>
                <a
                  href={r.href}
                  className="pointer-events-auto inline-block rounded-full border border-cream/15 px-4 py-2 text-[11px] tracking-wide text-cream/70 transition-colors hover:border-peach/60 hover:text-peach"
                >
                  {r.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* -------------------------- SCENE 6 · BRANCHES ------------------------- */}
        <div
          ref={(el) => { sceneRefs.current[5] = el; }}
          className="absolute inset-0 z-10 flex flex-col justify-between px-4 py-24 lg:px-10"
          style={{ opacity: 0, visibility: 'hidden' }}
        >
          <p className="text-[10px] uppercase tracking-[0.4em] text-cream/40">06 — Two branches, one standard</p>

          <div className="grid gap-3 lg:grid-cols-2 lg:gap-5">
            {branches.map((b) => (
              <div
                key={b.name}
                className="pointer-events-auto rounded-2xl border border-peach/25 bg-[#464858]/40 p-4 backdrop-blur-md lg:p-6"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-2xl text-cream lg:text-3xl" style={displayFont}>
                    {b.name}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] ${
                      b.open ? 'border-peach/60 text-peach' : 'border-cream/25 text-cream/50'
                    }`}
                  >
                    {b.open ? 'Open now' : 'Closed'}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-cream/60">{b.address}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-cream/40">{b.hours}</p>
                <div className="mt-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.16em]">
                  <a href={`tel:${b.phone}`} data-cursor="Call" className="text-peach underline-offset-4 hover:underline">
                    Call
                  </a>
                  <span className="text-cream/20">/</span>
                  <a
                    href={b.directions}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="View"
                    className="text-cream/70 underline-offset-4 hover:text-peach hover:underline"
                  >
                    Directions
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-cream/45">
            <a href={ctaLinks.call} className="pointer-events-auto hover:text-peach">
              Call
            </a>
            <span className="font-display text-base tracking-[0.2em] text-peach" style={displayFont}>
              F-EX
            </span>
            <a href={ctaLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="pointer-events-auto hover:text-peach">
              WhatsApp
            </a>
          </div>
        </div>

        {/* ------------------------------ side nav ------------------------------ */}
        <nav
          aria-label="Showcase scenes"
          className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-3 lg:flex"
        >
          {sceneLabels.map((label, i) => (
            <button
              key={label}
              ref={(el) => { navRefs.current[i] = el; }}
              type="button"
              onClick={() => jumpTo(i)}
              onKeyDown={(e) => onNavKeyDown(e, i)}
              aria-current={activeScene === i ? 'true' : undefined}
              aria-label={`Go to scene ${i + 1}: ${label}`}
              className="group flex items-center justify-end gap-2 focus-visible:outline-none"
            >
              <span className="text-[9px] uppercase tracking-[0.24em] text-cream/0 transition-colors group-hover:text-cream/70 group-focus-visible:text-cream/70">
                {label}
              </span>
              <span
                className={`block h-px transition-all duration-500 ${
                  activeScene === i ? 'w-8 bg-peach' : 'w-4 bg-cream/30 group-hover:bg-peach/60'
                }`}
              />
            </button>
          ))}
        </nav>

        {/* mobile scene counter */}
        <div className="absolute bottom-20 right-4 z-20 font-sans text-[10px] uppercase tracking-[0.2em] text-cream/40 lg:hidden">
          {String(activeScene + 1).padStart(2, '0')} / 0{SCENE_COUNT}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- sub-parts ------------------------------- */

function ChipLink({
  chip,
  onHover,
  align,
  compact,
}: {
  chip: ShowcaseChip;
  onHover: (c: ShowcaseChip) => void;
  align: 'left' | 'right';
  compact?: boolean;
}) {
  return (
    <a
      href={chip.href}
      onMouseEnter={() => onHover(chip)}
      onFocus={() => onHover(chip)}
      data-cursor="View"
      className={`pointer-events-auto block truncate text-cream/70 transition-colors hover:text-peach focus-visible:text-peach ${
        align === 'right' ? 'text-right' : ''
      } ${compact ? 'text-[10px] uppercase tracking-[0.16em]' : 'font-display text-xl lg:text-3xl'}`}
    >
      {chip.label}
    </a>
  );
}

/** Poster frame — used for reduced motion, low-end devices and first paint. */
function PosterFrame({
  scene,
  ink,
  accent,
  accentSecondary,
}: {
  scene: number;
  ink: string;
  accent: string;
  accentSecondary: string;
}) {
  const src = photoFor(scene);
  const fade = photoFadeFor(scene);
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: ink }}
      aria-hidden="true"
    >
      {/* Real photograph for this scene. The feathered webp melts its edges into
          the backdrop; the plain JPEG is the fallback. `object-contain` keeps
          the whole product in frame on a narrow stage — `object-cover` cropped
          a landscape shot down to a sliver of bezel. */}
      <picture className="block h-full w-full">
        <source srcSet={fade} type="image/webp" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          loading={scene === 0 ? 'eager' : 'lazy'}
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-luxe"
          style={{ transform: `scale(${scene === 1 ? 1.16 : 1})` }}
        />
      </picture>
      {/* Scrim: keeps the F/E/X letters and the body copy AA-legible over any
          frame, and holds the palette's deep-teal mood instead of a light photo. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          // Light touch at the top so the photograph actually reads, heavier
          // behind the copy at the bottom where it must stay AA-legible.
          background:
            'linear-gradient(180deg, rgba(8,28,39,0.55) 0%, rgba(8,28,39,0.18) 32%, rgba(8,28,39,0.30) 54%, rgba(8,28,39,0.86) 82%, rgba(8,28,39,0.95) 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(52% 46% at 50% 44%, ${accent}18 0%, transparent 72%)` }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(55% 50% at 50% 45%, rgba(217,155,127,0.18), transparent 70%)' }}
      />
    </div>
  );
}
