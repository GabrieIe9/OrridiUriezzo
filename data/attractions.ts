export type AttractionSlug = 'orridi-uriezzo' | 'marmitte-dei-giganti';

export type GalleryImage = {
  src: string;
  altKey: string;
  captionKey: string;
  sourceUrl: string;
  author?: string;
  license?: string;
};

export type MapPoint = {
  id: string;
  image?: string;
  mapsUrl: string;
  mapsPhotosUrl: string;
  sourceUrl?: string;
};

export type AttractionVisuals = {
  hero: string;
  card: string;
  gallery: GalleryImage[];
  mapsUrl: string;
  mapsPhotosUrl: string;
  mapEmbedUrl: string;
  mapPoints: MapPoint[];
};

const commons = (filename: string) => `https://commons.wikimedia.org/wiki/File:${filename}`;

export const attractionVisuals: Record<AttractionSlug, AttractionVisuals> = {
  'orridi-uriezzo': {
    hero: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Baceno_Orridi_di_Uriezzo_Orrido_01.jpg',
    card: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Baceno_Orridi_di_Uriezzo_Orrido_09.jpg',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Orridi+di+Uriezzo',
    mapsPhotosUrl: 'https://www.google.com/maps/search/?api=1&query=Orridi+di+Uriezzo+foto',
    mapEmbedUrl: 'https://www.google.com/maps?q=46.254442,8.329756&z=15&output=embed',
    mapPoints: [
      {
        id: 'orrido-sud',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Orridi_di_Uriezzo_S%C3%BCd_09.jpg/1280px-Orridi_di_Uriezzo_S%C3%BCd_09.jpg',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Orrido+Sud+Uriezzo',
        mapsPhotosUrl: 'https://www.google.com/maps/search/?api=1&query=Orrido+Sud+Uriezzo+foto',
        sourceUrl: commons('Orridi_di_Uriezzo_Süd_09.jpg')
      },
      {
        id: 'santa-lucia',
        image: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Baceno_Orridi_di_Uriezzo_01.jpg',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Oratorio+di+Santa+Lucia+Uriezzo+Premia',
        mapsPhotosUrl: 'https://www.google.com/maps/search/?api=1&query=Oratorio+di+Santa+Lucia+Uriezzo+Premia+foto',
        sourceUrl: commons('Baceno_Orridi_di_Uriezzo_01.jpg')
      },
      {
        id: 'baceno-access',
        image: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Baceno_Orridi_di_Uriezzo_Orrido_09.jpg',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Chiesa+Monumentale+San+Gaudenzio+Baceno',
        mapsPhotosUrl: 'https://www.google.com/maps/search/?api=1&query=Chiesa+Monumentale+San+Gaudenzio+Baceno+foto',
        sourceUrl: commons('Baceno_Orridi_di_Uriezzo_Orrido_09.jpg')
      }
    ],
    gallery: [
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Baceno_Orridi_di_Uriezzo_01.jpg',
        altKey: 'gallery.items.0.alt',
        captionKey: 'gallery.items.0.caption',
        sourceUrl: commons('Baceno_Orridi_di_Uriezzo_01.jpg')
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Baceno_Orridi_di_Uriezzo_02.jpg',
        altKey: 'gallery.items.1.alt',
        captionKey: 'gallery.items.1.caption',
        sourceUrl: commons('Baceno_Orridi_di_Uriezzo_02.jpg')
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Baceno_Orridi_di_Uriezzo_03.jpg',
        altKey: 'gallery.items.2.alt',
        captionKey: 'gallery.items.2.caption',
        sourceUrl: commons('Baceno_Orridi_di_Uriezzo_03.jpg')
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Baceno_Orridi_di_Uriezzo_04.jpg',
        altKey: 'gallery.items.3.alt',
        captionKey: 'gallery.items.3.caption',
        sourceUrl: commons('Baceno_Orridi_di_Uriezzo_04.jpg')
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Baceno_Orridi_di_Uriezzo_Orrido_01.jpg',
        altKey: 'gallery.items.4.alt',
        captionKey: 'gallery.items.4.caption',
        sourceUrl: commons('Baceno_Orridi_di_Uriezzo_Orrido_01.jpg')
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Baceno_Orridi_di_Uriezzo_Orrido_09.jpg',
        altKey: 'gallery.items.5.alt',
        captionKey: 'gallery.items.5.caption',
        sourceUrl: commons('Baceno_Orridi_di_Uriezzo_Orrido_09.jpg')
      }
    ]
  },
  'marmitte-dei-giganti': {
    hero: 'https://upload.wikimedia.org/wikipedia/commons/d/db/Baceno_Orridi_di_Uriezzo_Marmitte_dei_Giganti_01.jpg',
    card: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Baceno_Orridi_di_Uriezzo_Marmitte_dei_Giganti_02.jpg',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Marmitte+dei+Giganti+Maiesso',
    mapsPhotosUrl: 'https://www.google.com/maps/search/?api=1&query=Marmitte+dei+Giganti+Maiesso+foto',
    mapEmbedUrl: 'https://www.google.com/maps?q=46.254059,8.331617&z=16&output=embed',
    mapPoints: [
      {
        id: 'marmitte',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Orridi_di_Uriezzo_Marmitte_01.jpg/1024px-Orridi_di_Uriezzo_Marmitte_01.jpg',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Marmitte+dei+Giganti+Maiesso',
        mapsPhotosUrl: 'https://www.google.com/maps/search/?api=1&query=Marmitte+dei+Giganti+Maiesso+foto',
        sourceUrl: commons('Orridi_di_Uriezzo_Marmitte_01.jpg')
      },
      {
        id: 'maiesso-bridge',
        image: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Baceno_Orridi_di_Uriezzo_Marmitte_dei_Giganti_02.jpg',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Ponte+di+Maiesso',
        mapsPhotosUrl: 'https://www.google.com/maps/search/?api=1&query=Ponte+di+Maiesso+foto',
        sourceUrl: commons('Baceno_Orridi_di_Uriezzo_Marmitte_dei_Giganti_02.jpg')
      },
      {
        id: 'crego',
        image: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Centrale_idroelettrica_di_Crego.jpg',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Centrale+idroelettrica+di+Crego',
        mapsPhotosUrl: 'https://www.google.com/maps/search/?api=1&query=Centrale+idroelettrica+di+Crego+foto',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Centrale_idroelettrica_di_Crego.jpg'
      }
    ],
    gallery: [
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/d/db/Baceno_Orridi_di_Uriezzo_Marmitte_dei_Giganti_01.jpg',
        altKey: 'gallery.items.0.alt',
        captionKey: 'gallery.items.0.caption',
        sourceUrl: commons('Baceno_Orridi_di_Uriezzo_Marmitte_dei_Giganti_01.jpg')
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Baceno_Orridi_di_Uriezzo_Marmitte_dei_Giganti_02.jpg',
        altKey: 'gallery.items.1.alt',
        captionKey: 'gallery.items.1.caption',
        sourceUrl: commons('Baceno_Orridi_di_Uriezzo_Marmitte_dei_Giganti_02.jpg')
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Baceno_Orridi_di_Uriezzo_Marmitte_dei_Giganti_03.jpg',
        altKey: 'gallery.items.2.alt',
        captionKey: 'gallery.items.2.caption',
        sourceUrl: commons('Baceno_Orridi_di_Uriezzo_Marmitte_dei_Giganti_03.jpg')
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/9/99/Baceno_Orridi_di_Uriezzo_Marmitte_dei_Giganti_04.jpg',
        altKey: 'gallery.items.3.alt',
        captionKey: 'gallery.items.3.caption',
        sourceUrl: commons('Baceno_Orridi_di_Uriezzo_Marmitte_dei_Giganti_04.jpg')
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/c/c6/Baceno_Orridi_di_Uriezzo_Marmitte_dei_Giganti_05.jpg',
        altKey: 'gallery.items.4.alt',
        captionKey: 'gallery.items.4.caption',
        sourceUrl: commons('Baceno_Orridi_di_Uriezzo_Marmitte_dei_Giganti_05.jpg')
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Baceno_Orridi_di_Uriezzo_Marmitte_dei_Giganti_06.jpg',
        altKey: 'gallery.items.5.alt',
        captionKey: 'gallery.items.5.caption',
        sourceUrl: commons('Baceno_Orridi_di_Uriezzo_Marmitte_dei_Giganti_06.jpg')
      }
    ]
  }
};
