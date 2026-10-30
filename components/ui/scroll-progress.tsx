'use client';

import { useScrollProgress } from '@/hooks/use-scroll-progress';

/** Peach progress bar pinned to the very top of the viewport. */
export function ScrollProgress() {
  const progress = useScrollProgress();
  return (
    <div className="fixed left-0 top-0 z-[70] h-[2px] w-full bg-transparent" aria-hidden="true">
      <div
        className="h-full origin-left bg-gradient-to-r from-rose via-peach to-cream"
        style={{ transform: `scaleX(${progress})`, transition: 'transform 80ms linear' }}
      />
    </div>
  );
}
