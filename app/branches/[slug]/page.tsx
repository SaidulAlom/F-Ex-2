import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Mail, MessageCircle, Navigation, Phone, Star } from 'lucide-react';
import { branches, getBranch, site } from '@/lib/config';
import { buildMetadata, breadcrumbJsonLd } from '@/lib/seo';
import { BranchMap } from '@/components/site/branch-map';
import { OpenStatus } from '@/components/layout/open-status';
import { RevealText, Reveal } from '@/components/anim/reveal';
import { ProductCard } from '@/components/site/product-card';
import { getProducts } from '@/lib/queries';
import { fullAddress, telLink, whatsappLink } from '@/lib/utils';

export function generateStaticParams() {
  return branches.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const branch = getBranch(params.slug);
  if (!branch) return buildMetadata({ title: 'Branch not found', path: `/branches/${params.slug}`, noIndex: true });
  return buildMetadata({
    title: `${branch.name} — Phone Shop in ${branch.displayName}, Guwahati`,
    description: `${branch.name}: ${fullAddress(branch.address)}. Open ${branch.hours.days} ${branch.hours.label}. New phones, pre-owned, accessories and repairs. Call ${branch.phoneDisplay}.`,
    path: `/branches/${branch.slug}`,
    image: branch.image,
  });
}

export default async function BranchPage({ params }: { params: { slug: string } }) {
  const branch = getBranch(params.slug);
  if (!branch) notFound();

  const stock = (await getProducts({ branch: branch.slug, limit: 4 })).slice(0, 4);
  const other = branches.find((b) => b.slug !== branch.slug)!;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MobilePhoneStore',
            name: branch.name,
            image: branch.image,
            telephone: branch.phone,
            address: {
              '@type': 'PostalAddress',
              streetAddress: `${branch.address.line1}, ${branch.address.line2}`,
              addressLocality: branch.address.locality,
              addressRegion: branch.address.state,
              postalCode: branch.address.pincode,
              addressCountry: 'IN',
            },
            geo: { '@type': 'GeoCoordinates', latitude: branch.geo.lat, longitude: branch.geo.lng },
            openingHoursSpecification: {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
              opens: branch.hours.opens,
              closes: branch.hours.closes,
            },
            url: `${site.url}/branches/${branch.slug}`,
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', href: '/' },
              { name: 'Branches', href: '/branches' },
              { name: branch.displayName, href: `/branches/${branch.slug}` },
            ])
          ),
        }}
      />

      <section className="relative min-h-[70svh] overflow-hidden pt-32 md:pt-40">
        <Image src={branch.image} alt={`${branch.name} storefront`} fill priority sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/85 via-ink/90 to-ink" />
        <div className="mx-auto max-w-[1440px] px-5 pb-16 md:px-8">
          <nav aria-label="Breadcrumb" className="mb-6 flex gap-2 text-[10px] uppercase tracking-[0.2em] text-cream/40">
            <Link href="/" className="hover:text-peach">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/branches" className="hover:text-peach">Branches</Link>
            <span aria-hidden="true">/</span>
            <span className="text-cream/60">{branch.displayName}</span>
          </nav>

          <OpenStatus branch={branch} showHours />
          <RevealText
            as="h1"
            mode="lines"
            text={branch.name}
            className="mt-4 max-w-4xl font-display text-[11vw] leading-[0.9] text-cream md:text-[6vw]"
          />
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-cream/60 md:text-base">{branch.blurb}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href={telLink(branch.phone)} className="btn-peach" data-cursor="Call">
              <Phone className="h-4 w-4" /> {branch.phoneDisplay}
            </a>
            <a
              href={whatsappLink({ model: 'a phone', phone: branch.whatsapp })}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
              data-cursor="WhatsApp"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <a href={branch.directionsLink} target="_blank" rel="noopener noreferrer" className="btn-outline">
              <Navigation className="h-4 w-4" /> Get directions
            </a>
          </div>
        </div>
      </section>

      <section className="bg-ink pb-24">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 md:px-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <Reveal>
              <div className="rounded-2xl border border-peach/20 p-6">
                <h2 className="font-display text-2xl text-cream">Visit</h2>
                <div className="mt-4 space-y-3 text-sm text-cream/65">
                  <p className="flex items-start gap-3">
                    <Navigation className="mt-0.5 h-4 w-4 shrink-0 text-peach" />
                    <span>
                      {branch.address.line1},
                      <br />
                      {branch.address.line2},
                      <br />
                      {branch.address.locality}, {branch.address.city}–{branch.address.pincode}, {branch.address.state}
                    </span>
                  </p>
                  <p className="flex items-center gap-3">
                    <Clock className="h-4 w-4 shrink-0 text-peach" />
                    {branch.hours.days} · {branch.hours.label}
                  </p>
                  <p className="flex items-center gap-3">
                    <Phone className="h-4 w-4 shrink-0 text-peach" />
                    <a href={telLink(branch.phone)} className="hover:text-peach">{branch.phoneDisplay}</a>
                  </p>
                  <p className="flex items-center gap-3">
                    <Mail className="h-4 w-4 shrink-0 text-peach" />
                    <a href={`mailto:${site.email}`} className="hover:text-peach">{site.email}</a>
                  </p>
                  <p className="flex items-center gap-3">
                    <Star className="h-4 w-4 shrink-0 text-peach" />
                    <a href={site.googleReviewsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-peach">
                      Rate us on Google
                    </a>
                  </p>
                </div>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {branch.services.map((s) => (
                    <span key={s} className="rounded-full border border-cream/15 px-3 py-1 text-[9px] uppercase tracking-[0.14em] text-cream/50">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>

            <BranchMap branch={branch} />
          </div>

          <div>
            <div className="flex items-end justify-between">
              <h2 className="font-display text-3xl text-cream">In stock here</h2>
              <Link href={`/new-phones?branch=${branch.slug}`} className="text-[10px] uppercase tracking-[0.2em] text-cream/50 hover:text-peach">
                All stock →
              </Link>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 md:gap-4">
              {stock.map((p, i) => (
                <ProductCard key={p.slug} product={p} index={i} />
              ))}
            </div>
            {stock.length === 0 && (
              <p className="mt-4 rounded-xl border border-peach/20 p-6 text-sm text-cream/50">
                Stock is being updated. Call {branch.phoneDisplay} and we will confirm what is on the shelf today.
              </p>
            )}

            <div className="mt-10 rounded-2xl border border-peach/20 p-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-peach/70">Also visit</p>
              <p className="mt-2 font-display text-2xl text-cream">{other.name}</p>
              <p className="mt-1 text-sm text-cream/50">
                {other.address.line1}, {other.address.line2}, {other.address.city}–{other.address.pincode}
              </p>
              <Link href={`/branches/${other.slug}`} className="tap-sm mt-4 inline-flex w-fit items-center text-[10px] uppercase tracking-[0.2em] text-peach hover:underline">
                {other.displayName} branch →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
