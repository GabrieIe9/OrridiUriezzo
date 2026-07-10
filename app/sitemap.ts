import type {MetadataRoute} from 'next';
import {routing} from '@/i18n/routing';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.vercel.app';
  const paths = ['', '/orridi-uriezzo', '/marmitte-dei-giganti', '/qrcode'];

  return routing.locales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${base}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: path ? 'monthly' : 'weekly',
      priority: path ? 0.8 : 1
    }))
  );
}
