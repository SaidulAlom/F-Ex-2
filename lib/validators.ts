import { z } from 'zod';

/* ---------------- shared primitives ---------------- */
const phone = z
  .string()
  .trim()
  .regex(/^(\+?91[-\s]?)?[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number');
const optionalEmail = z.string().trim().email('Enter a valid email').optional().or(z.literal(''));
const honeypot = z.string().max(0, 'Bot detected').optional().or(z.literal(''));

/* ---------------- auth ---------------- */
export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8, 'Minimum 8 characters'),
});

/* ---------------- leads ---------------- */
export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please tell us your name').max(80),
  phone,
  email: optionalEmail,
  subject: z.string().trim().max(120).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'A little more detail, please').max(2000),
  branch: z.enum(['lokhra', 'basistha']).default('lokhra'),
  website: honeypot, // honeypot
});

export const reservationSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone,
  email: optionalEmail,
  productSlug: z.string().trim().min(1),
  productId: z.string().trim().optional().or(z.literal('')),
  productName: z.string().trim().min(1).max(160),
  priceAtLead: z.coerce.number().optional().nullable(),
  branch: z.enum(['lokhra', 'basistha']).default('lokhra'),
  preferredSlot: z.string().trim().max(60).optional().or(z.literal('')),
  message: z.string().trim().max(600).optional().or(z.literal('')),
  website: honeypot,
});

export const repairSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone,
  email: optionalEmail,
  deviceModel: z.string().trim().min(2, 'Which phone is it?').max(120),
  repairType: z.enum(['screen', 'battery', 'motherboard', 'camera', 'speaker', 'fingerprint', 'other']),
  message: z.string().trim().max(1000).optional().or(z.literal('')),
  photos: z.array(z.string().url()).max(4).default([]),
  branch: z.enum(['lokhra', 'basistha']).default('lokhra'),
  website: honeypot,
});

export const sellSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone,
  email: optionalEmail,
  deviceModel: z.string().trim().min(2).max(120),
  condition: z.enum(['Like New', 'Excellent', 'Good', 'Fair']),
  expectedPrice: z.coerce.number().min(0).max(500000).optional(),
  message: z.string().trim().max(800).optional().or(z.literal('')),
  branch: z.enum(['lokhra', 'basistha']).default('lokhra'),
  website: honeypot,
});

export type LeadInput = z.infer<typeof reservationSchema>;

/* ---------------- admin: product ---------------- */
export const productSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(160)
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and dashes only'),
  brand: z.string().trim().min(1).max(60),
  category: z.enum(['new-phones', 'second-hand', 'accessories', 'repairs']),
  accessoryType: z
    .enum(['charger', 'case', 'earphones', 'powerbank', 'smartwatch', 'landline', 'other'])
    .optional(),
  description: z.string().trim().max(4000).optional().or(z.literal('')),
  highlights: z.array(z.string().trim().max(120)).max(8).default([]),
  price: z.coerce.number().min(0).nullable().optional(),
  mrp: z.coerce.number().min(0).nullable().optional(),
  emiFrom: z.coerce.number().min(0).nullable().optional(),
  ram: z.string().trim().max(20).optional().or(z.literal('')),
  storage: z.string().trim().max(20).optional().or(z.literal('')),
  colors: z.array(z.string().trim().max(30)).max(8).default([]),
  condition: z.enum(['New', 'Like New', 'Excellent', 'Good', 'Fair']),
  batteryHealth: z.coerce.number().min(0).max(100).nullable().optional(),
  warrantyMonths: z.coerce.number().min(0).max(36).default(0),
  images: z.array(z.string().url()).min(1, 'At least one image').max(10),
  hoverImage: z.string().url().optional().or(z.literal('')),
  branches: z.array(z.enum(['lokhra', 'basistha'])).min(1, 'Assign at least one branch'),
  status: z.enum(['available', 'reserved', 'sold']),
  featured: z.boolean().default(false),
  order: z.coerce.number().default(0),
  seoTitle: z.string().trim().max(70).optional().or(z.literal('')),
  seoDescription: z.string().trim().max(180).optional().or(z.literal('')),
});

export type ProductInput = z.infer<typeof productSchema>;

export const bannerSchema = z.object({
  title: z.string().trim().min(2).max(120),
  subtitle: z.string().trim().max(200).optional().or(z.literal('')),
  eyebrow: z.string().trim().max(40).optional().or(z.literal('')),
  image: z.string().url().optional().or(z.literal('')),
  ctaLabel: z.string().trim().max(30).optional().or(z.literal('')),
  ctaHref: z.string().trim().max(200).optional().or(z.literal('')),
  placement: z.enum(['hero', 'marquee', 'offers', 'category']),
  tone: z.enum(['peach', 'rose', 'plum', 'cream']),
  active: z.boolean().default(true),
  order: z.coerce.number().default(0),
});

export const testimonialSchema = z.object({
  name: z.string().trim().min(2).max(60),
  location: z.string().trim().max(60).optional().or(z.literal('')),
  rating: z.coerce.number().min(1).max(5),
  quote: z.string().trim().min(10).max(600),
  purchase: z.string().trim().max(120).optional().or(z.literal('')),
  branch: z.enum(['lokhra', 'basistha']),
  featured: z.boolean().default(true),
  order: z.coerce.number().default(0),
});

export const branchSchema = z.object({
  name: z.string().trim().min(2).max(120),
  addressLine1: z.string().trim().min(2).max(160),
  addressLine2: z.string().trim().max(160).optional().or(z.literal('')),
  locality: z.string().trim().max(80).optional().or(z.literal('')),
  city: z.string().trim().max(60).optional().or(z.literal('')),
  state: z.string().trim().max(60).optional().or(z.literal('')),
  pincode: z.string().trim().regex(/^\d{6}$/, '6-digit PIN'),
  phone: z.string().trim().min(10).max(16),
  phoneDisplay: z.string().trim().max(20).optional().or(z.literal('')),
  whatsapp: z.string().trim().max(16).optional().or(z.literal('')),
  opensAt: z.string().trim().regex(/^\d{2}:\d{2}$/),
  closesAt: z.string().trim().regex(/^\d{2}:\d{2}$/),
  hoursLabel: z.string().trim().max(40).optional().or(z.literal('')),
  mapQuery: z.string().trim().max(200).optional().or(z.literal('')),
  directionsLink: z.string().url().optional().or(z.literal('')),
  blurb: z.string().trim().max(500).optional().or(z.literal('')),
  active: z.boolean().default(true),
});

export const leadStatusSchema = z.object({
  status: z.enum(['new', 'contacted', 'won', 'lost', 'archived']),
  notes: z.string().trim().max(1000).optional(),
});

/** Filter params for the public catalogue (all optional, URL-synced). */
export const catalogueFiltersSchema = z.object({
  category: z.enum(['new-phones', 'second-hand', 'accessories']).optional(),
  brand: z.union([z.string(), z.array(z.string())]).optional(),
  min: z.coerce.number().optional(),
  max: z.coerce.number().optional(),
  condition: z.union([z.string(), z.array(z.string())]).optional(),
  availability: z.enum(['available', 'reserved', 'sold', 'all']).optional(),
  branch: z.enum(['lokhra', 'basistha']).optional(),
  type: z.string().optional(),
  q: z.string().max(80).optional(),
  sort: z.enum(['featured', 'price-asc', 'price-desc', 'newest']).optional(),
  price: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
});
export type CatalogueFilters = z.infer<typeof catalogueFiltersSchema>;
