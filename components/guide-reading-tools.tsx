'use client';

import {BookOpen, Check, Clock3, History, ListTree} from 'lucide-react';
import {useEffect, useMemo, useState} from 'react';

type ChapterItem = {
  id: string;
  title: string;
  words: number;
};

type Labels = {
  title: string;
  progress: string;
  currentChapter: string;
  estimatedTime: string;
  minutes: string;
  resume: string;
  completed: string;
  chapters: string;
};

type StoredProgress = {
  chapterId: string;
  progress: number;
  updatedAt: string;
};

export function GuideReadingTools({
  slug,
  sectionId,
  chapters,
  labels
}: {
  slug: string;
  sectionId: string;
  chapters: ChapterItem[];
  labels: Labels;
}) {
  const [activeId, setActiveId] = useState(chapters[0]?.id || '');
  const [progress, setProgress] = useState(0);
  const [saved, setSaved] = useState<StoredProgress | null>(null);
  const storageKey = `orridi-guide-progress:${slug}`;

  const totalWords = useMemo(
    () => chapters.reduce((sum, chapter) => sum + chapter.words, 0),
    [chapters]
  );
  const readingMinutes = Math.max(1, Math.ceil(totalWords / 210));
  const activeIndex = Math.max(0, chapters.findIndex((chapter) => chapter.id === activeId));

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredProgress;
        queueMicrotask(() => setSaved(parsed));
      }
    } catch {
      // Storage can be unavailable in private or restricted browser contexts.
    }
  }, [storageKey]);

  useEffect(() => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    const guideSection = section;

    const chapterElements = chapters
      .map((chapter) => document.getElementById(`chapter-${slug}-${chapter.id}`))
      .filter((element): element is HTMLElement => Boolean(element));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          const nextId = visible.target.id.replace(`chapter-${slug}-`, '');
          setActiveId(nextId);
        }
      },
      {rootMargin: '-18% 0px -62% 0px', threshold: [0.05, 0.2, 0.45]}
    );

    chapterElements.forEach((element) => observer.observe(element));

    function updateProgress() {
      const rect = guideSection.getBoundingClientRect();
      const viewport = window.innerHeight;
      const readableDistance = Math.max(1, guideSection.offsetHeight - viewport * 0.45);
      const travelled = Math.min(readableDistance, Math.max(0, -rect.top + viewport * 0.18));
      setProgress(Math.round((travelled / readableDistance) * 100));
    }

    updateProgress();
    window.addEventListener('scroll', updateProgress, {passive: true});
    window.addEventListener('resize', updateProgress);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [chapters, sectionId, slug]);

  useEffect(() => {
    if (!activeId) return;
    const next: StoredProgress = {
      chapterId: activeId,
      progress,
      updatedAt: new Date().toISOString()
    };
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Reading progress is an enhancement; the guide remains usable without it.
    }
  }, [activeId, progress, storageKey]);

  function goToChapter(chapterId: string) {
    document.getElementById(`chapter-${slug}-${chapterId}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  function resumeReading() {
    if (saved?.chapterId) goToChapter(saved.chapterId);
  }

  return (
    <aside className="guide-reading-tools" aria-label={labels.title}>
      <div className="guide-reading-summary">
        <span className="guide-reader-icon" aria-hidden="true"><BookOpen size={20} /></span>
        <div>
          <strong>{labels.title}</strong>
          <small>{labels.currentChapter}: {activeIndex + 1}/{chapters.length}</small>
        </div>
      </div>

      <div className="guide-progress-block">
        <div className="guide-progress-label">
          <span>{labels.progress}</span>
          <strong>{progress}%</strong>
        </div>
        <div className="guide-progress-track" aria-hidden="true">
          <span style={{width: `${progress}%`}} />
        </div>
      </div>

      <div className="guide-reading-stats">
        <span><Clock3 size={15} aria-hidden="true" /> {labels.estimatedTime}: {readingMinutes} {labels.minutes}</span>
        <span><ListTree size={15} aria-hidden="true" /> {chapters.length} {labels.chapters}</span>
      </div>

      {saved?.chapterId && saved.progress < 98 ? (
        <button type="button" className="guide-resume-button" onClick={resumeReading}>
          <History size={16} aria-hidden="true" /> {labels.resume}
        </button>
      ) : progress >= 98 ? (
        <div className="guide-complete-badge"><Check size={15} aria-hidden="true" /> {labels.completed}</div>
      ) : null}

      <label className="guide-mobile-select">
        <span>{labels.currentChapter}</span>
        <select value={activeId} onChange={(event) => goToChapter(event.target.value)}>
          {chapters.map((chapter, index) => (
            <option key={chapter.id} value={chapter.id}>{index + 1}. {chapter.title}</option>
          ))}
        </select>
      </label>

      <nav className="guide-reader-nav" aria-label={labels.title}>
        {chapters.map((chapter, index) => {
          const active = chapter.id === activeId;
          return (
            <button
              type="button"
              key={chapter.id}
              className={active ? 'is-active' : undefined}
              onClick={() => goToChapter(chapter.id)}
              aria-current={active ? 'location' : undefined}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <span>{chapter.title}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
