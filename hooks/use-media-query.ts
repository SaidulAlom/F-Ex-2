'use client';

import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

export const useIsMobile = () => useMediaQuery('(max-width: 819px)');
export const useIsTouch = () => useMediaQuery('(pointer: coarse)');

/**
 * Rough low-end device detection used to skip WebGL / heavy effects:
 * small viewport + few cores or low memory.
 */
export function useLowEndDevice(): boolean {
  const [low, setLow] = useState(false);
  useEffect(() => {
    const cores = navigator.hardwareConcurrency ?? 4;
    // @ts-expect-error - deviceMemory is not in all TS libs
    const mem = navigator.deviceMemory ?? 4;
    const small = window.innerWidth < 820;
    setLow(cores <= 4 && mem <= 4 && small);
  }, []);
  return low;
}
