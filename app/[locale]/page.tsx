import type {Metadata} from 'next';
import Image from 'next/image';
import {ArrowRight, Droplets, Mountain} from 'lucide-react';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {attractionVisuals} from '@/data/attractions';
import {FadeIn} from '@/components/fade-in';
import {ShareQrButton} from '@/components/share-qr-button';
import type {AppLocale} from '@/i18n/routing';
import {italianShareUrl} from '@/lib/site-url';

export async function generateMetadata({params}: {params: Promise<{locale: AppLocale}>}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'home'});
  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: {
      languages: {
        it: '/it', en: '/en', es: '/es', de: '/de'
      }
    }
  };
}

export default async function HomePage({params}: {params: Promise<{locale: AppLocale}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');
  const share = await getTranslations('share');
  const shareUrl = italianShareUrl;

  const cards = [
    {
      slug: 'orridi-uriezzo' as const,
      href: '/orridi-uriezzo' as const,
      icon: Mountain,
      image: attractionVisuals['orridi-uriezzo'].card
    },
    {
      slug: 'marmitte-dei-giganti' as const,
      href: '/marmitte-dei-giganti' as const,
      icon: Droplets,
      image: attractionVisuals['marmitte-dei-giganti'].card
    }
  ];

  return (
    <main className="home-main">
      <section className="home-intro shell">
        <FadeIn>
          <span className="eyebrow">{t('eyebrow')}</span>
          <h1>{t('title')}</h1>
          <p>{t('intro')}</p>
        </FadeIn>
      </section>

      <section className="attraction-selector shell" aria-label={t('selectorAria')}>
        {cards.map(({slug, href, icon: Icon, image}, index) => (
          <FadeIn key={slug} delay={index * 100} className="selector-wrap">
            <Link href={href} className="attraction-card">
              <Image src={image} alt={t(`cards.${slug}.alt`)} fill priority sizes="(max-width: 900px) 100vw, 50vw" />
              <div className="card-overlay" />
              <div className="card-content">
                <span className="card-icon"><Icon size={23} aria-hidden="true" /></span>
                <span className="card-location">{t(`cards.${slug}.location`)}</span>
                <h2>{t(`cards.${slug}.title`)}</h2>
                <p>{t(`cards.${slug}.subtitle`)}</p>
                <span className="card-link">{t('discover')} <ArrowRight size={18} aria-hidden="true" /></span>
              </div>
            </Link>
          </FadeIn>
        ))}
      </section>

      <section className="home-note shell">
        <FadeIn>
          <p><strong>{t('trailNoteTitle')}</strong> {t('trailNote')}</p>
          <div className="home-share">
            <ShareQrButton
              shareUrl={shareUrl}
              buttonLabel={share('button')}
              title={share('title')}
              description={share('description')}
              closeLabel={share('close')}
              nativeShareLabel={share('nativeShare')}
              copyLabel={share('copy')}
              copiedLabel={share('copied')}
              qrAlt={share('qrAlt')}
            />
          </div>
        </FadeIn>
      </section>
    </main>
  );
}
