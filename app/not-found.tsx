import Link from 'next/link';
import { site } from '@/lib/config';

export default function NotFound() {
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center bg-ink px-5 text-center">
      <div className="absolute inset-0 bg-spotlight" />
      <p className="relative text-[10px] uppercase tracking-[0.44em] text-peach/70">404 — page not found</p>
      <h1 className="relative mt-6 font-display text-[22vw] leading-none text-cream md:text-[12vw]">404</h1>
      <p className="relative mt-4 max-w-md text-sm text-cream/55">
        That page has been sold, moved or never existed. Try the catalogue, or call us on {site.phone} and we will point
        you to the right counter.
      </p>
      <div className="relative mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-peach">Back home</Link>
        <Link href="/new-phones" className="btn-outline">Browse phones</Link>
      </div>
    </section>
  );
}
