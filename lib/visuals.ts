import {attractionVisuals, type AttractionSlug, type AttractionVisuals} from '@/data/attractions';
import {readVisualArchive} from './commons-images';


function dedupeFallbackVisuals(fallback: AttractionVisuals): AttractionVisuals {
  const used = new Set<string>([fallback.hero, fallback.card]);

  const mapPoints = fallback.mapPoints.map((point) => {
    if (!point.image || used.has(point.image)) {
      return {...point, image: undefined, sourceUrl: undefined};
    }
    used.add(point.image);
    return point;
  });

  const gallery = fallback.gallery.filter((image) => {
    if (used.has(image.src)) return false;
    used.add(image.src);
    return true;
  });

  return {...fallback, mapPoints, gallery};
}

export async function getAttractionVisuals(slug: AttractionSlug): Promise<AttractionVisuals> {
  const fallback = attractionVisuals[slug];
  const archive = await readVisualArchive();
  const remote = archive?.attractions?.[slug];
  if (!remote) return dedupeFallbackVisuals(fallback);

  return {
    ...fallback,
    updatedAt: archive?.updatedAt,
    hero: remote.hero.src,
    card: remote.card.src,
    gallery: remote.gallery.slice(0, 6).map((image, index) => ({
      src: image.src,
      altKey: `gallery.items.${index}.alt`,
      captionKey: `gallery.items.${index}.caption`,
      sourceUrl: image.sourceUrl,
      author: image.author,
      license: image.license
    })),
    mapPoints: fallback.mapPoints.map((point) => {
      const image = remote.mapPoints[point.id];
      return image
        ? {...point, image: image.src, sourceUrl: image.sourceUrl}
        : point;
    })
  };
}

export async function getHomeCardImages() {
  const [orridi, marmitte] = await Promise.all([
    getAttractionVisuals('orridi-uriezzo'),
    getAttractionVisuals('marmitte-dei-giganti')
  ]);

  return {
    'orridi-uriezzo': orridi.card,
    'marmitte-dei-giganti': marmitte.card
  } as const;
}


export async function getHomeAidaImages() {
  const [orridi, marmitte] = await Promise.all([
    getAttractionVisuals('orridi-uriezzo'),
    getAttractionVisuals('marmitte-dei-giganti')
  ]);

  return {
    orridi: orridi.gallery[0]?.src || orridi.hero,
    marmitte: marmitte.gallery[0]?.src || marmitte.hero
  } as const;
}
