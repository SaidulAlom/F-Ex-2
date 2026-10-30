'use client';

import { useEffect, useState } from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { branches, site } from '@/lib/config';
import { track } from '@/lib/analytics';
import { telLink } from '@/lib/utils';

/**
 * Sticky bottom Call + WhatsApp bar (mobile only).
 * Sits above the PhoneShowcase stage but below the header/drawer.
 * A shimmer sweep runs across the bar every few seconds.
 */
export function MobileActionBar() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // hide while the mobile menu is open (body scroll locked)
    const observer = new MutationObserver(() => {
      setHidden(document.documentElement.style.overflow === 'hidden');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    return () => observer.disconnect();
  }, []);

  if (hidden) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[65] lg:hidden safe-bottom">
      <div className="relative flex items-stretch overflow-hidden border-t border-peach/25 bg-ink/95 backdrop-blur-xl">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_35%,rgba(246,235,227,0.16)_50%,transparent_65%)] bg-[length:250%_100%] animate-shimmer"
        />
        <a
          href={telLink(site.phone)}
          onClick={() => track.call('lokhra', 'mobile_bar')}
          className="flex flex-1 items-center justify-center gap-2 py-3.5 text-[11px] uppercase tracking-[0.22em] text-cream"
        >
          <Phone className="h-4 w-4 text-peach" /> Call
        </a>
        <span className="my-3 w-px bg-peach/25" />
        <a
          href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent('Hi F-Ex Store, I have a question about a phone.')}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track.whatsapp('mobile_bar')}
          className="flex flex-1 items-center justify-center gap-2 bg-peach/12 py-3.5 text-[11px] uppercase tracking-[0.22em] text-peach"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
      </div>
      <p className="bg-ink-deep px-3 py-1 text-center text-[9px] uppercase tracking-[0.18em] text-cream/35">
        {branches[0].displayName} {branches[0].phoneDisplay} · Open till 10 PM
      </p>
    </div>
  );
}
