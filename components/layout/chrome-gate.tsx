'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { SiteChrome } from './site-chrome';

/**
 * Picks the shell for the current route.
 *
 * - Public storefront → full chrome: loader, scroll progress, custom cursor,
 *   section counter, header (+ mobile menu), footer, sticky mobile action bar.
 * - `/admin/**` → none of it. The panel has its own minimal shell and must stay
 *   calm; a cinematic loader or a custom cursor there would be wrong.
 *
 * Doing this here (rather than with a `(site)` route group) keeps every page
 * file where it is while still guaranteeing the chrome can never be forgotten.
 */
export function ChromeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/';
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');

  if (isAdmin) return <>{children}</>;
  return <SiteChrome>{children}</SiteChrome>;
}
