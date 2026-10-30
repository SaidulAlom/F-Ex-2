import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { site } from './config';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** ₹ formatting without hydration mismatch (always en-IN, no decimals). */
export function formatINR(value?: number | null): string {
  if (value === null || value === undefined) return 'Call for price';
  if (!Number.isFinite(value) || value <= 0) return 'Call for price';
  return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value)}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/** Build the pre-filled WhatsApp link for a product enquiry. */
export function whatsappLink(opts: { model: string; price?: string; url?: string; phone?: string }) {
  const { model, price = 'price on request', url = '', phone = site.whatsapp } = opts;
  const text = site.whatsappTemplate
    .replace('{model}', model)
    .replace('{price}', price)
    .replace('{url}', url);
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function telLink(phone: string) {
  return `tel:${phone.replace(/\s+/g, '')}`;
}

/** "1.2 km away" style formatting for maps links (kept simple on purpose). */
export function fullAddress(a: {
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}) {
  return [a.line1, a.line2, `${a.city} ${a.pincode}`, a.state].filter(Boolean).join(', ');
}

export function cnDate(d: string | Date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(d));
}

/** Clamp helper for animation maths. */
export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Reads ?key from a URLSearchParams-ish object. */
export function parsePriceRange(range?: string | null): { min?: number; max?: number } {
  if (!range) return {};
  const [min, max] = range.split('-').map(Number);
  return { min: Number.isFinite(min) ? min : undefined, max: Number.isFinite(max) ? max : undefined };
}
