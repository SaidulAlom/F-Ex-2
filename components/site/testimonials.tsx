'use client';

import { Star } from 'lucide-react';
import { site } from '@/lib/config';
import type { TestimonialData } from '@/lib/queries';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { RevealText } from '@/components/anim/reveal';

/** Infinite testimonial slider (pure CSS transform loop, pauses on hover). */
export function Testimonials({ items }: { items: TestimonialData[] }) {
  const reduced = useReducedMotion();
  if (!items.length) return null;
  const loop = [...items, ...items];

  return (
    <section data-section-label="In their words" className="relative overflow-hidden bg-ink py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-peach/70">Google reviews · 4.9 average</p>
            <RevealText
              as="h2"
              mode="words"
              text={'People keep\ncoming back.'}
              className="mt-4 font-display text-[12vw] leading-[0.88] text-cream sm:text-5xl md:text-6xl"
            />
          </div>
          <a
            href={site.googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border-b border-peach/40 pb-1 tap-sm w-fit text-[10px] uppercase tracking-[0.2em] text-peach hover:border-peach"
          >
            Read all reviews →
          </a>
        </div>
      </div>

      <div className="group mt-12 overflow-hidden mask-fade-x" aria-live="off">
        <div
          className="flex w-max gap-4 md:gap-6"
          style={{ animation: reduced ? 'none' : 'marquee 64s linear infinite' }}
        >
          {loop.map((t, i) => (
            <figure
              key={`${t._id}-${i}`}
              className="glass flex w-[78vw] shrink-0 flex-col gap-4 rounded-2xl p-6 sm:w-[52vw] md:w-[30vw] lg:w-[24vw]"
            >
              <div className="flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className={`h-3.5 w-3.5 ${s < t.rating ? 'fill-peach text-peach' : 'text-cream/20'}`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <blockquote className="text-sm leading-relaxed text-cream/80">“{t.quote}”</blockquote>
              <figcaption className="mt-auto border-t border-peach/15 pt-3">
                <p className="text-xs text-cream">{t.name}</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-cream/40">
                  {t.location} · {t.purchase || 'F-Ex Store'}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
