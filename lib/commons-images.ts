import {readPublicJson, writePublicJson} from './blob-storage';
import type {AttractionSlug} from '@/data/attractions';

const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const STATE_PATH = 'orridi/media/visuals.json';
const HISTORY_LIMIT = 176;

export type RemoteImage = {
  id: string;
  title: string;
  src: string;
  sourceUrl: string;
  author: string;
  license: string;
  description: string;
};

export type AttractionRemoteVisuals = {
  hero: RemoteImage;
  card: RemoteImage;
  gallery: RemoteImage[];
  mapPoints: Record<string, RemoteImage>;
};

export type VisualArchive = {
  updatedAt: string;
  rotation: number;
  history: string[];
  attractions: Record<AttractionSlug, AttractionRemoteVisuals>;
};

type CommonsPage = {
  pageid: number;
  title: string;
  imageinfo?: Array<{
    thumburl?: string;
    url?: string;
    descriptionurl?: string;
    thumbwidth?: number;
    thumbheight?: number;
    width?: number;
    height?: number;
    mime?: string;
    extmetadata?: Record<string, {value?: string}>;
  }>;
};

type Slot = {key: string; query: string};

const slots: Record<AttractionSlug, Slot[]> = {
  'orridi-uriezzo': [
    {key: 'hero', query: 'Orridi di Uriezzo canyon'},
    {key: 'card', query: 'Orridi di Uriezzo Baceno'},
    {key: 'gallery-0', query: 'Orridi di Uriezzo'},
    {key: 'gallery-1', query: 'Orrido Sud Uriezzo'},
    {key: 'gallery-2', query: 'Uriezzo gorge Piemonte'},
    {key: 'gallery-3', query: 'Baceno Orridi Uriezzo'},
    {key: 'gallery-4', query: 'Uriezzo canyon granite'},
    {key: 'gallery-5', query: 'Orridi Uriezzo sentiero'},
    {key: 'map-orrido-sud', query: 'Orrido Sud Uriezzo'},
    {key: 'map-santa-lucia', query: 'Santa Lucia Uriezzo Premia'},
    {key: 'map-baceno-access', query: 'San Gaudenzio Baceno'}
  ],
  'marmitte-dei-giganti': [
    {key: 'hero', query: 'Marmitte dei Giganti Maiesso'},
    {key: 'card', query: 'Maiesso Toce marmitte'},
    {key: 'gallery-0', query: 'Marmitte dei Giganti Uriezzo'},
    {key: 'gallery-1', query: 'Marmitte dei Giganti Maiesso'},
    {key: 'gallery-2', query: 'Maiesso river Toce'},
    {key: 'gallery-3', query: 'Baceno Marmitte dei Giganti'},
    {key: 'gallery-4', query: 'Toce potholes Maiesso'},
    {key: 'gallery-5', query: 'Ponte di Maiesso'},
    {key: 'map-marmitte', query: 'Marmitte dei Giganti Maiesso'},
    {key: 'map-maiesso-bridge', query: 'Ponte di Maiesso'},
    {key: 'map-crego', query: 'Crego Premia Piemonte'}
  ]
};

function cleanHtml(value?: string) {
  return (value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function pageToImage(page: CommonsPage): RemoteImage | null {
  const info = page.imageinfo?.[0];
  const src = info?.thumburl || info?.url;
  if (!info || !src || !info.descriptionurl) return null;
  if (info.mime && !info.mime.startsWith('image/')) return null;
  if (/\.svg(?:\?|$)/i.test(src)) return null;
  const width = info.thumbwidth || info.width || 0;
  const height = info.thumbheight || info.height || 0;
  if (width < 640 || height < 360) return null;

  const metadata = info.extmetadata || {};
  return {
    id: String(page.pageid),
    title: page.title.replace(/^File:/, ''),
    src,
    sourceUrl: info.descriptionurl,
    author: cleanHtml(metadata.Artist?.value || metadata.Credit?.value) || 'Wikimedia Commons contributor',
    license: cleanHtml(metadata.LicenseShortName?.value) || 'See source page',
    description: cleanHtml(metadata.ImageDescription?.value)
  };
}

async function searchCommons(query: string): Promise<RemoteImage[]> {
  const url = new URL(COMMONS_API);
  url.searchParams.set('action', 'query');
  url.searchParams.set('generator', 'search');
  url.searchParams.set('gsrsearch', query);
  url.searchParams.set('gsrnamespace', '6');
  url.searchParams.set('gsrlimit', '50');
  url.searchParams.set('prop', 'imageinfo');
  url.searchParams.set('iiprop', 'url|size|mime|extmetadata');
  url.searchParams.set('iiurlwidth', '1600');
  url.searchParams.set('format', 'json');
  url.searchParams.set('formatversion', '2');
  url.searchParams.set('origin', '*');

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'OrridiUriezzoGuide/1.0 (https://orridiuriezzo.vercel.app; automated Commons image rotation)'
    },
    signal: AbortSignal.timeout(20_000)
  });
  if (!response.ok) throw new Error(`Commons API ${response.status}`);

  const payload = (await response.json()) as {query?: {pages?: CommonsPage[]}};
  return (payload.query?.pages || [])
    .map(pageToImage)
    .filter((item): item is RemoteImage => Boolean(item));
}

function stableIndex(seed: number, slotIndex: number, length: number) {
  const value = Math.abs(Math.imul(seed + 17, 2654435761) + Math.imul(slotIndex + 31, 2246822519));
  return length ? value % length : 0;
}

function selectForSlots(
  slotList: Slot[],
  candidatesByQuery: Map<string, RemoteImage[]>,
  used: Set<string>,
  recent: Set<string>,
  rotation: number
) {
  const selected = new Map<string, RemoteImage>();
  const allCandidates = Array.from(candidatesByQuery.values()).flat();

  for (let index = 0; index < slotList.length; index += 1) {
    const slot = slotList[index];
    const directCandidates = candidatesByQuery.get(slot.query) || [];
    const candidates = directCandidates.length ? directCandidates : allCandidates;
    let unique = candidates.filter((image) => !used.has(image.id));

    // A narrow query can return only images already used by another slot.
    // Fall back to the global Commons candidate pool while preserving the
    // strict no-duplicate rule across both attractions.
    if (!unique.length) {
      unique = allCandidates.filter((image) => !used.has(image.id));
    }
    const fresh = unique.filter((image) => !recent.has(image.id));
    const pool = fresh.length ? fresh : unique;
    if (!pool.length) continue;

    const image = pool[stableIndex(rotation, index, pool.length)];
    selected.set(slot.key, image);
    used.add(image.id);
  }

  return selected;
}

export async function readVisualArchive() {
  return readPublicJson<VisualArchive>(STATE_PATH);
}

export async function refreshCommonsVisuals(force = false) {
  const existing = await readVisualArchive();
  const now = Date.now();
  if (!force && existing && now - Date.parse(existing.updatedAt) < 13 * 24 * 60 * 60 * 1000) {
    return {updated: false, archive: existing};
  }

  const rotation = Math.floor(now / (14 * 24 * 60 * 60 * 1000));
  const history = existing?.history || [];
  const recent = new Set(history.slice(-88));
  const used = new Set<string>();
  const attractions = {} as Record<AttractionSlug, AttractionRemoteVisuals>;
  const newHistory: string[] = [];
  const uniqueQueries = Array.from(new Set(Object.values(slots).flat().map((slot) => slot.query)));
  const searchResults = await Promise.all(uniqueQueries.map(async (query) => {
    try {
      return [query, await searchCommons(query)] as const;
    } catch (error) {
      console.error(`Commons search failed for ${query}`, error);
      return [query, [] as RemoteImage[]] as const;
    }
  }));
  const candidatesByQuery = new Map(searchResults);

  for (const slug of Object.keys(slots) as AttractionSlug[]) {
    const selected = selectForSlots(slots[slug], candidatesByQuery, used, recent, rotation + (slug === 'orridi-uriezzo' ? 0 : 101));
    const hero = selected.get('hero');
    const card = selected.get('card');
    const gallery = Array.from({length: 6}, (_, index) => selected.get(`gallery-${index}`)).filter(
      (image): image is RemoteImage => Boolean(image)
    );
    const mapPoints = Object.fromEntries(
      Array.from(selected.entries())
        .filter(([key]) => key.startsWith('map-'))
        .map(([key, image]) => [key.replace(/^map-/, ''), image])
    );

    if (!hero || !card || gallery.length !== 6 || Object.keys(mapPoints).length !== 3) {
      // Keep rotations atomic. Mixing one newly generated attraction with an
      // older one could reintroduce a duplicate across pages. When a complete
      // replacement cannot be assembled, preserve the previous global set.
      if (existing) return {updated: false, archive: existing};
      throw new Error(`Not enough Commons images found for ${slug}`);
    }

    attractions[slug] = {hero, card, gallery, mapPoints};
    newHistory.push(hero.id, card.id, ...gallery.map((image) => image.id), ...Object.values(mapPoints).map((image) => image.id));
  }

  const archive: VisualArchive = {
    updatedAt: new Date(now).toISOString(),
    rotation,
    history: [...history, ...newHistory].slice(-HISTORY_LIMIT),
    attractions
  };

  const stored = await writePublicJson(STATE_PATH, archive);
  return {updated: Boolean(stored), archive};
}
