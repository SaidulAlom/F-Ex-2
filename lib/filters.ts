import { parsePriceRange } from './utils';
import type { ProductFilters } from './queries';

export type RawSearch = Record<string, string | string[] | undefined>;

/** Maps URL search params to the DB query, honouring the `price=min-max` shorthand. */
export function toProductFilters(search: RawSearch, category?: string | string[]): ProductFilters {
  const one = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);
  const range = parsePriceRange(one(search.price));

  return {
    category: category ?? (one(search.category) ? (one(search.category) as string).split(',') : undefined),
    brand: one(search.brand)?.split(',').filter(Boolean),
    condition: one(search.condition)?.split(',').filter(Boolean),
    type: one(search.type),
    branch: one(search.branch),
    availability: (one(search.availability) as ProductFilters['availability']) ?? 'all',
    min: range.min ?? (one(search.min) ? Number(one(search.min)) : undefined),
    max: range.max ?? (one(search.max) ? Number(one(search.max)) : undefined),
    q: one(search.q),
    sort: (one(search.sort) as ProductFilters['sort']) ?? 'featured',
    limit: 60,
  };
}
