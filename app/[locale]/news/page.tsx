import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {NewsArchiveView} from '@/components/news-archive';
import {getNewsArchive, type NewsLocale} from '@/lib/news';
import type {AppLocale} from '@/i18n/routing';

export const revalidate = 3600;

export async function generateMetadata({params}: {params: Promise<{locale: AppLocale}>}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'news'});
  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: {languages: {it: '/it/news', en: '/en/news', es: '/es/news', de: '/de/news'}}
  };
}

export default async function NewsPage({params}: {params: Promise<{locale: AppLocale}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const [t, archive] = await Promise.all([getTranslations('news'), getNewsArchive()]);

  return (
    <main className="news-page">
      <section className="news-hero">
        <div className="shell">
          <span className="eyebrow">{t('eyebrow')}</span>
          <h1>{t('title')}</h1>
          <p>{t('intro')}</p>
        </div>
      </section>
      <section className="section">
        <div className="shell">
          <NewsArchiveView
            archive={archive}
            locale={locale as NewsLocale}
            labels={{
              weekLabel: t('weekLabel'),
              published: t('published'),
              source: t('source'),
              readOriginal: t('readOriginal'),
              empty: t('empty'),
              updated: t('updated')
            }}
          />
        </div>
      </section>
    </main>
  );
}
