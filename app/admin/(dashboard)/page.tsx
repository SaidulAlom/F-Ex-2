import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect, hasDb } from '@/lib/db';
import { Product } from '@/models/Product';
import { Lead } from '@/models/Lead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cnDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminOverview() {
  const session = await getServerSession(authOptions);
  let stats = { products: 0, available: 0, reserved: 0, sold: 0, leads: 0, newLeads: 0 };
  let recent: { _id: string; name: string; type: string; phone: string; createdAt: Date }[] = [];

  if (hasDb()) {
    await dbConnect();
    const branchFilter = session?.user.role === 'owner' ? {} : { branches: session?.user.branch };
    const [products, available, reserved, sold, leads, newLeads, latest] = await Promise.all([
      Product.countDocuments(branchFilter),
      Product.countDocuments({ ...branchFilter, status: 'available' }),
      Product.countDocuments({ ...branchFilter, status: 'reserved' }),
      Product.countDocuments({ ...branchFilter, status: 'sold' }),
      Lead.countDocuments({}),
      Lead.countDocuments({ status: 'new' }),
      Lead.find({}).sort({ createdAt: -1 }).limit(6).lean(),
    ]);
    stats = { products, available, reserved, sold, leads, newLeads };
    recent = latest.map((l) => ({
      _id: String(l._id),
      name: String(l.name),
      type: String(l.type),
      phone: String(l.phone),
      createdAt: l.createdAt as Date,
    }));
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-plum/60">Overview</p>
          <h1 className="mt-1 font-display text-3xl text-ink md:text-4xl">
            Good to see you, {session?.user.name?.split(' ')[0]}.
          </h1>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products/new" className="rounded-full bg-peach px-5 py-2.5 text-[10px] uppercase tracking-[0.16em] text-ink-deep">
            + Add product
          </Link>
          <Link href="/admin/leads" className="rounded-full border border-input px-5 py-2.5 text-[10px] uppercase tracking-[0.16em] text-ink">
            View leads
          </Link>
        </div>
      </header>

      {!hasDb() && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900">
          <strong>MONGODB_URI is not set.</strong> The storefront is serving demo data. Add the connection string to
          <code className="mx-1">.env.local</code> and run <code>npm run seed</code> to go live.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Products', value: stats.products, tone: 'default' as const },
          { label: 'Available', value: stats.available, tone: 'success' as const },
          { label: 'Reserved', value: stats.reserved, tone: 'warning' as const },
          { label: 'New leads', value: stats.newLeads, tone: 'rose' as const },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-plum/60">{s.label}</p>
            </CardHeader>
            <CardContent>
              <p className="font-display text-4xl text-ink">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Latest leads</CardTitle>
          <Link href="/admin/leads" className="text-[10px] uppercase tracking-[0.16em] text-rose">
            All leads →
          </Link>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              No leads yet. Submit the contact form once to test the pipeline.
            </p>
          ) : (
            <ul className="divide-y divide-input">
              {recent.map((l) => (
                <li key={l._id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm text-ink">{l.name}</p>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {l.type} · {cnDate(l.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="muted">{l.type}</Badge>
                    <a href={`tel:${l.phone}`} className="text-xs text-rose hover:underline">
                      {l.phone}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How stock updates work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-plum">
          <p>1. Products → “Add product”, upload photos, set price, condition and branches.</p>
          <p>2. Set status Available / Reserved / Sold as units move.</p>
          <p>3. Every save calls revalidateTag, so the public site reflects the change within seconds.</p>
        </CardContent>
      </Card>
    </div>
  );
}
