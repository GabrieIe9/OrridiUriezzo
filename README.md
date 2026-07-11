# Orridi di Uriezzo & Marmitte dei Giganti

Sito turistico multilingua, mobile-first e pronto per Vercel dedicato agli Orridi di Uriezzo e alle Marmitte dei Giganti di Maiesso.

## Funzioni principali

- Next.js App Router, TypeScript e `next-intl`.
- Italiano, inglese, spagnolo e tedesco.
- Guide editoriali in 10 capitoli per ogni attrazione e lingua.
- Audioguida per capitoli basata sulla Web Speech API del browser.
- Nessun servizio TTS esterno, nessuna chiave audio e nessun file MP3 generato.
- Pausa, ripresa, stop, salto stimato di 15 secondi, velocità, scelta della voce e capitolo successivo automatico.
- Salvataggio locale della posizione di ascolto per ogni capitolo.
- Rotazione automatica delle fotografie tramite Wikimedia Commons.
- Copia delle fotografie selezionate su Vercel Blob con autore, licenza e fonte.
- Sezione News aggiornata settimanalmente e archivio di 52 settimane.
- Mappe, punti di interesse, ristoranti, parcheggi e aree camper.
- Assistente Gemini limitato alle domande sugli Orridi e sulle Marmitte.
- QR di condivisione, dark mode, pulsante torna-su e layout mobile.
- Footer `Developer by Gabriele`.

## Audioguida del browser

`components/audio-guide.tsx` usa `window.speechSynthesis` e `SpeechSynthesisUtterance`.

Il testo viene letto direttamente dalla voce installata sul telefono o computer. Il player:

- seleziona automaticamente una voce compatibile con la lingua della pagina;
- permette di scegliere un'altra voce quando il dispositivo ne offre più di una;
- suddivide i capitoli lunghi in blocchi per una riproduzione più stabile;
- salva nel browser la posizione raggiunta;
- non invia il testo a ElevenLabs o ad altri servizi audio.

La voce e la qualità dipendono dal browser, dal sistema operativo e dai pacchetti lingua installati sul dispositivo.

## Automazioni

Il cron definito in `vercel.json` aggiorna ogni domenica:

1. notizie locali e archivio settimanale;
2. fotografie Wikimedia Commons quando è trascorso l'intervallo previsto;
3. contenuti salvati nel Blob store;
4. pagine localizzate tramite revalidazione.

Vercel Blob serve soltanto per fotografie e archivio news, non per l'audioguida.

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

NEXT_PUBLIC_SITE_URL=https://orridiuriezzo.vercel.app
NEXT_PUBLIC_SHARE_URL=https://orridiuriezzo.vercel.app/it

CRON_SECRET=stringa_casuale_di_almeno_16_caratteri
```

Collegando un Blob store a Vercel vengono fornite automaticamente le credenziali necessarie allo storage.

Non servono più variabili `ELEVENLABS_*`.

## File principali

```text
app/api/chat/route.ts             assistente Gemini
app/api/cron/refresh/route.ts     aggiornamento news e fotografie
components/audio-guide.tsx        lettura vocale del browser
components/news-archive.tsx       archivio settimanale
lib/commons-images.ts             ricerca fotografie
lib/news.ts                       feed, deduplica e archivio
data/guides/*.json                capitoli nelle quattro lingue
vercel.json                       pianificazione settimanale
```

## Verifiche

```bash
npm run lint
npm run build
npm audit
```

Non pubblicare `.env`, `.env.local`, `.next` o `node_modules`.

## Struttura AIDA dell'esperienza

La homepage e le pagine delle attrazioni seguono una sequenza AIDA verificabile:

1. **Attention:** proposta di valore e immagini del luogo.
2. **Interest:** benefici pratici della guida, delle mappe e dell'audioguida.
3. **Desire:** scelta visuale tra le due attrazioni e valorizzazione dell'itinerario collegato.
4. **Action:** pulsanti per aprire guida, audio, mappa, notizie e condivisione.

Il progetto non utilizza recensioni inventate, contatori falsi, scarsità artificiale o promesse non documentate.
