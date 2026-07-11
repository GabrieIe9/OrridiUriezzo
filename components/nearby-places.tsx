import {getLocale, getTranslations} from 'next-intl/server';
import places from '@/data/nearby-places.json';
import type {AppLocale} from '@/i18n/routing';
import {NearbyPlacesExplorer, type NearbyExplorerPlace} from './nearby-places-explorer';

function embedFor(query: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=13&output=embed`;
}

export async function NearbyPlaces() {
  const locale = await getLocale() as AppLocale;
  const t = await getTranslations('nearby');

  const explorerPlaces: NearbyExplorerPlace[] = [
    ...places.restaurants.map((place) => ({
      id: place.id,
      name: place.name,
      locality: place.locality,
      description: place.description[locale],
      mapsUrl: place.mapsUrl,
      embedUrl: embedFor(`${place.name} ${place.locality}`),
      category: 'restaurant' as const
    })),
    ...places.camperAreas.map((place) => ({
      id: place.id,
      name: place.name,
      locality: place.locality,
      description: place.description[locale],
      mapsUrl: place.mapsUrl,
      embedUrl: embedFor(`${place.name} ${place.locality}`),
      category: 'camper' as const
    }))
  ];

  return (
    <section className="section nearby-section" aria-labelledby="nearby-title">
      <div className="shell">
        <div className="section-heading narrow">
          <span className="eyebrow">{t('eyebrow')}</span>
          <h2 id="nearby-title">{t('title')}</h2>
          <p>{t('intro')}</p>
        </div>

        <NearbyPlacesExplorer
          places={explorerPlaces}
          labels={{
            all: t('filters.all'),
            restaurants: t('restaurants'),
            camper: t('camperAreas'),
            openMaps: t('openMaps')
          }}
        />

        <p className="nearby-note">{t('liveNote')}</p>
      </div>
    </section>
  );
}
