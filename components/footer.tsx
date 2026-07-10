import {ExternalLink, Mountain} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';

const localLinks = [
  ['Baceno', 'https://www.google.com/maps/search/?api=1&query=Baceno+VB'],
  ['Premia', 'https://www.google.com/maps/search/?api=1&query=Premia+VB'],
  ['Crodo', 'https://www.google.com/maps/search/?api=1&query=Crodo+VB']
] as const;

export async function Footer() {
  const t = await getTranslations('common');

  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <div className="footer-brand">
            <Mountain size={22} aria-hidden="true" />
            <strong>{t('brand')}</strong>
          </div>
          <p>{t('footer.description')}</p>
        </div>

        <div>
          <h2>{t('footer.explore')}</h2>
          <div className="footer-links">
            <Link href="/orridi-uriezzo">{t('nav.orridi')}</Link>
            <Link href="/marmitte-dei-giganti">{t('nav.marmitte')}</Link>
            <Link href="/qrcode">{t('nav.qrcode')}</Link>
          </div>
        </div>

        <div>
          <h2>{t('footer.localLinks')}</h2>
          <div className="footer-links">
            {localLinks.map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noreferrer">
                {label} <ExternalLink size={13} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} {t('brand')}</span>
        <span>{t('footer.disclaimer')}</span>
      </div>
    </footer>
  );
}
