import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import { branches, site } from '@/lib/config';
import { PageHero } from '@/components/site/page-hero';
import { ContactForm } from '@/components/forms/contact-form';
import { OpenStatus } from '@/components/layout/open-status';
import { BranchMap } from '@/components/site/branch-map';
import { Reveal } from '@/components/anim/reveal';
import { telLink, whatsappLink } from '@/lib/utils';

export const metadata: Metadata = buildMetadata({
  title: 'Contact — Call, WhatsApp or Visit',
  description:
    'Contact F-Ex Store Guwahati. Call +91 85118 22537, WhatsApp us, or visit our Lokhra and Basistha branches — open daily until 10 PM.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Open daily · 10 AM – 10 PM"
        title={'Say hello.'}
        intro="The fastest way to reach us is a phone call or a WhatsApp message — both land on a human at the counter, not a call centre. For anything detailed, the form below reaches the owner's inbox."
        breadcrumb={[{ href: '/contact', label: 'Contact' }]}
      />

      <section className="bg-ink py-20">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 md:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div className="space-y-4">
            {branches.map((b) => (
              <Reveal key={b.slug}>
                <div className="rounded-2xl border border-peach/20 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-display text-2xl text-cream">{b.name}</h2>
                    <OpenStatus branch={b} />
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-cream/60">
                    <p className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-peach" />
                      {b.address.line1}, {b.address.line2}, {b.address.locality}, {b.address.city}–{b.address.pincode}
                    </p>
                    <p className="flex items-center gap-3">
                      <Clock className="h-4 w-4 shrink-0 text-peach" />
                      {b.hours.days} · {b.hours.label}
                    </p>
                    <p className="flex items-center gap-3">
                      <Phone className="h-4 w-4 shrink-0 text-peach" />
                      <a href={telLink(b.phone)} className="tap-sm w-fit hover:text-peach">{b.phoneDisplay}</a>
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href={whatsappLink({ model: 'a phone', phone: b.whatsapp })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-peach/40 px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-peach hover:bg-peach/10"
                    >
                      <MessageCircle className="h-3 w-3" /> WhatsApp
                    </a>
                    <Link
                      href={`/branches/${b.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-cream/15 px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-cream/60 hover:text-peach"
                    >
                      Branch page
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}

            <Reveal delay={0.1}>
              <div className="rounded-2xl border border-peach/20 p-6">
                <p className="text-[10px] uppercase tracking-[0.3em] text-peach/70">Email</p>
                <a href={`mailto:${site.email}`} className="tap-sm mt-2 w-fit items-center gap-3 text-sm text-cream/70 hover:text-peach">
                  <Mail className="h-4 w-4 text-peach" /> {site.email}
                </a>
                <p className="mt-4 text-xs leading-relaxed text-cream/40">
                  For bulk/corporate purchases, dealer enquiries or press, write to us with “Corporate” in the subject and
                  we will reply within one working day.
                </p>
              </div>
            </Reveal>
          </div>

          <div className="rounded-2xl border border-peach/25 bg-plum/20 p-6 md:p-8">
            <h2 className="font-display text-3xl text-cream">Send a message</h2>
            <p className="mt-2 text-xs text-cream/45">
              We reply within an hour during shop hours. Fields marked with an error message need a quick fix.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-[1440px] gap-4 px-5 md:grid-cols-2 md:px-8">
          {branches.map((b) => (
            <BranchMap key={b.slug} branch={b} height={260} />
          ))}
        </div>
      </section>
    </>
  );
}
