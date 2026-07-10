# Configurazione API su Vercel

Le chiavi API non sono incluse nel repository e non devono essere inserite in file pubblici.

## Variabili richieste

Aprire il progetto su Vercel e andare in:

**Settings → Environment Variables**

Aggiungere:

```env
GEMINI_API_KEY=incolla_la_chiave_gemini
GEMINI_MODEL=gemini-2.5-flash
ELEVENLABS_API_KEY=incolla_la_chiave_elevenlabs
ELEVENLABS_VOICE_ID=JBFqnCBsd6RMkjVDRZzb
NEXT_PUBLIC_SITE_URL=https://orridiuriezzo.vercel.app
NEXT_PUBLIC_SHARE_URL=https://orridiuriezzo.vercel.app/it
```

Applicare le variabili almeno agli ambienti **Production** e **Preview**. Se si usa `vercel dev`, applicarle anche a **Development**.

Dopo il salvataggio eseguire un nuovo deployment dal commit più recente. Le variabili aggiunte dopo una build non vengono applicate retroattivamente ai deployment già conclusi.

## Controllo rapido

- Se la chat mostra “L’assistente AI non è ancora configurato”, manca `GEMINI_API_KEY` nel deployment in esecuzione.
- Se l’audioguida mostra “Audio service is not configured”, manca `ELEVENLABS_API_KEY` nel deployment in esecuzione.
- Le chiavi non devono avere il prefisso `NEXT_PUBLIC_`.
