# Configurazione Vercel

La guida completa è in `AUTOMATION_SETUP.md`.

## Variabili manuali

Aggiungere in **Project → Settings → Environment Variables**:

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

Applicare almeno a **Production** e **Preview**, quindi creare un nuovo deployment.

## Variabili Blob automatiche

Creare un Blob store pubblico e collegarlo al progetto. Vercel aggiunge automaticamente:

```text
BLOB_STORE_ID
VERCEL_OIDC_TOKEN
```

Non inserire questi valori nel repository. Il token OIDC viene ruotato da Vercel.

## Diagnostica

- `Audio service is not configured`: manca `ELEVENLABS_API_KEY` nel deployment attivo.
- `The audio guide is temporarily unavailable`: controllare i Runtime Logs per lo stato restituito da ElevenLabs.
- `L’assistente AI non è ancora configurato`: manca `GEMINI_API_KEY`.
- News vuote dopo la domenica: controllare il log di `/api/cron/refresh`, `CRON_SECRET` e il collegamento Blob.
- Audio rigenerato a ogni visita: il Blob store non è collegato o non è accessibile dall'ambiente del deployment.
