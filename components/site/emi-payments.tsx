'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { CreditCard, Landmark, Smartphone, Wallet } from 'lucide-react';
import { paymentMethods } from '@/lib/config';
import { RevealText, Reveal } from '@/components/anim/reveal';

const icons = [Wallet, Smartphone, CreditCard, Landmark];

/** EMI + payment badges with staggered scale-in. */
export function EmiPayments() {
  const reduced = useReducedMotion();

  return (
    <section data-section-label="Payments" className="relative overflow-hidden bg-ink py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_40%_at_80%_20%,rgba(217,155,127,0.18),transparent_70%)]" />
      <div className="relative mx-auto max-w-[1440px] px-5 md:px-8">
        <div className="grid gap-14 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-peach/70">Pay your way</p>
            <RevealText
              as="h2"
              mode="lines"
              text={'No-cost EMI\non selected models.'}
              className="mt-4 font-display text-[11vw] leading-[0.88] text-cream sm:text-6xl md:text-7xl"
            />
            <Reveal delay={0.15}>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-cream/60">
                Walk in with a card, walk out with a phone. Our EMI desk is staffed at both branches until 10 PM and
                approvals usually take under ten minutes. Or simply pay by UPI, card or cash — no surcharge on UPI.
              </p>
            </Reveal>
            <Reveal delay={0.22}>
              <Link href="/emi-payments" className="btn-peach mt-8 inline-flex">
                See EMI plans
              </Link>
            </Reveal>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {paymentMethods.map((m, i) => {
              const Icon = icons[i] ?? Wallet;
              return (
                <motion.div
                  key={m.name}
                  initial={reduced ? undefined : { opacity: 0, scale: 0.9, y: 20 }}
                  whileInView={reduced ? undefined : { opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: '-12% 0px' }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="glass filigree relative rounded-2xl p-5 md:p-6"
                >
                  <Icon className="h-5 w-5 text-peach" aria-hidden="true" />
                  <p className="mt-4 font-display text-2xl text-cream">{m.name}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-cream/45">{m.note}</p>
                </motion.div>
              );
            })}
            <div className="col-span-2 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-peach/25 px-5 py-4">
              <p className="text-xs text-cream/60">Cards accepted</p>
              <p className="font-display text-lg tracking-[0.08em] text-peach">VISA · MasterCard · RuPay</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
