'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { deleteBanner, saveBanner, toggleBanner } from '@/app/admin/(dashboard)/actions';

type Row = {
  _id: string;
  title: string;
  subtitle: string;
  eyebrow: string;
  image: string;
  ctaLabel: string;
  ctaHref: string;
  placement: string;
  tone: string;
  active: boolean;
  order: number;
};

/** Create / toggle / delete banners without leaving the list. */
export function BannerManager({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [, start] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState({
    title: '',
    subtitle: '',
    eyebrow: '',
    image: '',
    ctaLabel: 'Explore',
    ctaHref: '/new-phones',
    placement: 'offers',
    tone: 'peach',
    order: rows.length,
  });

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await saveBanner({ ...draft, active: true });
    setBusy(false);
    if (!res.ok) return setError(res.error);
    setDraft({ ...draft, title: '', subtitle: '', eyebrow: '', image: '' });
    start(() => router.refresh());
  };

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="grid gap-4 rounded-xl border border-input bg-white p-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label htmlFor="b-title">Title</Label>
          <Input id="b-title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="mt-1.5" required />
        </div>
        <div>
          <Label htmlFor="b-eyebrow">Eyebrow</Label>
          <Input id="b-eyebrow" value={draft.eyebrow} onChange={(e) => setDraft({ ...draft, eyebrow: e.target.value })} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="b-sub">Subtitle</Label>
          <Input id="b-sub" value={draft.subtitle} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="b-placement">Placement</Label>
          <select
            id="b-placement"
            value={draft.placement}
            onChange={(e) => setDraft({ ...draft, placement: e.target.value })}
            className="mt-1.5 h-11 w-full rounded-md border border-input bg-white px-3 text-sm"
          >
            {['hero', 'marquee', 'offers', 'category'].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="b-tone">Tone</Label>
          <select
            id="b-tone"
            value={draft.tone}
            onChange={(e) => setDraft({ ...draft, tone: e.target.value })}
            className="mt-1.5 h-11 w-full rounded-md border border-input bg-white px-3 text-sm"
          >
            {['peach', 'rose', 'plum', 'cream'].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="b-cta">CTA label</Label>
          <Input id="b-cta" value={draft.ctaLabel} onChange={(e) => setDraft({ ...draft, ctaLabel: e.target.value })} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="b-href">CTA link</Label>
          <Input id="b-href" value={draft.ctaHref} onChange={(e) => setDraft({ ...draft, ctaHref: e.target.value })} className="mt-1.5" />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="b-image">Image URL (Unsplash or Cloudinary)</Label>
          <Input id="b-image" value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} className="mt-1.5" />
        </div>
        {error && <p className="text-xs text-red-600 md:col-span-2">{error}</p>}
        <div className="md:col-span-2">
          <Button type="submit" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add banner
          </Button>
        </div>
      </form>

      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r._id} className="flex flex-wrap items-center gap-3 rounded-xl border border-input bg-white p-4">
            {r.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.image} alt="" className="h-14 w-24 rounded object-cover" />
            ) : (
              <div className="grid h-14 w-24 place-items-center rounded bg-cream text-[9px] uppercase text-plum/40">No image</div>
            )}
            <div className="min-w-[180px] flex-1">
              <p className="text-sm text-ink">{r.title}</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {r.placement} · order {r.order} · {r.ctaLabel} → {r.ctaHref}
              </p>
            </div>
            <Badge variant={r.active ? 'success' : 'muted'}>{r.active ? 'Live' : 'Hidden'}</Badge>
            <button
              type="button"
              onClick={() =>
                start(async () => {
                  await toggleBanner(r._id, !r.active);
                  router.refresh();
                })
              }
              className="rounded border border-input px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-ink"
            >
              {r.active ? 'Hide' : 'Publish'}
            </button>
            <button
              type="button"
              onClick={() => {
                if (!confirm(`Delete “${r.title}”?`)) return;
                start(async () => {
                  await deleteBanner(r._id);
                  router.refresh();
                });
              }}
              className="rounded border border-red-200 px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-red-600"
            >
              Delete
            </button>
          </div>
        ))}
        {rows.length === 0 && <p className="text-xs text-muted-foreground">No banners yet.</p>}
      </div>
    </div>
  );
}
