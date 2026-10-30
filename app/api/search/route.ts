import { NextResponse } from 'next/server';
import { getSearchIndex } from '@/lib/queries';
import { rateLimit, clientKey } from '@/lib/rate-limit';

/** Live search suggestions. Cheap in-memory filter over the cached index. */
export async function GET(req: Request) {
  const limit = rateLimit(clientKey(req, 'search'), 60, 60_000);
  if (!limit.ok) return NextResponse.json({ results: [] }, { status: 429 });

  const q = new URL(req.url).searchParams.get('q')?.trim().toLowerCase() ?? '';
  if (q.length < 2) return NextResponse.json({ results: [] });

  const index = await getSearchIndex();
  const results = index
    .filter((item) => `${item.name} ${item.brand}`.toLowerCase().includes(q))
    .slice(0, 6);

  return NextResponse.json({ results }, { headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600' } });
}
