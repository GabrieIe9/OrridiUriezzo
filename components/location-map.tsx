import Image from 'next/image';
import {Camera, ExternalLink, MapPinned} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import type {AttractionSlug, AttractionVisuals} from '@/data/attractions';
import {FadeIn} from './fade-in';

export async function LocationMap({slug, visuals}: {slug: AttractionSlug; visuals: AttractionVisuals}) {
  const namespace = slug === 'orridi-uriezzo' ? 'orridi' : 'marmitte';
  const t = await getTranslations(namespace);

  return (
    <section className="section location-map-section" aria-labelledby={`${slug}-map-title`}>
      <div className="shell">
        <div className="section-heading narrow location-map-heading">
          <span className="eyebrow">{t('map.eyebrow')}</span>
          <h2 id={`${slug}-map-title`}>{t('map.title')}</h2>
          <p>{t('map.intro')}</p>
        </div>

        <FadeIn className="google-map-frame">
          <iframe
            src={visuals.mapEmbedUrl}
            title={t('map.iframeTitle')}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </FadeIn>

        <div className="location-card-grid">
          {visuals.mapPoints.map((point, index) => (
            <FadeIn className="location-card" key={point.id} delay={index * 60}>
              {point.image ? (
                <div className="location-card-image">
                  <Image
                    src={point.image}
                    alt={t(`map.points.${point.id}.alt`)}
                    fill
                    sizes="(max-width: 760px) 100vw, 33vw"
                  />
                </div>
              ) : (
                <div className="location-card-image location-card-image-placeholder" aria-hidden="true">
                  <MapPinned size={38} />
                </div>
              )}
              <div className="location-card-body">
                <h3>{t(`map.points.${point.id}.title`)}</h3>
                <p>{t(`map.points.${point.id}.description`)}</p>
                <div className="location-card-actions">
                  <a href={point.mapsUrl} target="_blank" rel="noreferrer">
                    <MapPinned size={16} aria-hidden="true" /> {t('map.openMap')}
                  </a>
                  <a href={point.mapsPhotosUrl} target="_blank" rel="noreferrer">
                    <Camera size={16} aria-hidden="true" /> {t('map.openPhotos')}
                  </a>
                  {point.sourceUrl ? (
                    <a href={point.sourceUrl} target="_blank" rel="noreferrer" className="location-source-link">
                      {t('map.photoSource')} <ExternalLink size={13} aria-hidden="true" />
                    </a>
                  ) : null}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
