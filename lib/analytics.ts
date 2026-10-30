/**
 * GA4 event helpers. Safe no-ops when gtag is absent (dev, blocked scripts).
 * Events required by the brief: call, whatsapp, directions (per branch),
 * form submissions.
 */
type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
  }
}

function send(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', event, params);
}

export const track = {
  call: (branch: string, location: string) => send('call_click', { branch, location }),
  whatsapp: (context: string, model?: string) => send('whatsapp_click', { context, model: model ?? 'general' }),
  directions: (branch: string) => send('directions_click', { branch }),
  formSubmit: (form: string, branch?: string) => send('form_submit', { form, branch }),
  productView: (slug: string, brand: string, price: number | null) =>
    send('view_item', { item_id: slug, item_brand: brand, value: price ?? 0, currency: 'INR' }),
  filterChange: (filters: Record<string, unknown>) => send('filter_change', filters),
  reserveStart: (slug: string) => send('begin_reservation', { item_id: slug }),
};
