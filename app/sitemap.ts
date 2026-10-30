import type { MetadataRoute } from 'next';
import { branches, site } from '@/lib/config';
import { getProducts } from '@/lib/queries';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes = [
    '',
    '/new-phones',
    '/second-hand',
    '/accessories',
    '/repairs',
    '/emi-payments',
    '/delivery',
    '/branches',
    '/about',
    '/contact',
    '/sell',
  ].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency: (path === '' ? 'daily' : 'weekly') as 'daily' | 'weekly',
    priority: path === '' ? 1 : 0.8,
  }));

  const branchRoutes = branches.map((b) => ({
    url: `${site.url}/branches/${b.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await getProducts({ limit: 60 });
    productRoutes = products.map((p) => ({
      url: `${site.url}/product/${p.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch {
    productRoutes = [];
  }

  return [...staticRoutes, ...branchRoutes, ...productRoutes];
}
