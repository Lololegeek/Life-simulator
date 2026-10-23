'use client';

import * as React from 'react';
import { Drawer as VaulDrawer } from 'vaul';
import { cn } from '@/lib/utils';

export const Drawer = VaulDrawer.Root;

export function DrawerContent({ className, children, title }: { className?: string; children: React.ReactNode; title: string }) {
  return (
    <VaulDrawer.Portal>
      <VaulDrawer.Overlay className="fixed inset-0 z-50 bg-black/50" />
      <VaulDrawer.Content
        className={cn('fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] max-w-xl flex-col rounded-t-3xl border border-border bg-card outline-none', className)}
      >
        <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-muted" />
        <VaulDrawer.Title className="sr-only">{title}</VaulDrawer.Title>
        <VaulDrawer.Description className="sr-only">{title}</VaulDrawer.Description>
        <div className="overflow-y-auto p-5">{children}</div>
      </VaulDrawer.Content>
    </VaulDrawer.Portal>
  );
}
