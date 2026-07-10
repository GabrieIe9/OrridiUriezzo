'use client';

import {useLocale} from 'next-intl';
import {usePathname, useRouter} from '@/i18n/navigation';
import type {AppLocale} from '@/i18n/routing';

const locales: Array<{code: AppLocale; label: string}> = [
  {code: 'it', label: 'IT'},
  {code: 'en', label: 'EN'},
  {code: 'es', label: 'ES'},
  {code: 'de', label: 'DE'}
];

export function LanguageSwitcher({ariaLabel}: {ariaLabel: string}) {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="language-switcher" aria-label={ariaLabel} role="group">
      {locales.map(({code, label}) => (
        <button
          type="button"
          key={code}
          className={locale === code ? 'is-active' : ''}
          aria-current={locale === code ? 'page' : undefined}
          onClick={() => router.replace(pathname, {locale: code})}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
