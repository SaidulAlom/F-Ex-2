import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em]',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-peach text-ink-deep',
        outline: 'border-peach/50 text-peach',
        rose: 'border-rose/60 text-rose',
        muted: 'border-plum/30 bg-plum/10 text-plum',
        success: 'border-emerald-600/40 bg-emerald-50 text-emerald-800',
        warning: 'border-amber-600/40 bg-amber-50 text-amber-800',
        danger: 'border-red-600/40 bg-red-50 text-red-700',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
export { badgeVariants };
