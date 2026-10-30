'use client';

import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Site-wide Lenis smooth scroll, synced to GSAP ScrollTrigger.
 * - single instance, shared through the SmoothScrollProvider context
 * - disabled (native scroll) for prefers-reduced-motion
 * - exposes a ref so PhoneShowcase's jump() can call lenis.scrollTo()
 */
export type LenisApi = {
  lenis: Lenis | null;
  scrollTo: (target: number | string | HTMLElement, opts?: { offset?: number; duration?: number; immediate?: boolean }) => void;
};

let activeLenis: Lenis | null = null;

/** Access the live Lenis instance from anywhere (used by PhoneShowcase). */
export function getLenis(): Lenis | null {
  return activeLenis;
}

export function scrollToTarget(
  target: number | string | HTMLElement,
  opts: { offset?: number; duration?: number; immediate?: boolean } = {}
) {
  if (activeLenis) {
    activeLenis.scrollTo(target as never, { offset: opts.offset ?? 0, duration: opts.duration ?? 1.4, immediate: opts.immediate });
    return;
  }
  // Fallback for reduced motion / Lenis not ready yet
  if (typeof target === 'number') {
    window.scrollTo({ top: target + (opts.offset ?? 0), behavior: 'auto' });
  } else if (typeof target === 'string') {
    document.querySelector(target)?.scrollIntoView({ behavior: 'auto', block: 'start' });
  } else {
    target.scrollIntoView({ behavior: 'auto', block: 'start' });
  }
}

export function useLenis(): LenisApi {
  const [lenis, setLenis] = useState<Lenis | null>(activeLenis);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return; // native scrolling, no smoothing

    gsap.registerPlugin(ScrollTrigger);

    const instance = new Lenis({
      duration: 1.15,
      // tuning knob: higher lerp = snappier, lower = more cinematic
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false, // native momentum on touch, feels better on Android
      touchMultiplier: 1.4,
    });
    activeLenis = instance;
    setLenis(instance);

    function raf(time: number) {
      instance.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    }
    rafRef.current = requestAnimationFrame(raf);

    // Lenis scrolls the window natively, so ScrollTrigger only needs a nudge
    // on every Lenis frame (no scrollerProxy — that breaks pinning).
    instance.on('scroll', ScrollTrigger.update);
    // Drive ScrollTrigger.refresh once the layout has settled after mount.
    const refresh = setTimeout(() => ScrollTrigger.refresh(), 300);

    return () => {
      clearTimeout(refresh);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      instance.destroy();
      activeLenis = null;
      setLenis(null);
    };
  }, []);

  return { lenis, scrollTo: scrollToTarget };
}

/** Lock/unlock page scroll (menus, modals). */
export function lockScroll(locked: boolean) {
  if (activeLenis) {
    locked ? activeLenis.stop() : activeLenis.start();
  }
  document.documentElement.style.overflow = locked ? 'hidden' : '';
}
