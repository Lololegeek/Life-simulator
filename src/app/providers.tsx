'use client';

import { ThemeProvider } from 'next-themes';
import { I18nextProvider } from 'react-i18next';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import i18n from '@/i18n';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <I18nextProvider i18n={i18n}>
        <TooltipProvider delayDuration={200}>
          {children}
          <Toaster position="top-center" richColors closeButton />
        </TooltipProvider>
      </I18nextProvider>
    </ThemeProvider>
  );
}
