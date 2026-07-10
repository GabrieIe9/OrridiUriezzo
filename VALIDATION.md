# Validation report

Validated on 2026-07-10.

## Commands executed

```bash
npm install
npm run lint
npm run build
npm audit
```

## Result

- ESLint: 0 errors, 0 warnings.
- TypeScript: passed during `next build`.
- Production build: passed.
- Static output: 4 home pages, 8 attraction pages, 4 QR pages, sitemap and robots.
- Serverless output: `/api/tts`.
- Dependency audit: 0 known vulnerabilities.
- HTTP smoke test: `/it`, `/en/orridi-uriezzo`, `/de/marmitte-dei-giganti`, `/it/qrcode` and `/sitemap.xml` returned HTTP 200.
- TTS without `ELEVENLABS_API_KEY`: returned the expected HTTP 503 configuration error.

The ElevenLabs call itself was not executed because no API key was provided. The endpoint and request body follow the official streaming Text-to-Speech API schema.
