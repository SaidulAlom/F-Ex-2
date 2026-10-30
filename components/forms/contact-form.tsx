'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import type { z } from 'zod';
import { contactSchema } from '@/lib/validators';
import { Field, fieldClass, selectClass, FormSuccess } from './field';
import { branches } from '@/lib/config';
import { track } from '@/lib/analytics';

type ContactValues = z.infer<typeof contactSchema>;

/** Contact form with honeypot + server-side rate limiting + confirmation. */
export function ContactForm() {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { branch: 'lokhra', website: '' },
  });

  const onSubmit = async (values: ContactValues) => {
    setServerError('');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, type: 'contact' }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? 'Something went wrong');
      track.formSubmit('contact', values.branch);
      setDone(true);
      reset();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  if (done) {
    return (
      <FormSuccess
        title="Message received."
        body="Thanks — we usually reply within an hour during shop hours (10 AM – 10 PM). For anything urgent, call us directly."
        onReset={() => setDone(false)}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="c-name" error={errors.name?.message}>
          <input id="c-name" {...register('name')} className={fieldClass} autoComplete="name" placeholder="Your name" />
        </Field>
        <Field label="Mobile" htmlFor="c-phone" error={errors.phone?.message}>
          <input id="c-phone" {...register('phone')} className={fieldClass} inputMode="tel" autoComplete="tel" placeholder="98640 00000" />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email (optional)" htmlFor="c-email" error={errors.email?.message}>
          <input id="c-email" {...register('email')} className={fieldClass} autoComplete="email" placeholder="you@email.com" />
        </Field>
        <Field label="Nearest branch" htmlFor="c-branch" error={errors.branch?.message}>
          <select id="c-branch" {...register('branch')} className={selectClass}>
            {branches.map((b) => (
              <option key={b.slug} value={b.slug} className="text-ink">
                {b.displayName}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Subject" htmlFor="c-subject" error={errors.subject?.message}>
        <input id="c-subject" {...register('subject')} className={fieldClass} placeholder="Availability of iPhone 15 Pro" />
      </Field>
      <Field label="Message" htmlFor="c-message" error={errors.message?.message}>
        <textarea id="c-message" {...register('message')} rows={5} className={fieldClass} placeholder="Tell us what you need…" />
      </Field>

      <input {...register('website')} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      {serverError && <p role="alert" className="text-[11px] text-rose">{serverError}</p>}

      <button type="submit" disabled={isSubmitting} className="btn-peach disabled:opacity-60" data-cursor="Send">
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Send message
      </button>
    </form>
  );
}
