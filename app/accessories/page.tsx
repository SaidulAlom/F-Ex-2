import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { getProducts } from '@/lib/queries';
import { toProductFilters, type RawSearch } from '@/lib/filters';
import { PageHero } from '@/components/site/page-hero';
import { CatalogueView } from '@/components/catalogue/catalogue-view';

export const metadata: Metadata = buildMetadata({
  title: 'Accessories & Gadgets — Chargers, Cases, Watches',
  description:
    'Chargers, cases, earphones, power banks, smart watches and landline phones at F-Ex Store Guwahati. Tested in-store before you buy.',
  path: '/accessories',
});

export const revalidate = 300;

const accessoryTypes = [
  { value: 'charger', label: 'Chargers' },
  { value: 'case', label: 'Cases' },
  { value: 'earphones', label: 'Earphones' },
  { value: 'powerbank', label: 'Power banks' },
  { value: 'smartwatch', label: 'Smart watches' },
  { value: 'landline', label: 'Landline phones' },
  { value: 'other', label: 'Other' },
];

export default async function AccessoriesPage({ searchParams }: { searchParams: RawSearch }) {
  const products = await getProducts(toProductFilters(searchParams, 'accessories'));

  return (
    <>
      <PageHero
        eyebrow="Tested on the counter, not just unpacked"
        title={'Accessories &\ngadgets.'}
        intro="Chargers that actually deliver their rated wattage, cases that survive a scooter ride, earphones we have listened to ourselves. Plus landline phones for homes and offices."
        breadcrumb={[{ href: '/accessories', label: 'Accessories' }]}
        image="/images/photo-1590658268037-6bf12165a8df.jpg"
      />

      <section className="bg-ink pb-24">
        <div className="mx-auto max-w-[1440px] px-5 pt-8 md:px-8">
          <CatalogueView products={products} lockedCategory="accessories" accessoryTypes={accessoryTypes} />
        </div>
      </section>
    </>
  );
}
