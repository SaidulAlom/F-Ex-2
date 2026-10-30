import Link from 'next/link';
import { RevealText, Reveal } from '@/components/anim/reveal';

/** Shared interior-page hero: eyebrow, oversized serif headline, intro copy. */
export function PageHero({
  eyebrow,
  title,
  intro,
  breadcrumb,
  children,
  image,
  align = 'left',
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  breadcrumb?: { href: string; label: string }[];
  children?: React.ReactNode;
  image?: string;
  align?: 'left' | 'center';
}) {
  return (
    <section className="relative overflow-hidden border-b border-peach/15 bg-ink pb-16 pt-32 md:pb-24 md:pt-40">
      {image && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/90 to-ink" />
        </>
      )}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_45%_at_50%_0%,rgba(217,155,127,0.22),transparent_70%)]" />

      <div className={`relative mx-auto max-w-[1440px] px-5 md:px-8 ${align === 'center' ? 'text-center' : ''}`}>
        {breadcrumb && (
          <nav aria-label="Breadcrumb" className={`mb-6 flex gap-2 text-[10px] uppercase tracking-[0.2em] text-cream/40 ${align === 'center' ? 'justify-center' : ''}`}>
            <Link href="/" className="tap-sm hover:text-peach">Home</Link>
            {breadcrumb.map((b) => (
              <span key={b.href} className="flex gap-2">
                <span aria-hidden="true">/</span>
                <Link href={b.href} className="tap-sm hover:text-peach">{b.label}</Link>
              </span>
            ))}
          </nav>
        )}
        <p className={`text-[10px] uppercase tracking-[0.44em] text-peach/80 ${align === 'center' ? '' : ''}`}>{eyebrow}</p>
        <RevealText
          as="h1"
          mode="lines"
          text={title}
          className="mt-4 font-display text-[13vw] leading-[0.86] text-cream sm:text-7xl md:text-[6vw]"
        />
        {intro && (
          <Reveal delay={0.15}>
            <p className={`mt-6 max-w-2xl text-sm leading-relaxed text-cream/60 md:text-base ${align === 'center' ? 'mx-auto' : ''}`}>
              {intro}
            </p>
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}
