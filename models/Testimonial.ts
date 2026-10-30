import { Schema, model, models, type Model, type InferSchemaType } from 'mongoose';

const TestimonialSchema = new Schema(
  {
    name: { type: String, required: true },
    location: { type: String, default: 'Guwahati' },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    quote: { type: String, required: true },
    purchase: { type: String, default: '' }, // e.g. "iPhone 13 · Certified Pre-Owned"
    branch: { type: String, enum: ['lokhra', 'basistha'], default: 'lokhra' },
    featured: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type TestimonialDoc = InferSchemaType<typeof TestimonialSchema> & { _id: string };
export const Testimonial: Model<TestimonialDoc> =
  (models.Testimonial as Model<TestimonialDoc>) ||
  model<TestimonialDoc>('Testimonial', TestimonialSchema);
