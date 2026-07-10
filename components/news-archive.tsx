/* eslint-disable @next/next/no-img-element */
'use client';

import {useMemo, useState} from 'react';
import {CalendarDays, ExternalLink, Newspaper} from 'lucide-react';
import type {NewsArchive, NewsLocale} from '@/lib/news';

type Labels = {
  weekLabel: string;
  published: string;
  source: string;
  readOriginal: string;
  empty: string;
  updated: string;
};

function formatDate(value: string, locale: string, options?: Intl.DateTimeFormatOptions) {
  try {
    return new Intl.DateTimeFormat(locale, options || {dateStyle: 'long'}).format(new Date(value));
  } catch {
    return value.slice(0, 10);
  }
}

export function NewsArchiveView({archive, locale, labels}: {archive: NewsArchive; locale: NewsLocale; labels: Labels}) {
  const [selectedWeek, setSelectedWeek] = useState(archive.weeks[0]?.id || '');
  const week = useMemo(
    () => archive.weeks.find((entry) => entry.id === selectedWeek) || archive.weeks[0],
    [archive.weeks, selectedWeek]
  );

  return (
    <div className="news-archive">
      <div className="news-toolbar">
        <label htmlFor="news-week"><CalendarDays size={18} aria-hidden="true" /> {labels.weekLabel}</label>
        <select id="news-week" value={week?.id || ''} onChange={(event) => setSelectedWeek(event.target.value)} disabled={!archive.weeks.length}>
          {archive.weeks.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {formatDate(entry.startDate, locale, {day: '2-digit', month: 'short', year: 'numeric'})} – {formatDate(entry.endDate, locale, {day: '2-digit', month: 'short', year: 'numeric'})}
            </option>
          ))}
        </select>
        <small>{labels.updated}: {formatDate(archive.updatedAt, locale, {dateStyle: 'medium', timeStyle: 'short'})}</small>
      </div>

      {!week || !week.items.length ? (
        <div className="news-empty"><Newspaper size={30} aria-hidden="true" /><p>{labels.empty}</p></div>
      ) : (
        <div className="news-grid">
          {week.items.map((item) => (
            <article className="news-card" key={item.id}>
              {item.imageUrl ? (
                <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="news-image-link">
                  {/* External editorial thumbnail; source is linked and credited below. */}
                  <img src={item.imageUrl} alt={item.imageAlt || item.title[locale]} loading="lazy" referrerPolicy="no-referrer" />
                </a>
              ) : null}
              <div className="news-card-body">
                <div className="news-meta">
                  <span>{labels.published}: {formatDate(item.publishedAt, locale)}</span>
                  <span>{labels.source}: {item.source}</span>
                </div>
                <h2>{item.title[locale] || item.title.it}</h2>
                <p>{item.summary[locale] || item.summary.it}</p>
                <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="news-source-link">
                  {labels.readOriginal} <ExternalLink size={15} aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
