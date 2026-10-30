import { NextResponse } from 'next/server';
import { z } from 'zod';
import { contactSchema, repairSchema, reservationSchema, sellSchema } from '@/lib/validators';
import { clientKey, hashIp, rateLimit } from '@/lib/rate-limit';
import { createLead } from '@/lib/leads';
import { hasDb } from '@/lib/db';

/**
 * Single lead intake endpoint for every public form.
 * Protections: per-IP rate limit (5 / 10 min, 15 min block), honeypot field,
 * strict Zod validation, small body limit, hashed IP only (no raw PII).
 */
const typeSchema = z.enum(['contact', 'reservation', 'repair', 'sell', 'enquiry']);

export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req, 'leads'), 5, 10 * 60_000, 15 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests. Please call us instead — we answer till 10 PM.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
  }

  const raw = await req.text();
  if (raw.length > 20_000) return NextResponse.json({ ok: false, error: 'Payload too large' }, { status: 413 });

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }

  const type = typeSchema.safeParse((body as { type?: string })?.type);
  if (!type.success) return NextResponse.json({ ok: false, error: 'Unknown form type' }, { status: 400 });

  // Honeypot: a filled hidden field means a bot. Pretend success, store nothing.
  const honeypot = (body as { website?: string })?.website;
  if (honeypot && honeypot.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const schema =
    type.data === 'reservation'
      ? reservationSchema
      : type.data === 'repair'
        ? repairSchema
        : type.data === 'sell'
          ? sellSchema
          : contactSchema;

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? 'Please check the form', issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  if (!hasDb()) {
    // Preview mode without a database: accept and log so forms remain testable.
    console.info('[leads] no MONGODB_URI — lead not persisted', type.data);
    return NextResponse.json({ ok: true, preview: true });
  }

  const data = parsed.data as Record<string, unknown>;
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  try {
    const { id } = await createLead({
      type: type.data,
      name: String(data.name),
      phone: String(data.phone),
      email: data.email ? String(data.email) : '',
      message: data.message ? String(data.message) : '',
      branch: data.branch ? String(data.branch) : 'lokhra',
      productId: data.productId ? String(data.productId) : undefined,
      productSlug: data.productSlug ? String(data.productSlug) : '',
      productName: data.productName ? String(data.productName) : '',
      priceAtLead: data.priceAtLead ? Number(data.priceAtLead) : null,
      deviceModel: data.deviceModel ? String(data.deviceModel) : '',
      repairType: data.repairType ? String(data.repairType) : '',
      photos: Array.isArray(data.photos) ? (data.photos as string[]) : [],
      condition: data.condition ? String(data.condition) : '',
      expectedPrice: data.expectedPrice ? Number(data.expectedPrice) : null,
      preferredSlot: data.preferredSlot ? String(data.preferredSlot) : '',
      ipHash: hashIp(ip),
      userAgent: req.headers.get('user-agent')?.slice(0, 240) ?? '',
    });

    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (err) {
    console.error('[leads] failed', err);
    return NextResponse.json({ ok: false, error: 'Could not save your request. Please call us.' }, { status: 500 });
  }
}
