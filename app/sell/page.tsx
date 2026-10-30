import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgeIndianRupee, Clock3, Smartphone } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import { site } from '@/lib/config';
import { SellWaitlistForm } from '@/components/forms/sell-waitlist-form';
import { RevealText, Reveal } from '@/components/anim/reveal';
import { Marquee } from '@/components/ui/marquee';
import { telLink, whatsappLink } from '@/lib/utils';

export const metadata: Metadata = buildMetadata({
  title: 'Sell or Exchange Your Phone — Coming Soon',
  description:
    'F-Ex Store is building a proper sell and exchange programme for Guwahati: instant quotes, honest grading and same-day payout. Join the early access list.',
  path: '/sell',
});

export default function SellPage() {
  return (
    <>
      <section className="relative flex min-h-[92svh] items-center overflow-hidden bg-ink pt-28">
        <div className="absolute inset-0 bg-spotlight" />
        <div className="pointer-events-none absolute inset-0 grain" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-[10vw] top-1/2 -translate-y-1/2 font-display text-[40vw] leading-none text-cream/[0.045] md:text-[28vw]"
        >
          ₹
        </div>

        <div className="relative mx-auto w-full max-w-[1440px] px-5 py-16 md:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-peach/50 px-4 py-1.5 text-[9px] uppercase tracking-[0.22em] text-peach">
              Phase 2 · Coming soon
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-cream/40">Sell · Exchange · Upgrade</span>
          </div>

          <RevealText
            as="h1"
            mode="lines"
            text={'Your old phone\nis worth more\nthan you think.'}
            className="mt-6 font-display text-[13vw] leading-[0.84] text-cream md:text-[8vw]"
          />

          <Reveal delay={0.15}>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-cream/60 md:text-base">
              We are building a proper sell-and-exchange programme: an instant online quote, a 10-minute in-store
              verification, and same-day payment by UPI or cash. Until it launches, walk into either branch — we already
              buy and exchange phones over the counter, every day.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
            <div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { icon: BadgeIndianRupee, t: 'Instant quote', d: 'Model, storage, condition, battery health — real numbers, not a teaser.' },
                  { icon: Clock3, t: 'Same-day payout', d: 'UPI or cash before you leave the counter.' },
                  { icon: Smartphone, t: 'Data wiped', d: 'Certified erasure and a written confirmation.' },
                ].map((f, i) => (
                  <Reveal key={f.t} delay={i * 0.07}>
                    <div className="h-full rounded-2xl border border-peach/20 p-5">
                      <f.icon className="h-4 w-4 text-peach" />
                      <p className="mt-3 font-display text-xl text-cream">{f.t}</p>
                      <p className="mt-1 text-xs leading-relaxed text-cream/45">{f.d}</p>
                    </div>
                  </Reveal>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a href={telLink(site.phone)} className="btn-peach">
                  Call for a counter quote <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href={whatsappLink({ model: 'my old phone for exchange' })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline"
                >
                  WhatsApp a photo
                </a>
              </div>
              <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-cream/30">
                Already accepting exchanges at Lokhra & Basistha · <Link href="/branches" className="underline hover:text-peach">see branches</Link>
              </p>
            </div>

            <div className="rounded-2xl border border-peach/25 bg-plum/25 p-6 md:p-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-peach/70">Early access</p>
              <h2 className="mt-2 font-display text-3xl text-cream">Be first in the queue</h2>
              <p className="mt-2 text-xs text-cream/45">
                Leave your number and the phone you want to sell. When the programme opens, you get the first slot and
                the launch bonus.
              </p>
              <div className="mt-6">
                <SellWaitlistForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="border-y border-peach/15 bg-ink-deep/70">
        <Marquee
          items={['COMING SOON', 'SELL', 'EXCHANGE', 'UPGRADE', 'BEST PRICE', 'SAME-DAY PAYOUT', 'GUWAHATI']}
          duration={46}
          variant="outline"
        />
      </div>
    </>
  );
}
