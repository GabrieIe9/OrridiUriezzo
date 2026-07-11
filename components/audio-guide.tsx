'use client';

import type {CSSProperties} from 'react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
  Volume2,
  Waves
} from 'lucide-react';
import {useLocale, useTranslations} from 'next-intl';
import type {AttractionSlug} from '@/data/attractions';

export type AudioChapter = {
  id: string;
  title: string;
  kicker: string;
  paragraphs: string[];
};

type SpeechChunk = {
  start: number;
  end: number;
  text: string;
};

const speechLanguages: Record<string, string> = {
  it: 'it-IT',
  en: 'en-US',
  es: 'es-ES',
  de: 'de-DE'
};

function formatTime(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '0:00';
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function buildSpeechText(chapter: AudioChapter | undefined) {
  if (!chapter) return '';
  return [chapter.title, chapter.kicker, ...chapter.paragraphs]
    .map((part) => part.trim())
    .filter(Boolean)
    .join('. ');
}

function splitIntoSpeechChunks(text: string, maxLength = 260): SpeechChunk[] {
  const chunks: SpeechChunk[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    let end = Math.min(text.length, cursor + maxLength);

    if (end < text.length) {
      const candidate = text.slice(cursor, end);
      const punctuation = Math.max(
        candidate.lastIndexOf('. '),
        candidate.lastIndexOf('! '),
        candidate.lastIndexOf('? '),
        candidate.lastIndexOf('; '),
        candidate.lastIndexOf(', ')
      );
      const space = candidate.lastIndexOf(' ');
      const splitAt = punctuation >= 120 ? punctuation + 1 : space >= 120 ? space : -1;
      if (splitAt > 0) end = cursor + splitAt;
    }

    while (cursor < end && /\s/.test(text[cursor] || '')) cursor += 1;
    while (end > cursor && /\s/.test(text[end - 1] || '')) end -= 1;

    if (end <= cursor) break;
    chunks.push({start: cursor, end, text: text.slice(cursor, end)});
    cursor = end;
  }

  return chunks;
}

function estimateDuration(text: string, rate: number) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const wordsPerMinute = 155 * Math.max(0.5, rate);
  return Math.max(1, (words / wordsPerMinute) * 60);
}

export function AudioGuide({slug, chapters}: {slug: AttractionSlug; chapters: AudioChapter[]}) {
  const t = useTranslations('audio');
  const locale = useLocale();
  const sessionRef = useRef(0);
  const speakChapterRef = useRef<(chapter: AudioChapter, requestedStart?: number) => void>(() => undefined);
  const currentCharRef = useRef(0);
  const pausedRef = useRef(false);
  const selectedIdRef = useRef(chapters[0]?.id || '');
  const autoAdvanceRef = useRef(false);
  const playbackRateRef = useRef(1);
  const [selectedId, setSelectedId] = useState(chapters[0]?.id || '');
  const [supported, setSupported] = useState<boolean | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentChar, setCurrentChar] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [autoAdvance, setAutoAdvance] = useState(false);

  const selectedIndex = Math.max(0, chapters.findIndex((chapter) => chapter.id === selectedId));
  const selectedChapter = chapters[selectedIndex];
  const speechText = useMemo(() => buildSpeechText(selectedChapter), [selectedChapter]);
  const duration = useMemo(() => estimateDuration(speechText, playbackRate), [speechText, playbackRate]);
  const progress = speechText.length ? Math.min(100, Math.max(0, (currentChar / speechText.length) * 100)) : 0;
  const currentTime = duration * (progress / 100);
  const speechLang = speechLanguages[locale] || locale;

  const matchingVoices = useMemo(() => {
    const prefix = speechLang.toLowerCase().split('-')[0];
    const matches = voices.filter((voice) => voice.lang.toLowerCase().startsWith(prefix));
    return matches.length ? matches : voices;
  }, [speechLang, voices]);

  const selectedVoice = useMemo(
    () => voices.find((voice) => voice.voiceURI === selectedVoiceUri) || matchingVoices[0] || null,
    [matchingVoices, selectedVoiceUri, voices]
  );

  const rememberPosition = useCallback((chapterId: string, value: number) => {
    try {
      window.localStorage.setItem(`orridi-speech-position:${locale}:${slug}:${chapterId}`, String(value));
    } catch {
      // Local speech progress is optional.
    }
  }, [locale, slug]);

  const clearPosition = useCallback((chapterId: string) => {
    try {
      window.localStorage.removeItem(`orridi-speech-position:${locale}:${slug}:${chapterId}`);
    } catch {
      // Local speech progress is optional.
    }
  }, [locale, slug]);

  const restorePosition = useCallback((chapterId: string, textLength: number) => {
    try {
      const value = Number(window.localStorage.getItem(`orridi-speech-position:${locale}:${slug}:${chapterId}`));
      return Number.isFinite(value) && value > 0 && value < textLength ? value : 0;
    } catch {
      return 0;
    }
  }, [locale, slug]);

  const updateCurrentChar = useCallback((value: number, chapterId: string) => {
    const safeValue = Math.max(0, value);
    currentCharRef.current = safeValue;
    setCurrentChar(safeValue);
    rememberPosition(chapterId, safeValue);
  }, [rememberPosition]);

  const stopSpeech = useCallback((reset = false) => {
    sessionRef.current += 1;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    pausedRef.current = false;
    setPaused(false);
    setPlaying(false);

    if (reset) {
      currentCharRef.current = 0;
      setCurrentChar(0);
      clearPosition(selectedIdRef.current);
    }
  }, [clearPosition]);

  const speakChapter = useCallback((chapter: AudioChapter, requestedStart = 0) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      setError(t('unsupportedError'));
      setSupported(false);
      return;
    }

    const fullText = buildSpeechText(chapter);
    if (!fullText) return;

    const startChar = Math.min(Math.max(0, requestedStart), Math.max(0, fullText.length - 1));
    const chunks = splitIntoSpeechChunks(fullText);
    const firstChunkIndex = Math.max(0, chunks.findIndex((chunk) => chunk.end > startChar));
    const session = sessionRef.current + 1;
    sessionRef.current = session;
    window.speechSynthesis.cancel();
    setError(null);
    pausedRef.current = false;
    setPaused(false);
    setPlaying(true);
    updateCurrentChar(startChar, chapter.id);

    const speakChunk = (chunkIndex: number, offset: number) => {
      if (sessionRef.current !== session) return;
      const chunk = chunks[chunkIndex];

      if (!chunk) {
        setPlaying(false);
        setPaused(false);
        updateCurrentChar(fullText.length, chapter.id);
        clearPosition(chapter.id);

        const activeIndex = chapters.findIndex((item) => item.id === chapter.id);
        const next = chapters[activeIndex + 1];
        if (autoAdvanceRef.current && next) {
          selectedIdRef.current = next.id;
          setSelectedId(next.id);
          currentCharRef.current = 0;
          setCurrentChar(0);
          window.setTimeout(() => speakChapterRef.current(next, 0), 120);
        }
        return;
      }

      const partStart = Math.max(chunk.start, offset);
      const partText = fullText.slice(partStart, chunk.end).trim();
      if (!partText) {
        speakChunk(chunkIndex + 1, chunks[chunkIndex + 1]?.start || fullText.length);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(partText);
      utterance.lang = speechLang;
      utterance.rate = playbackRateRef.current;
      utterance.pitch = 1;
      utterance.volume = 1;
      if (selectedVoice) utterance.voice = selectedVoice;

      utterance.onstart = () => {
        if (sessionRef.current !== session) return;
        setPlaying(true);
        setPaused(false);
      };

      utterance.onboundary = (event) => {
        if (sessionRef.current !== session) return;
        const absolute = Math.min(fullText.length, partStart + Math.max(0, event.charIndex || 0));
        updateCurrentChar(absolute, chapter.id);
      };

      utterance.onend = () => {
        if (sessionRef.current !== session) return;
        updateCurrentChar(chunk.end, chapter.id);
        speakChunk(chunkIndex + 1, chunks[chunkIndex + 1]?.start || fullText.length);
      };

      utterance.onerror = (event) => {
        if (sessionRef.current !== session || event.error === 'canceled' || event.error === 'interrupted') return;
        setPlaying(false);
        setPaused(false);
        setError(t('playbackError'));
      };

      window.speechSynthesis.speak(utterance);
    };

    speakChunk(firstChunkIndex, startChar);
  }, [chapters, clearPosition, selectedVoice, speechLang, t, updateCurrentChar]);

  useEffect(() => {
    speakChapterRef.current = speakChapter;
  }, [speakChapter]);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    autoAdvanceRef.current = autoAdvance;
  }, [autoAdvance]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    const supportTimer = window.setTimeout(() => setSupported(isSupported), 0);
    if (!isSupported) return () => window.clearTimeout(supportTimer);

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
      const prefix = speechLang.toLowerCase().split('-')[0];
      const preferred = available.find((voice) => voice.lang.toLowerCase() === speechLang.toLowerCase() && voice.localService)
        || available.find((voice) => voice.lang.toLowerCase().startsWith(prefix) && voice.localService)
        || available.find((voice) => voice.lang.toLowerCase().startsWith(prefix))
        || available.find((voice) => voice.default)
        || available[0];
      if (preferred) setSelectedVoiceUri((current) => current || preferred.voiceURI);
    };

    const voicesTimer = window.setTimeout(loadVoices, 0);
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.clearTimeout(supportTimer);
      window.clearTimeout(voicesTimer);
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      sessionRef.current += 1;
      window.speechSynthesis.cancel();
    };
  }, [speechLang]);

  const statusText = supported === null
    ? t('statusPreparing')
    : supported === false
      ? t('statusUnsupported')
      : playing
        ? t('statusPlaying')
        : paused
          ? t('statusPaused')
          : t('statusReady');

  function play() {
    if (!selectedChapter) return;
    if (typeof window !== 'undefined' && pausedRef.current && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      pausedRef.current = false;
      setPaused(false);
      setPlaying(true);
      return;
    }
    const restored = currentCharRef.current || restorePosition(selectedChapter.id, speechText.length);
    speakChapter(selectedChapter, restored);
  }

  function pause() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.pause();
    pausedRef.current = true;
    setPaused(true);
    setPlaying(false);
  }

  function stop() {
    stopSpeech(true);
  }

  function seek(value: number) {
    if (!selectedChapter || !speechText.length || !duration) return;
    const target = Math.round((Math.max(0, Math.min(duration, value)) / duration) * speechText.length);
    currentCharRef.current = target;
    setCurrentChar(target);
    rememberPosition(selectedChapter.id, target);
    if (playing || paused) speakChapter(selectedChapter, target);
  }

  function skip(seconds: number) {
    seek(currentTime + seconds);
  }

  function changeRate(value: number) {
    playbackRateRef.current = value;
    setPlaybackRate(value);
    if ((playing || paused) && selectedChapter) {
      speakChapter(selectedChapter, currentCharRef.current);
    }
  }

  function selectChapter(id: string) {
    stopSpeech(false);
    selectedIdRef.current = id;
    setSelectedId(id);
    const chapter = chapters.find((item) => item.id === id);
    const textLength = buildSpeechText(chapter).length;
    const restored = restorePosition(id, textLength);
    currentCharRef.current = restored;
    setCurrentChar(restored);
    setError(null);
  }

  function move(offset: number) {
    const target = chapters[selectedIndex + offset];
    if (target) selectChapter(target.id);
  }

  function selectVoice(uri: string) {
    stopSpeech(false);
    setSelectedVoiceUri(uri);
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

        <span className={`audio-status-pill${supported === null ? ' is-loading' : ''}`}>
          {supported === null
            ? <LoaderCircle className="spin" size={14} aria-hidden="true" />
            : supported
              ? <CheckCircle2 size={14} aria-hidden="true" />
              : <Waves size={14} aria-hidden="true" />}
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
              onChange={(event) => selectChapter(event.target.value)}
            >
              {chapters.map((chapter, index) => (
                <option key={chapter.id} value={chapter.id}>
                  {index + 1}. {chapter.title}
                </option>
              ))}
            </select>
          </div>

          <p className="audio-cache-note">{t('browserVoiceNote')}</p>
        </div>

        <div className="audio-player-panel">
          <div className="audio-timeline">
            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.5"
              value={Math.min(currentTime, duration || 0)}
              onChange={(event) => seek(Number(event.target.value))}
              disabled={!supported || !speechText}
              aria-label={t('seek')}
              style={{'--audio-progress': `${progress}%`} as CSSProperties}
            />
            <div className="audio-time-row" aria-hidden="true">
              <span>{formatTime(currentTime)}</span>
              <span>≈ {formatTime(duration)}</span>
            </div>
          </div>

          <div className="audio-transport" role="group" aria-label={t('controlsLabel')}>
            <button
              type="button"
              onClick={() => move(-1)}
              disabled={selectedIndex === 0}
              className="audio-control audio-control-chapter"
              aria-label={t('previousChapter')}
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => skip(-15)}
              disabled={!supported || !speechText}
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
                disabled={!supported || !selectedChapter}
                className="audio-play-control"
                aria-label={paused ? t('resume') : t('listen')}
              >
                <Play size={26} fill="currentColor" aria-hidden="true" />
              </button>
            ) : (
              <button type="button" onClick={pause} className="audio-play-control" aria-label={t('pause')}>
                <Pause size={26} fill="currentColor" aria-hidden="true" />
              </button>
            )}

            <button
              type="button"
              onClick={() => skip(15)}
              disabled={!supported || !speechText}
              className="audio-control"
              aria-label={t('forward')}
            >
              <RotateCw size={20} aria-hidden="true" />
              <span className="audio-skip-number">15</span>
            </button>

            <button
              type="button"
              onClick={() => move(1)}
              disabled={selectedIndex >= chapters.length - 1}
              className="audio-control audio-control-chapter"
              aria-label={t('nextChapter')}
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>

          <div className="audio-player-options">
            <button type="button" onClick={stop} disabled={!supported || (!playing && !paused && currentChar === 0)} className="audio-stop-control">
              <Square size={14} fill="currentColor" aria-hidden="true" />
              {t('stop')}
            </button>

            <div className="audio-secondary-options">
              <label className="audio-auto-next">
                <input type="checkbox" checked={autoAdvance} onChange={(event) => setAutoAdvance(event.target.checked)} />
                <span>{t('autoNext')}</span>
              </label>
            </div>

            {matchingVoices.length > 1 ? (
              <label className="audio-speed-control audio-voice-control">
                <Waves size={16} aria-hidden="true" />
                <span>{t('voice')}</span>
                <select value={selectedVoice?.voiceURI || ''} onChange={(event) => selectVoice(event.target.value)} aria-label={t('voice')}>
                  {matchingVoices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name}</option>
                  ))}
                </select>
              </label>
            ) : null}

            <label className="audio-speed-control">
              <Gauge size={16} aria-hidden="true" />
              <span>{t('speed')}</span>
              <select value={playbackRate} onChange={(event) => changeRate(Number(event.target.value))} aria-label={t('speed')}>
                <option value="0.75">0.75×</option>
                <option value="1">1×</option>
                <option value="1.25">1.25×</option>
                <option value="1.5">1.5×</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      {error ? <p className="audio-error" role="alert">{error}</p> : null}
    </section>
  );
}
