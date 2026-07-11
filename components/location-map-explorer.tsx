'use client';

import Image from 'next/image';
import {Camera, ExternalLink, MapPinned} from 'lucide-react';
import {useMemo, useState} from 'react';

export type MapExplorerPoint = {
  id: string;
  title: string;
  description: string;
  alt: string;
  image?: string;
  mapsUrl: string;
  mapsPhotosUrl: string;
  sourceUrl?: string;
  embedUrl: string;
  category: 'attraction' | 'access' | 'viewpoint';
};

type Labels = {
  all: string;
  attraction: string;
  access: string;
  viewpoint: string;
  openMap: string;
  openPhotos: string;
  photoSource: string;
  selectPoint: string;
};

export function LocationMapExplorer({
  defaultEmbedUrl,
  iframeTitle,
  points,
  labels
}: {
  defaultEmbedUrl: string;
  iframeTitle: string;
  points: MapExplorerPoint[];
  labels: Labels;
}) {
  const [filter, setFilter] = useState<'all' | MapExplorerPoint['category']>('all');
  const [selectedId, setSelectedId] = useState(points[0]?.id || '');

  const filtered = useMemo(
    () => filter === 'all' ? points : points.filter((point) => point.category === filter),
    [filter, points]
  );
  const selected = points.find((point) => point.id === selectedId) || filtered[0] || points[0];

  function changeFilter(next: typeof filter) {
    setFilter(next);
    const first = next === 'all' ? points[0] : points.find((point) => point.category === next);
    if (first) setSelectedId(first.id);
  }

  return (
    <div className="map-explorer">
      <div className="map-filter-bar" role="group" aria-label={labels.selectPoint}>
        {(['all', 'attraction', 'access', 'viewpoint'] as const).map((category) => (
          <button
            type="button"
            key={category}
            className={filter === category ? 'is-active' : undefined}
            onClick={() => changeFilter(category)}
          >
            {labels[category]}
          </button>
        ))}
      </div>

      <div className="map-explorer-layout">
        <div className="google-map-frame map-explorer-frame">
          <iframe
            src={selected?.embedUrl || defaultEmbedUrl}
            title={selected ? `${iframeTitle}: ${selected.title}` : iframeTitle}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>

        <div className="map-explorer-list" aria-live="polite">
          {filtered.map((point) => (
            <article
              className={`location-card location-card-compact${selected?.id === point.id ? ' is-selected' : ''}`}
              key={point.id}
            >
              <button type="button" className="location-card-select" onClick={() => setSelectedId(point.id)}>
                {point.image ? (
                  <span className="location-card-image">
                    <Image src={point.image} alt={point.alt} fill sizes="(max-width: 760px) 35vw, 180px" />
                  </span>
                ) : (
                  <span className="location-card-image location-card-image-placeholder" aria-hidden="true"><MapPinned size={30} /></span>
                )}
                <span className="location-card-body">
                  <small>{labels[point.category]}</small>
                  <strong>{point.title}</strong>
                  <span>{point.description}</span>
                </span>
              </button>
              <div className="location-card-actions">
                <a href={point.mapsUrl} target="_blank" rel="noreferrer"><MapPinned size={15} aria-hidden="true" /> {labels.openMap}</a>
                <a href={point.mapsPhotosUrl} target="_blank" rel="noreferrer"><Camera size={15} aria-hidden="true" /> {labels.openPhotos}</a>
                {point.sourceUrl ? <a href={point.sourceUrl} target="_blank" rel="noreferrer"><ExternalLink size={14} aria-hidden="true" /> {labels.photoSource}</a> : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
