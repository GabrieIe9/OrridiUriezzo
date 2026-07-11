# Configurazione automazioni Vercel

## 1. Collegare Vercel Blob

Aprire il progetto su Vercel e collegare un Blob store pubblico agli ambienti Production e Preview.

Lo storage viene utilizzato per:

```text
orridi/media/...     fotografie selezionate da Wikimedia Commons
orridi/news/...      archivio settimanale delle notizie
```

L'audioguida non usa Blob: la lettura avviene direttamente nel browser.

## 2. Variabili d'ambiente

```env
GEMINI_API_KEY=chiave_gemini
GEMINI_MODEL=gemini-2.5-flash
NEXT_PUBLIC_SITE_URL=https://orridiuriezzo.vercel.app
NEXT_PUBLIC_SHARE_URL=https://orridiuriezzo.vercel.app/it
CRON_SECRET=una_stringa_casuale_lunga_almeno_16_caratteri
```

Non servono variabili ElevenLabs.

## 3. Cron settimanale

`vercel.json` richiama `/api/cron/refresh` ogni domenica alle 06:00 UTC.

La route:

- aggiorna le news;
- mantiene fino a 52 settimane;
- aggiorna le fotografie quando necessario;
- evita duplicati;
- revalida le pagine.

## 4. Deploy

Dopo aver collegato Blob e salvato le variabili, creare un nuovo deployment. Le modifiche alle variabili non si applicano ai deployment già esistenti.
