/**
 * ARCHIVED 2026-10-29 — not imported by any route.
 * The home hero is now `components/site/flying-hero.tsx` (a real three.js handset on a
 * keyframed flight path). This wrapper and `phone-showcase.tsx` are kept for reference only.
 */
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { brands, branches, isBranchOpen, priceRanges, site } from '@/lib/config';
import type { ShowcaseBranch, ShowcaseChip } from '@/components/ui/phone-showcase';

/**
 * Lazy-loaded 3D stage. `ssr: false` keeps ~40kb of WebGL/JS off the critical
 * path; the phone poster paints immediately as the loading fallback.
 */
const PhoneShowcase = dynamic(() => import('@/components/ui/phone-showcase'), {
  ssr: false,
  loading: () => <ShowcaseSkeleton />,
});

/** Static poster + copy that matches the cover frame (prevents layout shift). */
function ShowcaseSkeleton() {
  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-ink" aria-hidden="true">
      <div className="absolute inset-0 bg-spotlight" />
      {/* The cover photograph paints immediately — no layout shift, and no
          CSS-drawn stand-in while the stage chunk loads. */}
      <picture className="block h-full w-full">
        <source srcSet="/mobile/scene-1-fade.webp" type="image/webp" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/photo-1695048133142-1a20484d2569.jpg"
          alt=""
          className="h-full w-full object-cover opacity-90"
        />
      </picture>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(64% 52% at 50% 46%, rgba(8,28,39,0.28) 0%, rgba(8,28,39,0.70) 58%, rgba(8,28,39,0.93) 100%)',
        }}
      />
      <p className="absolute inset-x-0 bottom-24 text-center font-display text-[20vw] leading-none text-cream/90 lg:text-[16vw]">
        F-EX
      </p>
    </section>
  );
}

const brandChips: ShowcaseChip[] = brands.map((b) => ({
  label: b,
  href: `/new-phones?brand=${encodeURIComponent(b)}`,
  meta: 'New & pre-owned',
}));

const preOwnedChips: ShowcaseChip[] = [
  { label: 'iPhone', href: '/second-hand?brand=Apple', meta: 'Certified pre-owned' },
  { label: 'Vivo', href: '/second-hand?brand=Vivo', meta: 'Certified pre-owned' },
  { label: 'Samsung', href: '/second-hand?brand=Samsung', meta: 'Certified pre-owned' },
  { label: 'OnePlus', href: '/second-hand?brand=OnePlus', meta: 'Certified pre-owned' },
];

const accessoryChips: ShowcaseChip[] = [
  { label: 'Chargers', href: '/accessories?type=charger' },
  { label: 'Cases', href: '/accessories?type=case' },
  { label: 'Earphones', href: '/accessories?type=earphones' },
  { label: 'Power Banks', href: '/accessories?type=powerbank' },
  { label: 'Smart Watches', href: '/accessories?type=smartwatch' },
  { label: 'Landline Phones', href: '/accessories?type=landline' },
];

export function HomeShowcase() {
  const [showcaseBranches, setShowcaseBranches] = useState<ShowcaseBranch[]>(() =>
    branches.map((b) => ({
      name: b.displayName,
      address: `${b.address.line1}, ${b.address.line2}, ${b.address.city}–${b.address.pincode}`,
      hours: `${b.hours.days} · ${b.hours.label}`,
      open: false,
      phone: b.phone,
      phoneDisplay: b.phoneDisplay,
      directions: b.directionsLink,
    }))
  );

  // Live IST open/closed, recalculated every minute on the client.
  useEffect(() => {
    const update = () =>
      setShowcaseBranches((prev) =>
        prev.map((b, i) => ({ ...b, open: isBranchOpen(branches[i]) }))
      );
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <PhoneShowcase
      name="F-Ex Store"
      tagline="Mobile Dealer · Guwahati"
      branches={showcaseBranches}
      specs={['New Phones', 'Pre-Owned', 'Accessories', 'Expert Repairs', 'EMI & Same-Day Delivery']}
      brands={[...brandChips, ...preOwnedChips]}
      accessories={accessoryChips}
      ctaLinks={{
        call: `tel:${site.phone}`,
        whatsapp: `https://wa.me/${site.whatsapp}`,
        newPhones: '/new-phones',
        preOwned: '/second-hand',
        repairs: '/repairs',
      }}
      priceRanges={priceRanges.map((p) => ({ label: p.label, href: `/second-hand?price=${p.value}` }))}
      ink="#0F3040"
      bone="#F6EBE3"
      accent="#D99B7F"
      accentSecondary="#A56F63"
      sceneScroll={1}
      alive
    />
  );
}
