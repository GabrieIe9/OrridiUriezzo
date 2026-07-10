import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {AttractionPage} from '@/components/attraction-page';
import type {AppLocale} from '@/i18n/routing';

export async function generateMetadata({params}: {params: Promise<{locale: AppLocale}>}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'orridi'});
  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: {languages: {it: '/it/orridi-uriezzo', en: '/en/orridi-uriezzo', es: '/es/orridi-uriezzo', de: '/de/orridi-uriezzo'}}
  };
}

export default async function OrridiPage({params}: {params: Promise<{locale: AppLocale}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  return <AttractionPage slug="orridi-uriezzo" />;
}
