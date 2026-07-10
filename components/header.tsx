import {Mountain} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {LanguageSwitcher} from './language-switcher';
import {ThemeToggle} from './theme-toggle';

export async function Header() {
  const t = await getTranslations('common');

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link href="/" className="brand" aria-label={t('homeAria')}>
          <span className="brand-mark" aria-hidden="true">
            <Mountain size={20} strokeWidth={1.8} />
          </span>
          <span>
            <strong>{t('brand')}</strong>
            <small>{t('brandSubtitle')}</small>
          </span>
        </Link>

        <nav className="main-nav" aria-label={t('navigationAria')}>
          <Link href="/">{t('nav.home')}</Link>
          <Link href="/orridi-uriezzo">{t('nav.orridi')}</Link>
          <Link href="/marmitte-dei-giganti">{t('nav.marmitte')}</Link>
          <Link href="/news">{t('nav.news')}</Link>
        </nav>

        <div className="header-actions">
          <LanguageSwitcher ariaLabel={t('languageLabel')} />
          <ThemeToggle
            switchToDark={t('theme.switchToDark')}
            switchToLight={t('theme.switchToLight')}
          />
        </div>
      </div>
    </header>
  );
}
