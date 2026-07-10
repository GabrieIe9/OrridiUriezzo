# Attivazione automazioni su Vercel

Questa configurazione va eseguita una sola volta. Il codice dell'automazione è già incluso nel progetto.

## 1. Collegare Vercel Blob

Nel pannello Vercel:

1. aprire **Storage**;
2. creare un nuovo **Blob store** con accesso pubblico;
3. aprire la scheda **Projects** del Blob store;
4. scegliere **Connect to Project**;
5. selezionare il progetto `OrridiUriezzo`;
6. collegare almeno **Production** e **Preview**;
7. eseguire un nuovo deployment.

Vercel crea `BLOB_STORE_ID` e fornisce un `VERCEL_OIDC_TOKEN` temporaneo e ruotato automaticamente. Non copiare questi valori nei file del repository.

Il Blob store conserva:

```text
orridi/audio/...             MP3 ElevenLabs per capitolo
orridi/media/visuals.json    selezione fotografica e cronologia
orridi/news/archive.json     archivio delle 52 settimane
```

## 2. Variabili d'ambiente

Aprire **Project → Settings → Environment Variables** e aggiungere:

```env
GEMINI_API_KEY=chiave_gemini
GEMINI_MODEL=gemini-2.5-flash

ELEVENLABS_API_KEY=chiave_elevenlabs
ELEVENLABS_VOICE_ID=JBFqnCBsd6RMkjVDRZzb
ELEVENLABS_MODEL_ID=eleven_multilingual_v2

NEXT_PUBLIC_SITE_URL=https://orridiuriezzo.vercel.app
NEXT_PUBLIC_SHARE_URL=https://orridiuriezzo.vercel.app/it

CRON_SECRET=usa_una_stringa_casuale_lunga_almeno_16_caratteri
```

Applicare le variabili a **Production** e **Preview**. Dopo ogni modifica alle variabili creare un nuovo deployment.

## 3. Cron settimanale

`vercel.json` configura:

```json
{
  "crons": [
    {
      "path": "/api/cron/refresh",
      "schedule": "0 6 * * 0"
    }
  ]
}
```

L'esecuzione avviene ogni domenica alle 06:00 UTC. Quando `CRON_SECRET` è configurato, Vercel lo invia automaticamente come header:

```text
Authorization: Bearer <CRON_SECRET>
```

La route rifiuta richieste non autorizzate.

## 4. Primo popolamento

Dopo il deployment, il cron popolerà automaticamente gli archivi alla prima esecuzione domenicale.

Per anticipare il primo aggiornamento senza attendere, è possibile eseguire una richiesta autenticata da un terminale che disponga del segreto:

```bash
curl -H "Authorization: Bearer IL_TUO_CRON_SECRET" \
  https://orridiuriezzo.vercel.app/api/cron/refresh
```

Non incollare `CRON_SECRET` in pagine pubbliche, issue o commit.

## 5. Controlli

Nel pannello Vercel:

- **Settings → Cron Jobs**: verifica che `/api/cron/refresh` sia attivo;
- **Logs**: filtra `requestPath:/api/cron/refresh`;
- **Storage → Blob**: verifica la presenza delle cartelle `orridi/audio`, `orridi/media` e `orridi/news`.

La prima riproduzione di ciascun capitolo può richiedere la generazione ElevenLabs. Le riproduzioni successive utilizzano il file già presente su Blob.
