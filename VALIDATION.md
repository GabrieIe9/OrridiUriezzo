# Validation report

Validation completed on the final mobile, sharing, photography and nearby-services version.

## Automated checks

- `npm ci --no-audit --no-fund`: passed from a clean dependency directory.
- `npm run lint`: passed.
- `npm run build`: passed.
- TypeScript production type-check: passed.
- Static generation: 17 route outputs generated; localized home and detail pages generated for IT, EN, ES and DE.
- Dynamic routes detected: `/api/chat` and `/api/tts`.
- QR-specific page routes: absent.
- `qrcode.react`: removed from dependencies and lockfile.
- Translation object shape: identical in all four languages.
- `npm audit`: zero known vulnerabilities.
- Secret scan: supplied Gemini and ElevenLabs values are not present in the project.

## Functional checks

- Header and footer contain no QR page link.
- Homepage renders the Share control with the supplied `public/qrcode.png`.
- The shared URL defaults to `https://orridiuriezzo.vercel.app/it`.
- `NEXT_PUBLIC_SITE_URL` is normalized to its origin to prevent duplicated locale paths.
- Gallery images point to real-location sources and include attribution links.
- Google Maps photo, restaurant, pizzeria, parking and camper searches are present.
- Long-form history, geology, access and safety content is available in four languages.
- Gemini instructions remain server-side and restrict the assistant to the two attractions and visit-related services.
- Light/dark mode, mobile safe areas, AI chat and back-to-top controls remain enabled.
- Service-worker cache updated to `ossola-guide-v3` and includes the QR image.

## External services not called

Live Gemini and ElevenLabs requests were not executed. Their API keys must be configured only in Vercel environment variables.
