'use client';

import {Clock3, MapPin, Navigation, Route, Sparkles, Users} from 'lucide-react';
import {useState} from 'react';
import {useTranslations} from 'next-intl';
import type {AttractionSlug} from '@/data/attractions';

type TimeOption = '45' | '90' | '180';
type GroupOption = 'adult' | 'family' | 'experienced';
type AccessOption = 'premia' | 'baceno' | 'verampio';
type ScopeOption = 'single' | 'both';
type ResultKey = 'quick' | 'family' | 'complete' | 'adventure' | 'classic';

const accessMaps: Record<AccessOption, string> = {
  premia: 'https://www.google.com/maps/dir/?api=1&destination=Oratorio+di+Santa+Lucia+Uriezzo+Premia',
  baceno: 'https://www.google.com/maps/dir/?api=1&destination=Chiesa+Monumentale+San+Gaudenzio+Baceno',
  verampio: 'https://www.google.com/maps/dir/?api=1&destination=Verampio+Crodo'
};

export function VisitPlanner({slug}: {slug: AttractionSlug}) {
  const t = useTranslations('planner');
  const [time, setTime] = useState<TimeOption>('90');
  const [group, setGroup] = useState<GroupOption>('adult');
  const [access, setAccess] = useState<AccessOption>(slug === 'marmitte-dei-giganti' ? 'verampio' : 'premia');
  const [scope, setScope] = useState<ScopeOption>('both');

  let result: ResultKey = 'classic';
  if (time === '45') result = 'quick';
  else if (group === 'family') result = 'family';
  else if (group === 'experienced') result = 'adventure';
  else if (time === '180' && scope === 'both') result = 'complete';

  const steps = t.raw(`results.${result}.steps`) as string[];

  return (
    <section id={`visit-planner-${slug}`} className="section visit-planner-section" aria-labelledby={`planner-${slug}`}>
      <div className="shell">
        <div className="visit-planner-card">
          <div className="visit-planner-intro">
            <span className="eyebrow"><Sparkles size={16} aria-hidden="true" /> {t('eyebrow')}</span>
            <h2 id={`planner-${slug}`}>{t('title')}</h2>
            <p>{t('intro')}</p>
          </div>

          <div className="planner-controls">
            <label>
              <span><Clock3 size={16} aria-hidden="true" /> {t('time.label')}</span>
              <select value={time} onChange={(event) => setTime(event.target.value as TimeOption)}>
                <option value="45">{t('time.45')}</option>
                <option value="90">{t('time.90')}</option>
                <option value="180">{t('time.180')}</option>
              </select>
            </label>

            <label>
              <span><Users size={16} aria-hidden="true" /> {t('group.label')}</span>
              <select value={group} onChange={(event) => setGroup(event.target.value as GroupOption)}>
                <option value="adult">{t('group.adult')}</option>
                <option value="family">{t('group.family')}</option>
                <option value="experienced">{t('group.experienced')}</option>
              </select>
            </label>

            <label>
              <span><MapPin size={16} aria-hidden="true" /> {t('access.label')}</span>
              <select value={access} onChange={(event) => setAccess(event.target.value as AccessOption)}>
                <option value="premia">{t('access.premia')}</option>
                <option value="baceno">{t('access.baceno')}</option>
                <option value="verampio">{t('access.verampio')}</option>
              </select>
            </label>

            <label>
              <span><Route size={16} aria-hidden="true" /> {t('scope.label')}</span>
              <select value={scope} onChange={(event) => setScope(event.target.value as ScopeOption)}>
                <option value="single">{t('scope.single')}</option>
                <option value="both">{t('scope.both')}</option>
              </select>
            </label>
          </div>

          <article className="planner-result" aria-live="polite">
            <div className="planner-result-heading">
              <span>{t('resultLabel')}</span>
              <h3>{t(`results.${result}.title`)}</h3>
              <p>{t(`results.${result}.description`)}</p>
            </div>
            <ol>
              {steps.map((step) => <li key={step}>{step}</li>)}
            </ol>
            <a className="button button-primary" href={accessMaps[access]} target="_blank" rel="noreferrer">
              <Navigation size={17} aria-hidden="true" /> {t('openDirections')}
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
