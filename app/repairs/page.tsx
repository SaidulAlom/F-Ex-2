import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, Phone, ShieldCheck, Wrench } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import { branches, repairServices, site } from '@/lib/config';
import Image from 'next/image';
import { PageHero } from '@/components/site/page-hero';
import { RepairAtelier } from '@/components/site/repair-atelier';
import { MediaBand } from '@/components/site/media-band';
import { RepairForm } from '@/components/forms/repair-form';
import { Reveal, RevealText } from '@/components/anim/reveal';
import { telLink } from '@/lib/utils';
import { OpenStatus } from '@/components/layout/open-status';

export const metadata: Metadata = buildMetadata({
  title: 'Mobile Repair — Screen, Battery, Motherboard',
  description:
    'Expert mobile repairs in Guwahati: screen replacement, battery, motherboard, speaker, camera and fingerprint sensor. Free diagnosis, genuine parts, same-day service.',
  path: '/repairs',
});

export default function RepairsPage() {
  return (
    <>
      <PageHero
        eyebrow="Free diagnosis · Genuine parts · Same-day"
        title={'The repair\natelier.'}
        intro="We repair phones the way a watchmaker services a watch: on a proper bench, with the right tools, and with a written quote before anything is opened. Most screen jobs are finished while you wait."
        breadcrumb={[{ href: '/repairs', label: 'Repairs' }]}
        image="/images/repair-macro.jpg"
      >
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Clock, title: '45–90 min', body: 'Typical screen replacement' },
            { icon: ShieldCheck, title: 'Up to 6 months', body: 'Warranty on repaired parts' },
            { icon: Wrench, title: 'Both branches', body: 'Bench at Lokhra & Basistha' },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3 rounded-xl border border-peach/20 px-4 py-3">
              <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-peach" />
              <div>
                <p className="text-sm text-cream">{f.title}</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-cream/40">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </PageHero>

      <RepairAtelier />

      <MediaBand
        eyebrow="Micro-soldering, under the scope"
        title={'Real footage\nfrom the bench.'}
        body="No stock footage of a smiling man in a headset. This is a board from a water-damaged phone, cleaned under the microscope at our Lokhra bench — the same scope that handles bent charging ports, dead backlights and phones another shop already gave up on."
        points={[
          'Board-level repair: charging IC, backlight, audio and no-power faults.',
          'Free diagnosis with photographs of what we find before you approve a rupee.',
          'Genuine or OEM-grade parts only — the grade is written on your invoice.',
        ]}
        stats={[
          { k: '45–90', l: 'minutes, most screens' },
          { k: '6', l: 'months parts warranty' },
          { k: '2', l: 'benches, same standard' },
        ]}
        video="/video/repair-bench.mp4"
        poster="/video/repair-bench.jpg"
        videoLabel="A technician micro-soldering a phone mainboard under a microscope at the F-Ex Store bench"
        href="/contact"
        hrefLabel="Book a diagnosis"
      />

      {/* real bench photography — no stock smiles, no illustrations */}
      <section data-section-label="Inside the bench" className="bg-cream pb-4 pt-20 text-ink md:pb-8 md:pt-24">
        <div className="mx-auto max-w-[1440px] px-5 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-rose">Inside the bench</p>
              <h2 className="mt-3 font-display text-3xl leading-[0.95] text-ink md:text-4xl">
                Four hands, two benches, one standard.
              </h2>
            </div>
            <p className="max-w-sm text-xs leading-relaxed text-plum/70">
              Photographed at our Lokhra counter — the same scope, mat and torque drivers that touch your phone.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                src: '/images/repair-artisan.jpg',
                alt: 'Technician lifting a phone screen with a suction tool at the F-Ex Store bench',
                caption: 'Opening the phone — screen job, Lokhra',
                span: 'sm:col-span-1',
              },
              {
                src: '/images/repair-microscope.jpg',
                alt: 'Technician working on a phone board under a stereo microscope',
                caption: 'Board-level work under the scope',
                span: 'sm:col-span-1',
              },
              {
                src: '/images/repair-teardown.jpg',
                alt: 'Disassembled smartphone with logic board, battery and screen laid out on a repair mat',
                caption: 'Every part photographed before we quote',
                span: 'sm:col-span-1',
              },
            ].map((shot) => (
              <figure key={shot.src} className={`group relative overflow-hidden rounded-2xl bg-ink ${shot.span}`}>
                <div className="relative aspect-[4/5] w-full">
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-1000 ease-luxe group-hover:scale-[1.04]"
                  />
                  <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink-deep/85 via-ink-deep/10 to-transparent" />
                </div>
                <figcaption className="absolute inset-x-4 bottom-4 text-[10px] uppercase tracking-[0.18em] text-cream/80">
                  {shot.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* service menu */}
      <section data-section-label="Service menu" className="bg-cream py-24 text-ink">
        <div className="mx-auto max-w-[1440px] px-5 md:px-8">
          <p className="text-[10px] uppercase tracking-[0.4em] text-rose">What we fix</p>
          <RevealText
            as="h2"
            mode="words"
            text={'Five things, done properly.'}
            className="mt-4 max-w-2xl font-display text-4xl leading-[0.92] text-ink md:text-6xl"
          />
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-ink/10 bg-ink/10">
            {repairServices.map((s, i) => (
              <Reveal key={s.slug} delay={i * 0.05}>
                <div className="grid gap-3 bg-cream p-6 transition-colors hover:bg-white md:grid-cols-[180px_1fr_140px] md:items-center md:p-8">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-rose">
                    {String(i + 1).padStart(2, '0')} / {repairServices.length.toString().padStart(2, '0')}
                  </p>
                  <div>
                    <h3 className="font-display text-2xl text-ink md:text-3xl">{s.title}</h3>
                    <p className="mt-1 max-w-xl text-sm leading-relaxed text-plum/80">{s.detail}</p>
                  </div>
                  <p className="font-display text-xl text-ink md:text-right">{s.price}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-6 text-xs text-plum/60">
            Prices vary by model and part grade. The quoted price is the price you pay — we never add charges after the
            phone is opened.
          </p>
        </div>
      </section>

      {/* booking */}
      <section data-section-label="Book a repair" className="bg-ink py-24">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-peach/70">Book a slot</p>
            <RevealText
              as="h2"
              mode="lines"
              text={'Tell us what\nbroke.'}
              className="mt-4 font-display text-[12vw] leading-[0.86] text-cream sm:text-5xl md:text-6xl"
            />
            <p className="mt-6 max-w-md text-sm leading-relaxed text-cream/55">
              Send the details and up to three photos. We reply with an honest estimate and a time slot. Walk-ins are
              welcome too — both counters are open until 10 PM.
            </p>

            <div className="mt-8 space-y-3">
              {branches.map((b) => (
                <div key={b.slug} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-peach/20 px-4 py-3">
                  <div>
                    <p className="text-sm text-cream">{b.displayName}</p>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-cream/40">
                      {b.hours.days} · {b.hours.label}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <OpenStatus branch={b} />
                    <a href={telLink(b.phone)} className="tap-sm w-fit items-center gap-1.5 text-xs text-peach hover:underline">
                      <Phone className="h-3.5 w-3.5" /> Call
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs text-cream/35">
              Prefer WhatsApp? Send your model and a photo to {site.phone} and we will quote from the bench.
            </p>
          </div>

          <div className="rounded-2xl border border-peach/25 bg-plum/20 p-6 md:p-8">
            <RepairForm />
          </div>
        </div>
      </section>

      <section className="border-t border-peach/15 bg-ink-deep py-16">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-5 text-center md:flex-row md:px-8 md:text-left">
          <p className="font-display text-2xl text-cream md:text-3xl">
            Not sure it can be fixed? Let us look at it for free.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href={telLink(site.phone)} className="btn-peach">Call {site.phone}</a>
            <Link href="/contact" className="btn-outline">Message us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
