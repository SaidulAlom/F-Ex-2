import type { Metadata } from 'next';
import { branches, site } from './config';

export const defaultOgImage = '/images/photo-1511707171634-5f897ff02aa9.jpg';

export function buildMetadata(opts: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const { title, description = site.description, path = '/', image = defaultOgImage, noIndex } = opts;
  const url = `${site.url}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: 'website',
      url,
      siteName: site.name,
      title: `${title} | ${site.name}`,
      description,
      locale: 'en_IN',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${site.name}`,
      description,
      images: [image],
    },
  };
}

/** LocalBusiness JSON-LD, one node per branch + an organisation node. */
export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${site.url}/#organization`,
        name: site.name,
        legalName: site.legalName,
        url: site.url,
        logo: `${site.url}/logo.svg`,
        foundingDate: String(site.established),
        sameAs: Object.values(site.socials).filter(Boolean),
      },
      ...branches.map((b) => ({
        '@type': 'MobilePhoneStore',
        '@id': `${site.url}/branches/${b.slug}#store`,
        name: b.name,
        parentOrganization: { '@id': `${site.url}/#organization` },
        image: b.image,
        url: `${site.url}/branches/${b.slug}`,
        telephone: b.phone,
        priceRange: '₹₹',
        currenciesAccepted: 'INR',
        paymentAccepted: 'Cash, UPI, Credit Card, Debit Card, EMI',
        address: {
          '@type': 'PostalAddress',
          streetAddress: `${b.address.line1}, ${b.address.line2}`,
          addressLocality: b.address.locality,
          addressRegion: b.address.state,
          postalCode: b.address.pincode,
          addressCountry: 'IN',
        },
        geo: { '@type': 'GeoCoordinates', latitude: b.geo.lat, longitude: b.geo.lng },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: b.hours.opens,
          closes: b.hours.closes,
        },
        areaServed: { '@type': 'City', name: 'Guwahati' },
        makesOffer: [
          'New smartphones',
          'Certified pre-owned smartphones',
          'Mobile accessories',
          'Screen replacement',
          'Battery service',
          'Motherboard repair',
          'EMI on selected phones',
        ].map((name) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name } })),
      })),
    ],
  };
}

export function productJsonLd(p: {
  name: string;
  description: string;
  images: string[];
  brand: string;
  sku: string;
  price: number | null;
  condition: string;
  slug: string;
  availability: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    image: p.images,
    sku: p.sku,
    brand: { '@type': 'Brand', name: p.brand },
    itemCondition:
      p.condition === 'New' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
    offers: {
      '@type': 'Offer',
      url: `${site.url}/product/${p.slug}`,
      priceCurrency: 'INR',
      price: p.price ?? undefined,
      availability:
        p.availability === 'available'
          ? 'https://schema.org/InStock'
          : p.availability === 'reserved'
            ? 'https://schema.org/LimitedAvailability'
            : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: site.name },
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${site.url}${it.href}`,
    })),
  };
}
