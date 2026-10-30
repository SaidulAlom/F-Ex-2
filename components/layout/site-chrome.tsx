'use client';

import type { ReactNode } from 'react';
import { Loader } from '@/components/ui/loader';
import { ScrollProgress } from '@/components/ui/scroll-progress';
import { SectionCounter } from '@/components/ui/section-counter';
import { Header } from './header';
import { Footer } from './footer';
import { MobileActionBar } from './mobile-action-bar';
import { PageTransition } from '@/components/ui/page-transition';

/** Public-site chrome: loader, progress, header, footer, mobile bar.
 *  The peach labelled cursor was removed (2026-10-30) — the native pointer is back. */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-full focus:bg-peach focus:px-5 focus:py-2 focus:text-xs focus:text-ink-deep"
      >
        Skip to content
      </a>
      <Loader />
      <ScrollProgress />
      <SectionCounter />
      <Header />
      <main id="main" className="relative">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <MobileActionBar />
    </>
  );
}
