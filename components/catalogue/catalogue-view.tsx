'use client';

import { useCallback, useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import type { ProductCardData } from '@/types';
import { ProductCard } from '@/components/site/product-card';
import { brands as allBrands, conditionGrades, branches } from '@/lib/config';
import { cn } from '@/lib/utils';
import { track } from '@/lib/analytics';

/**
 * Catalogue with URL-synced filters (category, brand, price, condition,
 * availability, branch, sort). Layout changes animate via AnimatePresence.
 */
export function CatalogueView({
  products,
  lockedCategory,
  accessoryTypes,
}: {
  products: ProductCardData[];
  lockedCategory?: string;
  accessoryTypes?: { value: string; label: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const reduced = useReducedMotion();
  const [panelOpen, setPanelOpen] = useState(false);

  const get = (k: string) => params.get(k) ?? '';

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (!value) next.delete(key);
      else next.set(key, value);
      next.delete('page');
      startTransition(() => {
        router.replace(`${pathname}${next.toString() ? `?${next.toString()}` : ''}`, { scroll: false });
      });
      track.filterChange({ [key]: value });
    },
    [params, pathname, router]
  );

  const toggleParam = (key: string, value: string) => {
    const current = get(key).split(',').filter(Boolean);
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    setParam(key, next.length ? next.join(',') : null);
  };

  const activeBrands = get('brand').split(',').filter(Boolean);
  const activeConditions = get('condition').split(',').filter(Boolean);
  const activeType = get('type');
  const activeBranch = get('branch');
  const availability = get('availability') || 'all';
  const sort = get('sort') || 'featured';
  const min = get('min');
  const max = get('max');

  const activeCount =
    activeBrands.length + activeConditions.length + (activeType ? 1 : 0) + (activeBranch ? 1 : 0) + (min ? 1 : 0) + (max ? 1 : 0);

  const priceOptions = useMemo(
    () => [
      { label: 'Under ₹10k', min: '', max: '10000' },
      { label: '₹10k – ₹20k', min: '10000', max: '20000' },
      { label: '₹20k – ₹40k', min: '20000', max: '40000' },
      { label: '₹40k – ₹80k', min: '40000', max: '80000' },
      { label: '₹80k+', min: '80000', max: '' },
    ],
    []
  );

  const clearAll = () => {
    const next = new URLSearchParams();
    const q = params.get('q');
    if (q) next.set('q', q);
    startTransition(() => router.replace(`${pathname}${next.toString() ? `?${next}` : ''}`, { scroll: false }));
  };

  return (
    <div className="relative">
      {/* toolbar */}
      <div className="sticky top-16 z-40 -mx-5 mb-8 border-y border-peach/15 bg-ink/92 px-5 py-3 backdrop-blur-xl md:top-20 md:-mx-8 md:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setPanelOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-peach/40 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-peach md:hidden"
            aria-expanded={panelOpen}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filters {activeCount ? `(${activeCount})` : ''}
          </button>

          <span className="hidden text-[10px] uppercase tracking-[0.2em] text-cream/40 md:block">
            {products.length} {products.length === 1 ? 'phone' : 'phones'}
          </span>

          <div className="ml-auto flex items-center gap-2">
            {activeCount > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-cream/50 hover:text-peach"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
            <label className="sr-only" htmlFor="sort">Sort by</label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setParam('sort', e.target.value === 'featured' ? null : e.target.value)}
              className="rounded-full border border-cream/20 bg-transparent px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-cream/70 focus:border-peach focus:outline-none"
            >
              <option value="featured" className="text-ink">Featured</option>
              <option value="price-asc" className="text-ink">Price ↑</option>
              <option value="price-desc" className="text-ink">Price ↓</option>
              <option value="newest" className="text-ink">Newest</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[220px_1fr] md:gap-10">
        {/* filters */}
        <aside
          className={cn(
            'md:block',
            panelOpen
              ? 'fixed inset-x-0 bottom-0 top-16 z-50 overflow-y-auto bg-ink px-5 pb-24 pt-4 md:static md:z-auto md:overflow-visible md:bg-transparent md:p-0'
              : 'hidden'
          )}
          aria-label="Filters"
        >
          <div className="flex items-center justify-between md:hidden">
            <p className="font-display text-2xl text-cream">Filters</p>
            <button type="button" onClick={() => setPanelOpen(false)} aria-label="Close filters" className="p-2 text-cream/70">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-7 md:sticky md:top-40">
            {!lockedCategory && (
              <FilterGroup title="Category">
                {[
                  { v: '', l: 'All' },
                  { v: 'new-phones', l: 'New phones' },
                  { v: 'second-hand', l: 'Pre-owned' },
                  { v: 'accessories', l: 'Accessories' },
                ].map((c) => (
                  <FilterChip
                    key={c.l}
                    active={get('category') === c.v}
                    onClick={() => setParam('category', c.v || null)}
                    label={c.l}
                  />
                ))}
              </FilterGroup>
            )}

            {accessoryTypes && (
              <FilterGroup title="Type">
                {accessoryTypes.map((t) => (
                  <FilterChip
                    key={t.value}
                    active={activeType === t.value}
                    onClick={() => setParam('type', activeType === t.value ? null : t.value)}
                    label={t.label}
                  />
                ))}
              </FilterGroup>
            )}

            <FilterGroup title="Brand">
              {allBrands.map((b) => (
                <FilterChip key={b} active={activeBrands.includes(b)} onClick={() => toggleParam('brand', b)} label={b} />
              ))}
            </FilterGroup>

            <FilterGroup title="Price">
              {priceOptions.map((p) => (
                <FilterChip
                  key={p.label}
                  active={min === p.min && max === p.max && (min !== '' || max !== '')}
                  onClick={() => {
                    const next = new URLSearchParams(params.toString());
                    if (min === p.min && max === p.max) {
                      next.delete('min');
                      next.delete('max');
                    } else {
                      p.min ? next.set('min', p.min) : next.delete('min');
                      p.max ? next.set('max', p.max) : next.delete('max');
                    }
                    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
                  }}
                  label={p.label}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Condition">
              {conditionGrades.map((c) => (
                <FilterChip
                  key={c}
                  active={activeConditions.includes(c)}
                  onClick={() => toggleParam('condition', c)}
                  label={c}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Availability">
              {['all', 'available', 'reserved', 'sold'].map((a) => (
                <FilterChip
                  key={a}
                  active={availability === a}
                  onClick={() => setParam('availability', a === 'all' ? null : a)}
                  label={a === 'all' ? 'All' : a}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Branch">
              {branches.map((b) => (
                <FilterChip
                  key={b.slug}
                  active={activeBranch === b.slug}
                  onClick={() => setParam('branch', activeBranch === b.slug ? null : b.slug)}
                  label={b.displayName}
                />
              ))}
            </FilterGroup>

            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              className="w-full rounded-full bg-peach py-3 text-[10px] uppercase tracking-[0.2em] text-ink-deep md:hidden"
            >
              Show {products.length} results
            </button>
          </div>
        </aside>

        {/* grid */}
        <div>
          <motion.div layout className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {products.map((p, i) => (
                <motion.div
                  key={p.slug}
                  layout={!reduced}
                  initial={reduced ? undefined : { opacity: 0, scale: 0.96 }}
                  animate={reduced ? undefined : { opacity: 1, scale: 1 }}
                  exit={reduced ? undefined : { opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ProductCard product={p} index={i} priority={i < 3} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {products.length === 0 && (
            <div className="rounded-2xl border border-peach/20 p-12 text-center">
              <p className="font-display text-3xl text-cream">Nothing here — yet.</p>
              <p className="mx-auto mt-3 max-w-sm text-sm text-cream/50">
                Try a different filter, or WhatsApp us with the model you are looking for. We source phones on request.
              </p>
              <button onClick={clearAll} className="btn-outline mt-6">
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 text-[9px] uppercase tracking-[0.28em] text-cream/35">{title}</legend>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </fieldset>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] transition-colors',
        active
          ? 'border-peach bg-peach/15 text-peach'
          : 'border-cream/15 text-cream/55 hover:border-peach/50 hover:text-cream'
      )}
    >
      {label}
    </button>
  );
}
