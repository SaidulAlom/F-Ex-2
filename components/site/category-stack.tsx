'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { ArrowUpRight } from 'lucide-react';

/** How far up the viewport each card travels before it locks. Must match the sticky `top`. */
const PIN_GAP = 18;
const PIN_BASE = 84;
const pinTopFor = (index: number) => index * PIN_GAP + PIN_BASE;

/**
 * 0 → card top at the bottom edge of the viewport, 1 → card top at its sticky
 * offset (i.e. locked in place).
 *
 * `useScroll` cannot express this: it measures the sticky element's *live* rect,
 * whose `top` never travels above its sticky offset, so a `"start start"` target
 * is unreachable and progress freezes just under 1 — leaving every pinned card
 * permanently blurred and slightly scaled. Measuring against the pin offset makes
 * progress hit exactly 1 when the card locks, so the effects land on clean values.
 */
function usePinProgress(ref: React.RefObject<HTMLDivElement>, pinTop: number, enabled: boolean) {
  const progress = useMotionValue(0);

  useEffect(() => {
    if (!enabled) {
      // Reduced motion: land on the final, sharp state instead of leaving the
      // entrance values (blur 6px / scale 0.92) frozen mid-flight.
      progress.set(1);
      return;
    }
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const from = window.innerHeight;
      const raw = (from - el.getBoundingClientRect().top) / Math.max(1, from - pinTop);
      progress.set(Math.min(1, Math.max(0, raw)));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [enabled, pinTop, progress, ref]);

  return progress;
}

const cards = [
  {
    title: 'New Phones',
    kicker: 'Sealed · Warranty',
    copy: 'Apple, Vivo, Samsung, Redmi, Realme and OnePlus. Sealed boxes, India warranty, set up before you leave the counter.',
    href: '/new-phones',
    tone: 'bg-ink',
    accent: 'text-peach',
    border: 'border-peach/30',
    image:
      '/images/photo-1695048133142-1a20484d2569.jpg',
  },
  {
    title: 'Pre-Owned',
    kicker: '32-point certified',
    copy: 'A vault of flagships. Battery health printed on the tag, condition graded honestly, warranty on selected phones.',
    href: '/second-hand',
    tone: 'bg-plum',
    accent: 'text-cream',
    border: 'border-cream/20',
    image:
      '/images/photo-1592750475338-74b7b21085ab.jpg',
  },
  {
    title: 'Accessories & Gadgets',
    kicker: 'Tested in-store',
    copy: 'Chargers, cases, earphones, power banks, smart watches and even landline phones — everything we would use ourselves.',
    href: '/accessories',
    tone: 'bg-rose',
    accent: 'text-ink',
    border: 'border-ink/20',
    image:
      '/images/photo-1590658268037-6bf12165a8df.jpg',
  },
  {
    title: 'Repairs',
    kicker: 'Same-day, most models',
    copy: 'Screen, battery, motherboard, speaker, camera and fingerprint sensor. Free diagnosis at both branches.',
    href: '/repairs',
    tone: 'bg-cream',
    accent: 'text-ink',
    border: 'border-ink/15',
    image:
      '/images/repair-macro.jpg',
  },
] as const;

/**
 * Sticky stacking cards: each card pins while the next slides over it with
 * scale, blur and tilt. Cards use a different palette colour each.
 */
export function CategoryStack() {
  const container = useRef<HTMLDivElement | null>(null);
  const reduced = Boolean(useReducedMotion());

  return (
    <section
      data-section-label="The departments"
      ref={container}
      className="relative bg-ink-deep px-3 py-20 md:px-6 md:py-28"
      aria-label="Shop by category"
    >
      <div className="mx-auto mb-12 max-w-[1440px] px-2">
        <p className="text-[10px] uppercase tracking-[0.4em] text-peach/70">Four departments</p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl leading-[0.92] text-cream sm:text-5xl md:text-6xl">
          Everything a phone needs, under two roofs.
        </h2>
      </div>

      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 md:gap-6">
        {cards.map((card, i) => (
          <StackCard key={card.title} card={card} index={i} total={cards.length} reduced={reduced} />
        ))}
      </div>
    </section>
  );
}

function StackCard({
  card,
  index,
  total,
  reduced,
}: {
  card: (typeof cards)[number];
  index: number;
  total: number;
  reduced: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const pinTop = pinTopFor(index);
  const progress = usePinProgress(ref, pinTop, !reduced);
  const scale = useTransform(progress, [0, 1], [0.92, 1]);
  const blur = useTransform(progress, [0, 1], ['blur(6px)', 'blur(0px)']);
  const rotate = useTransform(progress, [0, 1], [index % 2 ? 1.4 : -1.4, 0]);

  return (
    <div
      ref={ref}
      className="sticky"
      style={{ top: `${pinTop}px`, zIndex: 10 + index }}
    >
      <motion.div
        style={{ scale, rotate, filter: blur }}
        className={`relative overflow-hidden rounded-[26px] border ${card.border} ${card.tone} shadow-[0_40px_100px_-40px_rgba(8,28,39,0.9)]`}
      >
        <Link href={card.href} className="group grid gap-6 p-6 md:grid-cols-[1.1fr_0.9fr] md:items-center md:p-10" data-cursor="View">
          <div>
            <div className="flex items-baseline gap-4">
              <span className={`font-display text-5xl leading-none opacity-40 md:text-6xl ${card.accent}`}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <p className={`text-[9px] uppercase tracking-[0.3em] opacity-60 ${card.accent}`}>{card.kicker}</p>
                <h3 className={`mt-1 font-display text-3xl leading-[0.95] md:text-5xl ${card.accent}`}>{card.title}</h3>
              </div>
            </div>
            <p className={`mt-5 max-w-md text-sm leading-relaxed opacity-80 ${card.accent}`}>{card.copy}</p>
            <span
              className={`mt-6 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] transition-transform duration-300 group-hover:translate-x-1 ${card.border} ${card.accent}`}
            >
              Explore <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>

          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl md:aspect-[4/3]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.image}
              alt={card.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-1000 ease-luxe group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-gradient-to-tr from-ink-deep/40 to-transparent" />
            <span className="absolute right-3 top-3 rounded-full bg-ink-deep/70 px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-cream/80 backdrop-blur">
              {String(index + 1)} / {total}
            </span>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
