# Variabili Vercel

Configurare in **Project → Settings → Environment Variables**:

```env
GEMINI_API_KEY=chiave_gemini
GEMINI_MODEL=gemini-2.5-flash
NEXT_PUBLIC_SITE_URL=https://orridiuriezzo.vercel.app
NEXT_PUBLIC_SHARE_URL=https://orridiuriezzo.vercel.app/it
CRON_SECRET=una_stringa_casuale_lunga_almeno_16_caratteri
```

Collegare inoltre un Blob store per fotografie e news.

L'audioguida usa la voce interna del browser e non richiede chiavi API, route server o configurazione Vercel.
