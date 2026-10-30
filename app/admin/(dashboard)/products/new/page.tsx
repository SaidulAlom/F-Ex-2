import { ProductForm } from '@/components/admin/product-form';

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-plum/60">Catalogue</p>
        <h1 className="mt-1 font-display text-3xl text-ink">Add a product</h1>
      </div>
      <ProductForm />
    </div>
  );
}
