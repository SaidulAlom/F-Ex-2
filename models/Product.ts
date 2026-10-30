import { Schema, model, models, type Model, type InferSchemaType } from 'mongoose';

export const CONDITION_GRADES = ['New', 'Like New', 'Excellent', 'Good', 'Fair'] as const;
export const PRODUCT_STATUS = ['available', 'reserved', 'sold'] as const;
export const PRODUCT_CATEGORIES = ['new-phones', 'second-hand', 'accessories', 'repairs'] as const;
export const ACCESSORY_TYPES = [
  'charger',
  'case',
  'earphones',
  'powerbank',
  'smartwatch',
  'landline',
  'other',
] as const;

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: 'text' },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    brand: { type: String, required: true, trim: true, index: true },
    category: { type: String, enum: PRODUCT_CATEGORIES, required: true, index: true },
    accessoryType: { type: String, enum: ACCESSORY_TYPES, default: undefined },
    description: { type: String, default: '' },
    highlights: { type: [String], default: [] },

    // pricing — price may be null -> "Call for price"
    price: { type: Number, default: null, min: 0 },
    mrp: { type: Number, default: null, min: 0 },
    emiFrom: { type: Number, default: null, min: 0 },

    // specs
    ram: { type: String, default: '' },
    storage: { type: String, default: '' },
    colors: { type: [String], default: [] },
    condition: { type: String, enum: CONDITION_GRADES, default: 'New', index: true },
    batteryHealth: { type: Number, default: null, min: 0, max: 100 },
    warrantyMonths: { type: Number, default: 0, min: 0 },

    images: { type: [String], default: [] },
    // hover-swap image used by the product card tilt effect
    hoverImage: { type: String, default: '' },

    branches: { type: [String], enum: ['lokhra', 'basistha'], default: ['lokhra'] },
    status: { type: String, enum: PRODUCT_STATUS, default: 'available', index: true },

    featured: { type: Boolean, default: false, index: true },
    order: { type: Number, default: 0 },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
  },
  { timestamps: true }
);

ProductSchema.index({ category: 1, status: 1, price: 1 });
ProductSchema.index({ name: 'text', brand: 'text', description: 'text' });

export type ProductDoc = InferSchemaType<typeof ProductSchema> & { _id: string };

export const Product: Model<ProductDoc> =
  (models.Product as Model<ProductDoc>) || model<ProductDoc>('Product', ProductSchema);
