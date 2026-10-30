import { unstable_cache } from 'next/cache';
import { dbConnect, hasDb } from './db';
import { Product } from '@/models/Product';
import { Banner } from '@/models/Banner';
import { Testimonial } from '@/models/Testimonial';
import { Branch } from '@/models/Branch';
import { demoProducts } from './demo-data';
import type { ProductCardData } from '@/types';

/**
 * All public reads go through cached functions tagged with
 * 'products' | 'banners' | 'testimonials' | 'branches'.
 * Admin mutations call revalidateTag(tag) so changes appear instantly.
 */
export const TAGS = {
  products: 'products',
  banners: 'banners',
  testimonials: 'testimonials',
  branches: 'branches',
  leads: 'leads',
} as const;

export const CACHE_SECONDS = 300; // 5 min safety net; tags do the real work

const serialize = (doc: Record<string, unknown>): ProductCardData => ({
  _id: String(doc._id),
  name: String(doc.name),
  slug: String(doc.slug),
  brand: String(doc.brand),
  category: String(doc.category),
  accessoryType: doc.accessoryType as string | undefined,
  price: (doc.price as number | null) ?? null,
  mrp: (doc.mrp as number | null) ?? null,
  emiFrom: (doc.emiFrom as number | null) ?? null,
  ram: (doc.ram as string) ?? '',
  storage: (doc.storage as string) ?? '',
  condition: String(doc.condition ?? 'New'),
  batteryHealth: (doc.batteryHealth as number | null) ?? null,
  warrantyMonths: (doc.warrantyMonths as number) ?? 0,
  images: (doc.images as string[]) ?? [],
  hoverImage: (doc.hoverImage as string) ?? '',
  branches: (doc.branches as string[]) ?? [],
  status: (doc.status as ProductCardData['status']) ?? 'available',
  featured: Boolean(doc.featured),
  description: (doc.description as string) ?? '',
  highlights: (doc.highlights as string[]) ?? [],
  colors: (doc.colors as string[]) ?? [],
});

/* ------------------------------- products ------------------------------- */
export type ProductFilters = {
  category?: string | string[];
  brand?: string | string[];
  min?: number;
  max?: number;
  condition?: string | string[];
  availability?: string;
  branch?: string;
  type?: string;
  q?: string;
  sort?: 'featured' | 'price-asc' | 'price-desc' | 'newest';
  limit?: number;
};

const toArray = (v?: string | string[]) => (Array.isArray(v) ? v : v ? [v] : []);

async function fetchProducts(filters: ProductFilters): Promise<ProductCardData[]> {
  const fallback = () => filterDemo(filters);

  if (!hasDb()) return fallback();
  try {
    await dbConnect();
    const query: Record<string, unknown> = {};

    const cats = toArray(filters.category);
    if (cats.length) query.category = { $in: cats };
    else query.category = { $ne: 'repairs' };

    const brands = toArray(filters.brand);
    if (brands.length) query.brand = { $in: brands };

    const conditions = toArray(filters.condition);
    if (conditions.length) query.condition = { $in: conditions };

    if (filters.type) query.accessoryType = filters.type;
    if (filters.branch) query.branches = filters.branch;

    if (filters.availability && filters.availability !== 'all') query.status = filters.availability;

    if (filters.min !== undefined || filters.max !== undefined) {
      query.price = {};
      if (filters.min !== undefined) (query.price as Record<string, number>).$gte = filters.min;
      if (filters.max !== undefined) (query.price as Record<string, number>).$lte = filters.max;
    }

    if (filters.q) {
      const rx = new RegExp(filters.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ name: rx }, { brand: rx }, { description: rx }];
    }

    const sort: Record<string, 1 | -1> =
      filters.sort === 'price-asc'
        ? { price: 1 }
        : filters.sort === 'price-desc'
          ? { price: -1 }
          : filters.sort === 'newest'
            ? { createdAt: -1 }
            : { featured: -1, order: 1 };

    const docs = await Product.find(query).sort(sort).limit(filters.limit ?? 60).lean();
    return docs.map((d) => serialize(d as Record<string, unknown>));
  } catch (err) {
    console.error('[queries] products failed, using demo data', err);
    return fallback();
  }
}

function filterDemo(f: ProductFilters): ProductCardData[] {
  const cats = toArray(f.category);
  const brands = toArray(f.brand);
  const conds = toArray(f.condition);
  let rows = demoProducts.filter((p) => (cats.length ? cats.includes(p.category) : p.category !== 'repairs'));
  if (brands.length) rows = rows.filter((p) => brands.includes(p.brand));
  if (conds.length) rows = rows.filter((p) => conds.includes(p.condition));
  if (f.type) rows = rows.filter((p) => p.accessoryType === f.type);
  if (f.branch) rows = rows.filter((p) => p.branches.includes(f.branch as 'lokhra' | 'basistha'));
  if (f.availability && f.availability !== 'all') rows = rows.filter((p) => p.status === f.availability);
  if (f.min !== undefined) rows = rows.filter((p) => (p.price ?? 0) >= f.min!);
  if (f.max !== undefined) rows = rows.filter((p) => (p.price ?? Infinity) <= f.max!);
  if (f.q) {
    const q = f.q.toLowerCase();
    rows = rows.filter((p) => `${p.name} ${p.brand} ${p.description}`.toLowerCase().includes(q));
  }
  if (f.sort === 'price-asc') rows = [...rows].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  if (f.sort === 'price-desc') rows = [...rows].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
  if (f.sort === 'featured') rows = [...rows].sort((a, b) => Number(b.featured) - Number(a.featured));
  return rows.slice(0, f.limit ?? 60).map((p) => ({ ...p }));
}

export const getProducts = (filters: ProductFilters = {}) =>
  unstable_cache(() => fetchProducts(filters), ['products', JSON.stringify(filters)], {
    tags: [TAGS.products],
    revalidate: CACHE_SECONDS,
  })();

export const getProductBySlug = (slug: string) =>
  unstable_cache(
    async () => {
      if (!hasDb()) return demoProducts.find((p) => p.slug === slug) ?? null;
      try {
        await dbConnect();
        const doc = await Product.findOne({ slug }).lean();
        return doc ? serialize(doc as Record<string, unknown>) : null;
      } catch {
        return demoProducts.find((p) => p.slug === slug) ?? null;
      }
    },
    ['product', slug],
    { tags: [TAGS.products], revalidate: CACHE_SECONDS }
  )();

export const getFeaturedProducts = (limit = 8) =>
  getProducts({ sort: 'featured', limit }).then((rows) => rows.filter((r) => r.featured).slice(0, limit));

/* ------------------------------- banners ------------------------------- */
export type BannerData = {
  _id: string;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  image?: string;
  ctaLabel?: string;
  ctaHref?: string;
  placement: string;
  tone: string;
  order: number;
};

const demoBanners: BannerData[] = [
  {
    _id: 'b1',
    title: 'iPhone 15 Pro — now on the counter',
    subtitle: 'Titanium, sealed, with Apple India warranty. Walk in and hold it.',
    eyebrow: 'New arrival',
    image:
      '/images/photo-1695048133142-1a20484d2569.jpg',
    ctaLabel: 'See the iPhone wall',
    ctaHref: '/new-phones?brand=Apple',
    placement: 'hero',
    tone: 'peach',
    order: 0,
  },
  {
    _id: 'b2',
    title: 'Certified pre-owned flagships from ₹18,999',
    subtitle: '32-point inspection, battery health on the tag, 6-month warranty.',
    eyebrow: 'Pre-owned vault',
    image:
      '/images/photo-1592750475338-74b7b21085ab.jpg',
    ctaLabel: 'Browse pre-owned',
    ctaHref: '/second-hand',
    placement: 'offers',
    tone: 'rose',
    order: 1,
  },
  {
    _id: 'b3',
    title: 'No-cost EMI on selected models',
    subtitle: 'Cards from Visa, MasterCard and RuPay. Approved in minutes, in-store.',
    eyebrow: 'Pay your way',
    image:
      '/images/photo-1556742049-0cfed4f6a45d.jpg',
    ctaLabel: 'EMI details',
    ctaHref: '/emi-payments',
    placement: 'marquee',
    tone: 'plum',
    order: 2,
  },
];

export const getBanners = (placement?: string) =>
  unstable_cache(
    async () => {
      if (!hasDb()) return placement ? demoBanners.filter((b) => b.placement === placement) : demoBanners;
      try {
        await dbConnect();
        const now = new Date();
        const q: Record<string, unknown> = {
          active: true,
          $and: [
            { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
            { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] },
          ],
        };
        if (placement) q.placement = placement;
        const docs = await Banner.find(q).sort({ order: 1, createdAt: -1 }).lean();
        return docs.map((d) => ({ ...d, _id: String(d._id) })) as unknown as BannerData[];
      } catch {
        return placement ? demoBanners.filter((b) => b.placement === placement) : demoBanners;
      }
    },
    ['banners', placement ?? 'all'],
    { tags: [TAGS.banners], revalidate: CACHE_SECONDS }
  )();

/* ----------------------------- testimonials ---------------------------- */
export type TestimonialData = {
  _id: string;
  name: string;
  location: string;
  rating: number;
  quote: string;
  purchase?: string;
  branch?: string;
};

const demoTestimonials: TestimonialData[] = [
  {
    _id: 't1',
    name: 'Anurag Deka',
    location: 'Six Mile',
    rating: 5,
    quote:
      'Bought a pre-owned iPhone 13 here. They showed me the battery health on the phone itself before I paid, and the warranty card was already filled out. Never felt rushed.',
    purchase: 'iPhone 13 · Certified Pre-Owned',
    branch: 'lokhra',
  },
  {
    _id: 't2',
    name: 'Priyanka Sharma',
    location: 'Basistha',
    rating: 5,
    quote:
      'My Vivo screen cracked on a Sunday evening. They replaced it in under an hour and I still made it home for dinner. Fair price, genuine part.',
    purchase: 'Vivo screen replacement',
    branch: 'basistha',
  },
  {
    _id: 't3',
    name: 'Rahul Bora',
    location: 'Zoo Road',
    rating: 5,
    quote:
      'EMI was sorted in ten minutes flat. The staff explained the paperwork instead of just pushing the most expensive model.',
    purchase: 'Samsung Galaxy S24 Ultra · EMI',
    branch: 'lokhra',
  },
  {
    _id: 't4',
    name: 'Meghna Das',
    location: 'Sarusajai',
    rating: 4,
    quote:
      'Same-day delivery to my office near the stadium. The phone came sealed with the case fitted, exactly as promised on WhatsApp.',
    purchase: 'Redmi Note 13 Pro',
    branch: 'lokhra',
  },
  {
    _id: 't5',
    name: 'Farhan Ahmed',
    location: 'Hatigaon',
    rating: 5,
    quote:
      'They diagnosed my dead motherboard for free and told me honestly that repairing it was not worth it. Then they gave me a fair exchange value against a new phone. That is why I keep going back.',
    purchase: 'Motherboard diagnosis · Exchange',
    branch: 'basistha',
  },
];

export const getTestimonials = (limit = 8) =>
  unstable_cache(
    async () => {
      if (!hasDb()) return demoTestimonials.slice(0, limit);
      try {
        await dbConnect();
        const docs = await Testimonial.find({ featured: true }).sort({ order: 1, createdAt: -1 }).limit(limit).lean();
        return docs.map((d) => ({ ...d, _id: String(d._id) })) as unknown as TestimonialData[];
      } catch {
        return demoTestimonials.slice(0, limit);
      }
    },
    ['testimonials', String(limit)],
    { tags: [TAGS.testimonials], revalidate: CACHE_SECONDS }
  )();

/* -------------------------------- branches ------------------------------ */
export const getBranchDocs = () =>
  unstable_cache(
    async () => {
      if (!hasDb()) return [];
      try {
        await dbConnect();
        const docs = await Branch.find({ active: true }).lean();
        return docs.map((d) => ({ ...d, _id: String(d._id) })) as unknown as (Record<string, unknown> & {
          _id: string;
        })[];
      } catch {
        return [];
      }
    },
    ['branches'],
    { tags: [TAGS.branches], revalidate: CACHE_SECONDS }
  )();

/* ------------------------------ suggestions ---------------------------- */
export const getSearchIndex = () =>
  unstable_cache(
    async () => {
      const rows = await fetchProducts({ limit: 60 });
      return rows.map((r) => ({ name: r.name, slug: r.slug, brand: r.brand, category: r.category, price: r.price }));
    },
    ['search-index'],
    { tags: [TAGS.products], revalidate: CACHE_SECONDS }
  )();
