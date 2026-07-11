import type {Metadata} from 'next';
import Image from 'next/image';
import {ArrowRight, Droplets, Headphones, MapPinned, Mountain, Route} from 'lucide-react';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {getHomeCardImages} from '@/lib/visuals';
import {FadeIn} from '@/components/fade-in';
import {ShareQrButton} from '@/components/share-qr-button';
import type {AppLocale} from '@/i18n/routing';
import {italianShareUrl} from '@/lib/site-url';

export const revalidate = 3600;

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
  const cardImages = await getHomeCardImages();

  const cards = [
    {
      slug: 'orridi-uriezzo' as const,
      href: '/orridi-uriezzo' as const,
      icon: Mountain,
      image: cardImages['orridi-uriezzo']
    },
    {
      slug: 'marmitte-dei-giganti' as const,
      href: '/marmitte-dei-giganti' as const,
      icon: Droplets,
      image: cardImages['marmitte-dei-giganti']
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


      <section className="home-quick-actions shell" aria-labelledby="home-quick-actions-title">
        <div className="home-quick-actions-heading">
          <span className="eyebrow">{t('quickActions.intro')}</span>
          <h2 id="home-quick-actions-title">{t('quickActions.title')}</h2>
        </div>
        <div className="home-quick-actions-grid">
          <Link href="/orridi-uriezzo#visit-planner-orridi-uriezzo" className="home-quick-action">
            <span aria-hidden="true"><Route size={22} /></span>
            <strong>{t('quickActions.plan')}</strong>
            <p>{t('quickActions.planText')}</p>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link href="/orridi-uriezzo#map-orridi-uriezzo" className="home-quick-action">
            <span aria-hidden="true"><MapPinned size={22} /></span>
            <strong>{t('quickActions.map')}</strong>
            <p>{t('quickActions.mapText')}</p>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link href="/orridi-uriezzo#audio-orridi-uriezzo" className="home-quick-action">
            <span aria-hidden="true"><Headphones size={22} /></span>
            <strong>{t('quickActions.audio')}</strong>
            <p>{t('quickActions.audioText')}</p>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
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
