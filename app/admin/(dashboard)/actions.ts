'use server';

import { revalidateTag } from 'next/cache';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { Product } from '@/models/Product';
import { Banner } from '@/models/Banner';
import { Testimonial } from '@/models/Testimonial';
import { Branch } from '@/models/Branch';
import { Lead } from '@/models/Lead';
import { TAGS } from '@/lib/queries';
import {
  bannerSchema,
  branchSchema,
  leadStatusSchema,
  productSchema,
  testimonialSchema,
} from '@/lib/validators';

async function requireStaff() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');
  return session;
}

type ActionResult = { ok: true } | { ok: false; error: string };

/* ------------------------------- products ------------------------------- */
export async function saveProduct(input: unknown, id?: string): Promise<ActionResult> {
  await requireStaff();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid product data' };
  }
  await dbConnect();
  try {
    if (id) {
      await Product.findByIdAndUpdate(id, parsed.data, { runValidators: true });
    } else {
      await Product.create(parsed.data);
    }
    revalidateTag(TAGS.products); // storefront updates instantly
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error && err.message.includes('duplicate') ? 'That slug is already used.' : 'Could not save the product.';
    return { ok: false, error: message };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireStaff();
  await dbConnect();
  await Product.findByIdAndDelete(id);
  revalidateTag(TAGS.products);
  return { ok: true };
}

export async function setProductStatus(id: string, status: 'available' | 'reserved' | 'sold'): Promise<ActionResult> {
  await requireStaff();
  await dbConnect();
  await Product.findByIdAndUpdate(id, { status });
  revalidateTag(TAGS.products);
  return { ok: true };
}

export async function toggleProductFeatured(id: string, featured: boolean): Promise<ActionResult> {
  await requireStaff();
  await dbConnect();
  await Product.findByIdAndUpdate(id, { featured });
  revalidateTag(TAGS.products);
  return { ok: true };
}

/* -------------------------------- leads --------------------------------- */
export async function updateLeadStatus(input: unknown, id: string): Promise<ActionResult> {
  await requireStaff();
  const parsed = leadStatusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Invalid status' };
  await dbConnect();
  await Lead.findByIdAndUpdate(id, parsed.data);
  revalidateTag(TAGS.leads);
  return { ok: true };
}

export async function deleteLead(id: string): Promise<ActionResult> {
  const session = await requireStaff();
  if (session.user.role !== 'owner') return { ok: false, error: 'Owner only' };
  await dbConnect();
  await Lead.findByIdAndDelete(id);
  revalidateTag(TAGS.leads);
  return { ok: true };
}

/* -------------------------------- banners -------------------------------- */
export async function saveBanner(input: unknown, id?: string): Promise<ActionResult> {
  await requireStaff();
  const parsed = bannerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid banner' };
  await dbConnect();
  if (id) await Banner.findByIdAndUpdate(id, parsed.data, { runValidators: true });
  else await Banner.create(parsed.data);
  revalidateTag(TAGS.banners);
  return { ok: true };
}

export async function toggleBanner(id: string, active: boolean): Promise<ActionResult> {
  await requireStaff();
  await dbConnect();
  await Banner.findByIdAndUpdate(id, { active });
  revalidateTag(TAGS.banners);
  return { ok: true };
}

export async function deleteBanner(id: string): Promise<ActionResult> {
  await requireStaff();
  await dbConnect();
  await Banner.findByIdAndDelete(id);
  revalidateTag(TAGS.banners);
  return { ok: true };
}

/* ------------------------------ testimonials ----------------------------- */
export async function saveTestimonial(input: unknown, id?: string): Promise<ActionResult> {
  await requireStaff();
  const parsed = testimonialSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid testimonial' };
  await dbConnect();
  if (id) await Testimonial.findByIdAndUpdate(id, parsed.data, { runValidators: true });
  else await Testimonial.create(parsed.data);
  revalidateTag(TAGS.testimonials);
  return { ok: true };
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  await requireStaff();
  await dbConnect();
  await Testimonial.findByIdAndDelete(id);
  revalidateTag(TAGS.testimonials);
  return { ok: true };
}

/* -------------------------------- branches ------------------------------- */
export async function saveBranch(input: unknown, slug: string): Promise<ActionResult> {
  const session = await requireStaff();
  if (session.user.role !== 'owner') return { ok: false, error: 'Owner only' };
  const parsed = branchSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid branch details' };
  await dbConnect();
  await Branch.findOneAndUpdate({ slug }, { ...parsed.data, slug }, { upsert: true, runValidators: true });
  revalidateTag(TAGS.branches);
  return { ok: true };
}
