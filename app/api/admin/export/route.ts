import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { Lead } from '@/models/Lead';

/** CSV export of leads (respects the same filters as the admin table). */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  await dbConnect();
  const { searchParams } = new URL(req.url);
  const query: Record<string, unknown> = {};
  if (searchParams.get('type') && searchParams.get('type') !== 'all') query.type = searchParams.get('type');
  if (searchParams.get('status') && searchParams.get('status') !== 'all') query.status = searchParams.get('status');
  if (searchParams.get('branch') && searchParams.get('branch') !== 'all') query.branch = searchParams.get('branch');
  if (session.user.role !== 'owner' && session.user.branch !== 'all') query.branch = session.user.branch;

  const docs = await Lead.find(query).sort({ createdAt: -1 }).limit(5000).lean();

  const headers = [
    'id',
    'received',
    'type',
    'status',
    'name',
    'phone',
    'email',
    'branch',
    'product',
    'device',
    'repair_type',
    'message',
    'notes',
  ];
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;

  const lines = [
    headers.join(','),
    ...docs.map((d) =>
      [
        String(d._id),
        new Date(d.createdAt as Date).toISOString(),
        d.type,
        d.status,
        d.name,
        d.phone,
        d.email,
        d.branch,
        d.productName,
        d.deviceModel,
        d.repairType,
        d.message,
        d.notes,
      ]
        .map(escape)
        .join(',')
    ),
  ].join('\n');

  return new NextResponse(`\uFEFF${lines}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="fex-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
