'use client';

import { useEffect, useState } from 'react';
import { isBranchOpen, type BranchConfig } from '@/lib/config';

/**
 * Live "Open now / Closed" pill computed in IST.
 * Renders a neutral state on the server, then updates on mount so there is
 * no hydration mismatch and no layout shift.
 */
export function OpenStatus({
  branch,
  className = '',
  showHours = false,
}: {
  branch: BranchConfig;
  className?: string;
  showHours?: boolean;
}) {
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const update = () => setOpen(isBranchOpen(branch));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [branch]);

  const label = open === null ? 'Checking…' : open ? 'Open now' : 'Closed';

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative flex h-1.5 w-1.5">
        {open && (
          <span className="absolute inline-flex h-full w-full animate-pulse-peach rounded-full bg-peach" />
        )}
        <span
          className={`relative inline-flex h-1.5 w-1.5 rounded-full ${open ? 'bg-peach' : 'bg-cream/40'}`}
        />
      </span>
      <span className={`text-[10px] uppercase tracking-[0.2em] ${open ? 'text-peach' : 'text-cream/45'}`}>
        {label}
      </span>
      {showHours && (
        <span className="text-[10px] uppercase tracking-[0.16em] text-cream/35">· {branch.hours.label}</span>
      )}
    </span>
  );
}
