import Image from 'next/image';
import {Camera, Clock3, ExternalLink, Footprints, MapPin, Mountain, Route, ShieldCheck} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import {attractionVisuals, type AttractionSlug} from '@/data/attractions';
import {AudioGuide} from './audio-guide';
import {FadeIn} from './fade-in';
import {NearbyPlaces} from './nearby-places';

type Fact = {
  icon: 'route' | 'time' | 'difficulty' | 'location';
  label: string;
  value: string;
};

const factIcons = {
  route: Route,
  time: Clock3,
  difficulty: Footprints,
  location: MapPin
};

function Paragraphs({items}: {items: string[]}) {
  return (
    <div className="content-copy">
      {items.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
    </div>
  );
}

export async function AttractionPage({slug}: {slug: AttractionSlug}) {
  const namespace = slug === 'orridi-uriezzo' ? 'orridi' : 'marmitte';
  const t = await getTranslations(namespace);
  const common = await getTranslations('common');
  const visuals = attractionVisuals[slug];
  const intro = t.raw('intro') as string[];
  const facts = t.raw('facts') as Fact[];
  const highlights = t.raw('highlights.items') as string[];
  const arrival = t.raw('sections.arrival.body') as string[];
  const geology = t.raw('sections.geology.body') as string[];
  const visit = t.raw('sections.visit.body') as string[];

  return (
    <main>
      <section className="detail-hero">
        <Image
          src={visuals.hero}
          alt={t('heroAlt')}
          fill
          priority
          sizes="100vw"
          className="hero-image"
        />
        <div className="hero-overlay" />
        <div className="shell detail-hero-content">
          <span className="eyebrow light">{t('eyebrow')}</span>
          <h1>{t('title')}</h1>
          <p>{t('subtitle')}</p>
          <a href={visuals.mapsUrl} target="_blank" rel="noreferrer" className="button button-light">
            <MapPin size={18} aria-hidden="true" /> {common('openMap')}
            <ExternalLink size={15} aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="section intro-section">
        <div className="shell detail-grid">
          <FadeIn className="story-column">
            <span className="eyebrow">{t('introEyebrow')}</span>
            {intro.map((paragraph, index) => <p key={index} className="lead-paragraph">{paragraph}</p>)}
          </FadeIn>
          <FadeIn className="facts-card" delay={100}>
            {facts.map((fact) => {
              const Icon = factIcons[fact.icon];
              return (
                <div className="fact" key={fact.label}>
                  <span aria-hidden="true"><Icon size={21} /></span>
                  <div><small>{fact.label}</small><strong>{fact.value}</strong></div>
                </div>
              );
            })}
          </FadeIn>
        </div>
      </section>

      <section className="section audio-section">
        <div className="shell">
          <AudioGuide slug={slug} />
        </div>
      </section>

      <section className="section content-sections">
        <div className="shell content-grid">
          <FadeIn className="content-card">
            <span className="content-icon"><MapPin size={22} aria-hidden="true" /></span>
            <h2>{t('sections.arrival.title')}</h2>
            <Paragraphs items={arrival} />
          </FadeIn>
          <FadeIn className="content-card" delay={70}>
            <span className="content-icon"><Mountain size={22} aria-hidden="true" /></span>
            <h2>{t('sections.geology.title')}</h2>
            <Paragraphs items={geology} />
          </FadeIn>
          <FadeIn className="content-card" delay={140}>
            <span className="content-icon"><ShieldCheck size={22} aria-hidden="true" /></span>
            <h2>{t('sections.visit.title')}</h2>
            <Paragraphs items={visit} />
          </FadeIn>
        </div>
      </section>

      <section className="section highlight-section">
        <div className="shell highlight-grid">
          <FadeIn>
            <span className="eyebrow light">{t('highlights.eyebrow')}</span>
            <h2>{t('highlights.title')}</h2>
          </FadeIn>
          <ul>
            {highlights.map((item, index) => (
              <FadeIn key={item} delay={index * 45}>
                <li><span>{String(index + 1).padStart(2, '0')}</span>{item}</li>
              </FadeIn>
            ))}
          </ul>
        </div>
      </section>

      <section className="section gallery-section" aria-labelledby={`${slug}-gallery-title`}>
        <div className="shell">
          <div className="section-heading gallery-heading">
            <span className="eyebrow">{t('gallery.eyebrow')}</span>
            <h2 id={`${slug}-gallery-title`}>{t('gallery.title')}</h2>
            <p>{t('gallery.intro')}</p>
            <a className="button button-secondary gallery-maps-link" href={visuals.mapsPhotosUrl} target="_blank" rel="noreferrer">
              <Camera size={18} aria-hidden="true" /> {t('gallery.mapsPhotos')} <ExternalLink size={15} aria-hidden="true" />
            </a>
          </div>
          <div className="gallery-grid">
            {visuals.gallery.map((image, index) => (
              <FadeIn className={`gallery-item gallery-item-${index + 1}`} key={image.src} delay={index * 40}>
                <figure>
                  <Image
                    src={image.src}
                    alt={t(image.altKey)}
                    fill
                    sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
                  />
                  <figcaption>
                    <span>{t(image.captionKey)}</span>
                    <a href={image.sourceUrl} target="_blank" rel="noreferrer">
                      {t('gallery.sourceLabel')} <ExternalLink size={12} aria-hidden="true" />
                    </a>
                  </figcaption>
                </figure>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <NearbyPlaces />
    </main>
  );
}
