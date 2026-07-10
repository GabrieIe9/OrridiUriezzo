import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {QrCodePanel} from '@/components/qr-code-panel';
import {FadeIn} from '@/components/fade-in';
import type {AppLocale} from '@/i18n/routing';

export async function generateMetadata({params}: {params: Promise<{locale: AppLocale}>}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'qrcode'});
  return {title: t('meta.title'), description: t('meta.description')};
}

export default async function QrCodePage({params}: {params: Promise<{locale: AppLocale}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('qrcode');
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-project.vercel.app';

  return (
    <main className="qr-page">
      <section className="shell qr-intro">
        <FadeIn>
          <span className="eyebrow">{t('eyebrow')}</span>
          <h1>{t('title')}</h1>
          <p>{t('intro')}</p>
        </FadeIn>
      </section>
      <section className="shell qr-section">
        <QrCodePanel defaultUrl={url} />
      </section>
    </main>
  );
}
