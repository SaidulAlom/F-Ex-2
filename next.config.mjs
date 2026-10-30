/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://maps.gstatic.com https://maps.googleapis.com",
      "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://api.resend.com",
      "frame-src https://www.google.com https://maps.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join('; '),
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  /**
   * Dev-only: the preview serves this app through a proxy host
   * (`<port>-<sandbox-id>.e2b.app`), which Next treats as a cross-origin caller
   * of `/_next/*` (and of the HMR socket) and warns about on every request.
   *
   * Listing the origins keeps the warning out of the log and the HMR socket
   * alive. NOTE: setting this option at all switches Next from "warn" to
   * "block", so the list must cover every way the dev server is reached —
   * bare localhost is allowed by Next already, but the IP forms are not.
   * Ignored outside `next dev`; harmless in production.
   */
  allowedDevOrigins: ['*.e2b.app', '127.0.0.1', '[::1]'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  experimental: { optimizePackageImports: ['framer-motion', 'lucide-react', 'gsap'] },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default nextConfig;
