import Link from 'next/link';
import { dbConnect, hasDb } from '@/lib/db';
import { Lead } from '@/models/Lead';
import { AdminEmpty } from '@/components/admin/sidebar';
import { LeadsTable } from '@/components/admin/leads-table';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminLeads({
  searchParams,
}: {
  searchParams: { type?: string; status?: string; branch?: string; q?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!hasDb()) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl text-ink">Leads</h1>
        <AdminEmpty title="No database connected" body="Leads appear here once MONGODB_URI is configured." />
      </div>
    );
  }

  await dbConnect();
  const query: Record<string, unknown> = {};
  if (searchParams.type && searchParams.type !== 'all') query.type = searchParams.type;
  if (searchParams.status && searchParams.status !== 'all') query.status = searchParams.status;
  if (searchParams.branch && searchParams.branch !== 'all') query.branch = searchParams.branch;
  if (session?.user.role !== 'owner' && session?.user.branch !== 'all') query.branch = session?.user.branch;
  if (searchParams.q) {
    const rx = new RegExp(searchParams.q, 'i');
    query.$or = [{ name: rx }, { phone: rx }, { productName: rx }, { deviceModel: rx }];
  }

  const docs = await Lead.find(query).sort({ createdAt: -1 }).limit(200).lean();
  const rows = docs.map((d) => ({
    _id: String(d._id),
    type: String(d.type),
    status: String(d.status),
    name: String(d.name),
    phone: String(d.phone),
    email: d.email ?? '',
    message: d.message ?? '',
    productName: d.productName ?? '',
    deviceModel: d.deviceModel ?? '',
    repairType: d.repairType ?? '',
    branch: String(d.branch),
    createdAt: new Date(d.createdAt as Date).toISOString(),
    notes: d.notes ?? '',
    photos: (d.photos ?? []) as string[],
  }));

  const qs = new URLSearchParams(
    Object.entries(searchParams).filter(([, v]) => Boolean(v)) as [string, string][]
  ).toString();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-plum/60">Customer pipeline</p>
          <h1 className="mt-1 font-display text-3xl text-ink">
            Leads <span className="text-plum/40">({rows.length})</span>
          </h1>
        </div>
        <a
          href={`/api/admin/export${qs ? `?${qs}` : ''}`}
          className="rounded-full border border-input px-5 py-2.5 text-[10px] uppercase tracking-[0.16em] text-ink hover:bg-white"
        >
          Export CSV
        </a>
      </header>

      <form className="flex flex-wrap gap-2" action="/admin/leads">
        <input
          name="q"
          defaultValue={searchParams.q}
          placeholder="Name, phone, product…"
          className="h-10 min-w-[180px] flex-1 rounded-md border border-input bg-white px-3 text-sm"
        />
        <select name="type" defaultValue={searchParams.type ?? 'all'} className="h-10 rounded-md border border-input bg-white px-3 text-sm">
          <option value="all">All types</option>
          {['enquiry', 'reservation', 'repair', 'sell', 'contact'].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select name="status" defaultValue={searchParams.status ?? 'all'} className="h-10 rounded-md border border-input bg-white px-3 text-sm">
          <option value="all">All statuses</option>
          {['new', 'contacted', 'won', 'lost', 'archived'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select name="branch" defaultValue={searchParams.branch ?? 'all'} className="h-10 rounded-md border border-input bg-white px-3 text-sm">
          <option value="all">All branches</option>
          <option value="lokhra">Lokhra</option>
          <option value="basistha">Basistha</option>
        </select>
        <button type="submit" className="rounded-md border border-input px-4 text-xs uppercase tracking-[0.14em] text-ink">
          Filter
        </button>
        <Link href="/admin/leads" className="px-2 py-2.5 text-xs text-plum/60 hover:text-rose">Reset</Link>
      </form>

      {rows.length === 0 ? (
        <AdminEmpty title="No leads match" body="Try clearing the filters, or submit a test form from the site." />
      ) : (
        <LeadsTable rows={rows} />
      )}
    </div>
  );
}
