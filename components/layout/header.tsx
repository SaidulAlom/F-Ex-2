'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Phone, Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { branches, navLinks, site } from '@/lib/config';
import { lockScroll } from '@/hooks/use-lenis';
import { cn, telLink } from '@/lib/utils';
import { SearchDialog } from './search-dialog';
import { OpenStatus } from './open-status';
import { track } from '@/lib/analytics';

/** Sticky header. Transparent over the hero, glass once scrolled. */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    lockScroll(menuOpen);
    return () => lockScroll(false);
  }, [menuOpen]);

  /**
   * The drawer is a hand-rolled modal (the search dialog uses Radix, which brings
   * its own Escape handling and focus trap). Without this, Escape did nothing and
   * the page stayed scroll-locked until the user found the X — a keyboard user
   * could get stuck behind the overlay.
   */
  useEffect(() => {
    if (!menuOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);

    // move focus into the drawer, and give it back to the toggle on close
    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 60);
    const toggle = menuButtonRef.current;

    return () => {
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(focusTimer);
      toggle?.focus();
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <header
        data-site-header=""
        className={cn(
          'fixed inset-x-0 top-0 z-[60] transition-all duration-500',
          scrolled ? 'border-b border-peach/20 bg-ink/85 backdrop-blur-xl' : 'border-b border-transparent bg-transparent'
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 md:h-20 md:px-8">
          <Link href="/" className="group flex shrink-0 items-baseline gap-2 whitespace-nowrap" aria-label="F-Ex Store home">
            <span className="font-display text-2xl leading-none text-cream md:text-3xl">F-EX</span>
            <span className="hidden text-[9px] uppercase tracking-[0.34em] text-peach/70 sm:block">Store · Ghy</span>
          </Link>

          <nav className="hidden items-center gap-5 xl:flex 2xl:gap-6" aria-label="Main">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'relative text-[11px] uppercase tracking-[0.18em] transition-colors hover:text-peach',
                  pathname === l.href ? 'text-peach' : 'text-cream/75'
                )}
              >
                {l.label}
                {pathname === l.href && (
                  <span className="absolute -bottom-1.5 left-0 h-px w-full bg-peach/70" />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 md:gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search products"
              className="shrink-0 rounded-full p-2.5 text-cream/80 transition-colors hover:bg-peach/10 hover:text-peach"
            >
              <Search className="h-4 w-4" />
            </button>
            <Link
              href="/sell"
              className="hidden whitespace-nowrap rounded-full border border-peach/40 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-peach transition-colors hover:bg-peach/10 lg:block"
            >
              Sell / Exchange
            </Link>
            <a
              href={telLink(branches[0].phone)}
              onClick={() => track.call('lokhra', 'header')}
              className="hidden items-center gap-2 whitespace-nowrap rounded-full bg-peach px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-ink-deep transition-transform hover:scale-[1.03] sm:flex"
              data-cursor="Call"
            >
              <Phone className="h-3.5 w-3.5" />
              Call
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              ref={menuButtonRef}
              className="shrink-0 rounded-full p-2.5 text-cream/80 hover:text-peach xl:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* branch strip — desktop only, hides on scroll */}
        <div
          className={cn(
            'hidden border-t border-peach/10 transition-all duration-500 xl:block',
            scrolled ? 'max-h-0 overflow-hidden opacity-0' : 'max-h-10 opacity-100'
          )}
        >
          <div className="mx-auto flex max-w-[1440px] items-center justify-between px-8 py-2 text-[10px] uppercase tracking-[0.2em] text-cream/50">
            <div className="flex gap-8">
              {branches.map((b) => (
                <span key={b.slug} className="flex items-center gap-2">
                  <span className="text-cream/70">{b.displayName}</span>
                  <OpenStatus branch={b} />
                </span>
              ))}
            </div>
            <span>Free delivery within Guwahati · EMI available</span>
          </div>
        </div>
      </header>

      {/* mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[80] xl:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="absolute inset-0 bg-ink-deep/80 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
            <motion.nav
              className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-ink px-6 pb-8 pt-5"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-xl text-cream">F-EX</span>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="rounded-full p-2 text-cream/70 hover:text-peach"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-8 flex flex-col gap-1">
                {navLinks.map((l, i) => (
                  <motion.div
                    key={l.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.04 }}
                  >
                    <Link
                      href={l.href}
                      className="block border-b border-peach/10 py-3 font-display text-2xl text-cream/85 hover:text-peach"
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
                <Link href="/sell" className="block py-3 font-display text-2xl text-peach">
                  Sell / Exchange
                </Link>
              </div>

              <div className="mt-auto space-y-3 pt-6">
                {branches.map((b) => (
                  <Link
                    key={b.slug}
                    href={`/branches/${b.slug}`}
                    className="flex items-center justify-between rounded-lg border border-peach/20 px-4 py-3"
                  >
                    <span className="text-xs uppercase tracking-[0.18em] text-cream/70">{b.displayName}</span>
                    <OpenStatus branch={b} />
                  </Link>
                ))}
                <a
                  href={telLink(site.phone)}
                  className="flex items-center justify-center gap-2 rounded-full bg-peach py-3 text-xs uppercase tracking-[0.2em] text-ink-deep"
                >
                  <Phone className="h-4 w-4" /> {site.phone}
                </a>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
