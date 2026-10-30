import { Resend } from 'resend';
import { site } from './config';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export type LeadEmailPayload = {
  type: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  branch?: string;
  productName?: string;
  deviceModel?: string;
  repairType?: string;
  preferredSlot?: string;
  photos?: string[];
  adminUrl?: string;
};

const esc = (s = '') =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function row(label: string, value?: string) {
  if (!value) return '';
  return `<tr><td style="padding:6px 0;color:#464858;font-size:13px;width:150px;">${esc(label)}</td>
  <td style="padding:6px 0;color:#0F3040;font-size:14px;font-weight:600;">${esc(value)}</td></tr>`;
}

function template(p: LeadEmailPayload) {
  const photos = (p.photos ?? [])
    .map(
      (u, i) =>
        `<a href="${esc(u)}" style="color:#A56F63;font-size:13px;margin-right:12px;">Photo ${i + 1}</a>`
    )
    .join('');
  return `<!doctype html><html><body style="margin:0;background:#F6EBE3;font-family:Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:28px;">
    <p style="letter-spacing:.28em;font-size:11px;color:#A56F63;margin:0 0 6px;">F-EX STORE · GUWAHATI</p>
    <h1 style="font-size:26px;color:#0F3040;margin:0 0 4px;font-weight:600;">New ${esc(p.type)} lead</h1>
    <p style="color:#464858;font-size:13px;margin:0 0 20px;">Received ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
    <div style="background:#fff;border-radius:12px;padding:20px 22px;border:1px solid #EADFD7;">
      <table style="width:100%;border-collapse:collapse;">
        ${row('Name', p.name)}
        ${row('Phone', p.phone)}
        ${row('Email', p.email)}
        ${row('Branch', p.branch)}
        ${row('Product', p.productName)}
        ${row('Device', p.deviceModel)}
        ${row('Repair', p.repairType)}
        ${row('Preferred slot', p.preferredSlot)}
        ${row('Message', p.message)}
      </table>
      ${photos ? `<p style="margin-top:14px;">${photos}</p>` : ''}
    </div>
    <p style="margin-top:22px;">
      <a href="tel:${esc(p.phone)}" style="background:#D99B7F;color:#081C27;text-decoration:none;padding:11px 18px;border-radius:999px;font-size:14px;font-weight:600;">Call now</a>
      <a href="https://wa.me/91${esc(p.phone.replace(/\D/g, '').slice(-10))}" style="margin-left:10px;color:#0F3040;font-size:14px;">WhatsApp</a>
      ${p.adminUrl ? `<a href="${esc(p.adminUrl)}" style="margin-left:10px;color:#A56F63;font-size:14px;">Open in admin</a>` : ''}
    </p>
    <p style="color:#8a8b93;font-size:11px;margin-top:30px;">Automated notification · ${esc(site.name)}</p>
  </div></body></html>`;
}

/**
 * Sends the lead notification to the store inbox. Never throws: a failed
 * email must not lose the lead (it is already persisted in MongoDB).
 */
export async function sendLeadEmail(payload: LeadEmailPayload): Promise<boolean> {
  const to = (process.env.LEAD_NOTIFY_EMAILS ?? site.email).split(',').map((s) => s.trim());
  const from = process.env.RESEND_FROM_EMAIL ?? 'F-Ex Store <onboarding@resend.dev>';

  if (!resend) {
    console.info('[mail] RESEND_API_KEY missing — skipping notification for', payload.type, payload.name);
    return false;
  }
  try {
    await resend.emails.send({
      from,
      to,
      subject: `New ${payload.type} lead — ${payload.name} (${payload.branch ?? 'lokhra'})`,
      html: template(payload),
      replyTo: payload.email || undefined,
    });
    return true;
  } catch (err) {
    console.error('[mail] send failed', err);
    return false;
  }
}

/** Optional acknowledgement to the customer. */
export async function sendLeadAck(payload: LeadEmailPayload): Promise<boolean> {
  if (!resend || !payload.email) return false;
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'F-Ex Store <onboarding@resend.dev>',
      to: payload.email,
      subject: 'We have your request — F-Ex Store, Guwahati',
      text: `Hi ${payload.name},\n\nThanks for reaching out to F-Ex Store. Our team will call you shortly between 10 AM and 10 PM IST.\n\nReference: ${payload.type}${payload.productName ? ` — ${payload.productName}` : ''}\n\nYou can also WhatsApp us at +91 85118 22537.\n\n— F-Ex Store, Lokhra & Basistha, Guwahati`,
    });
    return true;
  } catch {
    return false;
  }
}
