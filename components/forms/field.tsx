import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Label + control + error message, styled for the dark public site. */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-[10px] uppercase tracking-[0.22em] text-cream/45">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-[11px] text-rose">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[10px] text-cream/30">{hint}</p>
      ) : null}
    </div>
  );
}

export const fieldClass =
  'w-full rounded-lg border border-cream/15 bg-plum/20 px-4 py-3 text-sm text-cream placeholder:text-cream/25 transition-colors focus:border-peach focus:outline-none';

export const selectClass = `${fieldClass} appearance-none`;

/** Small success panel shown after a lead is accepted. */
export function FormSuccess({ title, body, onReset }: { title: string; body: string; onReset?: () => void }) {
  return (
    <div className="rounded-2xl border border-peach/40 bg-peach/10 p-8 text-center">
      <p className="font-display text-3xl text-cream">{title}</p>
      <p className="mx-auto mt-3 max-w-sm text-sm text-cream/60">{body}</p>
      {onReset && (
        <button type="button" onClick={onReset} className="btn-outline mt-6">
          Send another
        </button>
      )}
    </div>
  );
}
