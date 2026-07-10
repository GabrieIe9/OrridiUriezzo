# Validazione finale

Data di validazione: 11 luglio 2026.

## Comandi eseguiti

```text
npm ci --no-audit --no-fund: superato su copia pulita
npm run lint: superato senza warning
npm run build: superato
npm audit --omit=dev --audit-level=high: 0 vulnerabilità
```

## Build Next.js

- 21 pagine generate.
- 4 homepage localizzate.
- 8 pagine guida localizzate.
- 4 pagine news localizzate.
- API dinamiche: `/api/chat`, `/api/tts`, `/api/cron/refresh`.
- ISR: 1 ora sulle pagine aggiornate da Blob.
- Invalidazione immediata dopo gli aggiornamenti cron.

## Lunghezza guide

| Lingua | Orridi | Marmitte |
|---|---:|---:|
| Italiano | 4909 parole | 4309 parole |
| Inglese | 3748 parole | 3501 parole |
| Spagnolo | 4505 parole | 4250 parole |
| Tedesco | 3867 parole | 3654 parole |

Ogni guida contiene 10 capitoli. La generazione audio avviene per singolo capitolo.

## Sicurezza e integrità

- Nessuna chiave Gemini o ElevenLabs inclusa nel progetto.
- `.env` e `.env.local` esclusi da Git.
- Nessun URL del registro npm interno OpenAI nel lockfile.
- `.npmrc` usa `https://registry.npmjs.org/`.
- Cron protetto da `CRON_SECRET`.
- Gemini e ElevenLabs chiamati esclusivamente lato server.
- Input TTS limitato a lingue, attrazioni e capitoli presenti nei file locali.
- News senza ripubblicazione integrale: riassunto originale e link alla fonte.

## Automazioni

- Rotazione immagini prevista ogni 14 giorni.
- Nessun ID immagine duplicato nella selezione automatica globale.
- Rotazione atomica: se non viene trovata una composizione completa, resta attiva quella precedente.
- News archiviate per settimana, fino a 52 settimane.
- URL già archiviati esclusi dalle settimane successive.
- MP3 identificati da hash e conservati su Vercel Blob.

## Limiti del test locale

Le chiamate reali a Wikimedia Commons, feed RSS, Gemini, ElevenLabs e Vercel Blob non sono state eseguite durante la build perché l'ambiente di validazione non contiene le credenziali Vercel/API e non garantisce accesso DNS esterno. Le route gestiscono gli errori delle singole fonti e mantengono i contenuti precedenti o i fallback locali.
