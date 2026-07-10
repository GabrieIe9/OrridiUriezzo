'use client';

import {useEffect, useRef, useState} from 'react';
import {ChevronLeft, ChevronRight, LoaderCircle, Pause, Play, Square, Volume2} from 'lucide-react';
import {useLocale, useTranslations} from 'next-intl';
import type {AttractionSlug} from '@/data/attractions';

export type AudioChapter = {id: string; title: string; kicker: string};

export function AudioGuide({slug, chapters}: {slug: AttractionSlug; chapters: AudioChapter[]}) {
  const t = useTranslations('audio');
  const locale = useLocale();
  const audioRef = useRef<HTMLAudioElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [selectedId, setSelectedId] = useState(chapters[0]?.id || '');
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  const selectedIndex = Math.max(0, chapters.findIndex((chapter) => chapter.id === selectedId));
  const selectedChapter = chapters[selectedIndex];

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setPlaying(false);
    setError(null);
  }, [selectedId]);

  async function loadAudio() {
    if (!selectedChapter) return null;
    const cachedUrl = audioUrls[selectedChapter.id];
    if (cachedUrl) return cachedUrl;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({locale, slug, chapterId: selectedChapter.id})
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {error?: string} | null;
        throw new Error(payload?.error || t('genericError'));
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      setAudioUrls((current) => ({...current, [selectedChapter.id]: url}));
      return url;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t('genericError'));
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function play() {
    const url = await loadAudio();
    if (!url) return;

    const audio = audioRef.current;
    if (!audio) return;
    if (audio.src !== url) audio.src = url;
    await audio.play();
    setPlaying(true);
  }

  function pause() {
    audioRef.current?.pause();
    setPlaying(false);
  }

  function stop() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setPlaying(false);
  }

  function move(offset: number) {
    const target = chapters[selectedIndex + offset];
    if (target) setSelectedId(target.id);
  }

  return (
    <div className="audio-guide audio-guide-chapters" aria-live="polite">
      <div className="audio-guide-copy">
        <span className="audio-icon" aria-hidden="true"><Volume2 size={20} /></span>
        <div>
          <strong>{t('title')}</strong>
          <span>{t('description')}</span>
          <small>{t('cacheNote')}</small>
        </div>
      </div>

      <div className="audio-chapter-picker">
        <label htmlFor={`audio-chapter-${slug}`}>{t('chapterLabel')}</label>
        <select
          id={`audio-chapter-${slug}`}
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
        >
          {chapters.map((chapter) => (
            <option key={chapter.id} value={chapter.id}>{chapter.kicker} · {chapter.title}</option>
          ))}
        </select>
      </div>

      <div className="audio-controls">
        <button type="button" onClick={() => move(-1)} disabled={selectedIndex === 0 || loading} className="button button-ghost" aria-label={t('previousChapter')}>
          <ChevronLeft size={17} aria-hidden="true" />
        </button>
        {!playing ? (
          <button type="button" onClick={play} disabled={loading || !selectedChapter} className="button button-primary">
            {loading ? <LoaderCircle className="spin" size={18} /> : <Play size={18} fill="currentColor" />}
            {loading ? t('loading') : t('listen')}
          </button>
        ) : (
          <button type="button" onClick={pause} className="button button-primary">
            <Pause size={18} fill="currentColor" /> {t('pause')}
          </button>
        )}
        <button type="button" onClick={stop} disabled={!audioUrls[selectedId]} className="button button-ghost">
          <Square size={16} fill="currentColor" /> {t('stop')}
        </button>
        <button type="button" onClick={() => move(1)} disabled={selectedIndex >= chapters.length - 1 || loading} className="button button-ghost" aria-label={t('nextChapter')}>
          <ChevronRight size={17} aria-hidden="true" />
        </button>
      </div>

      <audio ref={audioRef} preload="none" onEnded={() => setPlaying(false)} onPause={() => setPlaying(false)} />
      {error ? <p className="audio-error" role="alert">{error}</p> : null}
    </div>
  );
}
