import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Reveal, RevealText } from '@/components/anim/reveal';
import { VideoLoop } from '@/components/ui/video-loop';

type Stat = { k: string; l: string };

/**
 * Copy on one side, a real self-hosted video loop on the other.
 *
 * Built for interior pages: the clip is a genuine bench clip (phone opened,
 * micro-soldering under the scope), never a stock "businessman smiling" bed.
 * Falls back to the still poster frame on reduced-motion and Data Saver.
 */
export function MediaBand({
  eyebrow,
  title,
  body,
  points = [],
  stats = [],
  video,
  poster,
  videoLabel,
  href,
  hrefLabel,
  reverse = false,
  tone = 'deep',
}: {
  eyebrow: string;
  title: string;
  body: string;
  points?: string[];
  stats?: Stat[];
  video: string;
  poster: string;
  videoLabel?: string;
  href?: string;
  hrefLabel?: string;
  reverse?: boolean;
  tone?: 'deep' | 'cream';
}) {
  const dark = tone === 'deep';

  return (
    <section
      className={`relative overflow-hidden ${dark ? 'bg-ink-deep' : 'bg-cream text-ink'} py-20 md:py-28`}
      aria-label={eyebrow}
    >
      {dark && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_50%_at_25%_30%,rgba(217,155,127,0.14),transparent_70%)]" />
      )}

      <div
        className={`relative mx-auto grid max-w-[1440px] items-center gap-10 px-5 md:px-8 lg:grid-cols-2 lg:gap-16 ${
          reverse ? 'lg:[&>*:first-child]:order-2' : ''
        }`}
      >
        <div className={dark ? '' : 'order-2 lg:order-1'}>
          <p className={`text-[10px] uppercase tracking-[0.4em] ${dark ? 'text-peach/75' : 'text-rose'}`}>{eyebrow}</p>
          <RevealText
            as="h2"
            mode="lines"
            text={title}
            className={`mt-4 font-display text-[12vw] leading-[0.88] sm:text-5xl md:text-6xl ${
              dark ? 'text-cream' : 'text-ink'
            }`}
          />
          <Reveal delay={0.12}>
            <p className={`mt-6 max-w-xl text-sm leading-relaxed md:text-base ${dark ? 'text-cream/60' : 'text-plum/85'}`}>
              {body}
            </p>
          </Reveal>

          {points.length > 0 && (
            <Reveal delay={0.18}>
              <ul className="mt-7 space-y-2.5">
                {points.map((p) => (
                  <li key={p} className="flex gap-3">
                    <span aria-hidden="true" className={`mt-2 h-1 w-1 shrink-0 rounded-full ${dark ? 'bg-peach' : 'bg-rose'}`} />
                    <span className={`text-xs leading-relaxed md:text-sm ${dark ? 'text-cream/55' : 'text-plum/80'}`}>{p}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {stats.length > 0 && (
            <Reveal delay={0.24}>
              <dl className={`mt-9 grid gap-6 border-t pt-7 sm:grid-cols-3 ${dark ? 'border-peach/20' : 'border-ink/15'}`}>
                {stats.map((s) => (
                  <div key={s.l}>
                    <dt className={`font-display text-3xl md:text-4xl ${dark ? 'text-cream' : 'text-ink'}`}>{s.k}</dt>
                    <dd className={`mt-1 text-[10px] uppercase tracking-[0.2em] ${dark ? 'text-cream/40' : 'text-plum/60'}`}>
                      {s.l}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          )}

          {href && hrefLabel && (
            <Reveal delay={0.3}>
              <Link
                href={href}
                className={`tap-sm mt-9 w-fit items-center gap-2 border-b pb-1 text-[11px] uppercase tracking-[0.2em] transition-colors ${
                  dark ? 'border-cream/30 text-cream hover:border-peach hover:text-peach' : 'border-ink/25 text-ink hover:border-rose hover:text-rose'
                }`}
              >
                {hrefLabel} <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Reveal>
          )}
        </div>

        <Reveal delay={0.1} className={dark ? '' : 'order-1 lg:order-2'}>
          <figure className="relative">
            <div className={`relative overflow-hidden rounded-[24px] border ${dark ? 'border-peach/25' : 'border-ink/10'} shadow-[0_50px_120px_-50px_rgba(8,28,39,0.85)]`}>
              <VideoLoop
                src={video}
                poster={poster}
                label={videoLabel}
                className="aspect-[4/5] w-full md:aspect-[5/6]"
                mediaClassName="object-center"
              />
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-deep/55 via-transparent to-transparent" />
              <span className="pointer-events-none absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-ink-deep/70 px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] text-cream/80 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-peach" aria-hidden="true" /> On our bench · Guwahati
              </span>
            </div>
            <figcaption className={`mt-3 text-[10px] uppercase tracking-[0.18em] ${dark ? 'text-cream/35' : 'text-plum/50'}`}>
              {videoLabel ?? 'Footage from the F-Ex repair bench'}
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
