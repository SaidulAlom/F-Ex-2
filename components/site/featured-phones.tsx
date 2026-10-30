'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { gsap, ScrollTrigger, useIsomorphicLayoutEffect } from '@/hooks/use-gsap';
import { ProductCard } from './product-card';
import type { ProductCardData } from '@/types';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useIsMobile } from '@/hooks/use-media-query';

/**
 * Horizontal scroll gallery — vertical scroll drives a sideways track.
 * Disabled (< 820px) and for reduced motion: native swipe carousel instead.
 * GSAP pin is cleaned up on resize via matchMedia.
 */
export function FeaturedPhones({
  products,
  eyebrow = 'Featured on the counter',
  title = 'This week at F-Ex',
  href = '/new-phones',
}: {
  products: ProductCardData[];
  eyebrow?: string;
  title?: string;
  href?: string;
}) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const mobile = useIsMobile();

  // layout effect: the pin's pin-spacer must be unwrapped BEFORE React removes
  // this section, otherwise a client-side navigation throws removeChild.
  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || reduced || mobile) return;

    const mm = gsap.matchMedia();
    mm.add('(min-width: 820px)', () => {
      const distance = () => track.scrollWidth - window.innerWidth + 96;
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance()}`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(track, { x: 0 });
      };
    });

    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    ro.observe(track);

    return () => {
      ro.disconnect();
      mm.revert();
      ScrollTrigger.refresh();
    };
  }, [reduced, mobile, products.length]);

  return (
    <section
      ref={sectionRef}
      data-section-label="The collection"
      className="relative overflow-hidden bg-ink py-20 md:py-24"
      aria-label="Featured phones"
    >
      <div className="mx-auto mb-10 flex max-w-[1440px] items-end justify-between gap-6 px-5 md:px-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-peach/70">{eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl leading-[0.92] text-cream sm:text-5xl md:text-6xl">{title}</h2>
        </div>
        <Link
          href={href}
          className="hidden shrink-0 items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-cream/60 hover:text-peach md:flex"
        >
          View all <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div
        className="mask-fade-x no-scrollbar overflow-x-auto px-5 pb-4 md:overflow-visible md:px-8"
        data-cursor={mobile ? undefined : 'Drag'}
      >
        <div
          ref={trackRef}
          className="flex w-max gap-4 md:gap-6"
          style={{ willChange: 'transform' }}
        >
          {products.map((p, i) => (
            <div key={p.slug} className="w-[72vw] shrink-0 sm:w-[46vw] md:w-[26vw] lg:w-[21vw]">
              <ProductCard product={p} index={i} priority={i < 2} />
            </div>
          ))}
          <div className="flex w-[60vw] shrink-0 items-center md:w-[26vw]">
            <Link href={href} className="group flex flex-col gap-3 px-4">
              <span className="font-display text-4xl text-cream/80 group-hover:text-peach md:text-5xl">
                See all phones →
              </span>
              <span className="text-[10px] uppercase tracking-[0.24em] text-cream/40">
                New & certified pre-owned
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
