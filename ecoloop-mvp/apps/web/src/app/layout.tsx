import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'EcoLoop - La plateforme de l\'économie circulaire',
    template: '%s | EcoLoop',
  },
  description: 'Connectez tous les acteurs de l\'économie circulaire : producteurs, collecteurs, industriels et mairies. Gérez vos déchets, organisez vos collectes, valorisez vos matières.',
  keywords: ['économie circulaire', 'gestion déchets', 'recyclage', 'collecte déchets', 'valorisation matières', 'développement durable'],
  authors: [{ name: 'EcoLoop' }],
  creator: 'EcoLoop',
  publisher: 'EcoLoop',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://ecoloop.app',
    title: 'EcoLoop - La plateforme de l\'économie circulaire',
    description: 'Connectez tous les acteurs de l\'économie circulaire pour une gestion des déchets plus efficace.',
    siteName: 'EcoLoop',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EcoLoop - La plateforme de l\'économie circulaire',
    description: 'Connectez tous les acteurs de l\'économie circulaire pour une gestion des déchets plus efficace.',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${fontSans.variable} ${fontMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}