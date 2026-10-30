import type { Metadata, Viewport } from 'next';
import { Bodoni_Moda, Sora, Cormorant_Garamond, IBM_Plex_Mono, Schibsted_Grotesk } from 'next/font/google';
import './globals.css';
import { site } from '@/lib/config';
import { localBusinessJsonLd } from '@/lib/seo';
import { Analytics } from '@/components/ui/analytics';
import { SmoothScrollProvider } from '@/components/providers/smooth-scroll-provider';
import { ChromeGate } from '@/components/layout/chrome-gate';

const display = Bodoni_Moda({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
  adjustFontFallback: false, // Bodoni Moda has no metric override; avoids build warning
});

const sans = Sora({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

// the paper-machine microsite (§ home hero) — a squarer grotesk than Sora
const grotesk = Schibsted_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-grotesk',
  display: 'swap',
});

const script = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['italic'],
  variable: '--font-script',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline} Guwahati`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [
    'mobile shop Guwahati',
    'iPhone Guwahati',
    'second hand phones Guwahati',
    'mobile repair Guwahati',
    'F-Ex Store Lokhra',
    'F Ex Guwahati Cell Store Basistha',
    'EMI mobile Guwahati',
  ],
  authors: [{ name: site.name }],
  alternates: { canonical: site.url },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: [
      {
        url: '/images/photo-1511707171634-5f897ff02aa9.jpg',
        width: 1200,
        height: 630,
        alt: 'F-Ex Store — new and pre-owned smartphones in Guwahati',
      },
    ],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/favicon.svg',
  },
  other: { 'theme-color': '#0F3040' },
};

export const viewport: Viewport = {
  themeColor: '#0F3040',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${sans.variable} ${script.variable} ${mono.variable} ${grotesk.variable}`}>
      <body className="bg-ink font-sans text-cream">
        <SmoothScrollProvider>
          <ChromeGate>{children}</ChromeGate>
        </SmoothScrollProvider>
        <Analytics />
        <script
          type="application/ld+json"
          // LocalBusiness schema for both branches (see lib/seo.ts)
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }}
        />
      </body>
    </html>
  );
}
