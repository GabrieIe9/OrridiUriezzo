import type {Metadata} from 'next';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.vercel.app';

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
