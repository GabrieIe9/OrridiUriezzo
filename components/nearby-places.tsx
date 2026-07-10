import {Caravan, ExternalLink, MapPin, UtensilsCrossed} from 'lucide-react';
import {getLocale, getTranslations} from 'next-intl/server';
import places from '@/data/nearby-places.json';
import type {AppLocale} from '@/i18n/routing';

const restaurantsEmbed = 'https://www.google.com/maps?q=ristoranti%20pizzerie%20vicino%20Orridi%20di%20Uriezzo&z=11&output=embed';
const camperEmbed = 'https://www.google.com/maps?q=area%20camper%20vicino%20Orridi%20di%20Uriezzo&z=11&output=embed';

export async function NearbyPlaces() {
  const locale = await getLocale() as AppLocale;
  const t = await getTranslations('nearby');

  return (
    <section className="section nearby-section" aria-labelledby="nearby-title">
      <div className="shell">
        <div className="section-heading narrow">
          <span className="eyebrow">{t('eyebrow')}</span>
          <h2 id="nearby-title">{t('title')}</h2>
          <p>{t('intro')}</p>
        </div>

        <div className="nearby-map-grid">
          <article className="nearby-map-card">
            <div className="nearby-map-card-heading">
              <UtensilsCrossed size={20} aria-hidden="true" />
              <h3>{t('restaurantsMapTitle')}</h3>
            </div>
            <iframe
              src={restaurantsEmbed}
              title={t('restaurantsMapTitle')}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </article>
          <article className="nearby-map-card">
            <div className="nearby-map-card-heading">
              <Caravan size={20} aria-hidden="true" />
              <h3>{t('camperMapTitle')}</h3>
            </div>
            <iframe
              src={camperEmbed}
              title={t('camperMapTitle')}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </article>
        </div>

        <div className="nearby-groups">
          <div className="nearby-group">
            <div className="nearby-group-heading">
              <span aria-hidden="true"><UtensilsCrossed size={21} /></span>
              <h3>{t('restaurants')}</h3>
            </div>
            <div className="nearby-grid">
              {places.restaurants.map((place) => (
                <a className="nearby-card" href={place.mapsUrl} target="_blank" rel="noreferrer" key={place.id}>
                  <div>
                    <strong>{place.name}</strong>
                    <span><MapPin size={14} aria-hidden="true" /> {place.locality}</span>
                    <p>{place.description[locale]}</p>
                  </div>
                  <span className="nearby-open">{t('openMaps')} <ExternalLink size={15} aria-hidden="true" /></span>
                </a>
              ))}
            </div>
          </div>

          <div className="nearby-group">
            <div className="nearby-group-heading">
              <span aria-hidden="true"><Caravan size={21} /></span>
              <h3>{t('camperAreas')}</h3>
            </div>
            <div className="nearby-grid">
              {places.camperAreas.map((place) => (
                <a className="nearby-card" href={place.mapsUrl} target="_blank" rel="noreferrer" key={place.id}>
                  <div>
                    <strong>{place.name}</strong>
                    <span><MapPin size={14} aria-hidden="true" /> {place.locality}</span>
                    <p>{place.description[locale]}</p>
                  </div>
                  <span className="nearby-open">{t('openMaps')} <ExternalLink size={15} aria-hidden="true" /></span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <p className="nearby-note">{t('liveNote')}</p>
      </div>
    </section>
  );
}
