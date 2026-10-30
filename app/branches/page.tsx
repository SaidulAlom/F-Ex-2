import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, MapPin, Navigation, Phone } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import { branches } from '@/lib/config';
import { PageHero } from '@/components/site/page-hero';
import { OpenStatus } from '@/components/layout/open-status';
import { BranchMap } from '@/components/site/branch-map';
import { Reveal } from '@/components/anim/reveal';
import { telLink } from '@/lib/utils';
import { BranchShowcase } from '@/components/site/branch-showcase';

export const metadata: Metadata = buildMetadata({
  title: 'Branches — Lokhra & Basistha, Guwahati',
  description:
    'Visit F-Ex Store at Lokhra (beside Sarusajai Stadium) or F Ex Guwahati Cell Store at Basistha. Open daily until 10 PM with parking, repairs and EMI.',
  path: '/branches',
});

export default function BranchesPage() {
  return (
    <>
      <PageHero
        eyebrow="Open every day till 10 PM"
        title={'Two doors in\nGuwahati.'}
        intro="Lokhra is our flagship — the full wall of new phones, the pre-owned vault and the repair bench. Basistha is the neighbourhood store near Lakhi Mandir, with a curated shelf and quick repairs."
        breadcrumb={[{ href: '/branches', label: 'Branches' }]}
        image="/images/store-interior.jpg"
      />

      <section className="bg-ink py-20">
        <div className="mx-auto max-w-[1440px] space-y-16 px-5 md:px-8">
          {branches.map((b, i) => (
            <Reveal key={b.slug} delay={i * 0.08}>
              <article className="grid gap-6 overflow-hidden rounded-3xl border border-peach/20 bg-plum/15 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="relative h-64 lg:h-full">
                  <Image src={b.image} alt={`${b.name} storefront`} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/80 via-transparent to-transparent" />
                  <div className="absolute inset-x-5 bottom-5">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-peach/90">{i === 0 ? 'Flagship' : 'Est. 2024'}</p>
                    <h2 className="font-display text-3xl text-cream md:text-4xl">{b.name}</h2>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <OpenStatus branch={b} showHours />
                  <p className="mt-4 text-sm leading-relaxed text-cream/60">{b.blurb}</p>

                  <div className="mt-5 flex items-start gap-3 text-sm text-cream/70">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-peach" />
                    <span>
                      {b.address.line1}, {b.address.line2}, {b.address.locality}, {b.address.city}–{b.address.pincode}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-sm text-cream/70">
                    <Clock className="h-4 w-4 shrink-0 text-peach" />
                    {b.hours.days} · {b.hours.label}
                  </div>
                  <a href={telLink(b.phone)} className="tap-sm mt-3 w-fit items-center gap-3 text-sm text-cream/70 hover:text-peach">
                    <Phone className="h-4 w-4 shrink-0 text-peach" /> {b.phoneDisplay}
                  </a>

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {b.services.map((s) => (
                      <span key={s} className="rounded-full border border-cream/15 px-3 py-1 text-[9px] uppercase tracking-[0.14em] text-cream/50">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href={`/branches/${b.slug}`} className="btn-peach">
                      Branch details
                    </Link>
                    <a href={b.directionsLink} target="_blank" rel="noopener noreferrer" className="btn-outline">
                      <Navigation className="h-4 w-4" /> Directions
                    </a>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}

          <div className="grid gap-4 md:grid-cols-2">
            {branches.map((b) => (
              <BranchMap key={b.slug} branch={b} />
            ))}
          </div>
        </div>
      </section>

      <BranchShowcase />
    </>
  );
}
