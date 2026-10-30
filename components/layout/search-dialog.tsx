'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { formatINR } from '@/lib/utils';

type Suggestion = { name: string; slug: string; brand: string; category: string; price: number | null };

/** Live search with debounced suggestions fetched from /api/search. */
export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (term: string) => {
    if (term.trim().length < 2) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      const data = (await res.json()) as { results?: Suggestion[] };
      setRows(data.results ?? []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(q), 220);
    return () => clearTimeout(t);
  }, [q, search]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-ink p-0 text-cream border-peach/30">
        <div className="flex items-center gap-3 border-b border-peach/20 px-5 py-4">
          <Search className="h-4 w-4 text-peach" aria-hidden="true" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="iPhone 13, Vivo, charger…"
            aria-label="Search products"
            className="w-full bg-transparent text-sm text-cream placeholder:text-cream/35 focus:outline-none"
          />
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-peach/70" />}
        </div>
        <div className="max-h-[52vh] overflow-y-auto p-2">
          {rows.length === 0 && (
            <p className="px-4 py-6 text-xs text-cream/40">
              {q.length > 1 ? 'Nothing matched. Try a brand or model name.' : 'Start typing to see phones and accessories.'}
            </p>
          )}
          <ul>
            {rows.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/product/${r.slug}`}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center justify-between gap-3 rounded-lg px-4 py-3 hover:bg-plum/40"
                >
                  <span>
                    <span className="block text-sm text-cream">{r.name}</span>
                    <span className="block text-[10px] uppercase tracking-[0.18em] text-cream/40">
                      {r.brand} · {r.category.replace('-', ' ')}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-peach">{formatINR(r.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t border-peach/15 px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-cream/30">
          Press Esc to close
        </div>
        <DialogTitle className="sr-only">Search F-Ex Store</DialogTitle>
      </DialogContent>
    </Dialog>
  );
}
