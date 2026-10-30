'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useLenis, type LenisApi } from '@/hooks/use-lenis';

const ScrollContext = createContext<LenisApi>({ lenis: null, scrollTo: () => {} });

export function useScrollContext() {
  return useContext(ScrollContext);
}

/** Mounts the single Lenis instance for the whole site (including /admin). */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const api = useLenis();
  return <ScrollContext.Provider value={api}>{children}</ScrollContext.Provider>;
}
