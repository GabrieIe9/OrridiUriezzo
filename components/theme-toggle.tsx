'use client';

import {Moon, Sun} from 'lucide-react';
import {usePathname} from 'next/navigation';
import {useEffect, useLayoutEffect, useSyncExternalStore} from 'react';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme';

function getPreferredTheme(): Theme {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function setDocumentTheme(theme: Theme, persist = false) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;

  if (persist) localStorage.setItem(THEME_STORAGE_KEY, theme);
  window.dispatchEvent(new Event('themechange'));
}

function subscribe(callback: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY) return;
    setDocumentTheme(getPreferredTheme());
    callback();
  };

  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });

  window.addEventListener('themechange', callback);
  window.addEventListener('storage', handleStorage);

  return () => {
    observer.disconnect();
    window.removeEventListener('themechange', callback);
    window.removeEventListener('storage', handleStorage);
  };
}

function getThemeSnapshot(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function getServerThemeSnapshot(): Theme {
  return 'light';
}

export function ThemeToggle({
  switchToDark,
  switchToLight
}: {
  switchToDark: string;
  switchToLight: string;
}) {
  const pathname = usePathname();
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, getServerThemeSnapshot);

  // next-intl can update the <html> element during locale navigation. Reapply the
  // stored preference immediately after every route change so the theme cannot reset.
  useLayoutEffect(() => {
    setDocumentTheme(getPreferredTheme());
  }, [pathname]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = () => {
      if (localStorage.getItem(THEME_STORAGE_KEY)) return;
      setDocumentTheme(mediaQuery.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
  const label = nextTheme === 'dark' ? switchToDark : switchToLight;

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={label}
      title={label}
      onClick={() => setDocumentTheme(nextTheme, true)}
    >
      <Sun className="theme-icon theme-icon-sun" size={19} aria-hidden="true" />
      <Moon className="theme-icon theme-icon-moon" size={19} aria-hidden="true" />
    </button>
  );
}
