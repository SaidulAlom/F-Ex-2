import 'server-only';
import { v2 as cloudinary } from 'cloudinary';

const configured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
);

if (configured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export const cloudinaryReady = configured;

export type SignedUpload = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
};

/** Signed params for direct browser -> Cloudinary upload (keeps secret server-side). */
export function signUpload(folder = 'fex/products'): SignedUpload {
  if (!configured) throw new Error('Cloudinary env vars missing');
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, process.env.CLOUDINARY_API_SECRET!);
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    timestamp,
    signature,
    folder,
  };
}

/** Server-side upload from a File (used by the repair form). */
export async function uploadBuffer(buffer: Buffer, folder = 'fex/repairs'): Promise<string> {
  if (!configured) throw new Error('Cloudinary env vars missing');
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ width: 1400, crop: 'limit', quality: 'auto' }] },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error('Upload failed'));
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}
