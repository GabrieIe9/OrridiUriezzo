import {createHash} from 'node:crypto';
import {XMLParser} from 'fast-xml-parser';
import {readPublicJson, writePublicJson} from './blob-storage';
import fallbackArchive from '@/data/news-fallback.json';

export type NewsLocale = 'it' | 'en' | 'es' | 'de';
export type LocalizedText = Record<NewsLocale, string>;

export type NewsItem = {
  id: string;
  title: LocalizedText;
  summary: LocalizedText;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  imageUrl?: string;
  imageAlt?: string;
};

export type NewsWeek = {
  id: string;
  startDate: string;
  endDate: string;
  generatedAt: string;
  items: NewsItem[];
};

export type NewsArchive = {
  updatedAt: string;
  weeks: NewsWeek[];
};

type RawNewsItem = {
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
  imageUrl?: string;
};

const ARCHIVE_PATH = 'orridi/news/archive.json';
const MAX_WEEKS = 52;
const MAX_ITEMS = 10;
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  removeNSPrefix: true,
  processEntities: true,
  trimValues: true
});

const feeds = [
  {
    name: 'Google News',
    url: 'https://news.google.com/rss/search?q=%22Orridi%20di%20Uriezzo%22%20OR%20%22Marmitte%20dei%20Giganti%22%20OR%20Uriezzo%20OR%20Maiesso&hl=it&gl=IT&ceid=IT:it'
  },
  {name: 'OssolaNews', url: 'https://www.ossolanews.it/feed/'},
  {name: 'VCO Azzurra TV', url: 'https://www.vcoazzurratv.it/feed/'},
  {name: 'Eco Risveglio', url: 'https://www.ecorisveglio.it/feed/'},
  {name: 'Verbano24', url: 'https://www.verbano24.it/feed/'}
] as const;

const relevancePattern = /(orrid[io]|uriezzo|marmitt[ae]\s+dei\s+giganti|maiesso|tomba\s+d.?uriezzo|ponte\s+di\s+maiesso)/i;

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function textValue(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (value && typeof value === 'object' && '#text' in value) {
    return textValue((value as {'#text': unknown})['#text']);
  }
  return '';
}

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeDate(value: string) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : new Date().toISOString();
}

function extractImage(item: Record<string, unknown>) {
  const enclosure = item.enclosure as Record<string, unknown> | undefined;
  const media = (item.content || item.thumbnail) as Record<string, unknown> | undefined;
  return textValue(enclosure?.['@_url'] || media?.['@_url'] || '');
}

function extractSource(item: Record<string, unknown>, fallback: string) {
  const source = item.source;
  if (typeof source === 'string') return source;
  if (source && typeof source === 'object') return textValue(source);
  return fallback;
}

async function fetchFeed(feed: (typeof feeds)[number]): Promise<RawNewsItem[]> {
  try {
    const response = await fetch(feed.url, {
      headers: {
        'User-Agent': 'OrridiUriezzoGuide/1.0 (+https://orridiuriezzo.vercel.app)'
      },
      signal: AbortSignal.timeout(18_000),
      cache: 'no-store'
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const xml = await response.text();
    const parsed = parser.parse(xml) as Record<string, unknown>;
    const rss = parsed.rss as Record<string, unknown> | undefined;
    const channel = rss?.channel as Record<string, unknown> | undefined;
    const feedRoot = parsed.feed as Record<string, unknown> | undefined;
    const entries = channel ? asArray(channel.item as Record<string, unknown> | Record<string, unknown>[] | undefined) : asArray(feedRoot?.entry as Record<string, unknown> | Record<string, unknown>[] | undefined);

    return entries.map((item) => {
      const linkValue = item.link;
      let url = '';
      if (typeof linkValue === 'string') url = linkValue;
      else if (Array.isArray(linkValue)) {
        const preferred = linkValue.find((link) => link && typeof link === 'object' && (link as Record<string, unknown>)['@_rel'] === 'alternate') || linkValue[0];
        url = textValue((preferred as Record<string, unknown> | undefined)?.['@_href'] || preferred);
      } else if (linkValue && typeof linkValue === 'object') {
        url = textValue((linkValue as Record<string, unknown>)['@_href'] || linkValue);
      }

      return {
        title: stripHtml(textValue(item.title)),
        description: stripHtml(textValue(item.description || item.summary || item.content || '')),
        source: extractSource(item, feed.name),
        url,
        publishedAt: normalizeDate(textValue(item.pubDate || item.published || item.updated || '')),
        imageUrl: extractImage(item) || undefined
      };
    }).filter((item) => item.title && item.url && relevancePattern.test(`${item.title} ${item.description}`));
  } catch (error) {
    console.error(`News feed failed: ${feed.url}`, error);
    return [];
  }
}

function metaContent(html: string, key: string) {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["']`, 'i')
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return stripHtml(match[1]);
  }
  return '';
}

async function enrichArticle(item: RawNewsItem): Promise<RawNewsItem> {
  try {
    const response = await fetch(item.url, {
      redirect: 'follow',
      headers: {'User-Agent': 'Mozilla/5.0 (compatible; OrridiUriezzoGuide/1.0)'},
      signal: AbortSignal.timeout(12_000),
      cache: 'no-store'
    });
    if (!response.ok) return item;
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return item;
    const html = (await response.text()).slice(0, 500_000);
    const imageUrl = metaContent(html, 'og:image') || metaContent(html, 'twitter:image') || item.imageUrl;
    const description = metaContent(html, 'og:description') || metaContent(html, 'description') || item.description;
    return {...item, url: response.url || item.url, imageUrl: imageUrl || undefined, description};
  } catch {
    return item;
  }
}

function basicSummary(item: RawNewsItem) {
  const source = item.description || item.title;
  if (source.length <= 520) return source;
  const cut = source.slice(0, 520);
  return `${cut.slice(0, Math.max(cut.lastIndexOf('.'), cut.lastIndexOf(' ')))}…`;
}

function sameText(value: string): LocalizedText {
  return {it: value, en: value, es: value, de: value};
}

function fallbackSummary(item: RawNewsItem): LocalizedText {
  return {
    it: `Aggiornamento segnalato da ${item.source}. Apri l'articolo originale per il contenuto completo e gli eventuali aggiornamenti successivi.`,
    en: `Update reported by ${item.source}. Open the original article for the complete report and any later updates.`,
    es: `Actualización publicada por ${item.source}. Abre el artículo original para consultar el contenido completo y posibles novedades posteriores.`,
    de: `Meldung von ${item.source}. Öffnen Sie den Originalartikel für den vollständigen Inhalt und mögliche spätere Aktualisierungen.`
  };
}

function parseJsonResponse(value: string) {
  const cleaned = value.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  return JSON.parse(cleaned) as Array<{
    id: string;
    title: Partial<LocalizedText>;
    summary: Partial<LocalizedText>;
  }>;
}

async function localizeWithGemini(items: Array<RawNewsItem & {id: string}>) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !items.length) return new Map<string, {title: LocalizedText; summary: LocalizedText}>();

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const input = items.map((item) => ({
    id: item.id,
    title: item.title,
    source: item.source,
    publishedAt: item.publishedAt,
    sourceDescription: basicSummary(item)
  }));

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'x-goog-api-key': apiKey},
      body: JSON.stringify({
        systemInstruction: {parts: [{text: 'You edit a weekly tourism news digest about the Orridi di Uriezzo and Marmitte dei Giganti. Return valid JSON only. Never copy long passages. Produce an original factual summary of at most 90 words per language. Do not invent facts. Keep source names and dates out of the summary because the interface shows them separately.'}]},
        contents: [{role: 'user', parts: [{text: `For every item, provide title and summary in it, en, es and de. Output an array with objects shaped exactly as {id,title:{it,en,es,de},summary:{it,en,es,de}}. Input: ${JSON.stringify(input)}`}]}],
        generationConfig: {temperature: 0.15, maxOutputTokens: 6000, responseMimeType: 'application/json'},
        store: false
      }),
      signal: AbortSignal.timeout(30_000),
      cache: 'no-store'
    });
    if (!response.ok) throw new Error(`Gemini HTTP ${response.status}`);
    const data = await response.json() as {candidates?: Array<{content?: {parts?: Array<{text?: string}>}}>};
    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
    if (!text) return new Map();

    const parsed = parseJsonResponse(text);
    return new Map(parsed.map((item) => [item.id, {
      title: {
        it: item.title.it || '', en: item.title.en || item.title.it || '',
        es: item.title.es || item.title.it || '', de: item.title.de || item.title.it || ''
      },
      summary: {
        it: item.summary.it || '', en: item.summary.en || item.summary.it || '',
        es: item.summary.es || item.summary.it || '', de: item.summary.de || item.summary.it || ''
      }
    }]));
  } catch (error) {
    console.error('Unable to localize news with Gemini', error);
    return new Map();
  }
}

function weekBounds(date = new Date()) {
  const current = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = current.getUTCDay();
  const diff = (day + 6) % 7;
  const start = new Date(current);
  start.setUTCDate(current.getUTCDate() - diff);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  return {start, end};
}

export async function getNewsArchive(): Promise<NewsArchive> {
  const remote = await readPublicJson<NewsArchive>(ARCHIVE_PATH);
  return remote || (fallbackArchive as NewsArchive);
}

export async function refreshNewsArchive() {
  const existing = await getNewsArchive();
  const {start, end} = weekBounds();
  const previousUrls = new Set(
    existing.weeks
      .filter((entry) => entry.id !== start.toISOString().slice(0, 10))
      .flatMap((entry) => entry.items.map((item) => item.sourceUrl.replace(/[?#].*$/, '')))
  );

  const all = (await Promise.all(feeds.map(fetchFeed))).flat();
  const byKey = new Map<string, RawNewsItem>();
  for (const item of all) {
    const key = item.url.replace(/[?#].*$/, '') || item.title.toLowerCase();
    const previous = byKey.get(key);
    if (!previous || Date.parse(item.publishedAt) > Date.parse(previous.publishedAt)) byKey.set(key, item);
  }

  const weekStart = start.getTime();
  const weekEnd = Math.min(Date.now() + 60 * 60 * 1000, end.getTime() + 24 * 60 * 60 * 1000);
  const candidates = Array.from(byKey.values())
    .filter((item) => {
      const published = Date.parse(item.publishedAt);
      const normalizedUrl = item.url.replace(/[?#].*$/, '');
      return published >= weekStart && published <= weekEnd && !previousUrls.has(normalizedUrl);
    })
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, MAX_ITEMS);
  const enriched = await Promise.all(candidates.map(enrichArticle));
  const withIds = enriched.map((item) => ({
    ...item,
    id: createHash('sha256').update(`${item.url}|${item.title}`).digest('hex').slice(0, 16)
  }));
  const localized = await localizeWithGemini(withIds);

  const items: NewsItem[] = withIds.map((item) => {
    const generated = localized.get(item.id);
    return {
      id: item.id,
      title: generated?.title || sameText(item.title),
      summary: generated?.summary || fallbackSummary(item),
      source: item.source,
      sourceUrl: item.url,
      publishedAt: item.publishedAt,
      imageUrl: item.imageUrl,
      imageAlt: item.title
    };
  });

  const week: NewsWeek = {
    id: start.toISOString().slice(0, 10),
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    generatedAt: new Date().toISOString(),
    items
  };

  const weeks = [week, ...existing.weeks.filter((entry) => entry.id !== week.id)].slice(0, MAX_WEEKS);
  const archive: NewsArchive = {updatedAt: new Date().toISOString(), weeks};
  const stored = await writePublicJson(ARCHIVE_PATH, archive);
  return {updated: Boolean(stored), archive, sourceCount: all.length};
}
