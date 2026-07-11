# Modifiche

## Audioguida browser

- Rimossa completamente l'integrazione ElevenLabs.
- Eliminata la route `app/api/tts/route.ts`.
- Rimosse tutte le variabili `ELEVENLABS_*`.
- Sostituita la generazione MP3 con la Web Speech API del browser.
- Aggiunta selezione automatica della voce nella lingua della pagina.
- Aggiunta scelta manuale della voce quando il dispositivo offre più opzioni.
- Mantenuti pausa, ripresa, stop, velocità, navigazione capitoli e riproduzione continua.
- Aggiunta suddivisione dei testi lunghi in blocchi per migliorare la stabilità.
- Mantenuto il salvataggio locale della posizione di ascolto.
- Aggiornate tutte le traduzioni e la documentazione.
