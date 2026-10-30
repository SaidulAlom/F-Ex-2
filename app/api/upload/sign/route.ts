import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cloudinaryReady, signUpload } from '@/lib/cloudinary';

/** Signed direct-upload params for admin product images (auth required). */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  if (!cloudinaryReady) return NextResponse.json({ error: 'Cloudinary is not configured' }, { status: 503 });

  const { folder } = (await req.json().catch(() => ({}))) as { folder?: string };
  try {
    return NextResponse.json(signUpload(folder ?? 'fex/products'));
  } catch {
    return NextResponse.json({ error: 'Could not sign upload' }, { status: 500 });
  }
}
