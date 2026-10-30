import { ExternalLink, Navigation } from 'lucide-react';
import type { BranchConfig } from '@/lib/config';

/**
 * Google Maps embed (no API key required for the classic embed) plus a
 * "Get directions" deep link. The iframe is lazy-loaded so it never blocks
 * first paint.
 */
export function BranchMap({ branch, height = 320 }: { branch: BranchConfig; height?: number }) {
  const src = `https://www.google.com/maps?q=${encodeURIComponent(branch.mapEmbedQuery)}&output=embed`;

  return (
    <div className="overflow-hidden rounded-2xl border border-peach/25">
      <div className="relative bg-plum/30" style={{ height }}>
        <iframe
          title={`Map of ${branch.name}`}
          src={src}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full border-0 grayscale-[35%] contrast-[1.05]"
          allowFullScreen
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-peach/20 bg-ink px-4 py-3">
        <div>
          <p className="text-sm text-cream">{branch.displayName}</p>
          <p className="text-[10px] uppercase tracking-[0.16em] text-cream/40">
            {branch.address.line1} · {branch.address.pincode}
          </p>
        </div>
        <div className="flex gap-3 text-[10px] uppercase tracking-[0.16em]">
          <a
            href={branch.directionsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="tap-sm w-fit items-center gap-1.5 text-peach hover:underline"
          >
            <Navigation className="h-3 w-3" /> Directions
          </a>
          <a
            href={branch.mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="tap-sm w-fit items-center gap-1.5 text-cream/50 hover:text-peach"
          >
            <ExternalLink className="h-3 w-3" /> Open map
          </a>
        </div>
      </div>
    </div>
  );
}
