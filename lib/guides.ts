import it from '@/data/guides/it.json';
import en from '@/data/guides/en.json';
import es from '@/data/guides/es.json';
import de from '@/data/guides/de.json';
import type {AttractionSlug} from '@/data/attractions';

export type GuideLocale = 'it' | 'en' | 'es' | 'de';
export type GuideChapter = {
  id: string;
  title: string;
  kicker: string;
  paragraphs: string[];
};

type GuideData = Record<AttractionSlug, {chapters: GuideChapter[]}>;

const guideData: Record<GuideLocale, GuideData> = {
  it: it as GuideData,
  en: en as GuideData,
  es: es as GuideData,
  de: de as GuideData
};

export function getGuide(locale: string, slug: AttractionSlug) {
  const safeLocale: GuideLocale = locale === 'en' || locale === 'es' || locale === 'de' ? locale : 'it';
  return guideData[safeLocale][slug];
}

export function getGuideChapter(locale: string, slug: AttractionSlug, chapterId: string) {
  return getGuide(locale, slug).chapters.find((chapter) => chapter.id === chapterId) || null;
}
