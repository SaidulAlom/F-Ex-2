'use client';

import {
  motion,
  useTransform,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useMotionValueEvent,
  type MotionValue,
} from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * CurtainSplitHero — 21st.dev "curtain split hero", rebuilt for F-Ex Store.
 *
 * Eight photographs of the shop start stacked in the middle like a closed
 * curtain. Scrolling (or clicking) parts them into two wings, revealing the
 * headline behind. The split, the pointer parallax and the card transforms are
 * unchanged from the original component; only the palette, copy and images are
 * F-Ex.
 */

const IMAGES = [
  { src: '/images/store-interior.jpg', alt: 'The F-Ex counter at Lokhra, phones in lit glass cases' },
  { src: '/images/photo-1510557880182-3d4d3cba35a5.jpg', alt: 'A hand holding an iPhone at the counter' },
  { src: '/images/photo-1592750475338-74b7b21085ab.jpg', alt: 'The back of a pre-owned iPhone, graded A' },
  { src: '/images/repair-microscope.jpg', alt: 'A technician repairing a phone board under a microscope' },
  { src: '/images/photo-1616348436168-de43ad0db179.jpg', alt: 'A new sealed iPhone in green' },
  { src: '/images/accessories-flatlay.jpg', alt: 'Cases, earbuds and adapters laid out flat' },
  { src: '/images/photo-1601593346740-925612772716.jpg', alt: 'A customer trying a phone case at the counter' },
  { src: '/images/repair-artisan.jpg', alt: 'An F-Ex technician with a screwdriver over an open phone' },
];

const SPRING_CONFIG = { stiffness: 65, damping: 22, mass: 0.5 };

interface StageDimensions {
  width: number;
  height: number;
  isMobile: boolean;
}

interface CurtainCardProps {
  item: { src: string; alt: string };
  index: number;
  total: number;
  progress: MotionValue<number>;
  pointer: { x: MotionValue<number>; y: MotionValue<number> };
  isSpreadActive: boolean;
  stage: StageDimensions;
}

function CurtainCard({ item, index, total, progress, pointer, isSpreadActive, stage }: CurtainCardProps) {
  const half = total / 2;
  const isLeft = index % 2 === 0;
  const wingIndex = Math.floor(index / 2);
  const norm = wingIndex / (half - 1) - 0.5;
  const sideMult = isLeft ? -1 : 1;

  const cardWidth = stage.isMobile ? 62 : 104;
  const cardHeight = stage.isMobile ? 84 : 140;

  const archCurve = Math.cos(norm * Math.PI) * (stage.width * 0.025);
  const targetX = sideMult * (stage.width * (stage.isMobile ? 0.37 : 0.34) + archCurve);
  const targetY = norm * (stage.height * 0.58);
  const targetRotate = sideMult * (norm * 18);

  const initialX = sideMult * (wingIndex * 4);
  const initialY = norm * 10;
  const initialRotate = sideMult * (wingIndex * 2);

  const translate = useTransform([progress, pointer.x, pointer.y], ([p, px, py]: number[]) => {
    const easeP = 1 - Math.pow(1 - p, 3);

    const tx = initialX + (targetX - initialX) * easeP;
    const ty = initialY + (targetY - initialY) * easeP;

    const maxParallaxX = stage.isMobile ? 8 : 16;
    const maxParallaxY = stage.isMobile ? 6 : 14;

    const dx = tx + px * (isLeft ? -maxParallaxX : maxParallaxX) * easeP;
    const dy = ty + py * maxParallaxY * easeP;

    return `calc(-50% + ${dx}px) calc(-50% + ${dy}px)`;
  });

  const rotate = useTransform(progress, [0, 0.45, 1], [initialRotate, isLeft ? -14 : 14, targetRotate]);
  const scale = useTransform(progress, [0, 0.5, 1], [1, 0.96, 0.92]);

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 cursor-pointer select-none will-change-transform"
      style={{
        width: cardWidth,
        height: cardHeight,
        zIndex: isLeft ? index + 1 : total - index,
        translate,
        rotate,
        scale,
      }}
      whileHover={
        isSpreadActive
          ? { scale: 1.08, zIndex: 50, rotate: 0, transition: SPRING_CONFIG }
          : { scale: 0.98 }
      }
      whileTap={{ scale: 1.04, zIndex: 50 }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-xl bg-ink-deep shadow-xl shadow-black/40 ring-1 ring-cream/15 transition-shadow duration-300 hover:shadow-2xl hover:ring-peach/60">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.src}
          alt={item.alt}
          draggable={false}
          className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-110"
        />
      </div>
    </motion.div>
  );
}

export type CurtainSplitHeroProps = {
  eyebrow?: string;
  title?: React.ReactNode;
  body?: string;
  className?: string;
};

export default function CurtainSplitHero({
  eyebrow = 'F-Ex Store · Guwahati',
  title = (
    <>
      Phones,
      <br />
      Honestly.
    </>
  ),
  body = 'New, pre-owned and repaired phones at two counters in Guwahati. Graded in the open, EMI on the counter, open till 10 PM.',
  className = '',
}: CurtainSplitHeroProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const [stage, setStage] = useState<StageDimensions>({ width: 1000, height: 640, isMobile: false });

  const rawProgress = useMotionValue(0);
  const progress = useSpring(rawProgress, SPRING_CONFIG);

  const [isSpreadActive, setIsSpreadActive] = useState(false);
  useMotionValueEvent(progress, 'change', (p) => setIsSpreadActive(p > 0.65));

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const pointerX = useSpring(rawX, SPRING_CONFIG);
  const pointerY = useSpring(rawY, SPRING_CONFIG);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const updateDimensions = () => {
      const rect = el.getBoundingClientRect();
      setStage({ width: rect.width, height: rect.height, isMobile: rect.width < 768 });
    };

    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const current = rawProgress.get();
      const delta = e.deltaY * 0.002;
      const next = Math.min(1, Math.max(0, current + delta));

      if ((e.deltaY > 0 && current < 1) || (e.deltaY < 0 && current > 0)) {
        e.preventDefault();
        rawProgress.set(next);
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [rawProgress]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    rawX.set(((e.clientX - rect.left) / rect.width - 0.5) * 2);
    rawY.set(((e.clientY - rect.top) / rect.height - 0.5) * 2);
  };

  const handlePointerLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  const toggleCurtain = () => {
    rawProgress.set(rawProgress.get() > 0.5 ? 0 : 1);
  };

  const textY = useTransform(progress, [0.25, 0.85], [30, 0]);
  const textOpacity = useTransform(progress, [0.3, 0.8], [0, 1]);
  const lineScale = useTransform(progress, [0.35, 0.85], [0, 1]);

  return (
    <section className={`relative flex w-full flex-col items-center justify-center ${className}`}>
      <div
        ref={stageRef}
        data-lenis-prevent
        onClick={toggleCurtain}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="relative flex h-[100svh] min-h-[600px] w-full items-center justify-center overflow-hidden bg-ink-deep text-cream transition-colors duration-300"
      >
        {/* the ruled grid the rest of the site uses */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(246,235,227,0.13)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_75%_75%_at_50%_50%,#000_45%,transparent_100%)] opacity-70" />

        {/* centre headline, revealed as the curtain parts */}
        <motion.div
          className="pointer-events-none z-[5] flex w-[74%] max-w-xs flex-col items-center rounded-2xl bg-ink-deep/70 px-4 py-5 text-center backdrop-blur-[3px] sm:w-auto sm:max-w-sm sm:bg-transparent sm:p-0 sm:backdrop-blur-none"
          style={{ y: textY, opacity: textOpacity }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-peach/80">{eyebrow}</span>
          <h1 className="mt-3 font-display text-4xl font-normal leading-[0.95] tracking-tight text-cream sm:text-5xl md:text-6xl">
            {title}
          </h1>
          <motion.div
            style={{ scaleX: lineScale }}
            className="my-4 h-px w-16 origin-center bg-peach/70 sm:my-5 sm:w-20"
          />
          <p className="max-w-[34ch] text-[11px] font-light leading-relaxed text-cream/70 sm:text-xs">{body}</p>
        </motion.div>

        {/* the bilateral curtain */}
        <div className="absolute inset-0 z-10 pointer-events-auto">
          {IMAGES.map((item, i) => (
            <CurtainCard
              key={i}
              item={item}
              index={i}
              total={IMAGES.length}
              progress={progress}
              pointer={{ x: pointerX, y: pointerY }}
              isSpreadActive={isSpreadActive}
              stage={stage}
            />
          ))}
        </div>

        {/* status pill */}
        <div className="pointer-events-none absolute bottom-24 z-30 flex items-center gap-2 rounded-full border border-cream/20 bg-cream/10 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-cream/80 backdrop-blur-md lg:bottom-8">
          <span
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
              isSpreadActive ? 'bg-emerald-400' : 'bg-peach'
            }`}
          />
          <span>{isSpreadActive ? 'Scroll up or click to close curtain' : 'Scroll down or click to unveil'}</span>
        </div>
      </div>
    </section>
  );
}
