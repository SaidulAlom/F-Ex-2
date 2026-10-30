import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Battery, CheckCircle2, MessageCircle, Phone, ShieldCheck, Store } from 'lucide-react';
import { getProductBySlug, getProducts } from '@/lib/queries';
import { branches, site, stickers } from '@/lib/config';
import { buildMetadata, productJsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { formatINR, telLink, whatsappLink, cnDate, cn } from '@/lib/utils';
import { ProductGallery } from '@/components/product/product-gallery';
import { ReserveForm } from '@/components/product/reserve-form';
import { ProductCard } from '@/components/site/product-card';
import { Badge } from '@/components/ui/badge';
import { OpenStatus } from '@/components/layout/open-status';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return buildMetadata({ title: 'Phone not found', path: `/product/${params.slug}`, noIndex: true });
  return buildMetadata({
    title: product.seoTitle || `${product.name} — ${product.condition}`,
    description:
      product.seoDescription ||
      product.description?.slice(0, 160) ||
      `${product.name} available at F-Ex Store Guwahati. ${formatINR(product.price)}. Call for availability.`,
    path: `/product/${product.slug}`,
    image: product.images[0],
  });
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const related = (await getProducts({ category: product.category, limit: 5 })).filter((p) => p.slug !== product.slug).slice(0, 4);
  const availableBranches = branches.filter((b) => product.branches.includes(b.slug));
  const waLink = whatsappLink({
    model: product.name,
    price: formatINR(product.price),
    url: `${site.url}/product/${product.slug}`,
    phone: availableBranches[0]?.whatsapp ?? site.whatsapp,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            productJsonLd({
              name: product.name,
              description: product.description ?? '',
              images: product.images,
              brand: product.brand,
              sku: product.slug,
              price: product.price,
              condition: product.condition,
              slug: product.slug,
              availability: product.status,
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', href: '/' },
              { name: product.category === 'second-hand' ? 'Pre-Owned' : 'Catalogue', href: `/${product.category}` },
              { name: product.name, href: `/product/${product.slug}` },
            ])
          ),
        }}
      />

      <section className="bg-ink pb-20 pt-28 md:pt-36">
        <div className="mx-auto max-w-[1440px] px-5 md:px-8">
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.2em] text-cream/40">
            <Link href="/" className="tap-sm hover:text-peach">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/${product.category}`} className="tap-sm hover:text-peach">
              {product.category === 'second-hand' ? 'Pre-Owned' : product.category === 'new-phones' ? 'New Phones' : 'Accessories'}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-cream/60">{product.name}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <ProductGallery images={product.images} alt={product.name} />

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{product.brand}</Badge>
                <Badge variant={product.condition === 'New' ? 'default' : 'rose'}>
                  {product.condition === 'New' ? 'Brand new' : stickers.certified}
                </Badge>
                {product.status !== 'available' && (
                  <Badge variant="muted">{product.status === 'sold' ? 'Sold' : 'Reserved'}</Badge>
                )}
              </div>

              <h1 className="mt-4 font-display text-4xl leading-[0.95] text-cream md:text-5xl">{product.name}</h1>

              <div className="mt-4 flex flex-wrap items-end gap-3">
                <p className="font-display text-3xl text-peach">{formatINR(product.price)}</p>
                {product.mrp && product.mrp > (product.price ?? 0) && (
                  <p className="text-sm text-cream/35 line-through">{formatINR(product.mrp)}</p>
                )}
                {product.emiFrom ? (
                  <p className="text-[11px] uppercase tracking-[0.16em] text-cream/45">
                    EMI from {formatINR(product.emiFrom)}/mo
                  </p>
                ) : null}
              </div>
              {!product.price && (
                <p className="mt-1 text-xs text-cream/40">Price changes with condition — call us for today&apos;s quote.</p>
              )}

              {/* spec grid */}
              <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-peach/15 py-6 text-sm">
                {[
                  ['RAM', product.ram],
                  ['Storage', product.storage],
                  ['Colour', product.colors?.join(', ')],
                  ['Condition', product.condition],
                  ['Battery health', product.batteryHealth ? `${product.batteryHealth}%` : '—'],
                  ['Warranty', product.warrantyMonths ? `${product.warrantyMonths} months` : 'As per brand'],
                ]
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k as string}>
                      <dt className="text-[9px] uppercase tracking-[0.22em] text-cream/35">{k}</dt>
                      <dd className="mt-0.5 text-cream/85">{v}</dd>
                    </div>
                  ))}
              </dl>

              {/* branch availability */}
              <div className="mt-6 space-y-3">
                <p className="text-[9px] uppercase tracking-[0.28em] text-cream/35">Available at</p>
                {availableBranches.map((b) => (
                  <div key={b.slug} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-peach/20 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Store className="h-3.5 w-3.5 text-peach" />
                      <Link href={`/branches/${b.slug}`} className="tap-sm w-fit items-center text-sm text-cream hover:text-peach">
                        {b.name}
                      </Link>
                    </div>
                    <OpenStatus branch={b} showHours />
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="WhatsApp"
                  className="btn-peach"
                >
                  <MessageCircle className="h-4 w-4" /> Enquire on WhatsApp
                </a>
                <a href={telLink(availableBranches[0]?.phone ?? site.phone)} className="btn-outline" data-cursor="Call">
                  <Phone className="h-4 w-4" /> Call {availableBranches[0]?.displayName ?? 'us'}
                </a>
              </div>

              <ul className="mt-6 grid gap-2 text-[11px] text-cream/45 sm:grid-cols-2">
                {[
                  { icon: ShieldCheck, text: product.condition === 'New' ? 'Sealed with India warranty' : '32-point checked in-store' },
                  { icon: Battery, text: 'Free same-day delivery in Guwahati' },
                  { icon: CheckCircle2, text: 'EMI on cards, approved in minutes' },
                  { icon: Store, text: 'Exchange your old phone' },
                ].map((f) => (
                  <li key={f.text} className="flex items-center gap-2">
                    <f.icon className="h-3.5 w-3.5 text-peach/70" />
                    {f.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* description + reserve */}
          <div className="mt-16 grid gap-10 border-t border-peach/15 pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <h2 className="font-display text-3xl text-cream">The details</h2>
              <p className="mt-4 max-w-xl whitespace-pre-line text-sm leading-relaxed text-cream/60">
                {product.description}
              </p>
              {product.highlights?.length ? (
                <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                  {product.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-sm text-cream/70">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-peach/80" />
                      {h}
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="mt-8 text-[10px] uppercase tracking-[0.18em] text-cream/30">
                Listed {cnDate(new Date())} · Prices include GST · Photos are of the actual unit where shown
              </p>
            </div>

            <div className="rounded-2xl border border-peach/25 bg-plum/20 p-6 md:p-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-peach/70">Reserve this phone</p>
              <h2 className="mt-2 font-display text-2xl text-cream">Keep it aside for 24 hours</h2>
              <p className="mt-2 text-xs text-cream/45">
                Fill this in and our team confirms stock at your chosen branch before holding the unit.
              </p>
              <div className="mt-6">
                <ReserveForm product={product} />
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <div className="mt-20">
              <div className="flex items-end justify-between">
                <h2 className="font-display text-3xl text-cream md:text-4xl">You may also like</h2>
                <Link href={`/${product.category}`} className="tap-sm w-fit items-center text-[10px] uppercase tracking-[0.2em] text-cream/50 hover:text-peach">
                  View all →
                </Link>
              </div>
              <div className={cn('mt-6 grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4')}>
                {related.map((p, i) => (
                  <ProductCard key={p.slug} product={p} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
