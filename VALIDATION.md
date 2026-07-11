# Validazione finale

Data di validazione: 11 luglio 2026.

## Comandi eseguiti sulla versione aggiornata

```text
npm run lint: superato senza errori
npm run build: superato
TypeScript: superato durante la build
Rendering HTTP locale della pagina italiana: stato 200
```

La build ha generato 21 pagine e le route dinamiche:

```text
/api/chat
/api/tts
/api/cron/refresh
```

## Funzioni verificate dalla compilazione

- quattro lingue: italiano, inglese, spagnolo e tedesco;
- guide da 10 capitoli per entrambe le attrazioni;
- pianificatore della visita;
- navigatore della lettura e salvataggio locale;
- audioguida per capitolo con cache Blob, download e ripresa locale;
- mappe filtrabili e servizi vicini;
- news settimanali e archivio storico;
- rotazione fotografie con copia persistente su Vercel Blob;
- dati strutturati `TouristAttraction` e `BreadcrumbList`.

## Integrità e sicurezza

- nessuna chiave Gemini o ElevenLabs inclusa nel progetto;
- `.env` e `.env.local` esclusi da Git;
- nessun URL del registro npm interno OpenAI nel lockfile;
- `.npmrc` usa `https://registry.npmjs.org/`;
- cron protetto da `CRON_SECRET`;
- Gemini ed ElevenLabs sono chiamati esclusivamente lato server;
- il testo inviato al TTS può provenire soltanto dai capitoli locali autorizzati;
- fotografie accompagnate da fonte, autore e licenza quando disponibili.

## Dipendenze esterne non eseguite nel test

Le chiamate reali a Wikimedia Commons, feed RSS, Gemini, ElevenLabs e Vercel Blob richiedono rete e credenziali del deployment. La build e il rendering usano i fallback locali quando tali servizi non sono configurati.
