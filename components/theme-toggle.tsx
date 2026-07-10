'use client';

import {Moon, Sun} from 'lucide-react';
import {useSyncExternalStore} from 'react';

type Theme = 'light' | 'dark';

function subscribe(callback: () => void) {
  window.addEventListener('themechange', callback);
  return () => window.removeEventListener('themechange', callback);
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
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, getServerThemeSnapshot);

  function applyTheme(nextTheme: Theme) {
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    localStorage.setItem('theme', nextTheme);
    window.dispatchEvent(new Event('themechange'));
  }

  const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
  const label = nextTheme === 'dark' ? switchToDark : switchToLight;

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={label}
      title={label}
      onClick={() => applyTheme(nextTheme)}
    >
      <Sun className="theme-icon theme-icon-sun" size={19} aria-hidden="true" />
      <Moon className="theme-icon theme-icon-moon" size={19} aria-hidden="true" />
    </button>
  );
}
