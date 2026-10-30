'use client';

import { useEffect, useRef, useState } from 'react';

/** IntersectionObserver hook (pauses heavy work when off-screen). */
export function useInView<T extends HTMLElement = HTMLDivElement>(options: IntersectionObserverInit & { once?: boolean } = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { once, ...io } = options;
    const obs = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
      if (entry.isIntersecting && once) obs.disconnect();
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px', ...io });
    obs.observe(el);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(options)]);

  return { ref, inView };
}
