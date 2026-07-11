# Orridi di Uriezzo & Marmitte dei Giganti

Sito turistico multilingua, mobile-first e pronto per Vercel dedicato agli Orridi di Uriezzo e alle Marmitte dei Giganti di Maiesso.

## Funzioni principali

- Next.js App Router, TypeScript e `next-intl`.
- Italiano, inglese, spagnolo e tedesco.
- Guida editoriale in 10 capitoli per ogni attrazione e ogni lingua.
- Circa 3.500–5.000 parole per attrazione, a seconda della lingua.
- Audioguida ElevenLabs separata per capitolo.
- Cache permanente degli MP3 su Vercel Blob, indicizzata tramite hash del testo, lingua, voce e modello.
- Rotazione automatica delle fotografie ogni 14 giorni tramite Wikimedia Commons.
- Selezione senza duplicati tra hero, card, galleria e punti della mappa.
- Attribuzione autore, licenza e collegamento alla pagina originale di ogni fotografia.
- Sezione News aggiornata ogni domenica da feed locali e Google News.
- Archivio delle ultime 52 settimane con menu a tendina.
- Titolo, fonte, data, immagine, riassunto originale e collegamento all'articolo completo.
- Mappe Google incorporate, punti di interesse e ricerche aggiornate per ristoranti, parcheggi e aree camper.
- Assistente Gemini limitato server-side alle domande inerenti agli Orridi e alle Marmitte.
- QR di condivisione in homepage, dark mode, pulsante torna-su e interfaccia ottimizzata per smartphone.
- Footer `Developer by Gabriele`.

## Automazioni

Il file `vercel.json` registra il cron:

```text
0 6 * * 0
```

La route `/api/cron/refresh` viene richiamata la domenica alle 06:00 UTC. Ogni esecuzione:

1. legge i feed delle testate locali e la ricerca Google News;
2. elimina duplicati e notizie fuori tema;
3. crea riassunti e traduzioni nelle quattro lingue tramite Gemini, senza copiare integralmente gli articoli;
4. salva o sostituisce la settimana corrente e conserva fino a 52 settimane;
5. controlla l'età dell'archivio fotografico;
6. se sono trascorsi almeno 13 giorni, cerca nuove fotografie su Wikimedia Commons;
7. esclude immagini già utilizzate nella composizione corrente e, quando possibile, quelle mostrate nelle rotazioni recenti;
8. salva news e selezione fotografica in Vercel Blob;
9. invalida le pagine localizzate affinché mostrino subito i nuovi contenuti.

Il processo è idempotente: più esecuzioni nella stessa settimana sostituiscono lo stesso archivio settimanale invece di duplicarlo.

## Cache audioguide

Il client invia solo:

```json
{"locale":"it","slug":"orridi-uriezzo","chapterId":"glaciazione"}
```

Il server recupera il testo dai file della guida e calcola un hash di:

```text
voce + modello + lingua + attrazione + capitolo + testo
```

- Se l'MP3 esiste su Vercel Blob, la route risponde con un redirect al file CDN.
- Se non esiste, chiama ElevenLabs una sola volta, salva l'MP3 su Blob e lo restituisce.
- Quando il testo o la voce cambiano, cambia l'hash e viene generata soltanto la nuova versione di quel capitolo.
- Senza Blob, resta disponibile una cache temporanea `/tmp`, non condivisa tra tutte le istanze serverless.

## Installazione locale

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Aprire `http://localhost:3000`.

## Variabili d'ambiente

```env
GEMINI_API_KEY=chiave_gemini
GEMINI_MODEL=gemini-2.5-flash

ELEVENLABS_API_KEY=chiave_elevenlabs
ELEVENLABS_VOICE_ID=JBFqnCBsd6RMkjVDRZzb
ELEVENLABS_MODEL_ID=eleven_multilingual_v2

NEXT_PUBLIC_SITE_URL=https://orridiuriezzo.vercel.app
NEXT_PUBLIC_SHARE_URL=https://orridiuriezzo.vercel.app/it

CRON_SECRET=stringa_casuale_di_almeno_16_caratteri
```

Le credenziali Blob non devono essere scritte manualmente nel repository. Collegando un Blob store al progetto, Vercel aggiunge `BLOB_STORE_ID` e fornisce automaticamente `VERCEL_OIDC_TOKEN` ai deployment.

Le chiavi Gemini ed ElevenLabs non devono avere il prefisso `NEXT_PUBLIC_` e non devono essere pubblicate su GitHub.

## Configurazione Vercel richiesta una sola volta

Vedi [AUTOMATION_SETUP.md](./AUTOMATION_SETUP.md).

In sintesi:

1. creare un Blob store pubblico;
2. collegarlo al progetto e agli ambienti Production/Preview;
3. aggiungere le variabili API e `CRON_SECRET`;
4. eseguire un nuovo deployment.

Dopo questa configurazione, fotografie, news e cache audio funzionano automaticamente.

## Origine fotografie

La ricerca automatica usa la MediaWiki API di Wikimedia Commons, richiedendo:

- file nel namespace immagini;
- URL in dimensione ottimizzata;
- dimensioni e MIME type;
- metadati estesi per autore e licenza.

Il sito non copia fotografie da Google Immagini o Google Maps. Quelle piattaforme vengono usate solo come collegamenti esterni, mentre le immagini visualizzate automaticamente provengono da un archivio con pagine di attribuzione consultabili.

## News e copyright

La sezione non ripubblica articoli completi. Conserva soltanto metadati, una miniatura disponibile nei metadati editoriali, un riassunto originale e il link alla fonte. Il testo completo resta sul sito dell'editore.

## File principali

```text
app/api/cron/refresh/route.ts   aggiornamento automatico
app/api/tts/route.ts            generazione e cache audio
app/[locale]/news/page.tsx      archivio news
components/news-archive.tsx     selettore settimane
components/audio-guide.tsx      player per capitoli
lib/commons-images.ts           ricerca e rotazione fotografie
lib/news.ts                     feed, deduplica e archivio
lib/blob-storage.ts             accesso Vercel Blob
lib/guides.ts                   caricamento guide
lib/visuals.ts                  immagini dinamiche con fallback
data/guides/*.json              capitoli nelle quattro lingue
vercel.json                     pianificazione settimanale
```

## Verifiche

```bash
npm run lint
npm run build
npm audit
```

Non pubblicare `.env`, `.env.local`, `.next` o `node_modules`.

## Esperienza di visita e lettura

Le pagine delle attrazioni includono ora:

- navigatore sticky della guida con avanzamento e tempo stimato;
- salvataggio locale dell'ultimo capitolo letto;
- mappe filtrabili per accessi, attrazioni, punti panoramici e servizi;
- ripresa della posizione audio per ogni capitolo;
- download MP3 e riproduzione continua opzionale;
- dati strutturati SEO per attrazioni turistiche e breadcrumb.

Durante la rotazione automatica, le immagini selezionate da Wikimedia Commons vengono copiate nel Blob store collegato. Il sito usa quindi l'URL Blob stabile, mentre autore, licenza e pagina sorgente restano associati alla fotografia.
