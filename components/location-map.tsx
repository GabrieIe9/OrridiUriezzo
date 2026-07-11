import {getTranslations} from 'next-intl/server';
import type {AttractionSlug, AttractionVisuals} from '@/data/attractions';
import {LocationMapExplorer} from './location-map-explorer';

export async function LocationMap({slug, visuals}: {slug: AttractionSlug; visuals: AttractionVisuals}) {
  const namespace = slug === 'orridi-uriezzo' ? 'orridi' : 'marmitte';
  const t = await getTranslations(namespace);

  const points = visuals.mapPoints.map((point) => ({
    ...point,
    title: t(`map.points.${point.id}.title`),
    description: t(`map.points.${point.id}.description`),
    alt: t(`map.points.${point.id}.alt`)
  }));

  return (
    <section id={`map-${slug}`} className="section location-map-section" aria-labelledby={`${slug}-map-title`}>
      <div className="shell">
        <div className="section-heading narrow location-map-heading">
          <span className="eyebrow">{t('map.eyebrow')}</span>
          <h2 id={`${slug}-map-title`}>{t('map.title')}</h2>
          <p>{t('map.intro')}</p>
        </div>

        <LocationMapExplorer
          defaultEmbedUrl={visuals.mapEmbedUrl}
          iframeTitle={t('map.iframeTitle')}
          points={points}
          labels={{
            all: t('map.filters.all'),
            attraction: t('map.filters.attraction'),
            access: t('map.filters.access'),
            viewpoint: t('map.filters.viewpoint'),
            openMap: t('map.openMap'),
            openPhotos: t('map.openPhotos'),
            photoSource: t('map.photoSource'),
            selectPoint: t('map.selectPoint')
          }}
        />
      </div>
    </section>
  );
}
