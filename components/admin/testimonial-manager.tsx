'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { deleteTestimonial, saveTestimonial } from '@/app/admin/(dashboard)/actions';

type Row = {
  _id: string;
  name: string;
  location: string;
  rating: number;
  quote: string;
  purchase: string;
  branch: string;
  featured: boolean;
  order: number;
};

export function TestimonialManager({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [, start] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState({
    name: '',
    location: 'Guwahati',
    rating: 5,
    quote: '',
    purchase: '',
    branch: 'lokhra',
    featured: true,
    order: rows.length,
  });

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await saveTestimonial(draft);
    setBusy(false);
    if (!res.ok) return setError(res.error);
    setDraft({ ...draft, name: '', quote: '', purchase: '' });
    start(() => router.refresh());
  };

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="grid gap-4 rounded-xl border border-input bg-white p-5 md:grid-cols-2">
        <div>
          <Label htmlFor="t-name">Customer name</Label>
          <Input id="t-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="mt-1.5" required />
        </div>
        <div>
          <Label htmlFor="t-loc">Area</Label>
          <Input id="t-loc" value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} className="mt-1.5" />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="t-quote">Quote</Label>
          <textarea
            id="t-quote"
            value={draft.quote}
            onChange={(e) => setDraft({ ...draft, quote: e.target.value })}
            rows={3}
            className="mt-1.5 w-full rounded-md border border-input bg-white p-3 text-sm"
            required
          />
        </div>
        <div>
          <Label htmlFor="t-purchase">Purchase (model · type)</Label>
          <Input id="t-purchase" value={draft.purchase} onChange={(e) => setDraft({ ...draft, purchase: e.target.value })} className="mt-1.5" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="t-rating">Rating</Label>
            <Input
              id="t-rating"
              type="number"
              min={1}
              max={5}
              value={draft.rating}
              onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="t-branch">Branch</Label>
            <select
              id="t-branch"
              value={draft.branch}
              onChange={(e) => setDraft({ ...draft, branch: e.target.value })}
              className="mt-1.5 h-11 w-full rounded-md border border-input bg-white px-3 text-sm"
            >
              <option value="lokhra">Lokhra</option>
              <option value="basistha">Basistha</option>
            </select>
          </div>
        </div>
        {error && <p className="text-xs text-red-600 md:col-span-2">{error}</p>}
        <div className="md:col-span-2">
          <Button type="submit" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add testimonial
          </Button>
        </div>
      </form>

      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r._id} className="rounded-xl border border-input bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-ink">
                  {r.name} <span className="text-xs text-muted-foreground">· {r.location} · {r.branch}</span>
                </p>
                <div className="mt-1 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'fill-rose text-rose' : 'text-plum/20'}`} />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    start(async () => {
                      await saveTestimonial({ ...r, featured: !r.featured }, r._id);
                      router.refresh();
                    })
                  }
                  className="rounded border border-input px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-ink"
                >
                  {r.featured ? 'Unfeature' : 'Feature'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!confirm('Delete this testimonial?')) return;
                    start(async () => {
                      await deleteTestimonial(r._id);
                      router.refresh();
                    });
                  }}
                  className="rounded border border-red-200 p-1.5 text-red-600"
                  aria-label="Delete testimonial"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs italic text-plum">“{r.quote}”</p>
          </div>
        ))}
        {rows.length === 0 && <p className="text-xs text-muted-foreground">No testimonials yet.</p>}
      </div>
    </div>
  );
}
