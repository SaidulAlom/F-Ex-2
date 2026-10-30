import { MessageCircle, Phone } from 'lucide-react';
import { branches, site } from '@/lib/config';
import { RevealText, Reveal } from '@/components/anim/reveal';
import { Magnetic } from '@/components/anim/magnetic';
import { telLink, whatsappLink } from '@/lib/utils';
import { VideoLoop } from '@/components/ui/video-loop';

/** Full-bleed dramatic closing CTA. */
export function FinalCta() {
  return (
    <section data-section-label="Visit" className="relative isolate overflow-hidden">
      {/* Real footage: a phone opened on our own bench, played as a muted loop.
          Falls back to the poster frame for reduced-motion and Data Saver. */}
      <VideoLoop
        src="/video/teardown.mp4"
        poster="/video/teardown.jpg"
        className="absolute inset-0 -z-10 opacity-70"
        mediaClassName="object-center"
        eager
      />
      {/* Scrims tuned so the bench footage still reads while the headline keeps AA:
          a light wash, a left-to-right protection for the type column, and a
          top/bottom fade so the loop melts into the sections around it. */}
      <div className="absolute inset-0 -z-10 bg-ink-deep/45" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/80 to-ink/25" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-deep via-transparent to-ink/60" />
      <div className="absolute inset-0 -z-10 bg-spotlight" />
      <div className="absolute inset-0 -z-10 grain" />

      <div className="mx-auto flex min-h-[86svh] max-w-[1440px] flex-col justify-center px-5 py-24 md:px-8">
        <p className="text-[10px] uppercase tracking-[0.44em] text-peach/80">Open till 10 PM, every day</p>
        <RevealText
          as="h2"
          mode="lines"
          text={'Come hold it\nin your hand.'}
          className="mt-5 font-display text-[16vw] leading-[0.82] text-cream sm:text-[11vw] md:text-[8.5vw]"
        />
        <Reveal delay={0.15}>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-cream/60 md:text-base">
            Photos never tell the whole story. Walk into either branch, compare two phones side by side, and take the
            one that feels right. Free delivery across Guwahati if you would rather stay home.
          </p>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Magnetic strength={0.22}>
              <a href={telLink(site.phone)} className="btn-peach" data-cursor="Call">
                <Phone className="h-4 w-4" /> Call {branches[0].phoneDisplay}
              </a>
            </Magnetic>
            <a
              href={whatsappLink({ model: 'a phone' })}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
              data-cursor="WhatsApp"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp us
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="mt-14 grid gap-6 border-t border-peach/20 pt-8 sm:grid-cols-2">
            {branches.map((b) => (
              <div key={b.slug}>
                <p className="font-display text-xl text-cream">{b.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-cream/50">
                  {b.address.line1}, {b.address.line2}, {b.address.city}–{b.address.pincode}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-peach/70">
                  {b.hours.days} · {b.hours.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
