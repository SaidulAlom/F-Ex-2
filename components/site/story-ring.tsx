'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import CircularCarousel from './circular-carousel';
import '@/app/story.css';

/**
 * StoryRing — home §2.
 *
 * The six-chapter F-Ex story on the React Bits CircularCarousel, on the deep
 * teal panel directly under the curtain hero. Distant cards fade into the panel
 * colour, so the ring dissolves into the page instead of into black.
 */

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
    subtitle: 'No-cost EMI from \u20b91,899 a month',
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

export function StoryRing() {
  const [chapters, setChapters] = useState(0);
  const router = useRouter();

  return (
    <section className="sr" id="story" aria-label="The F-Ex story">
      <div className="sr-rule" aria-hidden="true" />

      <div className="sr-top">
        <p className="sr-eyebrow">F-Ex story</p>
        <p className="sr-count">
          {String(chapters + 1).padStart(2, '0')} / {String(STORIES.length).padStart(2, '0')}
        </p>
      </div>

      <div className="sr-stage">
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
          depthFade={0.5}
          fadeColor="#0f3040"
          innerShade={0.72}
          cornerRadius={10}
          captions
          onChange={setChapters}
          onItemClick={(_item, index) => router.push(STORIES[index].href)}
          ariaLabel="The F-Ex story, chapter by chapter"
          className="sr-ring"
        />
      </div>

      <div className="sr-copy">
        <p className="sr-dots" aria-hidden="true">
          &middot;&middot;
        </p>
        <h2>
          Your Next
          <span>Phone, Sorted.</span>
        </h2>
        <p className="sr-lede">
          Six chapters from one counter: what we sell, how we grade it, and what happens when you bring
          it back cracked.
        </p>
        <Link href="/about" className="sr-cta">
          <span aria-hidden="true">&bull;&bull;</span> READ THE STORY
        </Link>
      </div>
    </section>
  );
}
