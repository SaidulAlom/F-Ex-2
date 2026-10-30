import { Schema, model, models, type Model, type InferSchemaType } from 'mongoose';

const BranchSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, enum: ['lokhra', 'basistha'] },
    name: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, default: '' },
    locality: { type: String, default: '' },
    city: { type: String, default: 'Guwahati' },
    state: { type: String, default: 'Assam' },
    pincode: { type: String, required: true },
    phone: { type: String, required: true },
    phoneDisplay: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    opensAt: { type: String, default: '10:00' },
    closesAt: { type: String, default: '22:00' },
    hoursLabel: { type: String, default: '10:00 AM – 10:00 PM' },
    mapQuery: { type: String, default: '' },
    directionsLink: { type: String, default: '' },
    image: { type: String, default: '' },
    blurb: { type: String, default: '' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type BranchDoc = InferSchemaType<typeof BranchSchema> & { _id: string };
export const Branch: Model<BranchDoc> =
  (models.Branch as Model<BranchDoc>) || model<BranchDoc>('Branch', BranchSchema);
