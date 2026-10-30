'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { repairSchema } from '@/lib/validators';
import type { z } from 'zod';
import { Field, fieldClass, selectClass, FormSuccess } from './field';
import { PhotoUpload } from './photo-upload';
import { branches, repairServices } from '@/lib/config';
import { track } from '@/lib/analytics';

type RepairValues = z.infer<typeof repairSchema>;

/** Repair request: device, fault type, optional Cloudinary photos. */
export function RepairForm({ defaultBranch = 'lokhra' }: { defaultBranch?: 'lokhra' | 'basistha' }) {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RepairValues>({
    resolver: zodResolver(repairSchema),
    defaultValues: {
      branch: defaultBranch,
      repairType: 'screen',
      photos,
      website: '',
    },
  });

  const onSubmit = async (values: RepairValues) => {
    setServerError('');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, photos, type: 'repair' }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? 'Something went wrong');
      track.formSubmit('repair', values.branch);
      setDone(true);
      reset();
      setPhotos([]);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  if (done) {
    return (
      <FormSuccess
        title="Booked in."
        body="We have your repair request and will call you within working hours to confirm the slot and an approximate price."
        onReset={() => setDone(false)}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" htmlFor="r-name" error={errors.name?.message}>
          <input id="r-name" {...register('name')} className={fieldClass} placeholder="Rahul Bora" autoComplete="name" />
        </Field>
        <Field label="Mobile number" htmlFor="r-phone" error={errors.phone?.message}>
          <input id="r-phone" {...register('phone')} className={fieldClass} placeholder="98640 00000" inputMode="tel" autoComplete="tel" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Device model" htmlFor="r-device" error={errors.deviceModel?.message}>
          <input id="r-device" {...register('deviceModel')} className={fieldClass} placeholder="iPhone 13, 128GB" />
        </Field>
        <Field label="What is wrong?" htmlFor="r-type" error={errors.repairType?.message}>
          <select id="r-type" {...register('repairType')} className={selectClass}>
            {[
              ...repairServices.map((s) => ({ value: s.slug, label: s.title })),
              { value: 'speaker', label: 'Speaker / Earpiece' },
              { value: 'other', label: 'Something else' },
            ].map((o) => (
              <option key={o.value} value={o.value} className="text-ink">
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Branch" htmlFor="r-branch" error={errors.branch?.message}>
          <select id="r-branch" {...register('branch')} className={selectClass}>
            {branches.map((b) => (
              <option key={b.slug} value={b.slug} className="text-ink">
                {b.displayName}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Email (optional)" htmlFor="r-email" error={errors.email?.message}>
          <input id="r-email" {...register('email')} className={fieldClass} placeholder="you@email.com" autoComplete="email" />
        </Field>
      </div>

      <Field label="Describe the issue" htmlFor="r-msg" error={errors.message?.message}>
        <textarea
          id="r-msg"
          {...register('message')}
          rows={3}
          className={fieldClass}
          placeholder="Dropped it yesterday, screen shows lines on the right edge…"
        />
      </Field>

      <Field label="Photos" htmlFor="r-photos">
        <PhotoUpload value={photos} onChange={setPhotos} />
      </Field>

      {/* honeypot */}
      <input {...register('website')} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      {serverError && <p role="alert" className="text-[11px] text-rose">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-peach w-full disabled:opacity-60 sm:w-auto"
        data-cursor="Send"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Request a repair slot
      </button>
      <p className="text-[10px] text-cream/30">
        Free diagnosis at both branches. We never sell your number or message you after the job is closed.
      </p>
    </form>
  );
}
