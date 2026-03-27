import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ViewModeProvider } from '@/lib/contexts/view-mode-context';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'CarGA — La bolsa de cargas digital de Argentina',
    template: '%s | CarGA',
  },
  description:
    'Conectamos transportistas con carga disponible en tiempo real. Sin llamadas. Sin grupos de WhatsApp. Sin intermediarios.',
  keywords: [
    'bolsa de cargas',
    'transporte Argentina',
    'carga disponible',
    'transportistas',
    'camiones',
    'flete',
    'logística digital',
  ],
  authors: [{ name: 'Codexium', url: 'https://codexium.ai' }],
  openGraph: {
    title: 'CarGA — La bolsa de cargas digital de Argentina',
    description:
      'Conectamos transportistas con carga disponible en tiempo real. Sin llamadas. Sin intermediarios.',
    type: 'website',
    locale: 'es_AR',
    siteName: 'CarGA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CarGA — La bolsa de cargas digital de Argentina',
    description:
      'Conectamos transportistas con carga disponible en tiempo real. Sin intermediarios.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-AR" className={inter.variable}>
      <body className={inter.className}>
        <ViewModeProvider>{children}</ViewModeProvider>
      </body>
    </html>
  );
}
