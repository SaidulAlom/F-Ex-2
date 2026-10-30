import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { getProducts } from '@/lib/queries';
import { toProductFilters, type RawSearch } from '@/lib/filters';
import { PageHero } from '@/components/site/page-hero';
import { CatalogueView } from '@/components/catalogue/catalogue-view';
import { branches } from '@/lib/config';

export const metadata: Metadata = buildMetadata({
  title: 'New Phones — Apple, Vivo, Samsung & More',
  description:
    'Buy sealed new smartphones with India warranty at F-Ex Store, Guwahati. Apple, Vivo, Samsung, Redmi, Realme and OnePlus with EMI and same-day delivery.',
  path: '/new-phones',
});

export const revalidate = 300;

export default async function NewPhonesPage({ searchParams }: { searchParams: RawSearch }) {
  const products = await getProducts(toProductFilters(searchParams, 'new-phones'));

  return (
    <>
      <PageHero
        eyebrow="Sealed · India warranty · Set up in-store"
        title={'The new\nphone wall.'}
        intro="Every handset here is sealed, carries an India warranty and is unboxed in front of you. If a model is not on the shelf, we usually source it within 48 hours."
        breadcrumb={[{ href: '/new-phones', label: 'New Phones' }]}
        image="/images/photo-1695048133142-1a20484d2569.jpg"
      >
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[10px] uppercase tracking-[0.18em] text-cream/45">
          <span>{products.length} models in stock</span>
          <span>EMI from ₹950/month</span>
          <span>{branches.length} branches in Guwahati</span>
        </div>
      </PageHero>

      <section className="bg-ink pb-24">
        <div className="mx-auto max-w-[1440px] px-5 pt-8 md:px-8">
          <CatalogueView products={products} lockedCategory="new-phones" />
        </div>
      </section>
    </>
  );
}
