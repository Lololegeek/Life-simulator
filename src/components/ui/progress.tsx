'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

export function Progress({ value, color, className }: { value: number; color?: string; className?: string }) {
  return (
    <ProgressPrimitive.Root value={value} className={cn('relative h-2.5 w-full overflow-hidden rounded-full bg-muted', className)}>
      <ProgressPrimitive.Indicator
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${Math.max(2, value)}%`, background: color ?? 'hsl(var(--primary))' }}
      />
    </ProgressPrimitive.Root>
  );
}
