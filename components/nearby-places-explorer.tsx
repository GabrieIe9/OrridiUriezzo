'use client';

import {Caravan, ExternalLink, MapPin, UtensilsCrossed} from 'lucide-react';
import {useMemo, useState} from 'react';

export type NearbyExplorerPlace = {
  id: string;
  name: string;
  locality: string;
  description: string;
  mapsUrl: string;
  embedUrl: string;
  category: 'restaurant' | 'camper';
};

type Labels = {
  all: string;
  restaurants: string;
  camper: string;
  openMaps: string;
};

export function NearbyPlacesExplorer({places, labels}: {places: NearbyExplorerPlace[]; labels: Labels}) {
  const [filter, setFilter] = useState<'all' | NearbyExplorerPlace['category']>('all');
  const [selectedId, setSelectedId] = useState(places[0]?.id || '');

  const filtered = useMemo(
    () => filter === 'all' ? places : places.filter((place) => place.category === filter),
    [filter, places]
  );
  const selected = places.find((place) => place.id === selectedId) || filtered[0] || places[0];

  function setCategory(category: typeof filter) {
    setFilter(category);
    const first = category === 'all' ? places[0] : places.find((place) => place.category === category);
    if (first) setSelectedId(first.id);
  }

  return (
    <div className="nearby-explorer">
      <div className="map-filter-bar nearby-filter-bar" role="group">
        <button type="button" className={filter === 'all' ? 'is-active' : undefined} onClick={() => setCategory('all')}>{labels.all}</button>
        <button type="button" className={filter === 'restaurant' ? 'is-active' : undefined} onClick={() => setCategory('restaurant')}><UtensilsCrossed size={15} aria-hidden="true" /> {labels.restaurants}</button>
        <button type="button" className={filter === 'camper' ? 'is-active' : undefined} onClick={() => setCategory('camper')}><Caravan size={15} aria-hidden="true" /> {labels.camper}</button>
      </div>

      <div className="nearby-explorer-layout">
        <div className="google-map-frame nearby-explorer-map">
          <iframe
            src={selected?.embedUrl}
            title={selected?.name || labels.all}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>

        <div className="nearby-explorer-list">
          {filtered.map((place) => {
            const Icon = place.category === 'restaurant' ? UtensilsCrossed : Caravan;
            return (
              <article className={`nearby-card nearby-card-interactive${selected?.id === place.id ? ' is-selected' : ''}`} key={place.id}>
                <button type="button" onClick={() => setSelectedId(place.id)}>
                  <span className="nearby-card-icon" aria-hidden="true"><Icon size={19} /></span>
                  <span>
                    <strong>{place.name}</strong>
                    <small><MapPin size={13} aria-hidden="true" /> {place.locality}</small>
                    <span>{place.description}</span>
                  </span>
                </button>
                <a className="nearby-open" href={place.mapsUrl} target="_blank" rel="noreferrer">
                  {labels.openMaps} <ExternalLink size={15} aria-hidden="true" />
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
