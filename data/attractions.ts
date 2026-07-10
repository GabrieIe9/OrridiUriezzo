export type AttractionSlug = 'orridi-uriezzo' | 'marmitte-dei-giganti';

export type GalleryImage = {
  src: string;
  altKey: string;
  captionKey: string;
  sourceUrl: string;
};

type AttractionVisuals = {
  hero: string;
  card: string;
  gallery: GalleryImage[];
  mapsUrl: string;
  mapsPhotosUrl: string;
};

const commons = (filename: string) => `https://commons.wikimedia.org/wiki/File:${filename}`;

export const attractionVisuals: Record<AttractionSlug, AttractionVisuals> = {
  'orridi-uriezzo': {
    hero: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Baceno_Orridi_di_Uriezzo_Orrido_01.jpg',
    card: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Baceno_Orridi_di_Uriezzo_Orrido_09.jpg',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Orridi+di+Uriezzo',
    mapsPhotosUrl: 'https://www.google.com/maps/search/?api=1&query=Orridi+di+Uriezzo+foto',
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
