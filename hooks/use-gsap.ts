'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from './use-reduced-motion';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

/**
 * `useLayoutEffect` on the client, `useEffect` on the server.
 *
 * Pin cleanup has to run in the LAYOUT phase: a passive effect's cleanup fires
 * after React has already removed the host nodes, and by then ScrollTrigger's
 * `.pin-spacer` wrapper is still around the pinned element — which makes React
 * throw "removeChild is not a child of this node" on client-side navigation.
 */
export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Scoped GSAP context with automatic cleanup.
 * The callback only runs once mounted; use gsap.matchMedia() inside for
 * responsive / reduced-motion variants.
 */
export function useGsap(
  setup: (ctx: { gsap: typeof gsap; ScrollTrigger: typeof ScrollTrigger; reduced: boolean }) => void | (() => void),
  deps: unknown[] = []
) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    const ctx = gsap.context(() => {
      setup({ gsap, ScrollTrigger, reduced });
    }, ref);
    return () => {
      // revert() kills the context's tweens AND unwraps any pin-spacer first
      ctx.revert();
      ScrollTrigger.refresh();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reduced]);

  return ref;
}

/** Refresh ScrollTrigger after fonts/images settle (avoids jumpy pins). */
export function refreshScrollTriggers(delay = 200) {
  if (typeof window === 'undefined') return;
  const t = setTimeout(() => ScrollTrigger.refresh(), delay);
  return () => clearTimeout(t);
}
