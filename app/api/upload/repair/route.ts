import { NextResponse } from 'next/server';
import { cloudinaryReady, uploadBuffer } from '@/lib/cloudinary';
import { clientKey, rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

/** Public Cloudinary upload for repair photos (rate limited, type/size checked). */
export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req, 'upload'), 8, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: 'Too many uploads. Please try again later.' }, { status: 429 });
  }
  if (!cloudinaryReady) {
    return NextResponse.json({ error: 'Uploads are not configured yet.' }, { status: 503 });
  }

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'No file received' }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Photo must be under 5 MB' }, { status: 413 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'Only JPG, PNG or WEBP photos' }, { status: 415 });

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadBuffer(buffer, 'fex/repairs');
    return NextResponse.json({ url });
  } catch (err) {
    console.error('[upload] failed', err);
    return NextResponse.json({ error: 'Upload failed. Try a smaller photo.' }, { status: 500 });
  }
}
