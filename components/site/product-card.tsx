'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { MessageCircle } from 'lucide-react';
import type { ProductCardData } from '@/types';
import { cdn } from '@/lib/image';
import { cn, formatINR, whatsappLink } from '@/lib/utils';
import { site } from '@/lib/config';
import { track } from '@/lib/analytics';

/**
 * Product card: 3D tilt, peach border sweep, image swap on hover, floating
 * price tag and a magnetic WhatsApp button. All motion is transform/opacity.
 */
export function ProductCard({
  product,
  priority = false,
  className = '',
  index = 0,
}: {
  product: ProductCardData;
  priority?: boolean;
  className?: string;
  index?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const reduced = useReducedMotion();

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), { stiffness: 180, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-9, 9]), { stiffness: 180, damping: 18 });

  const image = cdn(product.images[0] ?? '', 800);
  const hover = cdn(product.hoverImage || product.images[1] || '', 800);
  const onSale = product.mrp && product.price && product.mrp > product.price;
  const sold = product.status === 'sold';

  return (
    <motion.article
      ref={ref}
      onPointerMove={(e) => {
        if (reduced || e.pointerType !== 'mouse') return;
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        mx.set(0);
        my.set(0);
      }}
      style={{ rotateX: reduced ? 0 : rx, rotateY: reduced ? 0 : ry, transformPerspective: 1000 }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.7, delay: Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-peach/20 bg-plum/25 backdrop-blur-sm transition-colors duration-500 hover:border-peach/60',
        className
      )}
    >
      {/* peach border sweep */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'linear-gradient(120deg, transparent 20%, rgba(217,155,127,0.35) 45%, transparent 70%)',
          backgroundSize: '250% 100%',
          mixBlendMode: 'overlay',
          animation: hovered && !reduced ? 'shimmer 2.4s linear infinite' : undefined,
        }}
      />

      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden" data-cursor="View">
        {image ? (
          <>
            <Image
              src={image}
              alt={`${product.name} — ${product.condition} condition at F-Ex Store Guwahati`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              className={cn(
                'object-cover transition-all duration-700 ease-luxe',
                hover ? 'scale-105 opacity-0' : 'scale-100 opacity-100',
                sold && 'grayscale'
              )}
            />
            {hover && (
              <Image
                src={hover}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-luxe group-hover:scale-105"
                aria-hidden="true"
              />
            )}
          </>
        ) : (
          <div className="grid h-full place-items-center bg-ink/50 text-xs text-cream/40">No image</div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-deep/85 via-transparent to-transparent" />

        {/* ribbons + badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.condition !== 'New' && (
            <span className="rounded-full bg-ink-deep/80 px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] text-peach backdrop-blur">
              {product.condition === 'Like New' ? 'Certified Pre-Owned' : `${product.condition} grade`}
            </span>
          )}
          {onSale && (
            <span className="rounded-full bg-peach px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] text-ink-deep">
              Save {formatINR((product.mrp ?? 0) - (product.price ?? 0))}
            </span>
          )}
        </div>

        {product.status !== 'available' && (
          <span
            className={cn(
              'absolute right-3 top-3 rounded-sm px-2.5 py-1 text-[9px] uppercase tracking-[0.18em]',
              sold ? 'bg-ink-deep text-cream/70' : 'bg-rose text-ink-deep'
            )}
          >
            {sold ? 'Sold' : 'Reserved'}
          </span>
        )}

        {/* floating price tag */}
        <div className="absolute bottom-3 left-3 rounded-full border border-peach/40 bg-ink-deep/80 px-3 py-1.5 backdrop-blur transition-transform duration-500 group-hover:-translate-y-1">
          <span className="font-display text-base text-peach">{formatINR(product.price)}</span>
        </div>
      </Link>

      <div className="relative z-10 flex flex-1 flex-col gap-1 p-4">
        <p className="text-[9px] uppercase tracking-[0.22em] text-cream/40">{product.brand}</p>
        <Link href={`/product/${product.slug}`} className="tap-sm w-fit font-display text-lg leading-tight text-cream hover:text-peach">
          {product.name}
        </Link>
        <p className="mt-0.5 text-[11px] text-cream/45">
          {[product.ram, product.storage, product.condition].filter(Boolean).join(' · ')}
          {product.batteryHealth ? ` · ${product.batteryHealth}% battery` : ''}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="text-[9px] uppercase tracking-[0.16em] text-cream/30">
            {product.branches.map((b) => (b === 'lokhra' ? 'Lokhra' : 'Basistha')).join(' · ')}
          </span>
          <a
            href={whatsappLink({
              model: product.name,
              price: formatINR(product.price),
              url: `${site.url}/product/${product.slug}`,
            })}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track.whatsapp('product_card', product.name)}
            data-cursor="WhatsApp"
            aria-label={`Enquire about ${product.name} on WhatsApp`}
            className="group/wa inline-flex items-center gap-1.5 rounded-full border border-peach/40 px-3 py-1.5 text-[9px] uppercase tracking-[0.14em] text-peach transition-all duration-300 hover:bg-peach hover:text-ink-deep active:scale-95"
          >
            <MessageCircle className="h-3 w-3" />
            Enquire
          </a>
        </div>
      </div>
    </motion.article>
  );
}
