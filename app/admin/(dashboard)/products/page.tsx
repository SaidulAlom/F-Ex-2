import Link from 'next/link';
import { dbConnect, hasDb } from '@/lib/db';
import { Product } from '@/models/Product';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AdminEmpty } from '@/components/admin/sidebar';
import { formatINR } from '@/lib/utils';
import { ProductRowActions } from '@/components/admin/product-row-actions';

export const dynamic = 'force-dynamic';

export default async function AdminProducts({ searchParams }: { searchParams: { q?: string; status?: string } }) {
  if (!hasDb()) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl text-ink">Products</h1>
        <AdminEmpty title="No database connected" body="Set MONGODB_URI in .env.local, then run npm run seed." />
      </div>
    );
  }

  await dbConnect();
  const query: Record<string, unknown> = {};
  if (searchParams.q) query.name = new RegExp(searchParams.q, 'i');
  if (searchParams.status && searchParams.status !== 'all') query.status = searchParams.status;

  const docs = await Product.find(query).sort({ updatedAt: -1 }).limit(200).lean();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-plum/60">Catalogue</p>
          <h1 className="mt-1 font-display text-3xl text-ink">Products <span className="text-plum/40">({docs.length})</span></h1>
        </div>
        <Link href="/admin/products/new" className="rounded-full bg-peach px-5 py-2.5 text-[10px] uppercase tracking-[0.16em] text-ink-deep">
          + Add product
        </Link>
      </header>

      <form className="flex flex-wrap gap-2" action="/admin/products">
        <input
          name="q"
          defaultValue={searchParams.q}
          placeholder="Search by name…"
          className="h-10 flex-1 rounded-md border border-input bg-white px-3 text-sm"
        />
        <select name="status" defaultValue={searchParams.status ?? 'all'} className="h-10 rounded-md border border-input bg-white px-3 text-sm">
          <option value="all">All statuses</option>
          <option value="available">Available</option>
          <option value="reserved">Reserved</option>
          <option value="sold">Sold</option>
        </select>
        <button type="submit" className="rounded-md border border-input px-4 text-xs uppercase tracking-[0.14em] text-ink">
          Filter
        </button>
      </form>

      {docs.length === 0 ? (
        <AdminEmpty title="No products yet" body="Add your first phone, or run the seed script to load the demo catalogue." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Branches</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {docs.map((p) => (
              <TableRow key={String(p._id)}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.images?.[0] ?? ''}
                      alt=""
                      className="h-10 w-10 rounded object-cover"
                      loading="lazy"
                    />
                    <div>
                      <Link href={`/admin/products/${String(p._id)}`} className="text-sm font-medium text-ink hover:text-rose">
                        {p.name}
                      </Link>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {p.brand} · {p.category}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{formatINR(p.price)}</TableCell>
                <TableCell className="text-xs">{p.condition}</TableCell>
                <TableCell className="text-xs uppercase tracking-[0.1em] text-plum/70">
                  {(p.branches ?? []).join(' · ')}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={p.status === 'available' ? 'success' : p.status === 'reserved' ? 'warning' : 'muted'}
                  >
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <ProductRowActions id={String(p._id)} status={p.status} featured={Boolean(p.featured)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
