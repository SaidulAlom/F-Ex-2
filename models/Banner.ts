import { Schema, model, models, type Model, type InferSchemaType } from 'mongoose';

export const BANNER_PLACEMENTS = ['hero', 'marquee', 'offers', 'category'] as const;

const BannerSchema = new Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    eyebrow: { type: String, default: '' },
    image: { type: String, default: '' },
    ctaLabel: { type: String, default: 'Explore' },
    ctaHref: { type: String, default: '/new-phones' },
    placement: { type: String, enum: BANNER_PLACEMENTS, default: 'offers', index: true },
    tone: { type: String, enum: ['peach', 'rose', 'plum', 'cream'], default: 'peach' },
    active: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export type BannerDoc = InferSchemaType<typeof BannerSchema> & { _id: string };
export const Banner: Model<BannerDoc> =
  (models.Banner as Model<BannerDoc>) || model<BannerDoc>('Banner', BannerSchema);
