import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Phone, Navigation } from 'lucide-react';
import { branches, site } from '@/lib/config';
import { OpenStatus } from '@/components/layout/open-status';
import { Reveal, RevealText } from '@/components/anim/reveal';
import { telLink } from '@/lib/utils';

/** Two oversized branch cards with map preview, hours and call CTA. */
export function BranchShowcase() {
  return (
    <section data-section-label="The branches" className="relative bg-cream py-24 text-ink md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-rose">Two doors, one standard</p>
            <RevealText
              as="h2"
              mode="words"
              text={'Find us in\nGuwahati.'}
              className="mt-4 font-display text-[13vw] leading-[0.86] text-ink sm:text-6xl md:text-7xl"
            />
          </div>
          <Link href="/branches" className="tap-sm w-fit border-b border-ink/25 pb-1 text-[10px] uppercase tracking-[0.2em] hover:border-peach hover:text-rose">
            All branch details →
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {branches.map((b, i) => (
            <Reveal key={b.slug} delay={i * 0.1}>
              <article className="group relative overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_-50px_rgba(15,48,64,0.7)]">
                <div className="relative h-52 overflow-hidden md:h-60">
                  <Image
                    src={b.image}
                    alt={`${b.name} storefront`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-1000 ease-luxe group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                  <div className="absolute inset-x-4 bottom-4 flex items-end justify-between">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.3em] text-peach/90">
                        {i === 0 ? 'Flagship' : 'Neighbourhood store'}
                      </p>
                      <h3 className="font-display text-3xl text-cream">{b.displayName}</h3>
                    </div>
                    <span className="rounded-full bg-ink-deep/70 px-3 py-1 backdrop-blur">
                      <OpenStatus branch={b} />
                    </span>
                  </div>
                </div>

                <div className="space-y-4 p-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose" />
                    <p className="text-sm leading-relaxed text-plum">
                      {b.address.line1}, {b.address.line2}, {b.address.locality}, {b.address.city}–{b.address.pincode}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.18em] text-plum/70 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                    <span className="whitespace-nowrap">
                      {b.hours.days} · {b.hours.label}
                    </span>
                    <a
                      href={telLink(b.phone)}
                      className="tap-sm w-fit items-center gap-1.5 whitespace-nowrap text-ink hover:text-rose"
                    >
                      <Phone className="h-3.5 w-3.5 shrink-0" /> {b.phoneDisplay}
                    </a>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <a
                      href={telLink(b.phone)}
                      className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[10px] uppercase tracking-[0.18em] text-cream transition-colors hover:bg-ink/90"
                    >
                      <Phone className="h-3.5 w-3.5" /> Call
                    </a>
                    <a
                      href={b.directionsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-5 py-2.5 text-[10px] uppercase tracking-[0.18em] text-ink transition-colors hover:border-peach hover:text-rose"
                    >
                      <Navigation className="h-3.5 w-3.5" /> Directions
                    </a>
                    <Link
                      href={`/branches/${b.slug}`}
                      className="inline-flex min-h-[44px] items-center gap-2 px-2 py-2.5 text-[10px] uppercase tracking-[0.18em] text-plum/70 hover:text-rose"
                    >
                      Branch page →
                    </Link>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <p className="mt-8 text-center text-[10px] uppercase tracking-[0.22em] text-plum/60">
          Same-day delivery across Guwahati · Free delivery on orders above ₹5,000 · WhatsApp {site.phone}
        </p>
      </div>
    </section>
  );
}
