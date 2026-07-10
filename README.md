# Orridi di Uriezzo & Marmitte dei Giganti

Sito turistico multilingua e mobile-first per la Valle Antigorio, costruito con Next.js App Router, TypeScript, `next-intl`, Tailwind CSS, ElevenLabs Text-to-Speech e un assistente visitatori basato su Gemini.

## Funzionalità

- Routing localizzato: `/it`, `/en`, `/es`, `/de`.
- Homepage con selezione tra Orridi di Uriezzo e Marmitte dei Giganti.
- Pagine editoriali complete in quattro lingue.
- Selettore lingua che conserva la pagina corrente.
- Galleria ottimizzata con `next/image`.
- Audioguida ElevenLabs con chiave esclusivamente server-side.
- Cache TTS best-effort in `/tmp` e cache HTTP/CDN.
- Elenco ristoranti gestito da `data/restaurants.json` con modale accessibile.
- Pagina QR code con esportazione PNG ad alta risoluzione e SVG vettoriale.
- Service worker leggero per cache progressiva delle pagine già visitate.
- Sitemap, robots, manifest PWA, metadata SEO e layout mobile-first.
- Modalità chiara/scura con preferenza persistente e rispetto del tema di sistema.
- Pulsante mobile per tornare in cima.
- Assistente Gemini limitato alle sole domande sugli Orridi di Uriezzo e sulle Marmitte dei Giganti.

## Requisiti

- Node.js 20.9 o successivo.
- Account ElevenLabs e relativa API key per l’audioguida.
- Chiave Gemini API creata in Google AI Studio per l’assistente visitatori.
- Account Vercel per il deploy.

## Installazione locale

```bash
npm install
cp .env.example .env.local
npm run dev
```

Aprire `http://localhost:3000`. La root reindirizza automaticamente a `/it`.

## Variabili d’ambiente

```env
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=JBFqnCBsd6RMkjVDRZzb
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
```

`ELEVENLABS_API_KEY` è obbligatoria per il TTS e non deve mai essere esposta con il prefisso `NEXT_PUBLIC_`.

`ELEVENLABS_VOICE_ID` è opzionale. In sua assenza viene usato l’ID voce presente nell’esempio ufficiale ElevenLabs. Prima del lancio è consigliabile scegliere e testare una voce adatta alle quattro lingue.

`GEMINI_API_KEY` è obbligatoria per la chat AI e deve restare server-side. `GEMINI_MODEL` è opzionale e usa `gemini-2.5-flash` come valore predefinito.

`NEXT_PUBLIC_SITE_URL` alimenta URL canonici, sitemap e QR code. Impostarlo sull’indirizzo di produzione definitivo.

## Audioguida e sicurezza

Il client invia soltanto `locale` e `slug` a `/api/tts`. Il server ricava il testo dai file di traduzione: non viene accettato testo arbitrario, evitando che l’endpoint diventi un proxy pubblico per consumare crediti ElevenLabs.

Sono presenti:

- allowlist delle quattro lingue e delle due guide;
- rate limit best-effort per IP;
- timeout della chiamata esterna;
- streaming della risposta MP3;
- cache temporanea in `/tmp` basata su hash di voce, lingua, pagina e testo;
- cache HTTP condivisa tramite `s-maxage`.

La directory `/tmp` di Vercel è effimera e può essere riutilizzata solo dalla stessa istanza. Per una cache persistente tra istanze, sostituire il blocco filesystem in `app/api/tts/route.ts` con Vercel Blob, S3 o un altro object storage.


## Assistente Gemini e limitazione dell’argomento

La chat usa `/api/chat` come proxy server-side: la chiave Gemini non raggiunge mai il browser. La route applica due livelli di controllo:

- filtro locale delle domande e del contesto conversazionale;
- istruzione di sistema Gemini che vieta risposte estranee agli Orridi di Uriezzo e alle Marmitte dei Giganti.

Sono inoltre presenti limite di lunghezza, cronologia ridotta, rate limit best-effort per IP, timeout e risposta senza cache. Le richieste fuori tema vengono respinte senza consumare una chiamata Gemini.

L’assistente non deve essere considerato una fonte per condizioni in tempo reale, chiusure, meteo o sicurezza del sentiero. Per questi dati rimanda sempre a fonti turistiche e autorità locali.

## Deploy su Vercel

### Da dashboard

1. Pubblicare il progetto su GitHub, GitLab o Bitbucket.
2. Importare il repository in Vercel.
3. Aggiungere `ELEVENLABS_API_KEY`, `GEMINI_API_KEY` e `NEXT_PUBLIC_SITE_URL` nelle Environment Variables.
4. Facoltativamente aggiungere `ELEVENLABS_VOICE_ID` e `GEMINI_MODEL`.
5. Avviare il deploy. Vercel rileva Next.js senza configurazione aggiuntiva.

### Da CLI

```bash
npm i -g vercel
vercel
vercel env add ELEVENLABS_API_KEY
vercel env add GEMINI_API_KEY
vercel env add NEXT_PUBLIC_SITE_URL
vercel --prod
```

Dopo il primo deploy di produzione, aggiornare `NEXT_PUBLIC_SITE_URL` con il dominio definitivo e ridistribuire il progetto, così metadata, sitemap e QR code useranno l’URL corretto.

## Sostituire le immagini placeholder

Le immagini correnti provengono da Unsplash e sono centralizzate in:

```text
data/attractions.ts
```

Sostituire `hero`, `card` e gli elementi di `gallery` con URL autorizzati oppure file locali in `public/images`.

Per file locali:

```ts
hero: '/images/orridi/hero.jpg'
```

Rimuovere `images.unsplash.com` da `next.config.ts` quando non è più necessario. Aggiornare sempre gli alt text nei file `messages/*.json`.

## Aggiornare ristoranti e locali

I dati sono in:

```text
data/restaurants.json
```

Le voci incluse sono esclusivamente dimostrative e contrassegnate con `isPlaceholder: true`. Prima della pubblicazione verificare:

- nome ufficiale;
- indirizzo;
- distanze reali;
- orari e giorni di chiusura;
- numero di telefono;
- URL Google Maps;
- consenso o correttezza della presenza nel sito.

Dopo la verifica è possibile impostare `isPlaceholder` a `false` e rimuovere il testo dimostrativo dal nome. Il componente che legge il file è `components/restaurant-grid.tsx`.

## Traduzioni

Tutti i testi sono separati per lingua:

```text
messages/it.json
messages/en.json
messages/es.json
messages/de.json
```

Le proprietà `orridi.narration` e `marmitte.narration` vengono usate dal TTS. Quando si modifica il testo della pagina, aggiornare anche la narrazione. L’hash della cache cambia automaticamente.

## QR code

La pagina è disponibile in ogni lingua, ad esempio:

```text
/it/qrcode
```

Il campo URL è modificabile nel browser. L’esportazione PNG usa una base da 1024 × 1024 pixel; l’SVG è vettoriale ed è preferibile per la stampa su pannelli.

Prima della stampa:

1. usare il dominio di produzione definitivo;
2. mantenere un margine bianco libero attorno al codice;
3. evitare superfici riflettenti o deformazioni;
4. testare la scansione su dispositivi diversi e da più distanze.

## Offline e connessioni lente

Il service worker in `public/sw.js` salva progressivamente pagine e asset visitati. L’audioguida non viene inserita nella cache offline del service worker perché può essere pesante e dipende da ElevenLabs. Aggiornare `CACHE_NAME` quando si desidera forzare l’invalidazione della cache client.

## Struttura principale

```text
app/
├── [locale]/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── orridi-uriezzo/page.tsx
│   ├── marmitte-dei-giganti/page.tsx
│   └── qrcode/page.tsx
├── api/
│   ├── chat/route.ts
│   └── tts/route.ts
├── globals.css
├── layout.tsx
├── robots.ts
└── sitemap.ts
components/
├── attraction-page.tsx
├── audio-guide.tsx
├── fade-in.tsx
├── floating-tools.tsx
├── footer.tsx
├── header.tsx
├── language-switcher.tsx
├── qr-code-panel.tsx
├── restaurant-grid.tsx
└── service-worker-register.tsx
data/
├── attractions.ts
└── restaurants.json
i18n/
├── navigation.ts
├── request.ts
└── routing.ts
messages/
├── de.json
├── en.json
├── es.json
└── it.json
public/
├── icon.svg
├── manifest.webmanifest
├── offline.html
└── sw.js
proxy.ts
```

## Controlli prima della pubblicazione

- Sostituire tutte le immagini placeholder.
- Verificare sul posto accessi, tempi, chiusure e condizioni di sicurezza.
- Verificare e approvare i dati dei ristoranti.
- Testare la voce ElevenLabs in tutte le lingue.
- Testare contrasto, navigazione da tastiera e lettori di schermo.
- Testare QR code e prestazioni su rete mobile lenta.
- Far revisionare i contenuti turistici da un referente locale.
