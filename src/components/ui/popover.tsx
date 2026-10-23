'use client';

import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

export function PopoverContent({ className, ...props }: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        sideOffset={6}
        className={cn('z-[60] w-72 rounded-xl border border-border bg-card p-4 shadow-xl animate-in fade-in-0 zoom-in-95', className)}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
