'use client';

import {useEffect, useRef, useState} from 'react';
import {LoaderCircle, Pause, Play, Square, Volume2} from 'lucide-react';
import {useLocale, useTranslations} from 'next-intl';
import type {AttractionSlug} from '@/data/attractions';

export function AudioGuide({slug}: {slug: AttractionSlug}) {
  const t = useTranslations('audio');
  const locale = useLocale();
  const audioRef = useRef<HTMLAudioElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  async function loadAudio() {
    if (audioUrl) return audioUrl;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({locale, slug})
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | {error?: string}
          | null;
        throw new Error(payload?.error || t('genericError'));
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      setAudioUrl(url);
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

  return (
    <div className="audio-guide" aria-live="polite">
      <div className="audio-guide-copy">
        <span className="audio-icon" aria-hidden="true"><Volume2 size={20} /></span>
        <div>
          <strong>{t('title')}</strong>
          <span>{t('description')}</span>
        </div>
      </div>

      <div className="audio-controls">
        {!playing ? (
          <button type="button" onClick={play} disabled={loading} className="button button-primary">
            {loading ? <LoaderCircle className="spin" size={18} /> : <Play size={18} fill="currentColor" />}
            {loading ? t('loading') : t('listen')}
          </button>
        ) : (
          <button type="button" onClick={pause} className="button button-primary">
            <Pause size={18} fill="currentColor" />
            {t('pause')}
          </button>
        )}
        <button type="button" onClick={stop} disabled={!audioUrl} className="button button-ghost">
          <Square size={16} fill="currentColor" />
          {t('stop')}
        </button>
      </div>

      <audio
        ref={audioRef}
        preload="none"
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
      />
      {error ? <p className="audio-error" role="alert">{error}</p> : null}
    </div>
  );
}
