'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List className={cn('flex gap-1 rounded-full border border-foreground/10 bg-card p-1', className)} {...props} />;
}

export function TabsTrigger({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'flex flex-1 flex-col items-center gap-0.5 rounded-full px-2 py-1.5 text-[11px] font-semibold text-muted-foreground transition hover:text-foreground data-[state=active]:bg-foreground data-[state=active]:text-background sm:flex-row sm:justify-center sm:gap-1.5 sm:text-xs',
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn('outline-none data-[state=inactive]:hidden', className)} {...props} />;
}
