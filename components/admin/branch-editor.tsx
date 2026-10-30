'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { saveBranch } from '@/app/admin/(dashboard)/actions';

type Values = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  opensAt: string;
  closesAt: string;
  hoursLabel: string;
  mapQuery: string;
  directionsLink: string;
  blurb: string;
  active: boolean;
};

/** Branch details editor (owner only — enforced again server-side). */
export function BranchEditor({
  slug,
  name,
  initial,
  disabled,
}: {
  slug: string;
  name: string;
  initial: Values;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Values>(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const set = <K extends keyof Values>(key: K, value: Values[K]) => setValues((v) => ({ ...v, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    const res = await saveBranch(values, slug);
    setBusy(false);
    if (!res.ok) return setError(res.error);
    setMessage('Saved — storefront updated.');
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="rounded-xl border border-input bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl text-ink">{name}</h2>
        <span className="text-[10px] uppercase tracking-[0.16em] text-plum/50">{slug}</span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {(
          [
            ['name', 'Branch name'],
            ['addressLine1', 'Address line 1'],
            ['addressLine2', 'Address line 2'],
            ['locality', 'Locality'],
            ['city', 'City'],
            ['state', 'State'],
            ['pincode', 'PIN code'],
            ['phone', 'Phone (E.164)'],
            ['phoneDisplay', 'Phone (display)'],
            ['whatsapp', 'WhatsApp (digits)'],
            ['opensAt', 'Opens (HH:MM)'],
            ['closesAt', 'Closes (HH:MM)'],
            ['hoursLabel', 'Hours label'],
            ['mapQuery', 'Map query'],
            ['directionsLink', 'Directions URL'],
          ] as [keyof Values, string][]
        ).map(([key, label]) => (
          <div key={String(key)}>
            <Label htmlFor={`${slug}-${key}`}>{label}</Label>
            <Input
              id={`${slug}-${key}`}
              value={String(values[key] ?? '')}
              onChange={(e) => set(key, e.target.value as Values[typeof key])}
              disabled={disabled}
              className="mt-1.5"
            />
          </div>
        ))}
        <div className="md:col-span-3">
          <Label htmlFor={`${slug}-blurb`}>Blurb</Label>
          <textarea
            id={`${slug}-blurb`}
            value={values.blurb}
            onChange={(e) => set('blurb', e.target.value)}
            disabled={disabled}
            rows={2}
            className="mt-1.5 w-full rounded-md border border-input bg-white p-3 text-sm"
          />
        </div>
      </div>

      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      {message && <p className="mt-3 text-xs text-emerald-700">{message}</p>}
      {disabled && <p className="mt-3 text-xs text-amber-700">Only an owner account can edit branch details.</p>}

      <Button type="submit" disabled={busy || disabled} className="mt-4">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save branch
      </Button>
    </form>
  );
}
