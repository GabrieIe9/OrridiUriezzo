'use client';

import type {CSSProperties} from 'react';
import {useEffect, useMemo, useRef, useState} from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Gauge,
  LoaderCircle,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Square,
  Volume2
} from 'lucide-react';
import {useLocale, useTranslations} from 'next-intl';
import type {AttractionSlug} from '@/data/attractions';

export type AudioChapter = {id: string; title: string; kicker: string};

type CacheState = 'cached' | 'generated' | 'ready';

function formatTime(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '0:00';
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function AudioGuide({slug, chapters}: {slug: AttractionSlug; chapters: AudioChapter[]}) {
  const t = useTranslations('audio');
  const locale = useLocale();
  const audioRef = useRef<HTMLAudioElement>(null);
  const objectUrlsRef = useRef<Record<string, string>>({});
  const pendingAutoPlayRef = useRef(false);
  const lastSavedSecondRef = useRef(-1);
  const [selectedId, setSelectedId] = useState(chapters[0]?.id || '');
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});
  const [cacheStates, setCacheStates] = useState<Record<string, CacheState>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [autoAdvance, setAutoAdvance] = useState(false);

  const selectedIndex = Math.max(0, chapters.findIndex((chapter) => chapter.id === selectedId));
  const selectedChapter = chapters[selectedIndex];
  const selectedAudioUrl = audioUrls[selectedId];

  const progress = useMemo(() => {
    if (!duration) return 0;
    return Math.min(100, Math.max(0, (currentTime / duration) * 100));
  }, [currentTime, duration]);

  const statusText = loading
    ? t('statusPreparing')
    : playing
      ? t('statusPlaying')
      : cacheStates[selectedId] === 'cached'
        ? t('statusCached')
        : cacheStates[selectedId] === 'generated'
          ? t('statusGenerated')
          : selectedAudioUrl
            ? t('statusReady')
            : t('statusIdle');

  useEffect(() => {
    const urls = objectUrlsRef.current;
    return () => {
      Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError(null);

    if (selectedAudioUrl) {
      audio.src = selectedAudioUrl;
      audio.playbackRate = playbackRate;
      audio.load();
      if (pendingAutoPlayRef.current) {
        pendingAutoPlayRef.current = false;
        queueMicrotask(() => {
          void audio.play().then(() => setPlaying(true)).catch(() => setError(t('playbackError')));
        });
      }
    } else {
      audio.removeAttribute('src');
      audio.load();
    }
  }, [selectedAudioUrl, selectedId, playbackRate, t]);

  async function loadAudio(chapter: AudioChapter | undefined = selectedChapter) {
    if (!chapter) return null;
    const cachedUrl = audioUrls[chapter.id];
    if (cachedUrl) return cachedUrl;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({locale, slug, chapterId: chapter.id})
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {error?: string} | null;
        throw new Error(payload?.error || t('genericError'));
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      objectUrlsRef.current[chapter.id] = url;
      setAudioUrls((current) => ({...current, [chapter.id]: url}));

      const serverCache = response.headers.get('X-TTS-Cache');
      const cacheState: CacheState = response.redirected || (serverCache && serverCache !== 'MISS')
        ? 'cached'
        : serverCache === 'MISS'
          ? 'generated'
          : 'ready';
      setCacheStates((current) => ({...current, [chapter.id]: cacheState}));
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

    try {
      if (audio.src !== url) {
        audio.src = url;
        audio.load();
      }
      audio.playbackRate = playbackRate;
      await audio.play();
      setPlaying(true);
    } catch {
      setError(t('playbackError'));
      setPlaying(false);
    }
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
    setCurrentTime(0);
    setPlaying(false);
    try {
      window.localStorage.removeItem(`orridi-audio-position:${locale}:${slug}:${selectedId}`);
    } catch {
      // Local playback state is optional.
    }
  }

  function skip(seconds: number) {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.min(audio.duration, Math.max(0, audio.currentTime + seconds));
    setCurrentTime(audio.currentTime);
  }

  function seek(value: number) {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = value;
    setCurrentTime(value);
  }

  function changeRate(value: number) {
    setPlaybackRate(value);
    if (audioRef.current) audioRef.current.playbackRate = value;
  }

  function move(offset: number) {
    const target = chapters[selectedIndex + offset];
    if (target) setSelectedId(target.id);
  }

  function restorePosition(audio: HTMLAudioElement) {
    try {
      const value = Number(window.localStorage.getItem(`orridi-audio-position:${locale}:${slug}:${selectedId}`));
      if (Number.isFinite(value) && value > 3 && value < audio.duration - 5) {
        audio.currentTime = value;
        setCurrentTime(value);
      }
    } catch {
      // Local playback state is optional.
    }
  }

  function rememberPosition(audio: HTMLAudioElement) {
    const second = Math.floor(audio.currentTime);
    setCurrentTime(audio.currentTime);
    if (second === lastSavedSecondRef.current || second % 5 !== 0) return;
    lastSavedSecondRef.current = second;
    try {
      window.localStorage.setItem(`orridi-audio-position:${locale}:${slug}:${selectedId}`, String(audio.currentTime));
    } catch {
      // Local playback state is optional.
    }
  }


  async function handleEnded() {
    setPlaying(false);
    try {
      window.localStorage.removeItem(`orridi-audio-position:${locale}:${slug}:${selectedId}`);
    } catch {
      // Local playback state is optional.
    }

    const next = chapters[selectedIndex + 1];
    if (!autoAdvance || !next) return;
    pendingAutoPlayRef.current = true;
    setSelectedId(next.id);
    await loadAudio(next);
  }

  return (
    <section className="audio-guide audio-guide-chapters" aria-label={t('title')} aria-live="polite">
      <header className="audio-player-header">
        <div className="audio-guide-copy">
          <span className="audio-icon" aria-hidden="true"><Volume2 size={22} /></span>
          <div>
            <span className="audio-kicker">{t('eyebrow')}</span>
            <strong>{t('title')}</strong>
            <span>{t('description')}</span>
          </div>
        </div>

        <span className={`audio-status-pill${loading ? ' is-loading' : ''}`}>
          {loading ? <LoaderCircle className="spin" size={14} aria-hidden="true" /> : <CheckCircle2 size={14} aria-hidden="true" />}
          {statusText}
        </span>
      </header>

      <div className="audio-player-grid">
        <div className="audio-chapter-panel">
          <div className="audio-chapter-heading">
            <span>{t('chapterCounter', {current: selectedIndex + 1, total: chapters.length})}</span>
            <strong>{selectedChapter?.title}</strong>
            <small>{selectedChapter?.kicker}</small>
          </div>

          <div className="audio-chapter-picker">
            <label htmlFor={`audio-chapter-${slug}`}>{t('chapterLabel')}</label>
            <select
              id={`audio-chapter-${slug}`}
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
              disabled={loading}
            >
              {chapters.map((chapter, index) => (
                <option key={chapter.id} value={chapter.id}>
                  {index + 1}. {chapter.title}
                </option>
              ))}
            </select>
          </div>

          <p className="audio-cache-note">{t('cacheNote')}</p>
        </div>

        <div className="audio-player-panel">
          <div className="audio-timeline">
            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={Math.min(currentTime, duration || 0)}
              onChange={(event) => seek(Number(event.target.value))}
              disabled={!selectedAudioUrl || !duration}
              aria-label={t('seek')}
              style={{'--audio-progress': `${progress}%`} as CSSProperties}
            />
            <div className="audio-time-row" aria-hidden="true">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="audio-transport" role="group" aria-label={t('controlsLabel')}>
            <button
              type="button"
              onClick={() => move(-1)}
              disabled={selectedIndex === 0 || loading}
              className="audio-control audio-control-chapter"
              aria-label={t('previousChapter')}
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => skip(-15)}
              disabled={!selectedAudioUrl}
              className="audio-control"
              aria-label={t('rewind')}
            >
              <RotateCcw size={20} aria-hidden="true" />
              <span className="audio-skip-number">15</span>
            </button>

            {!playing ? (
              <button
                type="button"
                onClick={play}
                disabled={loading || !selectedChapter}
                className="audio-play-control"
                aria-label={loading ? t('loading') : t('listen')}
              >
                {loading ? <LoaderCircle className="spin" size={25} aria-hidden="true" /> : <Play size={26} fill="currentColor" aria-hidden="true" />}
              </button>
            ) : (
              <button type="button" onClick={pause} className="audio-play-control" aria-label={t('pause')}>
                <Pause size={26} fill="currentColor" aria-hidden="true" />
              </button>
            )}

            <button
              type="button"
              onClick={() => skip(15)}
              disabled={!selectedAudioUrl}
              className="audio-control"
              aria-label={t('forward')}
            >
              <RotateCw size={20} aria-hidden="true" />
              <span className="audio-skip-number">15</span>
            </button>

            <button
              type="button"
              onClick={() => move(1)}
              disabled={selectedIndex >= chapters.length - 1 || loading}
              className="audio-control audio-control-chapter"
              aria-label={t('nextChapter')}
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>

          <div className="audio-player-options">
            <button type="button" onClick={stop} disabled={!selectedAudioUrl} className="audio-stop-control">
              <Square size={14} fill="currentColor" aria-hidden="true" />
              {t('stop')}
            </button>

            <div className="audio-secondary-options">
              <label className="audio-auto-next">
                <input type="checkbox" checked={autoAdvance} onChange={(event) => setAutoAdvance(event.target.checked)} />
                <span>{t('autoNext')}</span>
              </label>
            </div>

            <label className="audio-speed-control">
              <Gauge size={16} aria-hidden="true" />
              <span>{t('speed')}</span>
              <select
                value={playbackRate}
                onChange={(event) => changeRate(Number(event.target.value))}
                aria-label={t('speed')}
              >
                <option value="0.75">0.75×</option>
                <option value="1">1×</option>
                <option value="1.25">1.25×</option>
                <option value="1.5">1.5×</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        preload="metadata"
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration || 0);
          restorePosition(event.currentTarget);
        }}
        onDurationChange={(event) => setDuration(event.currentTarget.duration || 0)}
        onTimeUpdate={(event) => rememberPosition(event.currentTarget)}
        onEnded={() => { void handleEnded(); }}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
      />

      {error ? <p className="audio-error" role="alert">{error}</p> : null}
    </section>
  );
}
