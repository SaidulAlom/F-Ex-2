import 'server-only';
import { dbConnect } from './db';
import { Lead } from '@/models/Lead';
import { sendLeadEmail, sendLeadAck, type LeadEmailPayload } from './mail';
import { site } from './config';

type CreateLeadInput = LeadEmailPayload & {
  type: 'enquiry' | 'repair' | 'reservation' | 'sell' | 'contact';
  productId?: string;
  productSlug?: string;
  priceAtLead?: number | null;
  notes?: string;
  ipHash?: string;
  userAgent?: string;
  preferredSlot?: string;
  photos?: string[];
  expectedPrice?: number | null;
  condition?: string;
};

/**
 * Persist a lead, then fire the Resend notification + customer acknowledgement.
 * Email failures never lose the lead: it is already in MongoDB.
 */
export async function createLead(input: CreateLeadInput) {
  await dbConnect();

  const lead = await Lead.create({
    type: input.type,
    status: 'new',
    name: input.name,
    phone: input.phone,
    email: input.email ?? '',
    message: input.message ?? '',
    productId: input.productId || null,
    productName: input.productName ?? '',
    productSlug: input.productSlug ?? '',
    priceAtLead: input.priceAtLead ?? null,
    deviceModel: input.deviceModel ?? '',
    repairType: input.repairType ?? '',
    photos: input.photos ?? [],
    condition: input.condition ?? '',
    expectedPrice: input.expectedPrice ?? null,
    branch: (input.branch as 'lokhra' | 'basistha') ?? 'lokhra',
    preferredSlot: input.preferredSlot ?? '',
    notes: input.notes ?? '',
    ipHash: input.ipHash ?? '',
    userAgent: input.userAgent ?? '',
  });

  const [sent, acked] = await Promise.all([
    sendLeadEmail({ ...input, adminUrl: `${site.url}/admin/leads?focus=${lead._id}` }),
    sendLeadAck(input),
  ]);

  if (sent || acked) {
    await Lead.updateOne({ _id: lead._id }, { $set: { emailSent: sent } });
  }

  return { id: String(lead._id) };
}
