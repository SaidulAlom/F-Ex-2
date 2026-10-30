'use client';

import { useCustomCursor } from '@/hooks/use-custom-cursor';

/** Peach trailing-glow cursor. Rendered once in the root layout. */
export function CustomCursor() {
  const { dotRef, glowRef, labelRef } = useCustomCursor();
  return (
    <div className="pointer-events-none fixed inset-0 z-[100] hidden md:block" aria-hidden="true">
      <div
        ref={glowRef}
        className="absolute left-0 top-0 h-14 w-14 rounded-full opacity-70 transition-opacity duration-300"
        style={{
          background: 'radial-gradient(circle, rgba(217,155,127,0.45) 0%, rgba(165,111,99,0.12) 45%, transparent 70%)',
          filter: 'blur(6px)',
        }}
      />
      <div
        ref={dotRef}
        className="absolute left-0 top-0 flex h-3 w-3 items-center justify-center rounded-full bg-peach mix-blend-difference"
        style={{ transition: 'transform 0.18s cubic-bezier(0.22,1,0.36,1)' }}
      >
        <span
          ref={labelRef}
          className="whitespace-nowrap text-[7px] font-medium uppercase tracking-[0.08em] text-ink-deep opacity-0"
          style={{ transition: 'opacity 0.2s ease' }}
        />
      </div>
    </div>
  );
}
