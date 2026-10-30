import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { getProducts } from '@/lib/queries';
import { toProductFilters, type RawSearch } from '@/lib/filters';
import { PageHero } from '@/components/site/page-hero';
import { CatalogueView } from '@/components/catalogue/catalogue-view';
import { stickers } from '@/lib/config';

export const metadata: Metadata = buildMetadata({
  title: 'Second-Hand Phones — Certified Pre-Owned',
  description:
    'Certified pre-owned iPhones and Android flagships in Guwahati. 32-point inspection, battery health on the tag and 6-month warranty on selected phones.',
  path: '/second-hand',
});

export const revalidate = 300;

export default async function SecondHandPage({ searchParams }: { searchParams: RawSearch }) {
  const products = await getProducts(toProductFilters(searchParams, 'second-hand'));

  return (
    <>
      <PageHero
        eyebrow="32-point inspection · Battery health documented"
        title={'The pre-owned\nvault.'}
        intro="Flagships from the last three years, inspected on 32 points and graded honestly. Every tag shows the battery health, the grade and what warranty it carries."
        breadcrumb={[{ href: '/second-hand', label: 'Pre-Owned' }]}
        image="/images/photo-1592750475338-74b7b21085ab.jpg"
      >
        <div className="mt-8 flex flex-wrap gap-2">
          {[stickers.certified, 'Battery health on tag', '6-month warranty*', 'Exchange accepted'].map((s) => (
            <span key={s} className="rounded-full border border-peach/30 px-3 py-1 text-[9px] uppercase tracking-[0.16em] text-peach/80">
              {s}
            </span>
          ))}
        </div>
      </PageHero>

      <section className="bg-ink pb-24">
        <div className="mx-auto max-w-[1440px] px-5 pt-8 md:px-8">
          <CatalogueView products={products} lockedCategory="second-hand" />
        </div>
      </section>
    </>
  );
}
