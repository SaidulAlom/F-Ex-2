import { Schema, model, models, type Model, type InferSchemaType } from 'mongoose';

export const LEAD_TYPES = ['enquiry', 'repair', 'reservation', 'sell', 'contact'] as const;
export const LEAD_STATUS = ['new', 'contacted', 'won', 'lost', 'archived'] as const;

const LeadSchema = new Schema(
  {
    type: { type: String, enum: LEAD_TYPES, required: true, index: true },
    status: { type: String, enum: LEAD_STATUS, default: 'new', index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: '', trim: true, lowercase: true },
    message: { type: String, default: '' },

    // reservation / enquiry
    productId: { type: Schema.Types.ObjectId, ref: 'Product', default: null },
    productName: { type: String, default: '' },
    productSlug: { type: String, default: '' },
    priceAtLead: { type: Number, default: null },

    // repair
    deviceModel: { type: String, default: '' },
    repairType: { type: String, default: '' },
    photos: { type: [String], default: [] },

    // sell / exchange
    condition: { type: String, default: '' },
    expectedPrice: { type: Number, default: null },

    branch: { type: String, enum: ['lokhra', 'basistha'], default: 'lokhra', index: true },
    source: { type: String, default: 'website' },
    preferredSlot: { type: String, default: '' },
    notes: { type: String, default: '' }, // staff-only
    emailSent: { type: Boolean, default: false },
    ipHash: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true }
);

LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ phone: 1, createdAt: -1 });

export type LeadDoc = InferSchemaType<typeof LeadSchema> & { _id: string };
export const Lead: Model<LeadDoc> = (models.Lead as Model<LeadDoc>) || model<LeadDoc>('Lead', LeadSchema);
