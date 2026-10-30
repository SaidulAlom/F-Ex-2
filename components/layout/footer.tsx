import Link from 'next/link';
import { ArrowUpRight, Instagram, Facebook, MapPin, Phone } from 'lucide-react';
import { branches, navLinks, site, stickers } from '@/lib/config';
import { OpenStatus } from './open-status';
import { telLink, whatsappLink } from '@/lib/utils';

/** Footer with the giant F-EX wordmark and branch details. */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-peach/20 bg-ink-deep pb-24 pt-16 md:pb-10 md:pt-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(217,155,127,0.16),transparent_70%)]" />

      <div className="relative mx-auto max-w-[1440px] px-5 md:px-8">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr_1fr] md:gap-8">
          <div>
            <p className="font-script text-2xl italic text-peach/90">Since {site.established}</p>
            <h2 className="mt-3 max-w-md font-display text-3xl leading-[1.05] text-cream md:text-4xl">
              The finest phone counter in Guwahati, and we will happily prove it in person.
            </h2>
            <div className="mt-6 flex flex-wrap gap-2">
              {Object.values(stickers).map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-cream/15 px-3 py-1 text-[9px] uppercase tracking-[0.18em] text-cream/55"
                >
                  {s}
                </span>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <a
                href={site.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="rounded-full border border-peach/30 p-2.5 text-peach transition-colors hover:bg-peach/10"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={site.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="rounded-full border border-peach/30 p-2.5 text-peach transition-colors hover:bg-peach/10"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-cream/35">Branches</p>
            <ul className="mt-4 space-y-5">
              {branches.map((b) => (
                <li key={b.slug}>
                  {/* The branch name is the link; the phone number must be a
                      SIBLING anchor — nesting one <a> inside another is invalid
                      HTML and breaks hydration. */}
                  <div className="group flex items-start gap-2">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-peach/70" />
                    <div>
                      <Link
                        href={`/branches/${b.slug}`}
                        className="tap-sm flex w-fit items-center gap-2 text-sm text-cream hover:text-peach"
                      >
                        {b.name}
                        <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                      <p className="mt-0.5 text-xs leading-relaxed text-cream/45">
                        {b.address.line1}, {b.address.line2}, {b.address.city}–{b.address.pincode}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-cream/40">
                        <a href={telLink(b.phone)} className="tap-sm w-fit items-center hover:text-peach">
                          {b.phoneDisplay}
                        </a>
                        <OpenStatus branch={b} />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-cream/35">Explore</p>
            <ul className="mt-4 grid grid-cols-2 gap-y-2">
              {[...navLinks, { href: '/sell', label: 'Sell / Exchange' }, { href: '/branches', label: 'Branches' }].map(
                (l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-xs text-cream/55 hover:text-peach">
                      {l.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
            <div className="mt-6 space-y-2 text-xs text-cream/45">
              <a href={telLink(site.phone)} className="flex items-center gap-2 hover:text-peach">
                <Phone className="h-3.5 w-3.5 text-peach/70" /> {site.phone}
              </a>
              <a
                href={whatsappLink({ model: 'a phone' })}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-peach"
              >
                WhatsApp us → 
              </a>
              <p className="text-cream/30">{site.email}</p>
            </div>
          </div>
        </div>

        {/* giant wordmark */}
        <div className="relative mt-16 select-none border-t border-peach/10 pt-6">
          <p
            className="whitespace-nowrap text-center font-display leading-[0.8] text-cream/[0.07]"
            style={{ fontSize: 'clamp(4rem, 21vw, 20rem)', WebkitTextStroke: '1px rgba(217,155,127,0.18)' }}
            aria-hidden="true"
          >
            F-EX
          </p>
          <div className="mt-4 flex flex-col items-center justify-between gap-2 text-[10px] uppercase tracking-[0.2em] text-cream/30 md:flex-row">
            <p>© {year} {site.legalName}. All rights reserved.</p>
            <p className="flex gap-4">
              <Link href="/admin" className="hover:text-peach">
                Staff login
              </Link>
              <Link href="/contact" className="hover:text-peach">
                Contact
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
