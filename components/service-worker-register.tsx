'use client';

import {useEffect} from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Offline support is progressive enhancement; the site remains usable without it.
      });
    }
  }, []);

  return null;
}
