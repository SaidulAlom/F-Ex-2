'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import type { z } from 'zod';
import { reservationSchema } from '@/lib/validators';
import { Field, fieldClass, selectClass, FormSuccess } from '@/components/forms/field';
import { branches } from '@/lib/config';
import { track } from '@/lib/analytics';
import type { ProductCardData } from '@/types';

type ReserveValues = z.infer<typeof reservationSchema>;

/** Reserve-a-phone form. Held for 24 hours once staff confirm. */
export function ReserveForm({ product }: { product: ProductCardData }) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReserveValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      branch: (product.branches[0] as 'lokhra' | 'basistha') ?? 'lokhra',
      productSlug: product.slug,
      productId: product._id ?? '',
      productName: product.name,
      priceAtLead: product.price ?? undefined,
      website: '',
    },
  });

  const onSubmit = async (values: ReserveValues) => {
    setError('');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, type: 'reservation' }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? 'Something went wrong');
      track.formSubmit('reservation', values.branch);
      setDone(true);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  if (done) {
    return (
      <FormSuccess
        title="Reserved."
        body={`We are holding the ${product.name} for you. Our team will call to confirm pickup — reservations are kept for 24 hours.`}
        onReset={() => setDone(false)}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate id="reserve">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" htmlFor="rv-name" error={errors.name?.message}>
          <input id="rv-name" {...register('name')} className={fieldClass} autoComplete="name" placeholder="Your name" />
        </Field>
        <Field label="Mobile" htmlFor="rv-phone" error={errors.phone?.message}>
          <input id="rv-phone" {...register('phone')} className={fieldClass} inputMode="tel" autoComplete="tel" placeholder="98640 00000" />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Pickup branch" htmlFor="rv-branch" error={errors.branch?.message}>
          <select id="rv-branch" {...register('branch')} className={selectClass}>
            {branches
              .filter((b) => product.branches.includes(b.slug))
              .map((b) => (
                <option key={b.slug} value={b.slug} className="text-ink">
                  {b.displayName}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Preferred time" htmlFor="rv-slot" error={errors.preferredSlot?.message}>
          <select id="rv-slot" {...register('preferredSlot')} className={selectClass}>
            <option value="" className="text-ink">Any time</option>
            <option value="morning" className="text-ink">Morning (10 AM – 1 PM)</option>
            <option value="afternoon" className="text-ink">Afternoon (1 – 5 PM)</option>
            <option value="evening" className="text-ink">Evening (5 – 10 PM)</option>
          </select>
        </Field>
      </div>
      <Field label="Anything we should know?" htmlFor="rv-msg" error={errors.message?.message}>
        <textarea id="rv-msg" {...register('message')} rows={3} className={fieldClass} placeholder="I would like to exchange my old phone…" />
      </Field>

      <input {...register('website')} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      {error && <p role="alert" className="text-[11px] text-rose">{error}</p>}

      <button type="submit" disabled={isSubmitting} className="btn-peach w-full disabled:opacity-60">
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Reserve for 24 hours
      </button>
      <p className="text-[10px] text-cream/30">No payment now. We confirm stock before holding the unit.</p>
    </form>
  );
}
