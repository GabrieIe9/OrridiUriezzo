'use client';

import {useEffect, useRef, useState} from 'react';
import {Clock3, ExternalLink, MapPin, Phone, UtensilsCrossed, X} from 'lucide-react';
import {useLocale, useTranslations} from 'next-intl';
import restaurantsData from '@/data/restaurants.json';
import type {AttractionSlug} from '@/data/attractions';
import type {AppLocale} from '@/i18n/routing';

type Restaurant = (typeof restaurantsData.restaurants)[number];

export function RestaurantGrid({slug}: {slug: AttractionSlug}) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations('restaurants');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<Restaurant | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (selected && !dialog.open) dialog.showModal();
    if (!selected && dialog.open) dialog.close();
  }, [selected]);

  return (
    <section className="section section-restaurants" aria-labelledby="restaurants-title">
      <div className="shell">
        <div className="section-heading narrow">
          <span className="eyebrow">{t('eyebrow')}</span>
          <h2 id="restaurants-title">{t('title')}</h2>
          <p>{t('intro')}</p>
          <p className="data-warning">{t('placeholderWarning')}</p>
        </div>

        <div className="restaurant-grid">
          {restaurantsData.restaurants.map((restaurant) => (
            <button
              type="button"
              className="restaurant-card"
              key={restaurant.id}
              onClick={() => setSelected(restaurant)}
              aria-haspopup="dialog"
            >
              <span className="restaurant-card-icon" aria-hidden="true">
                <UtensilsCrossed size={22} />
              </span>
              <span>
                <strong>{restaurant.name}</strong>
                <small>{restaurant.cuisine[locale]}</small>
                <em>{restaurant.distance[slug][locale]}</em>
              </span>
            </button>
          ))}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="restaurant-dialog"
        onClose={() => setSelected(null)}
        onClick={(event) => {
          if (event.target === dialogRef.current) setSelected(null);
        }}
      >
        {selected ? (
          <div className="dialog-panel">
            <button
              type="button"
              className="dialog-close"
              onClick={() => setSelected(null)}
              aria-label={t('close')}
            >
              <X size={20} />
            </button>

            <span className="dialog-kicker">{t('demoBadge')}</span>
            <h3>{selected.name}</h3>
            <p className="dialog-cuisine">{selected.cuisine[locale]}</p>

            <dl className="restaurant-details">
              <div>
                <dt><MapPin size={17} aria-hidden="true" /> {t('address')}</dt>
                <dd>{selected.address}</dd>
              </div>
              <div>
                <dt><MapPin size={17} aria-hidden="true" /> {t('distance')}</dt>
                <dd>{selected.distance[slug][locale]}</dd>
              </div>
              <div>
                <dt><Clock3 size={17} aria-hidden="true" /> {t('hours')}</dt>
                <dd>{selected.hours[locale]}</dd>
              </div>
              <div>
                <dt><Phone size={17} aria-hidden="true" /> {t('phone')}</dt>
                <dd>{selected.phone ?? t('phoneMissing')}</dd>
              </div>
            </dl>

            <a className="button button-primary full-width" href={selected.mapsUrl} target="_blank" rel="noreferrer">
              {t('openMaps')} <ExternalLink size={17} aria-hidden="true" />
            </a>
          </div>
        ) : null}
      </dialog>
    </section>
  );
}
