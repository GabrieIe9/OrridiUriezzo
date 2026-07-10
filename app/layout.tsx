import type {Metadata, Viewport} from 'next';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.vercel.app';


export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light dark',
  themeColor: [
    {media: '(prefers-color-scheme: light)', color: '#f7f4ec'},
    {media: '(prefers-color-scheme: dark)', color: '#0b1714'}
  ]
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Orridi di Uriezzo & Marmitte dei Giganti',
    template: '%s | Val d’Ossola'
  },
  description: 'Guida multilingua agli Orridi di Uriezzo e alle Marmitte dei Giganti in Valle Antigorio.',
  manifest: '/manifest.webmanifest',
  icons: {icon: '/icon.svg'},
  robots: {index: true, follow: true}
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return children;
}
