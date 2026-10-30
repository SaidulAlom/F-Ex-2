'use client';

import { useRef, useState } from 'react';
import { Loader2, Upload, X } from 'lucide-react';

type Signed = { cloudName: string; apiKey: string; timestamp: number; signature: string; folder: string };

/**
 * Multi-image uploader for products. Requests a signed payload from
 * /api/upload/sign, then posts straight to Cloudinary (secret stays server-side).
 */
export function ImageUploader({
  value,
  onChange,
  max = 6,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}) {
  const input = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError('');
    const urls = [...value];

    try {
      const signRes = await fetch('/api/upload/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'fex/products' }),
      });
      const signed = (await signRes.json()) as Signed & { error?: string };
      if (!signRes.ok) throw new Error(signed.error ?? 'Could not authorise upload');

      for (const file of Array.from(files).slice(0, max - value.length)) {
        const body = new FormData();
        body.append('file', file);
        body.append('api_key', signed.apiKey);
        body.append('timestamp', String(signed.timestamp));
        body.append('signature', signed.signature);
        body.append('folder', signed.folder);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`, {
          method: 'POST',
          body,
        });
        const data = (await res.json()) as { secure_url?: string; error?: { message: string } };
        if (data.secure_url) urls.push(data.secure_url);
        else setError(data.error?.message ?? 'Upload failed');
      }
      onChange(urls.slice(0, max));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {value.map((url, i) => (
          <div key={url} className="relative h-24 w-24 overflow-hidden rounded-lg border border-input">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Product image ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((v) => v !== url))}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
              aria-label="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="grid h-24 w-24 place-items-center rounded-lg border border-dashed border-input text-plum/50 hover:border-rose hover:text-rose"
            aria-label="Add images"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          </button>
        )}
      </div>
      <input ref={input} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => upload(e.target.files)} />
      {error && <p className="mt-2 text-[11px] text-red-600">{error}</p>}
      <p className="mt-1.5 text-[10px] text-muted-foreground">
        First image is the card image; second is used on hover. Max {max}.
      </p>
    </div>
  );
}
