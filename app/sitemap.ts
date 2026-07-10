import type {MetadataRoute} from 'next';
import {routing} from '@/i18n/routing';
import {siteOrigin} from '@/lib/site-url';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['', '/orridi-uriezzo', '/marmitte-dei-giganti', '/news'];

  return routing.locales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${siteOrigin}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: path === '/news' || !path ? 'weekly' : 'monthly',
      priority: path ? 0.8 : 1
    }))
  );
}
