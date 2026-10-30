import Image from 'next/image';
import Link from 'next/link';
import { brandStatement, stickers } from '@/lib/config';
import { RevealText, Reveal, ClipReveal } from '@/components/anim/reveal';

/** Collage of overlapping phone images + pull-quote, on cream for contrast. */
export function BrandStatement() {
  return (
    <section
      data-section-label="The house"
      className="relative overflow-hidden bg-cream py-24 text-ink md:py-32"
    >
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-rose/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-peach/25 blur-3xl" />

      <div className="relative mx-auto grid max-w-[1440px] items-center gap-14 px-5 md:grid-cols-2 md:gap-20 md:px-8">
        {/* collage */}
        <div className="relative order-2 h-[420px] md:order-1 md:h-[560px]">
          <ClipReveal className="absolute left-0 top-6 w-[52%] rotate-[-6deg] overflow-hidden rounded-2xl shadow-[0_30px_70px_-30px_rgba(15,48,64,0.6)]">
            <Image
              src="/images/photo-1592750475338-74b7b21085ab.jpg"
              alt="Certified pre-owned iPhone on display at F-Ex Store"
              width={700}
              height={900}
              className="h-full w-full object-cover"
              sizes="(max-width: 768px) 45vw, 25vw"
            />
          </ClipReveal>

          <ClipReveal delay={0.12} className="absolute right-0 top-0 w-[46%] rotate-[5deg] overflow-hidden rounded-2xl shadow-[0_30px_70px_-30px_rgba(15,48,64,0.6)]">
            <Image
              src="/images/photo-1511707171634-5f897ff02aa9.jpg"
              alt="New smartphone held in hand at the F-Ex Store counter"
              width={600}
              height={800}
              className="h-full w-full object-cover"
              sizes="(max-width: 768px) 45vw, 22vw"
            />
          </ClipReveal>

          <ClipReveal delay={0.2} className="absolute bottom-0 left-[22%] w-[56%] rotate-[2deg] overflow-hidden rounded-2xl shadow-[0_40px_90px_-30px_rgba(15,48,64,0.65)]">
            <Image
              src="/images/photo-1580910051074-3eb694886505.jpg"
              alt="Close-up of a phone camera module being inspected at F-Ex Store"
              width={800}
              height={700}
              className="h-full w-full object-cover"
              sizes="(max-width: 768px) 55vw, 30vw"
            />
          </ClipReveal>

          <Reveal delay={0.3} className="absolute -left-2 bottom-16 md:-left-6">
            <span className="inline-block -rotate-6 rounded-full bg-ink px-4 py-2 text-[9px] uppercase tracking-[0.2em] text-peach shadow-lg">
              {stickers.certified}
            </span>
          </Reveal>
          <Reveal delay={0.4} className="absolute right-2 top-1/2">
            <span className="inline-block rotate-3 rounded-full border border-ink/20 bg-cream px-4 py-2 text-[9px] uppercase tracking-[0.2em] text-ink/70 shadow-sm">
              Est. 2024 · Guwahati
            </span>
          </Reveal>
        </div>

        {/* copy */}
        <div className="order-1 md:order-2">
          <p className="text-[10px] uppercase tracking-[0.4em] text-rose">The house of F-Ex</p>
          <RevealText
            as="h2"
            mode="words"
            text={'Chosen the way\njewellery is chosen.'}
            className="mt-4 font-display text-[13vw] leading-[0.86] tracking-tight text-ink sm:text-6xl md:text-7xl"
          />
          <Reveal delay={0.15}>
            <blockquote className="mt-8 border-l-2 border-peach pl-5 font-script text-xl italic leading-relaxed text-plum md:text-2xl">
              “{brandStatement.pullQuote}”
            </blockquote>
          </Reveal>
          <Reveal delay={0.25}>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-plum/85 md:text-base">{brandStatement.body}</p>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="mt-6 font-script text-lg italic text-rose">— {brandStatement.signature}</p>
            <Link href="/about" className="tap-sm mt-6 w-fit items-center gap-2 border-b border-ink/25 pb-1 text-xs uppercase tracking-[0.2em] text-ink transition-colors hover:border-peach hover:text-rose">
              Our story
              <span aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
