/**
 * F-Ex Store — single source of truth for business data.
 * Everything a non-developer might need to change (phones, WhatsApp numbers,
 * social links, opening hours) lives here. Prices/stock live in MongoDB.
 *
 * TODO markers = values the owner must confirm before launch.
 */

export const site = {
  name: 'F-Ex Store',
  legalName: 'F Ex Guwahati Cell Store',
  shortName: 'F-Ex',
  tagline: 'Own the Extraordinary.',
  description:
    'New and pre-owned smartphones, accessories and expert repairs in Guwahati. Two branches — Lokhra and Basistha — open every day till 10 PM with same-day delivery and EMI.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fexstore.in', // TODO: real domain
  established: 2024,
  locale: 'en_IN',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  // Primary contact used by the sticky bars & footer
  phone: '+918511822537', // TODO: confirm primary sales line
  whatsapp: '918511822537', // digits only, country code first
  email: 'hello@fexstore.in', // TODO: real inbox
  // WhatsApp prefilled-text template used by every enquiry button.
  // {model} {price} {url} are substituted at runtime.
  whatsappTemplate:
    "Hi F-Ex Store! I'm interested in the *{model}* ({price}). Could you share availability and the best price?\n\n{url}",
  socials: {
    instagram: 'https://instagram.com/', // TODO: real handle
    facebook: 'https://facebook.com/', // TODO
    google: 'https://maps.google.com/', // TODO: Google Business Profile (reviews link)
    youtube: '', // TODO (optional)
  },
  googleReviewsUrl: 'https://maps.google.com/', // TODO: reviews URL per branch
} as const;

export type BranchSlug = 'lokhra' | 'basistha';

export type BranchConfig = {
  slug: BranchSlug;
  name: string;
  displayName: string;
  shortName: string;
  address: {
    line1: string;
    line2: string;
    locality: string;
    city: string;
    state: string;
    pincode: string;
    landmark: string;
  };
  phone: string; // E.164 for tel: + wa.me needs digits only
  phoneDisplay: string;
  whatsapp: string; // digits only
  hours: { opens: string; closes: string; label: string; days: string };
  geo: { lat: number; lng: number };
  mapEmbedQuery: string;
  mapLink: string;
  directionsLink: string;
  image: string;
  blurb: string;
  services: string[];
};

export const branches: BranchConfig[] = [
  {
    slug: 'lokhra',
    name: 'F-Ex Store — Lokhra',
    displayName: 'Lokhra',
    shortName: 'Lokhra',
    address: {
      line1: 'Beside Sarusajai Stadium',
      line2: 'Near Paramount Grande, Lokhra Road',
      locality: 'Lokhra',
      city: 'Guwahati',
      state: 'Assam',
      pincode: '781034',
      landmark: 'Sarusajai Stadium',
    },
    phone: '+918511822537',
    phoneDisplay: '+91 85118 22537',
    whatsapp: '918511822537',
    hours: { opens: '10:30', closes: '22:00', label: '10:30 AM – 10:00 PM', days: 'Mon – Sun' },
    geo: { lat: 26.1155, lng: 91.7698 }, // TODO: verify exact pin
    mapEmbedQuery: 'F-Ex Store Lokhra, Sarusajai Stadium, Guwahati 781034',
    mapLink: 'https://www.google.com/maps/search/?api=1&query=F-Ex+Store+Lokhra+Guwahati',
    directionsLink: 'https://www.google.com/maps/dir/?api=1&destination=F-Ex+Store+Lokhra+Guwahati',
    image: '/images/store-interior.jpg',
    blurb:
      'Our flagship counter beside Sarusajai Stadium. The full new-phone wall, the pre-owned vault and the repair bench all under one roof.',
    services: ['New phones', 'Pre-owned', 'Repairs', 'EMI desk', 'Same-day delivery'],
  },
  {
    slug: 'basistha',
    name: 'F Ex Guwahati Cell Store — Basistha',
    displayName: 'Basistha',
    shortName: 'Basistha',
    address: {
      line1: 'Brahmaputra Apartment, A G Office',
      line2: 'Lakhi Mandir, Basistha',
      locality: 'Basistha',
      city: 'Guwahati',
      state: 'Assam',
      pincode: '781029',
      landmark: 'Lakhi Mandir',
    },
    phone: '+910000000000', // TODO: Basistha phone number (placeholder)
    phoneDisplay: '+91 00000 00000', // TODO
    whatsapp: '918511822537', // TODO: dedicated Basistha WhatsApp, falls back to Lokhra
    hours: { opens: '10:00', closes: '22:00', label: '10:00 AM – 10:00 PM', days: 'Mon – Sun' },
    geo: { lat: 26.1005, lng: 91.7908 }, // TODO: verify exact pin
    mapEmbedQuery: 'F Ex Guwahati Cell Store, Brahmaputra Apartment, Basistha, Guwahati 781029',
    mapLink: 'https://www.google.com/maps/search/?api=1&query=F+Ex+Guwahati+Cell+Store+Basistha',
    directionsLink: 'https://www.google.com/maps/dir/?api=1&destination=F+Ex+Guwahati+Cell+Store+Basistha',
    image: '/images/photo-1556742049-0cfed4f6a45d.jpg',
    blurb:
      'Our neighbourhood store near Lakhi Mandir. Quick repairs, accessories and a curated pre-owned shelf — with pickup arranged across Basistha.',
    services: ['New phones', 'Pre-owned', 'Accessories', 'Repairs', 'Pickup'],
  },
];

export const getBranch = (slug: string) => branches.find((b) => b.slug === slug);

/** IST opening-hours helper. Returns true when the branch is open right now. */
export function isBranchOpen(branch: BranchConfig, now: Date = new Date()): boolean {
  // Convert "now" into IST wall-clock time regardless of server locale.
  const istMs = now.getTime() + (330 + now.getTimezoneOffset()) * 60_000;
  const ist = new Date(istMs);
  const minutes = ist.getHours() * 60 + ist.getMinutes();
  const [oH, oM] = branch.hours.opens.split(':').map(Number);
  const [cH, cM] = branch.hours.closes.split(':').map(Number);
  return minutes >= oH * 60 + oM && minutes < cH * 60 + cM;
}

/** Sticker copy used across the site. */
export const stickers = {
  certified: 'Certified Pre-Owned',
  established: 'Est. 2024',
  genuine: 'Genuine Parts',
  openTill: 'Open Till 10 PM',
  sameDay: 'Same-Day Delivery',
} as const;

/** Trust badges for the promise sections. */
export const promises = [
  {
    number: '01',
    title: 'Authentic',
    kicker: 'Every unit, verified',
    body: 'IMEI checked against the manufacturer database, box and invoice matched, accessories counted. Nothing grey-market ever reaches our shelf.',
  },
  {
    number: '02',
    title: 'Certified',
    kicker: 'A grade, not a guess',
    body: 'Pre-owned phones pass a 32-point inspection. Battery health, screen uniformity, cameras, sensors and charging are documented on the tag.',
  },
  {
    number: '03',
    title: 'Cared For',
    kicker: 'Service after the sale',
    body: 'Warranty on selected phones, genuine parts on repairs, and a human on WhatsApp who actually answers until 10 PM, every day.',
  },
] as const;

export const repairServices = [
  { slug: 'screen', title: 'Screen Replacement', price: 'From ₹1,499', detail: 'Original and OEM-grade panels, 45–90 minutes on most models, colour-calibrated after fitting.' },
  { slug: 'battery', title: 'Battery Service', price: 'From ₹899', detail: 'Genuine cells with health report before and after. Free diagnostics at both branches.' },
  { slug: 'motherboard', title: 'Motherboard Repair', price: 'On diagnosis', detail: 'Micro-soldering, water damage, no-boot and charging IC faults handled in-house.' },
  { slug: 'camera', title: 'Camera & Speaker', price: 'From ₹999', detail: 'Blurry optics, dead speakers, distorted earpieces — replaced with tested modules.' },
  { slug: 'fingerprint', title: 'Fingerprint Sensor', price: 'From ₹1,199', detail: 'Sensor, flex and calibration restored so biometrics work exactly as they should.' },
] as const;

export const paymentMethods = [
  { name: 'Cash', note: 'At both branches' },
  { name: 'UPI', note: 'Paytm · PhonePe' },
  { name: 'Cards', note: 'Visa · MasterCard · RuPay' },
  { name: 'EMI', note: 'No-cost on selected models' },
] as const;

export const brandStatement = {
  pullQuote:
    'A phone is the most personal object we own. It deserves to be chosen the way jewellery is chosen — slowly, in good light, by someone who knows what they are looking at.',
  body: 'F-Ex Store opened in 2024 with one counter, a repair bench and an unreasonable standard for what a phone shop could feel like. Today, two branches in Guwahati carry new handsets from Apple and Vivo, a vault of certified pre-owned flagships, accessories that are actually worth their price, and a repair atelier that has resurrected more phones than we can count.',
  signature: 'The F-Ex family, Guwahati',
} as const;

/** Navigation used by header + footer. */
export const navLinks = [
  { href: '/new-phones', label: 'New Phones' },
  { href: '/second-hand', label: 'Pre-Owned' },
  { href: '/accessories', label: 'Accessories' },
  { href: '/repairs', label: 'Repairs' },
  { href: '/emi-payments', label: 'EMI' },
  { href: '/delivery', label: 'Delivery' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

/** Marquee copy — two strips run in opposite directions. */
export const marqueeWords = [
  'iPHONE',
  'VIVO',
  'PRE-OWNED',
  'EMI AVAILABLE',
  'SAME-DAY DELIVERY',
  'EXPERT REPAIRS',
  'GENUINE PARTS',
  'OPEN TILL 10 PM',
] as const;

export const priceRanges = [
  { label: 'Under ₹10k', value: '0-10000' },
  { label: '₹10k – ₹20k', value: '10000-20000' },
  { label: '₹20k – ₹40k', value: '20000-40000' },
  { label: '₹40k+', value: '40000-999999' },
] as const;

/** Default catalogue taxonomy. Admin can add more via products. */
export const brands = ['Apple', 'Vivo', 'Samsung', 'Redmi', 'Realme', 'OnePlus', 'Oppo', 'Nothing'] as const;

export const categories = [
  { slug: 'new-phones', label: 'New Phones', href: '/new-phones' },
  { slug: 'second-hand', label: 'Pre-Owned', href: '/second-hand' },
  { slug: 'accessories', label: 'Accessories & Gadgets', href: '/accessories' },
  { slug: 'repairs', label: 'Repairs', href: '/repairs' },
] as const;

export const conditionGrades = ['New', 'Like New', 'Excellent', 'Good', 'Fair'] as const;
