import type { Metadata, Viewport } from 'next';
import { Fraunces, Geist, Geist_Mono } from 'next/font/google';
import 'driver.js/dist/driver.css';
import './globals.css';
import { Providers } from './providers';

const sans = Geist({ subsets: ['latin'], variable: '--font-sans' });
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });
const display = Fraunces({ subsets: ['latin'], variable: '--font-display', axes: ['SOFT', 'opsz'] });

export const metadata: Metadata = {
  title: '1 sur 8 milliards — Simulateur de vie',
  description: 'Naître n’importe où sur Terre, vivre une vie entière et faire tous les choix : études, carrière, amour, crime, fortune.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f2ece2' },
    { media: '(prefers-color-scheme: dark)', color: '#13120f' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable} ${display.variable} paper font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
