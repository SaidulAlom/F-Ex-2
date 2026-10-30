'use client';

import { useEffect, useRef } from 'react';

/**
 * Peach trailing-glow cursor with contextual labels.
 * Disabled on touch devices and for prefers-reduced-motion.
 * Add data-cursor="View" (or Drag / WhatsApp / Call) to any element.
 */
export function useCustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return;

    document.documentElement.classList.add('has-custom-cursor');

    const dot = dotRef.current!;
    const glow = glowRef.current!;
    const label = labelRef.current!;
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let gx = mx;
    let gy = my;
    let raf = 0;
    let hovering = false;

    const move = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%) scale(${hovering ? 2.6 : 1})`;
    };

    const loop = () => {
      gx += (mx - gx) * 0.12; // glow lag — lower = longer trail
      gy += (my - gy) * 0.12;
      glow.style.transform = `translate3d(${gx}px, ${gy}px, 0) translate(-50%, -50%) scale(${hovering ? 2.2 : 1})`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const over = (e: PointerEvent) => {
      const target = (e.target as HTMLElement)?.closest<HTMLElement>('[data-cursor]');
      const text = target?.dataset.cursor;
      hovering = Boolean(text);
      label.textContent = text ?? '';
      label.style.opacity = text ? '1' : '0';
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%) scale(${hovering ? 2.6 : 1})`;
    };

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerover', over, { passive: true });
    window.addEventListener('pointerleave', () => {
      dot.style.opacity = '0';
      glow.style.opacity = '0';
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerover', over);
      document.documentElement.classList.remove('has-custom-cursor');
    };
  }, []);

  return { dotRef, glowRef, labelRef };
}
