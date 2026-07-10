# Orridi di Uriezzo & Marmitte dei Giganti

Sito turistico multilingua, mobile-first e pronto per Vercel dedicato agli Orridi di Uriezzo e alle Marmitte dei Giganti di Maiesso, in Valle Antigorio.

## Funzionalità

- Next.js App Router con TypeScript.
- Lingue: italiano, inglese, spagnolo e tedesco.
- Percorsi localizzati `/it`, `/en`, `/es`, `/de`.
- Pagine complete per Orridi di Uriezzo e Marmitte dei Giganti.
- Testi estesi su storia glaciale, geologia, accessi, ambiente e sicurezza.
- Fotografie reali del luogo con collegamento alla pagina di attribuzione Wikimedia Commons.
- Collegamenti Google Maps per posizione, fotografie recenti, ristoranti, pizzerie, parcheggi e aree camper.
- Pulsante Condividi in homepage con il QR code fornito per la versione italiana.
- Tema chiaro/scuro con preferenza salvata nel browser.
- Assistente Gemini limitato server-side alle sole domande inerenti alle due attrazioni.
- Audioguida ElevenLabs con chiave custodita lato server.
- Pulsante mobile per tornare in cima.
- Service worker con fallback offline e cache del QR code.
- Footer con `Developer by Gabriele`.

## Installazione locale

```bash
npm ci
npm run dev
```

Aprire `http://localhost:3000`: l’app reindirizza automaticamente alla versione italiana.

## Variabili d’ambiente

Copiare `.env.example` in `.env.local` e inserire chiavi nuove:

```env
GEMINI_API_KEY=chiave_gemini
GEMINI_MODEL=gemini-2.5-flash
ELEVENLABS_API_KEY=chiave_elevenlabs
ELEVENLABS_VOICE_ID=JBFqnCBsd6RMkjVDRZzb
NEXT_PUBLIC_SITE_URL=https://orridiuriezzo.vercel.app
NEXT_PUBLIC_SHARE_URL=https://orridiuriezzo.vercel.app/it
```

Le chiavi Gemini ed ElevenLabs non devono mai essere inserite in file pubblicati su GitHub e non devono avere il prefisso `NEXT_PUBLIC_`.

`NEXT_PUBLIC_SITE_URL` viene normalizzata automaticamente al solo dominio. Anche inserendo accidentalmente `/it`, sitemap e metadati non generano URL duplicati. `NEXT_PUBLIC_SHARE_URL` controlla invece il link mostrato nel popup di condivisione.

## Deploy su Vercel

1. Collegare il repository GitHub a Vercel.
2. Configurare le variabili d’ambiente indicate sopra in **Project → Settings → Environment Variables**.
3. Lasciare il framework su **Next.js**.
4. Usare come install command:

```bash
npm ci --no-audit --no-fund
```

5. Usare come build command:

```bash
npm run build
```

6. Avviare un nuovo deploy dal commit più recente di `main`.

## QR code e condivisione

Il QR code è in `public/qrcode.png`. Non esiste più una pagina QR dedicata e il QR non compare nel menu. In homepage il pulsante **Condividi** apre una finestra con:

- QR code scansionabile;
- condivisione nativa del telefono quando supportata;
- copia del link negli appunti.

Per sostituire il codice è sufficiente rimpiazzare `public/qrcode.png` mantenendo lo stesso nome e formato.

## Fotografie

Gli URL delle fotografie si trovano in `data/attractions.ts`. Le immagini visualizzate provengono da Wikimedia Commons e ogni didascalia contiene il link alla pagina di attribuzione e licenza. Ogni galleria include inoltre un pulsante verso la ricerca fotografica dell’attrazione su Google Maps.

Le fotografie caricate dagli utenti su Google Maps non vengono copiate o ripubblicate nel sito: questo evita hotlink non stabile e problemi di licenza. Il sito rimanda direttamente a Google Maps per visualizzarle nella loro fonte originale.

## Ristoranti e aree camper

I collegamenti sono definiti in `data/nearby-places.json` e vengono aperti come ricerche Google Maps. In questo modo orari, recensioni, aperture stagionali, disponibilità e indicazioni rimangono consultabili nella fonte aggiornata.

La sezione comprende:

- Trattoria della Campagna a Verampio;
- ricerche di ristoranti e pizzerie a Baceno, Premia e Crodo;
- ricerche di aree camper e parcheggi a Baceno, Premia, Crodo e Verampio.

## Assistente Gemini

La route `app/api/chat/route.ts`:

- accetta solo quattro lingue supportate;
- applica una verifica preventiva dell’argomento;
- rifiuta le domande fuori tema prima di chiamare Gemini;
- invia a Gemini un’istruzione di sistema non modificabile dal client;
- limita lunghezza, cronologia, frequenza e durata delle richieste;
- non espone la chiave API al browser.

L’assistente può parlare soltanto di Orridi, Marmitte, geologia, storia, percorsi, sicurezza e servizi utili alla visita.

## Audioguida ElevenLabs

La route `app/api/tts/route.ts` accetta soltanto attrazioni e lingue predefinite, genera audio tramite ElevenLabs e utilizza una cache temporanea in `/tmp`. La cache è best-effort: nelle funzioni serverless può non essere condivisa tra tutte le istanze.

## Aggiornare i contenuti

- Traduzioni e testi: `messages/it.json`, `en.json`, `es.json`, `de.json`.
- Fotografie e collegamenti alle mappe: `data/attractions.ts`.
- Ristoranti, pizzerie e aree camper: `data/nearby-places.json`.
- Stile mobile e dark mode: `app/globals.css`.
- Prompt e protezioni Gemini: `app/api/chat/route.ts`.

## Controlli

```bash
npm run lint
npm run build
```

Non pubblicare mai `.env`, `.env.local`, `.next` o `node_modules`.
