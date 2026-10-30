/**
 * Seed script — 12 products, 2 branches, 3 banners, 5 testimonials, 1 owner.
 * Run:  npm run seed           (loads .env.local)
 *
 * Safe to re-run: it upserts by slug/email so existing leads are never touched.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { demoProducts } from '../lib/demo-data';
import { branches as branchConfig } from '../lib/config';
import { Product } from '../models/Product';
import { Branch } from '../models/Branch';
import { Banner } from '../models/Banner';
import { Testimonial } from '../models/Testimonial';
import { User } from '../models/User';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('✖ MONGODB_URI is not set. Copy .env.example to .env.local first.');
  process.exit(1);
}

const ownerEmail = process.env.SEED_OWNER_EMAIL ?? 'owner@fexstore.in';
const ownerPassword = process.env.SEED_OWNER_PASSWORD ?? 'ChangeMe!2024';
const staffEmail = process.env.SEED_STAFF_EMAIL ?? 'basistha@fexstore.in';
const staffPassword = process.env.SEED_STAFF_PASSWORD ?? 'ChangeMe!2024';

async function main() {
  console.log('→ Connecting to MongoDB…');
  await mongoose.connect(MONGODB_URI!, { maxPoolSize: 5 });

  /* ------------------------------- products ------------------------------ */
  for (const p of demoProducts) {
    await Product.findOneAndUpdate(
      { slug: p.slug },
      {
        $set: {
          ...p,
          seoTitle: `${p.name} — F-Ex Store Guwahati`,
          seoDescription: p.description.slice(0, 155),
        },
      },
      { upsert: true, runValidators: true, new: true }
    );
  }
  console.log(`✓ Products: ${demoProducts.length} upserted`);

  /* ------------------------------- branches ------------------------------ */
  for (const b of branchConfig) {
    await Branch.findOneAndUpdate(
      { slug: b.slug },
      {
        $set: {
          slug: b.slug,
          name: b.name,
          addressLine1: b.address.line1,
          addressLine2: b.address.line2,
          locality: b.address.locality,
          city: b.address.city,
          state: b.address.state,
          pincode: b.address.pincode,
          phone: b.phone,
          phoneDisplay: b.phoneDisplay,
          whatsapp: b.whatsapp,
          opensAt: b.hours.opens,
          closesAt: b.hours.closes,
          hoursLabel: b.hours.label,
          mapQuery: b.mapEmbedQuery,
          directionsLink: b.directionsLink,
          image: b.image,
          blurb: b.blurb,
          active: true,
        },
      },
      { upsert: true, runValidators: true }
    );
  }
  console.log(`✓ Branches: ${branchConfig.length} upserted`);

  /* -------------------------------- banners ------------------------------ */
  const banners = [
    {
      title: 'iPhone 15 Pro — now on the counter',
      subtitle: 'Titanium, sealed, with Apple India warranty. Walk in and hold it.',
      eyebrow: 'New arrival',
      image: '/images/photo-1695048133142-1a20484d2569.jpg',
      ctaLabel: 'See the iPhone wall',
      ctaHref: '/new-phones?brand=Apple',
      placement: 'hero',
      tone: 'peach',
      order: 0,
      active: true,
    },
    {
      title: 'Certified pre-owned flagships from ₹18,999',
      subtitle: '32-point inspection, battery health on the tag, 6-month warranty on selected phones.',
      eyebrow: 'Pre-owned vault',
      image: '/images/photo-1592750475338-74b7b21085ab.jpg',
      ctaLabel: 'Browse pre-owned',
      ctaHref: '/second-hand',
      placement: 'offers',
      tone: 'rose',
      order: 1,
      active: true,
    },
    {
      title: 'No-cost EMI on selected models',
      subtitle: 'Visa, MasterCard and RuPay accepted. Approvals in minutes, in-store.',
      eyebrow: 'Pay your way',
      image: '/images/photo-1556742049-0cfed4f6a45d.jpg',
      ctaLabel: 'EMI details',
      ctaHref: '/emi-payments',
      placement: 'marquee',
      tone: 'plum',
      order: 2,
      active: true,
    },
  ];
  await Banner.deleteMany({});
  await Banner.insertMany(banners);
  console.log(`✓ Banners: ${banners.length} inserted`);

  /* ------------------------------ testimonials --------------------------- */
  const testimonials = [
    {
      name: 'Anurag Deka',
      location: 'Six Mile',
      rating: 5,
      quote:
        'Bought a pre-owned iPhone 13 here. They showed me the battery health on the phone itself before I paid, and the warranty card was already filled out. Never felt rushed.',
      purchase: 'iPhone 13 · Certified Pre-Owned',
      branch: 'lokhra',
    },
    {
      name: 'Priyanka Sharma',
      location: 'Basistha',
      rating: 5,
      quote:
        'My Vivo screen cracked on a Sunday evening. They replaced it in under an hour and I still made it home for dinner. Fair price, genuine part.',
      purchase: 'Vivo screen replacement',
      branch: 'basistha',
    },
    {
      name: 'Rahul Bora',
      location: 'Zoo Road',
      rating: 5,
      quote:
        'EMI was sorted in ten minutes flat. The staff explained the paperwork instead of just pushing the most expensive model.',
      purchase: 'Samsung Galaxy S24 Ultra · EMI',
      branch: 'lokhra',
    },
    {
      name: 'Meghna Das',
      location: 'Sarusajai',
      rating: 4,
      quote:
        'Same-day delivery to my office near the stadium. The phone came sealed with the case fitted, exactly as promised on WhatsApp.',
      purchase: 'Redmi Note 13 Pro',
      branch: 'lokhra',
    },
    {
      name: 'Farhan Ahmed',
      location: 'Hatigaon',
      rating: 5,
      quote:
        'They diagnosed my dead motherboard for free and told me honestly that repairing it was not worth it. Then gave me a fair exchange value against a new phone.',
      purchase: 'Motherboard diagnosis · Exchange',
      branch: 'basistha',
    },
  ];
  await Testimonial.deleteMany({});
  await Testimonial.insertMany(testimonials.map((t, i) => ({ ...t, featured: true, order: i })));
  console.log(`✓ Testimonials: ${testimonials.length} inserted`);

  /* --------------------------------- users ------------------------------- */
  const existingOwner = await User.findOne({ email: ownerEmail.toLowerCase() });
  if (existingOwner) {
    console.log(`• Owner ${ownerEmail} already exists — password left unchanged`);
  } else {
    await User.create({
      name: 'F-Ex Owner',
      email: ownerEmail.toLowerCase(),
      password: ownerPassword,
      role: 'owner',
      branch: 'all',
    });
    console.log(`✓ Owner created: ${ownerEmail} / ${ownerPassword}  ← change this immediately`);
  }

  const existingStaff = await User.findOne({ email: staffEmail.toLowerCase() });
  if (!existingStaff) {
    await User.create({
      name: 'Basistha Counter',
      email: staffEmail.toLowerCase(),
      password: staffPassword,
      role: 'branchStaff',
      branch: 'basistha',
    });
    console.log(`✓ Branch staff created: ${staffEmail} / ${staffPassword}`);
  }

  console.log('\nDone. Sign in at /admin/login');
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('✖ Seed failed:', err);
  await mongoose.disconnect();
  process.exit(1);
});
