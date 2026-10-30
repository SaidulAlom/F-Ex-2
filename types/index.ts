export type ProductCardData = {
  _id?: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  accessoryType?: string;
  price: number | null;
  mrp?: number | null;
  emiFrom?: number | null;
  ram?: string;
  storage?: string;
  condition: string;
  batteryHealth?: number | null;
  warrantyMonths?: number;
  images: string[];
  hoverImage?: string;
  branches: string[];
  status: 'available' | 'reserved' | 'sold';
  featured?: boolean;
  description?: string;
  highlights?: string[];
  colors?: string[];
  seoTitle?: string;
  seoDescription?: string;
};

export type LeadRow = {
  _id: string;
  type: string;
  status: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  productName?: string;
  productSlug?: string;
  deviceModel?: string;
  repairType?: string;
  branch: string;
  createdAt: string;
  notes?: string;
};

export type SessionUser = {
  name?: string | null;
  email?: string | null;
  role?: 'owner' | 'branchStaff';
  branch?: string;
};
