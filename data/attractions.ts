export type AttractionSlug = 'orridi-uriezzo' | 'marmitte-dei-giganti';

export type GalleryImage = {
  src: string;
  altKey: string;
  captionKey: string;
};

type AttractionVisuals = {
  hero: string;
  card: string;
  gallery: GalleryImage[];
  mapsUrl: string;
};

// TODO: replace these royalty-free Unsplash placeholders with approved local photos.
export const attractionVisuals: Record<AttractionSlug, AttractionVisuals> = {
  'orridi-uriezzo': {
    hero: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=2200&q=85',
    card: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1800&q=85',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Orridi+di+Uriezzo',
    gallery: [
      {
        src: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1600&q=80',
        altKey: 'gallery.items.0.alt',
        captionKey: 'gallery.items.0.caption'
      },
      {
        src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80',
        altKey: 'gallery.items.1.alt',
        captionKey: 'gallery.items.1.caption'
      },
      {
        src: 'https://images.unsplash.com/photo-1439853949127-fa647821eba0?auto=format&fit=crop&w=1600&q=80',
        altKey: 'gallery.items.2.alt',
        captionKey: 'gallery.items.2.caption'
      },
      {
        src: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1600&q=80',
        altKey: 'gallery.items.3.alt',
        captionKey: 'gallery.items.3.caption'
      },
      {
        src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80',
        altKey: 'gallery.items.4.alt',
        captionKey: 'gallery.items.4.caption'
      },
      {
        src: 'https://images.unsplash.com/photo-1464278533981-50106e6176b1?auto=format&fit=crop&w=1600&q=80',
        altKey: 'gallery.items.5.alt',
        captionKey: 'gallery.items.5.caption'
      }
    ]
  },
  'marmitte-dei-giganti': {
    hero: 'https://images.unsplash.com/photo-1437482078695-73f5ca6c96e2?auto=format&fit=crop&w=2200&q=85',
    card: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1800&q=85',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Marmitte+dei+Giganti+Maiesso',
    gallery: [
      {
        src: 'https://images.unsplash.com/photo-1437482078695-73f5ca6c96e2?auto=format&fit=crop&w=1600&q=80',
        altKey: 'gallery.items.0.alt',
        captionKey: 'gallery.items.0.caption'
      },
      {
        src: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1600&q=80',
        altKey: 'gallery.items.1.alt',
        captionKey: 'gallery.items.1.caption'
      },
      {
        src: 'https://images.unsplash.com/photo-1439853949127-fa647821eba0?auto=format&fit=crop&w=1600&q=80',
        altKey: 'gallery.items.2.alt',
        captionKey: 'gallery.items.2.caption'
      },
      {
        src: 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=1600&q=80',
        altKey: 'gallery.items.3.alt',
        captionKey: 'gallery.items.3.caption'
      },
      {
        src: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1600&q=80',
        altKey: 'gallery.items.4.alt',
        captionKey: 'gallery.items.4.caption'
      },
      {
        src: 'https://images.unsplash.com/photo-1534269222346-5a896154c41d?auto=format&fit=crop&w=1600&q=80',
        altKey: 'gallery.items.5.alt',
        captionKey: 'gallery.items.5.caption'
      }
    ]
  }
};
