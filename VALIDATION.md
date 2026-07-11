# Validazione

## Comandi eseguiti

```text
npm ci: superato
npm run lint: superato
npm run build: superato
TypeScript: superato
21 pagine generate
```

## Route dinamiche

```text
/api/chat
/api/cron/refresh
```

La route `/api/tts` è stata rimossa.

## Audioguida

- usa `speechSynthesis` e `SpeechSynthesisUtterance` nel browser;
- non usa ElevenLabs;
- non genera o scarica MP3;
- supporta capitoli, pausa, ripresa, stop, velocità, voce e avanzamento automatico;
- salva localmente la posizione raggiunta;
- mostra un messaggio dedicato nei browser senza sintesi vocale.

## Sicurezza

- nessuna chiave ElevenLabs richiesta o inclusa;
- Gemini resta esclusivamente server-side;
- `.env`, `.env.local`, `.next` e `node_modules` sono esclusi dal progetto distribuibile.
