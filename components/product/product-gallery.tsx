'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { ZoomIn } from 'lucide-react';
import { imageAt } from '@/lib/image';

/**
 * Swipeable product gallery with a click-to-zoom lightbox.
 * Thumbnails on the left (desktop) / below (mobile); keyboard arrow support.
 */
export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const startX = useRef<number | null>(null);
  const reduced = useReducedMotion();
  const list = images.length ? images : [''];

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + list.length) % list.length);

  return (
    <div className="grid gap-3 md:grid-cols-[80px_1fr]">
      <div className="order-2 flex gap-2 overflow-x-auto md:order-1 md:flex-col md:overflow-visible">
        {list.map((img, i) => (
          <button
            key={img + i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`View image ${i + 1}`}
            aria-current={i === index}
            className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border transition-colors md:h-20 md:w-20 ${
              i === index ? 'border-peach' : 'border-cream/15 hover:border-peach/50'
            }`}
          >
            <Image src={imageAt(img, 200)} alt="" fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>

      <div
        className="group relative order-1 aspect-[4/5] overflow-hidden rounded-2xl border border-peach/25 bg-plum/30 md:order-2"
        onPointerDown={(e) => {
          startX.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (startX.current === null) return;
          const dx = e.clientX - startX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          startX.current = null;
        }}
        data-cursor="Drag"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={reduced ? undefined : { opacity: 0, scale: 1.04 }}
            animate={reduced ? undefined : { opacity: 1, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={imageAt(list[index], 1200)}
              alt={`${alt} — image ${index + 1}`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setZoom(true)}
          aria-label="Zoom image"
          className="absolute right-3 top-3 rounded-full bg-ink-deep/70 p-2.5 text-cream backdrop-blur transition-colors hover:text-peach"
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {list.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all ${i === index ? 'w-6 bg-peach' : 'w-2 bg-cream/30'}`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {zoom && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-ink-deep/95 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoom(false)}
            role="dialog"
            aria-label="Zoomed product image"
          >
            <motion.img
              src={imageAt(list[index], 1800)}
              alt={alt}
              className="max-h-[88vh] max-w-full rounded-lg object-contain"
              initial={{ scale: 0.94 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
            <button
              type="button"
              onClick={() => setZoom(false)}
              className="absolute right-5 top-5 rounded-full border border-peach/40 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-peach"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
