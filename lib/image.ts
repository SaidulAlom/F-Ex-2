/**
 * Client-safe image helpers (no Cloudinary SDK import, so this can be pulled
 * into client components without bundling Node built-ins).
 */

/** Inject f_auto,q_auto,w_<width> for responsive delivery of Cloudinary URLs. */
export function cdn(url: string, width = 900): string {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_limit/`);
}

/**
 * Legacy passthrough for Unsplash URLs.
 *
 * The storefront no longer references any remote photography — every image is
 * self-hosted under `public/images` (see README §14) — but this stays so that a
 * URL pasted into the admin panel still gets a sane width/quality.
 */
export function unsplash(url: string, width = 900): string {
  if (!url?.includes('images.unsplash.com')) return url;
  return url.replace(/w=\d+/, `w=${width}`).replace(/q=\d+/, 'q=75');
}

export function imageAt(url: string, width = 900): string {
  return unsplash(cdn(url, width), width);
}
