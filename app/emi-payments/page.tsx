import type { Metadata } from 'next';
import Link from 'next/link';
import { BadgeCheck, Calculator, CreditCard, Landmark, Smartphone, Wallet } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import { branches, site } from '@/lib/config';
import { PageHero } from '@/components/site/page-hero';
import { EmiPayments } from '@/components/site/emi-payments';
import { Reveal, RevealText } from '@/components/anim/reveal';
import { telLink, whatsappLink } from '@/lib/utils';
import { OpenStatus } from '@/components/layout/open-status';

export const metadata: Metadata = buildMetadata({
  title: 'EMI & Payments — Cards, UPI, No-Cost EMI',
  description:
    'No-cost EMI on selected phones at F-Ex Store Guwahati. Pay by cash, UPI (Paytm, PhonePe), Visa, MasterCard or RuPay. Approvals in minutes at both branches.',
  path: '/emi-payments',
});

const plans = [
  { tenure: '3 months', note: 'No-cost on selected models', example: '₹41,633/mo', on: '₹1,24,900' },
  { tenure: '6 months', note: 'No-cost on selected models', example: '₹20,817/mo', on: '₹1,24,900' },
  { tenure: '9 months', note: 'Standard interest', example: '₹14,412/mo', on: '₹1,24,900' },
  { tenure: '12 months', note: 'Standard interest', example: '₹11,214/mo', on: '₹1,24,900' },
  { tenure: '18 months', note: 'Bank approval required', example: '₹7,987/mo', on: '₹1,24,900' },
  { tenure: '24 months', note: 'Bank approval required', example: '₹6,398/mo', on: '₹1,24,900' },
];

export default function EmiPaymentsPage() {
  return (
    <>
      <PageHero
        eyebrow="Pay your way · Approvals in minutes"
        title={'EMI &\npayments.'}
        intro="Bring a card and a photo ID. Our EMI desk staffs both branches until 10 PM and can usually tell you within ten minutes exactly what a phone will cost per month — before you commit to anything."
        breadcrumb={[{ href: '/emi-payments', label: 'EMI & Payments' }]}
        image="/images/photo-1556742049-0cfed4f6a45d.jpg"
      />

      <EmiPayments />

      <section className="bg-cream py-24 text-ink">
        <div className="mx-auto max-w-[1440px] px-5 md:px-8">
          <p className="text-[10px] uppercase tracking-[0.4em] text-rose">Worked example</p>
          <RevealText
            as="h2"
            mode="words"
            text={'What ₹1,24,900 looks like per month.'}
            className="mt-4 max-w-3xl font-display text-4xl leading-[0.94] text-ink md:text-6xl"
          />
          <div className="mt-10 overflow-hidden rounded-2xl border border-ink/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink text-cream">
                <tr>
                  <th className="px-5 py-3 text-[10px] font-medium uppercase tracking-[0.2em]">Tenure</th>
                  <th className="px-5 py-3 text-[10px] font-medium uppercase tracking-[0.2em]">Type</th>
                  <th className="px-5 py-3 text-right text-[10px] font-medium uppercase tracking-[0.2em]">Per month</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.tenure} className="border-b border-ink/10 last:border-0 odd:bg-white/60">
                    <td className="px-5 py-3 font-display text-lg">{p.tenure}</td>
                    <td className="px-5 py-3 text-plum/80">{p.note}</td>
                    <td className="px-5 py-3 text-right font-display text-lg text-ink">{p.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-plum/60">
            Indicative only. Final EMI depends on the issuing bank, card network and current schemes. No processing fee
            is charged by F-Ex — bank charges, where applicable, are shown before approval.
          </p>

          <div className="mt-14 grid gap-4 md:grid-cols-4">
            {[
              { icon: Wallet, t: 'Cash', d: 'Best price, no surcharge.' },
              { icon: Smartphone, t: 'UPI', d: 'Paytm, PhonePe, any UPI app.' },
              { icon: CreditCard, t: 'Cards', d: 'Visa, MasterCard, RuPay.' },
              { icon: Landmark, t: 'EMI', d: '3 to 24 months on cards.' },
            ].map((p, i) => (
              <Reveal key={p.t} delay={i * 0.06}>
                <div className="rounded-2xl border border-ink/10 bg-white/70 p-6">
                  <p.icon className="h-5 w-5 text-rose" />
                  <p className="mt-4 font-display text-2xl">{p.t}</p>
                  <p className="mt-1 text-sm text-plum/75">{p.d}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-2xl bg-ink p-8 text-cream md:flex-row md:items-center">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-peach/70">Check your eligibility</p>
              <p className="mt-2 font-display text-2xl md:text-3xl">
                Call the EMI desk and we will run the numbers with you.
              </p>
              <div className="mt-3 flex flex-wrap gap-4">
                {branches.map((b) => (
                  <span key={b.slug} className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-[0.16em] text-cream/50">{b.displayName}</span>
                    <OpenStatus branch={b} />
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href={telLink(site.phone)} className="btn-peach">
                <Calculator className="h-4 w-4" /> Call {branchPhone()}
              </a>
              <a href={whatsappLink({ model: 'an EMI plan' })} target="_blank" rel="noopener noreferrer" className="btn-outline">
                WhatsApp
              </a>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-plum/70">
            <BadgeCheck className="h-4 w-4 text-rose" />
            <span>
              EMI is available on selected models only and requires a valid card and ID. <Link href="/contact" className="underline">Ask us</Link> before travelling to the store.
            </span>
          </div>
        </div>
      </section>
    </>
  );
}

function branchPhone() {
  return branches[0].phoneDisplay;
}
