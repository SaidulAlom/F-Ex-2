import { dbConnect, hasDb } from '@/lib/db';
import { Banner } from '@/models/Banner';
import { AdminEmpty } from '@/components/admin/sidebar';
import { BannerManager } from '@/components/admin/banner-manager';

export const dynamic = 'force-dynamic';

export default async function AdminBanners() {
  if (!hasDb()) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl text-ink">Banners & offers</h1>
        <AdminEmpty title="No database connected" body="Connect MongoDB to manage banners." />
      </div>
    );
  }

  await dbConnect();
  const docs = await Banner.find({}).sort({ order: 1 }).lean();
  const rows = docs.map((b) => ({
    _id: String(b._id),
    title: String(b.title),
    subtitle: b.subtitle ?? '',
    eyebrow: b.eyebrow ?? '',
    image: b.image ?? '',
    ctaLabel: b.ctaLabel ?? '',
    ctaHref: b.ctaHref ?? '',
    placement: String(b.placement),
    tone: String(b.tone),
    active: Boolean(b.active),
    order: Number(b.order ?? 0),
  }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-plum/60">Merchandising</p>
        <h1 className="mt-1 font-display text-3xl text-ink">Banners & offers</h1>
        <p className="mt-1 max-w-xl text-xs text-muted-foreground">
          The hero placement feeds the ticker strip under the 3D stage; “offers” appears in the offers band. Changes go
          live instantly.
        </p>
      </div>
      <BannerManager rows={rows} />
    </div>
  );
}
