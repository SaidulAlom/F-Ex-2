import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';
import { brandStatement, branches, site, stickers } from '@/lib/config';
import { PageHero } from '@/components/site/page-hero';
import { PromisePinned } from '@/components/site/promise-pinned';
import { MediaBand } from '@/components/site/media-band';
import { RevealText, Reveal, ClipReveal } from '@/components/anim/reveal';
import { Testimonials } from '@/components/site/testimonials';
import { getTestimonials } from '@/lib/queries';

export const metadata: Metadata = buildMetadata({
  title: 'About Us — The House of F-Ex, Guwahati',
  description:
    'F-Ex Store opened in Guwahati in 2024 with one counter, a repair bench and an unreasonable standard. Learn how we grade pre-owned phones and why customers keep coming back.',
  path: '/about',
});

export const revalidate = 600;

export default async function AboutPage() {
  const testimonials = await getTestimonials(5);

  return (
    <>
      <PageHero
        eyebrow="Est. 2024 · Lokhra & Basistha"
        title={'A phone shop\nworth the detour.'}
        intro={brandStatement.pullQuote}
        breadcrumb={[{ href: '/about', label: 'About' }]}
        image="/images/store-interior.jpg"
      />

      <section className="bg-cream py-24 text-ink">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 md:px-8 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-rose">Our story</p>
            <RevealText
              as="h2"
              mode="words"
              text={'One counter.\nOne bench.\nOne standard.'}
              className="mt-4 font-display text-[11vw] leading-[0.9] text-ink sm:text-5xl md:text-6xl"
            />
            <div className="mt-8 space-y-4 text-sm leading-relaxed text-plum/85 md:text-base">
              <p>{brandStatement.body}</p>
              <p>
                We started in 2024 because buying a phone in Guwahati usually meant either a showroom with no soul or a
                counter with no accountability. We wanted a third option: a place where the person selling you the phone
                is the same person who inspects it, repairs it and answers your call three months later.
              </p>
              <p>
                Today there are two branches — Lokhra beside Sarusajai Stadium, and Basistha near Lakhi Mandir — and the
                same rule applies at both: if we would not put it in our own pocket, it does not go on the shelf.
              </p>
            </div>
            <p className="mt-6 font-script text-xl italic text-rose">— {brandStatement.signature}</p>
          </div>

          <div className="relative h-[420px] md:h-[560px]">
            <ClipReveal className="absolute left-0 top-0 w-[62%] -rotate-3 overflow-hidden rounded-2xl shadow-xl">
              <Image
                src="/images/photo-1556742049-0cfed4f6a45d.jpg"
                alt="Staff helping a customer choose a phone at F-Ex Store"
                width={700}
                height={800}
                className="h-full w-full object-cover"
                sizes="(max-width: 768px) 60vw, 30vw"
              />
            </ClipReveal>
            <ClipReveal delay={0.15} className="absolute bottom-0 right-0 w-[58%] rotate-3 overflow-hidden rounded-2xl shadow-xl">
              <Image
                src="/images/repair-macro.jpg"
                alt="Repair bench at F-Ex Store with phone opened for service"
                width={700}
                height={700}
                className="h-full w-full object-cover"
                sizes="(max-width: 768px) 55vw, 28vw"
              />
            </ClipReveal>
            <Reveal delay={0.3} className="absolute left-4 bottom-16">
              <span className="inline-block -rotate-6 rounded-full bg-ink px-4 py-2 text-[9px] uppercase tracking-[0.2em] text-peach shadow-lg">
                {stickers.genuine}
              </span>
            </Reveal>
          </div>
        </div>
      </section>

      <MediaBand
        eyebrow="After hours at Lokhra"
        title={'The bench\nnever really\ncloses.'}
        body="Closing time is 10 PM, but boards that came in that evening still get looked at before we leave. A phone someone needs for work tomorrow outranks a tidy bench — that rule has not changed since the first counter."
        stats={[
          { k: '10 PM', l: 'doors close, daily' },
          { k: '12h', l: 'open every day' },
          { k: '2', l: 'branches in Guwahati' },
        ]}
        video="/video/atelier.mp4"
        poster="/video/atelier.jpg"
        videoLabel="A technician settling in at the F-Ex repair bench after the store closes"
        href="/repairs"
        hrefLabel="See what we repair"
        reverse
      />

      <PromisePinned />

      <section className="bg-ink-deep py-24">
        <div className="mx-auto max-w-[1440px] px-5 md:px-8">
          <p className="text-[10px] uppercase tracking-[0.4em] text-peach/70">How we grade pre-owned</p>
          <RevealText
            as="h2"
            mode="words"
            text={'The tag tells the truth.'}
            className="mt-4 max-w-3xl font-display text-4xl leading-[0.94] text-cream md:text-6xl"
          />
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-peach/20 bg-peach/20 md:grid-cols-5">
            {[
              { g: 'New', d: 'Sealed, never activated. Full brand warranty.' },
              { g: 'Like New', d: 'No visible marks. Battery 90%+.' },
              { g: 'Excellent', d: 'Faint signs of use, screen flawless.' },
              { g: 'Good', d: 'Light scuffs on frame, screen intact.' },
              { g: 'Fair', d: 'Honest wear, priced accordingly.' },
            ].map((c) => (
              <div key={c.g} className="bg-ink-deep p-6">
                <p className="font-display text-2xl text-peach">{c.g}</p>
                <p className="mt-2 text-xs leading-relaxed text-cream/50">{c.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 grid gap-8 border-t border-peach/15 pt-12 md:grid-cols-3">
            {[
              { k: '2', l: 'branches in Guwahati' },
              { k: '32', l: 'point pre-owned inspection' },
              { k: '12h', l: 'open daily, 10 AM – 10 PM' },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-display text-5xl text-cream md:text-6xl">{s.k}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-cream/40">{s.l}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap gap-3">
            <Link href="/branches" className="btn-peach">Visit a branch</Link>
            <Link href="/sell" className="btn-outline">Sell your phone</Link>
          </div>
        </div>
      </section>

      <Testimonials items={testimonials} />

      <section className="border-t border-peach/15 bg-ink py-16">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-4 px-5 text-center md:flex-row md:justify-between md:px-8 md:text-left">
          <p className="max-w-xl font-display text-2xl text-cream md:text-3xl">
            Questions before you visit? We answer WhatsApp until 10 PM, every day.
          </p>
          <a href={`tel:${site.phone}`} className="btn-peach">{branches[0].phoneDisplay}</a>
        </div>
      </section>
    </>
  );
}
