import { notFound } from 'next/navigation';
import { dbConnect, hasDb } from '@/lib/db';
import { Product } from '@/models/Product';
import { ProductForm } from '@/components/admin/product-form';
import { AdminEmpty } from '@/components/admin/sidebar';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  if (!hasDb()) return <AdminEmpty title="No database" body="Connect MongoDB to edit products." />;
  await dbConnect();

  const doc = await Product.findById(params.id).lean();
  if (!doc) notFound();

  const initial = JSON.parse(JSON.stringify(doc));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-plum/60">Edit product</p>
        <h1 className="mt-1 font-display text-3xl text-ink">{String(doc.name)}</h1>
      </div>
      <ProductForm id={String(doc._id)} initial={initial} />
    </div>
  );
}
