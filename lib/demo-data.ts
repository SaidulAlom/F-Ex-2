/**
 * Demo catalogue — identical records to scripts/seed.ts.
 * Used as a graceful fallback when MONGODB_URI is absent (e.g. a fresh
 * preview deploy) so the marketing site never renders empty sections.
 */
export type DemoProduct = {
  name: string;
  slug: string;
  brand: string;
  category: 'new-phones' | 'second-hand' | 'accessories' | 'repairs';
  accessoryType?: string;
  description: string;
  highlights: string[];
  price: number | null;
  mrp?: number | null;
  emiFrom?: number | null;
  ram: string;
  storage: string;
  colors: string[];
  condition: 'New' | 'Like New' | 'Excellent' | 'Good' | 'Fair';
  batteryHealth?: number | null;
  warrantyMonths: number;
  images: string[];
  hoverImage?: string;
  branches: ('lokhra' | 'basistha')[];
  status: 'available' | 'reserved' | 'sold';
  featured: boolean;
  order: number;
  seoTitle?: string;
  seoDescription?: string;
};

/**
 * Local media. Every photograph used by the storefront is self-hosted under
 * `public/images` so the site renders offline, in sandboxed previews and on
 * Vercel without leaning on a third-party CDN.
 */
const u = (id: string) => `/images/${id}.jpg`;

export const demoProducts: DemoProduct[] = [
  {
    name: 'iPhone 15 Pro 256GB',
    slug: 'iphone-15-pro-256gb',
    brand: 'Apple',
    category: 'new-phones',
    description:
      'The titanium flagship, sealed and India-warranty. A17 Pro silicon, 48MP main sensor and the action button — demonstrated in person at both branches before you buy.',
    highlights: ['Titanium frame', '48MP ProRAW', 'USB-C 10Gbps', '1-year Apple India warranty'],
    price: 122900,
    mrp: 134900,
    emiFrom: 4832,
    ram: '8GB',
    storage: '256GB',
    colors: ['Natural Titanium', 'Blue Titanium', 'Black Titanium'],
    condition: 'New',
    warrantyMonths: 12,
    images: [u('photo-1695048133142-1a20484d2569'), u('photo-1592750475338-74b7b21085ab')],
    hoverImage: u('photo-1511707171634-5f897ff02aa9'),
    branches: ['lokhra', 'basistha'],
    status: 'available',
    featured: true,
    order: 1,
  },
  {
    name: 'iPhone 13 128GB — Certified Pre-Owned',
    slug: 'iphone-13-128gb-pre-owned',
    brand: 'Apple',
    category: 'second-hand',
    description:
      'A grade-A iPhone 13 that has passed our 32-point inspection. Battery health documented on the tag, no panel replacement, Face ID tested twice.',
    highlights: ['Battery health 91%', 'No screen change', 'Face ID verified', '6-month F-Ex warranty'],
    price: 36900,
    mrp: 59900,
    emiFrom: 1450,
    ram: '4GB',
    storage: '128GB',
    colors: ['Midnight', 'Blue'],
    condition: 'Excellent',
    batteryHealth: 91,
    warrantyMonths: 6,
    images: [u('photo-1592750475338-74b7b21085ab'), u('photo-1510557880182-3d4d3cba35a5')],
    hoverImage: u('photo-1580910051074-3eb694886505'),
    branches: ['lokhra'],
    status: 'available',
    featured: true,
    order: 2,
  },
  {
    name: 'Vivo X100 Pro 512GB',
    slug: 'vivo-x100-pro-512gb',
    brand: 'Vivo',
    category: 'new-phones',
    description:
      'Zeiss optics and a 1-inch sensor in a phone that shoots like a camera. One of the most requested handsets at our Lokhra counter.',
    highlights: ['Zeiss 1" main sensor', 'Dimensity 9300', '100W FlashCharge', 'IP68'],
    price: 89999,
    mrp: 99999,
    emiFrom: 3540,
    ram: '16GB',
    storage: '512GB',
    colors: ['Asteroid Black', 'Sunset Orange'],
    condition: 'New',
    warrantyMonths: 12,
    images: [u('photo-1598327105666-5b89351aff97'), u('photo-1567581935884-3349723552ca')],
    hoverImage: u('photo-1616348436168-de43ad0db179'),
    branches: ['lokhra', 'basistha'],
    status: 'available',
    featured: true,
    order: 3,
  },
  {
    name: 'iPhone 14 Pro Max 256GB — Pre-Owned',
    slug: 'iphone-14-pro-max-256gb-pre-owned',
    brand: 'Apple',
    category: 'second-hand',
    description:
      'Dynamic Island, always-on display and the 48MP camera, at roughly half the launch price. Comes with a fresh tempered glass fitted in-store.',
    highlights: ['Battery health 89%', 'Original box', 'All cameras tested', '6-month warranty'],
    price: 72900,
    mrp: 129900,
    emiFrom: 2860,
    ram: '6GB',
    storage: '256GB',
    colors: ['Deep Purple', 'Space Black'],
    condition: 'Like New',
    batteryHealth: 89,
    warrantyMonths: 6,
    images: [u('photo-1678652197831-2d180705cd2c'), u('photo-1632661674596-df8be070a5c5')],
    hoverImage: u('photo-1695048133142-1a20484d2569'),
    branches: ['lokhra', 'basistha'],
    status: 'reserved',
    featured: true,
    order: 4,
  },
  {
    name: 'Samsung Galaxy S24 Ultra 512GB',
    slug: 'samsung-galaxy-s24-ultra-512gb',
    brand: 'Samsung',
    category: 'new-phones',
    description:
      'S Pen, flat titanium frame and Galaxy AI. We set it up for you — data transfer, screen guard and case fitting included.',
    highlights: ['S Pen included', 'Galaxy AI', '200MP camera', '1-year warranty'],
    price: 124999,
    mrp: 139999,
    emiFrom: 4915,
    ram: '12GB',
    storage: '512GB',
    colors: ['Titanium Gray', 'Titanium Violet'],
    condition: 'New',
    warrantyMonths: 12,
    images: [u('photo-1610945265064-0e34e5519bbf'), u('photo-1598327105666-5b89351aff97')],
    hoverImage: u('photo-1567581935884-3349723552ca'),
    branches: ['lokhra'],
    status: 'available',
    featured: true,
    order: 5,
  },
  {
    name: 'Redmi Note 13 Pro 5G 256GB',
    slug: 'redmi-note-13-pro-5g-256gb',
    brand: 'Redmi',
    category: 'new-phones',
    description:
      'The value pick of the season — 200MP camera, 67W charging and a bright AMOLED panel. Our best seller under ₹25,000.',
    highlights: ['200MP OIS', '67W turbo charge', '120Hz AMOLED', '5G dual SIM'],
    price: 23999,
    mrp: 27999,
    emiFrom: 950,
    ram: '8GB',
    storage: '256GB',
    colors: ['Midnight Black', 'Fusion White'],
    condition: 'New',
    warrantyMonths: 12,
    images: [u('photo-1592899677977-9c10ca588bbd'), u('photo-1616348436168-de43ad0db179')],
    hoverImage: u('photo-1598327105666-5b89351aff97'),
    branches: ['lokhra', 'basistha'],
    status: 'available',
    featured: false,
    order: 6,
  },
  {
    name: 'OnePlus 12R 128GB — Pre-Owned',
    slug: 'oneplus-12r-128gb-pre-owned',
    brand: 'OnePlus',
    category: 'second-hand',
    description:
      'Six months old, single owner, with the original 100W charger and box. Snapdragon 8 Gen 2 at a mid-range price.',
    highlights: ['Battery health 94%', 'Original charger', '100W SuperVOOC', '3-month warranty'],
    price: 28400,
    mrp: 39999,
    emiFrom: 1120,
    ram: '8GB',
    storage: '128GB',
    colors: ['Iron Gray'],
    condition: 'Excellent',
    batteryHealth: 94,
    warrantyMonths: 3,
    images: [u('photo-1585060544812-6b45742d762f'), u('photo-1511707171634-5f897ff02aa9')],
    hoverImage: u('photo-1592750475338-74b7b21085ab'),
    branches: ['basistha'],
    status: 'available',
    featured: true,
    order: 7,
  },
  {
    name: 'Realme 12 Pro+ 256GB',
    slug: 'realme-12-pro-plus-256gb',
    brand: 'Realme',
    category: 'new-phones',
    description:
      'A periscope telephoto at a price that surprises everyone. Popular with students around Sarusajai.',
    highlights: ['Periscope 64MP', 'Snapdragon 7s Gen 2', '67W charge', 'Curved AMOLED'],
    price: 25999,
    mrp: 29999,
    emiFrom: 1030,
    ram: '8GB',
    storage: '256GB',
    colors: ['Submarine Blue', 'Navigator Beige'],
    condition: 'New',
    warrantyMonths: 12,
    images: [u('photo-1598965402089-897ce52e8355'), u('photo-1567581935884-3349723552ca')],
    hoverImage: u('photo-1610945265064-0e34e5519bbf'),
    branches: ['lokhra'],
    status: 'available',
    featured: false,
    order: 8,
  },
  {
    name: '65W GaN Fast Charger + USB-C Cable',
    slug: '65w-gan-fast-charger-usbc',
    brand: 'F-Ex Essentials',
    category: 'accessories',
    accessoryType: 'charger',
    description:
      'One compact brick for phone, tablet and laptop. BIS-certified, with a braided 100W USB-C cable in the box.',
    highlights: ['65W GaN', 'BIS certified', 'Braided cable included', '2-year warranty'],
    price: 2199,
    mrp: 2999,
    ram: '',
    storage: '',
    colors: ['Ivory', 'Graphite'],
    condition: 'New',
    warrantyMonths: 24,
    images: [u('photo-1583863788434-e58a36330cf0'), u('photo-1591290619618-904f6dd935e3')],
    hoverImage: u('photo-1615526675159-e248c3021d3f'),
    branches: ['lokhra', 'basistha'],
    status: 'available',
    featured: false,
    order: 9,
  },
  {
    name: 'F-Ex Signature Leather Case — iPhone 15 Pro',
    slug: 'fex-signature-leather-case-iphone-15-pro',
    brand: 'F-Ex Essentials',
    category: 'accessories',
    accessoryType: 'case',
    description:
      'Full-grain leather with a MagSafe ring and copper foil trim, embossed in-store. Ages beautifully.',
    highlights: ['Full-grain leather', 'MagSafe compatible', 'Copper foil trim', 'Hand-finished'],
    price: 3499,
    ram: '',
    storage: '',
    colors: ['Teal', 'Rosewood', 'Cream'],
    condition: 'New',
    warrantyMonths: 6,
    images: [u('photo-1601593346740-925612772716'), u('accessories-flatlay')],
    hoverImage: u('photo-1510557880182-3d4d3cba35a5'),
    branches: ['lokhra'],
    status: 'available',
    featured: true,
    order: 10,
  },
  {
    name: 'Noise-Cancelling Wireless Earphones',
    slug: 'noise-cancelling-wireless-earphones',
    brand: 'F-Ex Essentials',
    category: 'accessories',
    accessoryType: 'earphones',
    description:
      '38dB hybrid ANC, 40-hour total playback and a warm, bass-forward tuning. Tested on the counter before you leave.',
    highlights: ['38dB ANC', '40h playback', 'Bluetooth 5.4', 'IPX5'],
    price: 4999,
    mrp: 6999,
    ram: '',
    storage: '',
    colors: ['Champagne', 'Ink'],
    condition: 'New',
    warrantyMonths: 12,
    images: [u('photo-1590658268037-6bf12165a8df'), u('photo-1606220945770-b5b6c2c55bf1')],
    hoverImage: u('accessories-audio'),
    branches: ['lokhra', 'basistha'],
    status: 'available',
    featured: false,
    order: 11,
  },
  {
    name: '20,000mAh 22.5W Power Bank',
    slug: '20000mah-225w-power-bank',
    brand: 'F-Ex Essentials',
    category: 'accessories',
    accessoryType: 'powerbank',
    description:
      'Two phones, three charges, one brick. Digital readout, pass-through charging and airline-safe capacity.',
    highlights: ['20,000mAh', '22.5W PD', 'Digital display', 'Airline safe'],
    price: 1899,
    mrp: 2499,
    ram: '',
    storage: '',
    colors: ['Teal', 'Black'],
    condition: 'New',
    warrantyMonths: 12,
    images: [u('photo-1609091839311-d5365f9ff1c5'), u('photo-1583863788434-e58a36330cf0')],
    hoverImage: u('photo-1591290619618-904f6dd935e3'),
    branches: ['basistha'],
    status: 'available',
    featured: false,
    order: 12,
  },
];

export const demoTags = {
  brands: ['Apple', 'Vivo', 'Samsung', 'Redmi', 'Realme', 'OnePlus'],
} as const;
