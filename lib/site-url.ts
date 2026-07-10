const fallbackOrigin = 'https://orridiuriezzo.vercel.app';

function getConfiguredUrl(value: string | undefined) {
  try {
    return new URL(value || fallbackOrigin);
  } catch {
    return new URL(fallbackOrigin);
  }
}

export const siteOrigin = getConfiguredUrl(process.env.NEXT_PUBLIC_SITE_URL).origin;
export const italianShareUrl = process.env.NEXT_PUBLIC_SHARE_URL || `${siteOrigin}/it`;
