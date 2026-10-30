'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Loader2, Star } from 'lucide-react';
import { setProductStatus, toggleProductFeatured } from '@/app/admin/(dashboard)/actions';

/** Inline status + featured toggles. Changes hit the storefront immediately. */
export function ProductRowActions({
  id,
  status,
  featured,
}: {
  id: string;
  status: string;
  featured: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState(false);

  const change = (next: 'available' | 'reserved' | 'sold') => {
    setBusy(true);
    start(async () => {
      await setProductStatus(id, next);
      router.refresh();
      setBusy(false);
    });
  };

  const star = () => {
    setBusy(true);
    start(async () => {
      await toggleProductFeatured(id, !featured);
      router.refresh();
      setBusy(false);
    });
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      <select
        value={status}
        onChange={(e) => change(e.target.value as 'available' | 'reserved' | 'sold')}
        className="h-8 rounded border border-input bg-white px-1.5 text-[11px]"
        aria-label="Change status"
      >
        <option value="available">Available</option>
        <option value="reserved">Reserved</option>
        <option value="sold">Sold</option>
      </select>
      <button
        type="button"
        onClick={star}
        aria-label={featured ? 'Remove from featured' : 'Mark as featured'}
        className={`rounded p-1.5 ${featured ? 'text-rose' : 'text-plum/30 hover:text-rose'}`}
      >
        <Star className={`h-4 w-4 ${featured ? 'fill-current' : ''}`} />
      </button>
      <Link href={`/admin/products/${id}`} className="rounded border border-input px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-ink">
        Edit
      </Link>
      {(busy || pending) && <Loader2 className="h-3.5 w-3.5 animate-spin text-plum/50" />}
    </div>
  );
}
