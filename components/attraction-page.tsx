import Image from 'next/image';
import {BookOpen, Camera, Clock3, ExternalLink, Footprints, MapPin, Route} from 'lucide-react';
import {getLocale, getTranslations} from 'next-intl/server';
import type {AttractionSlug} from '@/data/attractions';
import {getAttractionVisuals} from '@/lib/visuals';
import {getGuide} from '@/lib/guides';
import {AudioGuide} from './audio-guide';
import {FadeIn} from './fade-in';
import {NearbyPlaces} from './nearby-places';
import {LocationMap} from './location-map';

type Fact = {
  icon: 'route' | 'time' | 'difficulty' | 'location';
  label: string;
  value: string;
};

const factIcons = {route: Route, time: Clock3, difficulty: Footprints, location: MapPin};

export async function AttractionPage({slug}: {slug: AttractionSlug}) {
  const namespace = slug === 'orridi-uriezzo' ? 'orridi' : 'marmitte';
  const [t, common, locale, visuals] = await Promise.all([
    getTranslations(namespace),
    getTranslations('common'),
    getLocale(),
    getAttractionVisuals(slug)
  ]);
  const guide = getGuide(locale, slug);
  const intro = t.raw('intro') as string[];
  const facts = t.raw('facts') as Fact[];
  const highlights = t.raw('highlights.items') as string[];

  return (
    <main>
      <section className="detail-hero">
        <Image src={visuals.hero} alt={t('heroAlt')} fill priority sizes="100vw" className="hero-image" />
        <div className="hero-overlay" />
        <div className="shell detail-hero-content">
          <span className="eyebrow light">{t('eyebrow')}</span>
          <h1>{t('title')}</h1>
          <p>{t('subtitle')}</p>
          <a href={visuals.mapsUrl} target="_blank" rel="noreferrer" className="button button-light">
            <MapPin size={18} aria-hidden="true" /> {common('openMap')} <ExternalLink size={15} aria-hidden="true" />
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
              return <div className="fact" key={fact.label}><span aria-hidden="true"><Icon size={21} /></span><div><small>{fact.label}</small><strong>{fact.value}</strong></div></div>;
            })}
          </FadeIn>
        </div>
      </section>

      <section className="section audio-section">
        <div className="shell">
          <AudioGuide slug={slug} chapters={guide.chapters.map(({id, title, kicker}) => ({id, title, kicker}))} />
        </div>
      </section>

      <section className="section guide-section" aria-labelledby={`${slug}-guide-title`}>
        <div className="shell">
          <div className="section-heading guide-heading">
            <span className="eyebrow"><BookOpen size={17} aria-hidden="true" /> {t('guide.eyebrow')}</span>
            <h2 id={`${slug}-guide-title`}>{t('guide.title')}</h2>
            <p>{t('guide.description')}</p>
          </div>
          <nav className="guide-toc" aria-label={t('guide.contentsLabel')}>
            {guide.chapters.map((chapter, index) => (
              <a key={chapter.id} href={`#chapter-${slug}-${chapter.id}`}>
                <span>{String(index + 1).padStart(2, '0')}</span>{chapter.title}
              </a>
            ))}
          </nav>
          <div className="guide-chapters">
            {guide.chapters.map((chapter, index) => (
              <FadeIn key={chapter.id} className="guide-chapter" delay={(index % 3) * 50}>
                <article id={`chapter-${slug}-${chapter.id}`}>
                  <div className="chapter-number">{String(index + 1).padStart(2, '0')}</div>
                  <div className="chapter-body">
                    <span className="eyebrow">{chapter.kicker}</span>
                    <h2>{chapter.title}</h2>
                    {chapter.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
                    <a className="chapter-back" href={`#${slug}-guide-title`}>{t('guide.backToContents')}</a>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="section highlight-section">
        <div className="shell highlight-grid">
          <FadeIn><span className="eyebrow light">{t('highlights.eyebrow')}</span><h2>{t('highlights.title')}</h2></FadeIn>
          <ul>{highlights.map((item, index) => <FadeIn key={item} delay={index * 45}><li><span>{String(index + 1).padStart(2, '0')}</span>{item}</li></FadeIn>)}</ul>
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
                  <Image src={image.src} alt={t(image.altKey)} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" />
                  <figcaption>
                    <span>{t(image.captionKey)}</span>
                    <a href={image.sourceUrl} target="_blank" rel="noreferrer">
                      {t('gallery.sourceLabel')}{image.author ? ` · ${image.author}` : ''}{image.license ? ` · ${image.license}` : ''} <ExternalLink size={12} aria-hidden="true" />
                    </a>
                  </figcaption>
                </figure>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <LocationMap slug={slug} visuals={visuals} />
      <NearbyPlaces />
    </main>
  );
}
