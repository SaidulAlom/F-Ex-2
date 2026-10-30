'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';

/**
 * Photo picker for repair requests. Uploads to Cloudinary through
 * /api/upload/repair (server-side signed) and returns secure URLs.
 * Max 3 photos, 5 MB each.
 */
export function PhotoUpload({
  value,
  onChange,
  max = 3,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setError('');
    setUploading(true);
    const next = [...value];
    for (const file of Array.from(files).slice(0, max - value.length)) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Each photo must be under 5 MB.');
        continue;
      }
      const body = new FormData();
      body.append('file', file);
      try {
        const res = await fetch('/api/upload/repair', { method: 'POST', body });
        const data = (await res.json()) as { url?: string; error?: string };
        if (data.url) next.push(data.url);
        else setError(data.error ?? 'Upload failed. Try a smaller photo.');
      } catch {
        setError('Upload failed. Check your connection.');
      }
    }
    onChange(next.slice(0, max));
    setUploading(false);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {value.map((url) => (
          <div key={url} className="relative h-20 w-20 overflow-hidden rounded-lg border border-cream/15">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Uploaded repair photo" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((v) => v !== url))}
              aria-label="Remove photo"
              className="absolute right-1 top-1 rounded-full bg-ink-deep/80 p-1 text-cream"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="grid h-20 w-20 place-items-center rounded-lg border border-dashed border-cream/25 text-cream/40 transition-colors hover:border-peach hover:text-peach"
            aria-label="Add a photo of your device"
          >
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => upload(e.target.files)}
      />
      {error && <p className="mt-2 text-[11px] text-rose">{error}</p>}
      <p className="mt-2 text-[10px] text-cream/30">Optional — a photo helps us quote faster. Up to {max}.</p>
    </div>
  );
}
