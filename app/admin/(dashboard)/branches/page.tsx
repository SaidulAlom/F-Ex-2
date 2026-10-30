import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { branches } from '@/lib/config';
import { dbConnect, hasDb } from '@/lib/db';
import { Branch } from '@/models/Branch';
import { BranchEditor } from '@/components/admin/branch-editor';
import { OpenStatus } from '@/components/layout/open-status';

export const dynamic = 'force-dynamic';

export default async function AdminBranches() {
  const session = await getServerSession(authOptions);
  const isOwner = session?.user.role === 'owner';

  let overrides: Record<string, Record<string, unknown>> = {};
  if (hasDb()) {
    await dbConnect();
    const docs = await Branch.find({}).lean();
    overrides = Object.fromEntries(docs.map((d) => [String(d.slug), JSON.parse(JSON.stringify(d))]));
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-plum/60">Store information</p>
        <h1 className="mt-1 font-display text-3xl text-ink">Branches</h1>
        <p className="mt-1 max-w-xl text-xs text-muted-foreground">
          Defaults live in <code>lib/config.ts</code>; edits saved here override them in the database. Only the owner can
          change branch details.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {branches.map((b) => (
          <div key={b.slug} className="rounded-xl border border-input bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink">{b.name}</p>
              <OpenStatus branch={b} />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {b.address.line1}, {b.address.line2}, {b.address.city}–{b.address.pincode}
            </p>
          </div>
        ))}
      </div>

      {branches.map((b) => (
        <BranchEditor
          key={b.slug}
          slug={b.slug}
          name={b.name}
          disabled={!isOwner}
          initial={{
            name: String(overrides[b.slug]?.name ?? b.name),
            addressLine1: String(overrides[b.slug]?.addressLine1 ?? b.address.line1),
            addressLine2: String(overrides[b.slug]?.addressLine2 ?? b.address.line2),
            locality: String(overrides[b.slug]?.locality ?? b.address.locality),
            city: String(overrides[b.slug]?.city ?? b.address.city),
            state: String(overrides[b.slug]?.state ?? b.address.state),
            pincode: String(overrides[b.slug]?.pincode ?? b.address.pincode),
            phone: String(overrides[b.slug]?.phone ?? b.phone),
            phoneDisplay: String(overrides[b.slug]?.phoneDisplay ?? b.phoneDisplay),
            whatsapp: String(overrides[b.slug]?.whatsapp ?? b.whatsapp),
            opensAt: String(overrides[b.slug]?.opensAt ?? b.hours.opens),
            closesAt: String(overrides[b.slug]?.closesAt ?? b.hours.closes),
            hoursLabel: String(overrides[b.slug]?.hoursLabel ?? b.hours.label),
            mapQuery: String(overrides[b.slug]?.mapQuery ?? b.mapEmbedQuery),
            directionsLink: String(overrides[b.slug]?.directionsLink ?? b.directionsLink),
            blurb: String(overrides[b.slug]?.blurb ?? b.blurb),
            active: Boolean(overrides[b.slug]?.active ?? true),
          }}
        />
      ))}
    </div>
  );
}
