'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import type { z } from 'zod';
import { sellSchema } from '@/lib/validators';
import { Field, fieldClass, selectClass } from './field';
import { branches } from '@/lib/config';
import { track } from '@/lib/analytics';

type SellValues = z.infer<typeof sellSchema>;

/** Phase-2 early access list. Stores as a `sell` lead so nothing is lost. */
export function SellWaitlistForm() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SellValues>({
    resolver: zodResolver(sellSchema),
    defaultValues: { branch: 'lokhra', condition: 'Excellent', website: '' },
  });

  const onSubmit = async (values: SellValues) => {
    setError('');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, type: 'sell' }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? 'Something went wrong');
      track.formSubmit('sell_waitlist', values.branch);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  if (done) {
    return (
      <div className="rounded-xl border border-peach/40 bg-peach/10 p-6">
        <p className="font-display text-2xl text-cream">You are on the list.</p>
        <p className="mt-2 text-sm text-cream/60">
          We will message you the moment the programme opens. In the meantime, the counter at either branch will happily
          quote your phone today.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="s-name" error={errors.name?.message}>
          <input id="s-name" {...register('name')} className={fieldClass} autoComplete="name" placeholder="Your name" />
        </Field>
        <Field label="Mobile" htmlFor="s-phone" error={errors.phone?.message}>
          <input id="s-phone" {...register('phone')} className={fieldClass} inputMode="tel" autoComplete="tel" placeholder="98640 00000" />
        </Field>
      </div>
      <Field label="Phone you want to sell" htmlFor="s-model" error={errors.deviceModel?.message}>
        <input id="s-model" {...register('deviceModel')} className={fieldClass} placeholder="iPhone 12, 128GB, Blue" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Condition" htmlFor="s-cond" error={errors.condition?.message}>
          <select id="s-cond" {...register('condition')} className={selectClass}>
            {['Like New', 'Excellent', 'Good', 'Fair'].map((c) => (
              <option key={c} value={c} className="text-ink">{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Nearest branch" htmlFor="s-branch" error={errors.branch?.message}>
          <select id="s-branch" {...register('branch')} className={selectClass}>
            {branches.map((b) => (
              <option key={b.slug} value={b.slug} className="text-ink">{b.displayName}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Expected price (optional)" htmlFor="s-price" error={errors.expectedPrice?.message}>
        <input id="s-price" {...register('expectedPrice')} className={fieldClass} inputMode="numeric" placeholder="18000" />
      </Field>

      <input {...register('website')} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      {error && <p role="alert" className="text-[11px] text-rose">{error}</p>}

      <button type="submit" disabled={isSubmitting} className="btn-peach w-full disabled:opacity-60">
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Join early access
      </button>
    </form>
  );
}
