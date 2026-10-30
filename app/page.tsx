import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { getBanners, getFeaturedProducts, getTestimonials } from '@/lib/queries';
import CurtainSplitHero from '@/components/ui/curtain-split-hero';
import { StoryRing } from '@/components/site/story-ring';
import { MarqueeStrip } from '@/components/site/marquee-strip';
import { BrandStatement } from '@/components/site/brand-statement';
import { FeaturedPhones } from '@/components/site/featured-phones';
import { CategoryStack } from '@/components/site/category-stack';
import { EmiPayments } from '@/components/site/emi-payments';
import { BranchShowcase } from '@/components/site/branch-showcase';
import { Testimonials } from '@/components/site/testimonials';
import { FinalCta } from '@/components/site/final-cta';

export const metadata: Metadata = buildMetadata({
  title: 'F-Ex Store — New & Pre-Owned Phones in Guwahati',
  description:
    'New and pre-owned smartphones, accessories and expert repairs at F-Ex Store, Guwahati. Lokhra & Basistha branches, open daily till 10 PM, EMI and same-day delivery.',
  path: '/',
});

// Home is cached and revalidated by tag from the admin panel.
export const revalidate = 300;

export default async function HomePage() {
  const [featured, banners, testimonials] = await Promise.all([
    getFeaturedProducts(8),
    getBanners('marquee'),
    getTestimonials(6),
  ]);

  return (
    <>
      <CurtainSplitHero />

      <StoryRing />

      <MarqueeStrip offer={banners[0]?.title} />

      <BrandStatement />

      <FeaturedPhones
        products={featured.length ? featured : []}
        eyebrow="Featured on the counter"
        title="This week at F-Ex"
      />

      <CategoryStack />

      <EmiPayments />

      <BranchShowcase />

      <Testimonials items={testimonials} />

      <FinalCta />
    </>
  );
}
