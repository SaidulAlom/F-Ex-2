'use client';

import { useEffect, useRef, useState } from 'react';

type VideoLoopProps = {
  /** Self-hosted mp4 under /public. Never a remote URL — see README §13. */
  src: string;
  /** Poster frame, shown before playback and instead of playback on reduced motion. */
  poster: string;
  className?: string;
  /** Extra classes for the <video> element itself (object-position etc.). */
  mediaClassName?: string;
  /** Screen-reader description. Omit for purely decorative beds. */
  label?: string;
  /** Start fetching the file immediately (use only for above-the-fold beds). */
  eager?: boolean;
};

/**
 * Muted, looping background video that behaves itself.
 *
 * - Decorative by default (`aria-hidden`), so it is never a tab stop.
 * - `IntersectionObserver` pauses it the moment it leaves the viewport — no
 *   decode cycles wasted while somebody reads the rest of the page.
 * - `prefers-reduced-motion: reduce` (and Data Saver) keep the poster frame and
 *   never start playback; every bed is designed to read fine as a still.
 * - The clip fades in only once it is actually playing, so the first paint is
 *   the poster rather than a black rectangle.
 */
export function VideoLoop({ src, poster, className = '', mediaClassName = '', label, eager = false }: VideoLoopProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const canPlay = () => !reduced.matches && !connection?.saveData;

    // Stay on the poster frame where motion is unwanted.
    if (!canPlay()) {
      video.pause();
      return;
    }

    let inView = false;

    const sync = () => {
      if (inView && canPlay()) {
        void video.play().catch(() => {
          /* autoplay blocked or element detached — poster stays, no error surfaced */
        });
      } else {
        video.pause();
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? false;
        sync();
      },
      { threshold: 0.2 },
    );
    io.observe(video);

    // React to a live OS-level change ("reduce motion" toggled mid-session).
    const onPref = () => {
      setPlaying(false);
      sync();
    };
    reduced.addEventListener('change', onPref);

    // Do not keep decoding a tab nobody is looking at.
    const onVisibility = () => {
      if (document.hidden) video.pause();
      else sync();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      io.disconnect();
      reduced.removeEventListener('change', onPref);
      document.removeEventListener('visibilitychange', onVisibility);
      video.pause();
    };
  }, []);

  return (
    // The caller owns position and size (e.g. `absolute inset-0`); the inner
    // frame is the positioned box that the poster overlay sits in.
    <div className={className} aria-hidden={label ? undefined : 'true'}>
      <div className="relative h-full w-full overflow-hidden">
        <video
          ref={videoRef}
          className={`h-full w-full object-cover transition-opacity duration-700 ${
            playing ? 'opacity-100' : 'opacity-0'
          } ${mediaClassName}`}
          poster={poster}
          muted
          loop
          playsInline
          preload={eager ? 'auto' : 'metadata'}
          disablePictureInPicture
          aria-label={label}
          tabIndex={-1}
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        >
          <source src={src} type="video/mp4" />
        </video>

        {/* Poster underneath, so reduced-motion and slow connections still see a frame. */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${
            playing ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ backgroundImage: `url(${poster})` }}
        />
      </div>
    </div>
  );
}
