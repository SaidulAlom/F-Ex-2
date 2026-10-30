import type { Metadata } from 'next';
import Link from 'next/link';
import { Bike, Clock, MapPin, PackageCheck, PhoneCall, Truck } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import { branches, site } from '@/lib/config';
import { PageHero } from '@/components/site/page-hero';
import { Reveal, RevealText } from '@/components/anim/reveal';
import { telLink, whatsappLink } from '@/lib/utils';

export const metadata: Metadata = buildMetadata({
  title: 'Delivery & Pickup — Same-Day Across Guwahati',
  description:
    'Same-day delivery and free store pickup at F-Ex Store Guwahati. We deliver phones, accessories and repaired devices across the city every day until 10 PM.',
  path: '/delivery',
});

const steps = [
  { icon: PhoneCall, t: 'Tell us what you want', d: 'Call, WhatsApp or reserve on the site. We confirm stock at the nearest branch before promising anything.' },
  { icon: PackageCheck, t: 'We prepare it', d: 'Sealed box, invoice, and for pre-owned units the inspection tag and warranty card — all photographed before dispatch.' },
  { icon: Bike, t: 'Same-day run', d: 'Guwahati city limits: usually within 2–4 hours. Orders placed before 8 PM arrive the same day.' },
  { icon: Truck, t: 'Or pick it up', d: 'Both counters are open daily until 10 PM. Free setup, tempered glass and case fitting at pickup.' },
];

export default function DeliveryPage() {
  return (
    <>
      <PageHero
        eyebrow="Same-day · Free above ₹5,000 · Across Guwahati"
        title={'Delivery &\npickup.'}
        intro="We deliver by our own riders, not a marketplace. That means the person handing you the phone also knows how it works, and can answer a question at your door."
        breadcrumb={[{ href: '/delivery', label: 'Delivery' }]}
        image="/images/photo-1556742049-0cfed4f6a45d.jpg"
      />

      <section className="bg-ink py-24">
        <div className="mx-auto max-w-[1440px] px-5 md:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Reveal key={s.t} delay={i * 0.07}>
                <div className="filigree relative h-full rounded-2xl p-6">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-peach/60">
                    Step {String(i + 1).padStart(2, '0')}
                  </p>
                  <s.icon className="mt-4 h-5 w-5 text-peach" />
                  <h3 className="mt-3 font-display text-2xl text-cream">{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-cream/55">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-peach/70">Zones & timings</p>
              <RevealText
                as="h2"
                mode="words"
                text={'Where we ride.'}
                className="mt-3 font-display text-4xl leading-[0.92] text-cream md:text-6xl"
              />
              <p className="mt-5 max-w-md text-sm leading-relaxed text-cream/55">
                Both branches deliver, so the closer counter always handles your order. Delivery is free on orders above
                ₹5,000; below that we charge the actual ride cost.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  { zone: 'Lokhra · Sarusajai · Six Mile · Khanapara', eta: '1–2 hours' },
                  { zone: 'Basistha · Beltola · Survey · Hatigaon', eta: '1–2 hours' },
                  { zone: 'Zoo Road · Ganeshguri · Dispur · G.S. Road', eta: '2–3 hours' },
                  { zone: 'Jalukbari · Amingaon · Airport Road', eta: '3–4 hours' },
                  { zone: 'Outside Guwahati', eta: 'Courier, next day' },
                ].map((z) => (
                  <div key={z.zone} className="flex items-center justify-between gap-4 border-b border-peach/15 pb-2 text-sm">
                    <span className="flex items-center gap-2 text-cream/75">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-peach/70" />
                      {z.zone}
                    </span>
                    <span className="shrink-0 text-[10px] uppercase tracking-[0.16em] text-peach/70">{z.eta}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-peach/20 p-7">
              <p className="text-[10px] uppercase tracking-[0.3em] text-peach/70">Pickup counters</p>
              {branches.map((b) => (
                <div key={b.slug} className="mt-5 border-b border-peach/15 pb-5 last:border-0">
                  <p className="font-display text-2xl text-cream">{b.displayName}</p>
                  <p className="mt-1 text-sm leading-relaxed text-cream/55">
                    {b.address.line1}, {b.address.line2}, {b.address.city}–{b.address.pincode}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.16em] text-cream/40">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /> {b.hours.days} · {b.hours.label}
                    </span>
                    <a href={telLink(b.phone)} className="tap-sm w-fit text-peach hover:underline">
                      {b.phoneDisplay}
                    </a>
                    <Link href={`/branches/${b.slug}`} className="hover:text-peach">
                      Map →
                    </Link>
                  </div>
                </div>
              ))}

              <div className="mt-6 flex flex-wrap gap-3">
                <a href={whatsappLink({ model: 'a phone' })} target="_blank" rel="noopener noreferrer" className="btn-peach">
                  Order on WhatsApp
                </a>
                <a href={telLink(site.phone)} className="btn-outline">
                  Call {site.phone}
                </a>
              </div>
            </div>
          </div>

          <div className="mt-16 rounded-2xl border border-peach/20 bg-plum/20 p-7">
            <h3 className="font-display text-2xl text-cream">Sending a phone in for repair?</h3>
            <p className="mt-2 max-w-2xl text-sm text-cream/55">
              We arrange free pickup for repairs within Guwahati. Book the slot, hand the phone to our rider, and we send
              a photographed condition report and a quote before starting work. Repaired devices are delivered back the
              same day where possible.
            </p>
            <Link href="/repairs" className="mt-5 inline-flex btn-outline">
              Book a repair pickup
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
