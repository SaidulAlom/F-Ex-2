import { marqueeWords } from '@/lib/config';
import { Marquee } from '@/components/ui/marquee';

/** Two marquee strips running in opposite directions, plus an offer ticker. */
export function MarqueeStrip({ offer }: { offer?: string }) {
  return (
    <section aria-label="F-Ex Store highlights" className="relative z-10">
      <div className="border-y border-peach/20 bg-ink-deep/80">
        <Marquee items={marqueeWords} duration={44} variant="dark" />
        <div className="h-px bg-gradient-to-r from-transparent via-peach/30 to-transparent" />
        <Marquee items={[...marqueeWords].reverse()} duration={58} reverse variant="outline" />
      </div>
      {offer && (
        <div className="bg-peach/10 py-2 text-center text-[10px] uppercase tracking-[0.24em] text-peach">
          {offer}
        </div>
      )}
    </section>
  );
}
