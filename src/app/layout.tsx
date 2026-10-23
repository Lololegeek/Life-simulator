import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Inter } from 'next/font/google';
import 'driver.js/dist/driver.css';
import './globals.css';
import { Providers } from './providers';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans' });
const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display' });

export const metadata: Metadata = {
  title: '1 sur 8 milliards — Simulateur de vie',
  description: 'Naître n’importe où sur Terre, vivre une vie entière et faire tous les choix : études, carrière, amour, crime, fortune.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f6fa' },
    { media: '(prefers-color-scheme: dark)', color: '#0d0f17' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
