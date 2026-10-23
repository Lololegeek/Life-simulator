import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold', {
  variants: {
    variant: {
      default: 'bg-primary/15 text-primary',
      muted: 'bg-muted text-muted-foreground',
      success: 'bg-success/15 text-success',
      danger: 'bg-danger/15 text-danger',
      warning: 'bg-warning/15 text-warning',
    },
  },
  defaultVariants: { variant: 'default' },
});

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
