import type {Metadata} from 'next';
import Image from 'next/image';
import {
  ArrowRight,
  BookOpenCheck,
  Droplets,
  Headphones,
  Languages,
  MapPinned,
  Mountain,
  Route
} from 'lucide-react';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {getHomeAidaImages, getHomeCardImages} from '@/lib/visuals';
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
  const [cardImages, heroImages] = await Promise.all([
    getHomeCardImages(),
    getHomeAidaImages()
  ]);

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

  const benefits = [
    {key: 'understand', icon: BookOpenCheck},
    {key: 'orient', icon: MapPinned},
    {key: 'listen', icon: Headphones}
  ] as const;

  const proof = [
    {key: 'languages', icon: Languages},
    {key: 'chapters', icon: BookOpenCheck},
    {key: 'route', icon: Route}
  ] as const;

  return (
    <main className="home-main home-main-aida">
      <section className="aida-hero shell" aria-labelledby="home-aida-title">
        <FadeIn className="aida-hero-copy">
          <span className="eyebrow">{t('aida.attention.eyebrow')}</span>
          <h1 id="home-aida-title">{t('aida.attention.title')}</h1>
          <p>{t('aida.attention.description')}</p>
          <div className="aida-hero-actions">
            <Link href="/orridi-uriezzo" className="button button-primary">
              {t('aida.attention.primaryCta')} <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link href="/marmitte-dei-giganti" className="button button-secondary">
              {t('aida.attention.secondaryCta')}
            </Link>
          </div>
          <div className="aida-proof-row" aria-label={t('aida.proof.ariaLabel')}>
            {proof.map(({key, icon: Icon}) => (
              <div className="aida-proof-item" key={key}>
                <Icon size={18} aria-hidden="true" />
                <span>{t(`aida.proof.${key}`)}</span>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn className="aida-hero-visual" delay={100}>
          <figure className="aida-hero-image aida-hero-image-primary">
            <Image
              src={heroImages.orridi}
              alt={t('aida.attention.orridiAlt')}
              fill
              priority
              sizes="(max-width: 900px) 92vw, 38vw"
            />
          </figure>
          <figure className="aida-hero-image aida-hero-image-secondary">
            <Image
              src={heroImages.marmitte}
              alt={t('aida.attention.marmitteAlt')}
              fill
              priority
              sizes="(max-width: 900px) 45vw, 20vw"
            />
          </figure>
          <div className="aida-hero-badge">
            <strong>{t('aida.attention.badgeTitle')}</strong>
            <span>{t('aida.attention.badgeText')}</span>
          </div>
        </FadeIn>
      </section>

      <section className="aida-interest shell" aria-labelledby="aida-interest-title">
        <div className="aida-section-heading">
          <span className="eyebrow">{t('aida.interest.eyebrow')}</span>
          <h2 id="aida-interest-title">{t('aida.interest.title')}</h2>
          <p>{t('aida.interest.description')}</p>
        </div>
        <div className="aida-benefit-grid">
          {benefits.map(({key, icon: Icon}, index) => (
            <FadeIn className="aida-benefit-card" key={key} delay={index * 60}>
              <span className="aida-benefit-icon" aria-hidden="true"><Icon size={22} /></span>
              <h3>{t(`aida.interest.cards.${key}.title`)}</h3>
              <p>{t(`aida.interest.cards.${key}.text`)}</p>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="aida-desire shell" aria-labelledby="aida-desire-title">
        <div className="aida-section-heading aida-section-heading-centered">
          <span className="eyebrow">{t('aida.desire.eyebrow')}</span>
          <h2 id="aida-desire-title">{t('aida.desire.title')}</h2>
          <p>{t('aida.desire.description')}</p>
        </div>

        <div className="attraction-selector" aria-label={t('selectorAria')}>
          {cards.map(({slug, href, icon: Icon, image}, index) => (
            <FadeIn key={slug} delay={index * 100} className="selector-wrap">
              <Link href={href} className="attraction-card">
                <Image src={image} alt={t(`cards.${slug}.alt`)} fill sizes="(max-width: 900px) 100vw, 50vw" />
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
        </div>

        <FadeIn className="aida-route-note">
          <Route size={24} aria-hidden="true" />
          <p><strong>{t('trailNoteTitle')}</strong> {t('trailNote')}</p>
        </FadeIn>
      </section>

      <section className="aida-action-section">
        <div className="shell aida-action-card">
          <div className="aida-action-copy">
            <span className="eyebrow light">{t('aida.action.eyebrow')}</span>
            <h2>{t('aida.action.title')}</h2>
            <p>{t('aida.action.description')}</p>
          </div>
          <div className="aida-action-buttons">
            <Link href="/orridi-uriezzo#orridi-uriezzo-guide" className="button button-light">
              {t('aida.action.primaryCta')} <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link href="/news" className="button aida-button-outline-light">
              {t('aida.action.newsCta')}
            </Link>
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
        </div>
      </section>
    </main>
  );
}
