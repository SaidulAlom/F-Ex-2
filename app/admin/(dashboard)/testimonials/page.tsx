import { dbConnect, hasDb } from '@/lib/db';
import { Testimonial } from '@/models/Testimonial';
import { AdminEmpty } from '@/components/admin/sidebar';
import { TestimonialManager } from '@/components/admin/testimonial-manager';

export const dynamic = 'force-dynamic';

export default async function AdminTestimonials() {
  if (!hasDb()) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl text-ink">Testimonials</h1>
        <AdminEmpty title="No database connected" body="Connect MongoDB to curate reviews." />
      </div>
    );
  }

  await dbConnect();
  const docs = await Testimonial.find({}).sort({ order: 1 }).lean();
  const rows = docs.map((t) => ({
    _id: String(t._id),
    name: String(t.name),
    location: t.location ?? '',
    rating: Number(t.rating ?? 5),
    quote: String(t.quote),
    purchase: t.purchase ?? '',
    branch: String(t.branch ?? 'lokhra'),
    featured: Boolean(t.featured),
    order: Number(t.order ?? 0),
  }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-plum/60">Social proof</p>
        <h1 className="mt-1 font-display text-3xl text-ink">Testimonials</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Only add reviews you actually received — the slider links to your Google profile for verification.
        </p>
      </div>
      <TestimonialManager rows={rows} />
    </div>
  );
}
