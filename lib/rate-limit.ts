import { createHash } from 'crypto';

/**
 * Lightweight in-memory sliding-window limiter.
 * Good enough for a single-region Vercel deploy; swap the store for Upstash
 * Redis if traffic grows (see README "Scaling").
 */
type Entry = { hits: number[]; blockedUntil?: number };
const store = new Map<string, Entry>();
const MAX_KEYS = 5_000;

export type LimitResult = { ok: boolean; remaining: number; retryAfter: number };

export function rateLimit(key: string, limit = 5, windowMs = 60_000, blockMs = 0): LimitResult {
  const now = Date.now();
  if (store.size > MAX_KEYS) store.clear();

  const entry: Entry = store.get(key) ?? { hits: [] };
  if (entry.blockedUntil && entry.blockedUntil > now) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((entry.blockedUntil - now) / 1000) };
  }
  entry.hits = entry.hits.filter((t) => now - t < windowMs);

  if (entry.hits.length >= limit) {
    if (blockMs) entry.blockedUntil = now + blockMs;
    store.set(key, entry);
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.ceil((blockMs || windowMs - (now - entry.hits[0])) / 1000),
    };
  }

  entry.hits.push(now);
  store.set(key, entry);
  return { ok: true, remaining: limit - entry.hits.length, retryAfter: 0 };
}

/** Derive a stable, non-reversible client key for logging / limiting. */
export function clientKey(req: Request, scope: string): string {
  const h = req.headers;
  const ip =
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    'unknown';
  return `${scope}:${hashIp(ip)}`;
}

export function hashIp(ip: string): string {
  return createHash('sha256').update(`${ip}:${process.env.RATE_LIMIT_SALT ?? 'fex'}`).digest('hex').slice(0, 32);
}
