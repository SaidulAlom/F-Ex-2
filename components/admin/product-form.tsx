'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Trash2 } from 'lucide-react';
import type { z } from 'zod';
import { productSchema } from '@/lib/validators';
import { saveProduct, deleteProduct } from '@/app/admin/(dashboard)/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ImageUploader } from './image-uploader';
import { brands, branches, conditionGrades } from '@/lib/config';
import { slugify } from '@/lib/utils';

type Values = z.infer<typeof productSchema>;

const empty: Values = {
  name: '',
  slug: '',
  brand: 'Apple',
  category: 'new-phones',
  description: '',
  highlights: [],
  price: null,
  mrp: null,
  emiFrom: null,
  ram: '',
  storage: '',
  colors: [],
  condition: 'New',
  batteryHealth: null,
  warrantyMonths: 12,
  images: [],
  hoverImage: '',
  branches: ['lokhra'],
  status: 'available',
  featured: false,
  order: 0,
  seoTitle: '',
  seoDescription: '',
};

/** Create/edit product. Every field is Zod-validated server-side as well. */
export function ProductForm({ initial, id }: { initial?: Partial<Values>; id?: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(productSchema),
    defaultValues: { ...empty, ...initial },
  });
  const { register, handleSubmit, watch, setValue, formState } = form;
  const errors = formState.errors;
  const values = watch();

  const toggleBranch = (slug: 'lokhra' | 'basistha') => {
    const next = values.branches.includes(slug)
      ? values.branches.filter((b) => b !== slug)
      : [...values.branches, slug];
    setValue('branches', next.length ? next : ['lokhra'], { shouldValidate: true });
  };

  const onSubmit = async (data: Values) => {
    setServerError('');
    const res = await saveProduct(data, id);
    if (!res.ok) {
      setServerError(res.error);
      return;
    }
    router.push('/admin/products');
    router.refresh();
  };

  const onDelete = async () => {
    if (!id || !confirm('Delete this product permanently?')) return;
    setDeleting(true);
    await deleteProduct(id);
    router.push('/admin/products');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-5 rounded-xl border border-input bg-white p-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label htmlFor="name">Product name</Label>
          <Input
            id="name"
            {...register('name', {
              onChange: (e) => {
                if (!id) setValue('slug', slugify(e.target.value));
              },
            })}
            placeholder="iPhone 15 Pro 256GB"
            className="mt-1.5"
          />
          {errors.name && <p className="mt-1 text-[11px] text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="slug">URL slug</Label>
          <Input id="slug" {...register('slug')} className="mt-1.5 font-mono text-xs" />
          {errors.slug && <p className="mt-1 text-[11px] text-red-600">{errors.slug.message}</p>}
        </div>

        <div>
          <Label htmlFor="brand">Brand</Label>
          <select id="brand" {...register('brand')} className="mt-1.5 h-11 w-full rounded-md border border-input bg-white px-3 text-sm">
            {[...new Set([...brands, 'F-Ex Essentials'])].map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <select id="category" {...register('category')} className="mt-1.5 h-11 w-full rounded-md border border-input bg-white px-3 text-sm">
            <option value="new-phones">New phones</option>
            <option value="second-hand">Pre-owned</option>
            <option value="accessories">Accessories</option>
            <option value="repairs">Repairs (service)</option>
          </select>
        </div>

        <div>
          <Label htmlFor="accessoryType">Accessory type (if applicable)</Label>
          <select
            id="accessoryType"
            {...register('accessoryType')}
            className="mt-1.5 h-11 w-full rounded-md border border-input bg-white px-3 text-sm"
          >
            <option value="">—</option>
            {['charger', 'case', 'earphones', 'powerbank', 'smartwatch', 'landline', 'other'].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            {...register('description')}
            rows={4}
            className="mt-1.5 w-full rounded-md border border-input bg-white p-3 text-sm"
            placeholder="What makes this unit worth buying? Condition notes, what is included…"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="highlights">Highlights (comma separated)</Label>
          <Input
            id="highlights"
            defaultValue={initial?.highlights?.join(', ')}
            onChange={(e) =>
              setValue(
                'highlights',
                e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
              )
            }
            className="mt-1.5"
            placeholder="Battery health 91%, No screen change, 6-month warranty"
          />
        </div>
      </div>

      <div className="grid gap-5 rounded-xl border border-input bg-white p-5 md:grid-cols-3">
        <div>
          <Label htmlFor="price">Price (₹) — blank = “Call for price”</Label>
          <Input id="price" type="number" {...register('price')} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="mrp">MRP (₹)</Label>
          <Input id="mrp" type="number" {...register('mrp')} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="emiFrom">EMI from (₹/month)</Label>
          <Input id="emiFrom" type="number" {...register('emiFrom')} className="mt-1.5" />
        </div>

        <div>
          <Label htmlFor="ram">RAM</Label>
          <Input id="ram" {...register('ram')} className="mt-1.5" placeholder="8GB" />
        </div>
        <div>
          <Label htmlFor="storage">Storage</Label>
          <Input id="storage" {...register('storage')} className="mt-1.5" placeholder="256GB" />
        </div>
        <div>
          <Label htmlFor="colors">Colours (comma separated)</Label>
          <Input
            id="colors"
            defaultValue={initial?.colors?.join(', ')}
            onChange={(e) => setValue('colors', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
            className="mt-1.5"
            placeholder="Natural Titanium, Blue"
          />
        </div>

        <div>
          <Label htmlFor="condition">Condition grade</Label>
          <select id="condition" {...register('condition')} className="mt-1.5 h-11 w-full rounded-md border border-input bg-white px-3 text-sm">
            {conditionGrades.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="batteryHealth">Battery health (%)</Label>
          <Input id="batteryHealth" type="number" {...register('batteryHealth')} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="warrantyMonths">Warranty (months)</Label>
          <Input id="warrantyMonths" type="number" {...register('warrantyMonths')} className="mt-1.5" />
        </div>
      </div>

      <div className="grid gap-5 rounded-xl border border-input bg-white p-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label>Images</Label>
          <div className="mt-1.5">
            <ImageUploader value={values.images ?? []} onChange={(urls) => setValue('images', urls, { shouldValidate: true })} />
          </div>
          {errors.images && <p className="mt-1 text-[11px] text-red-600">{errors.images.message as string}</p>}
        </div>

        <div>
          <Label htmlFor="hoverImage">Hover image URL (optional)</Label>
          <Input id="hoverImage" {...register('hoverImage')} className="mt-1.5 text-xs" />
        </div>

        <div>
          <Label>Branches</Label>
          <div className="mt-1.5 flex gap-2">
            {branches.map((b) => (
              <button
                key={b.slug}
                type="button"
                onClick={() => toggleBranch(b.slug)}
                className={`rounded-full border px-4 py-2 text-xs ${
                  values.branches?.includes(b.slug)
                    ? 'border-peach bg-peach/20 text-ink'
                    : 'border-input text-plum/70'
                }`}
              >
                {b.displayName}
              </button>
            ))}
          </div>
          {errors.branches && <p className="mt-1 text-[11px] text-red-600">{errors.branches.message as string}</p>}
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <select id="status" {...register('status')} className="mt-1.5 h-11 w-full rounded-md border border-input bg-white px-3 text-sm">
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
        </div>

        <div className="flex items-end gap-4">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" {...register('featured')} className="h-4 w-4 accent-[#D99B7F]" />
            Featured on home
          </label>
          <div>
            <Label htmlFor="order">Order</Label>
            <Input id="order" type="number" {...register('order')} className="mt-1 w-20" />
          </div>
        </div>
      </div>

      {serverError && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-xs text-red-700">{serverError}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {id ? 'Save changes' : 'Create product'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/products')}>
          Cancel
        </Button>
        {id && (
          <Button type="button" variant="destructive" onClick={onDelete} disabled={deleting} className="ml-auto">
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        )}
      </div>
    </form>
  );
}
