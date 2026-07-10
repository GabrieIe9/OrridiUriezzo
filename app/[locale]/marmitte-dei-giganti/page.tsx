import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {AttractionPage} from '@/components/attraction-page';
import type {AppLocale} from '@/i18n/routing';

export async function generateMetadata({params}: {params: Promise<{locale: AppLocale}>}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'marmitte'});
  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: {languages: {it: '/it/marmitte-dei-giganti', en: '/en/marmitte-dei-giganti', es: '/es/marmitte-dei-giganti', de: '/de/marmitte-dei-giganti'}}
  };
}

export default async function MarmittePage({params}: {params: Promise<{locale: AppLocale}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return <AttractionPage slug="marmitte-dei-giganti" />;
}
