# Modifiche versione automatizzata

- Aggiunta guida completa in 10 capitoli per ogni attrazione e lingua.
- Estesi i contenuti a circa 3.500–5.000 parole per attrazione.
- Trasformata l'audioguida in un player per capitoli.
- Aggiunta cache permanente ElevenLabs su Vercel Blob con versionamento tramite hash.
- Aggiunta ricerca automatica di fotografie tramite Wikimedia Commons API.
- Rotazione fotografica ogni 14 giorni con attribuzione e controllo anti-duplicato globale.
- Aggiunta sezione News in quattro lingue.
- Aggiunto archivio settimanale fino a 52 settimane con selettore.
- Aggiunti feed locali, Google News, deduplica, data, fonte, immagine e link originale.
- Aggiunti riassunti e traduzioni Gemini senza ripubblicare integralmente gli articoli.
- Aggiunta route cron protetta con `CRON_SECRET`.
- Aggiunta pianificazione domenicale in `vercel.json`.
- Aggiunta invalidazione automatica delle pagine dopo ogni aggiornamento.
- Aggiunte dipendenze `@vercel/blob` e `fast-xml-parser`.
- Conservati mobile layout, mappe, dark mode, QR, chat e footer Developer by Gabriele.

## Migliorie esperienza visita e lettura

- Aggiunto pianificatore interattivo con tempo disponibile, tipologia di gruppo, accesso e itinerario desiderato.
- Aggiunte scorciatoie operative in homepage per pianificazione, mappe e audioguida.
- Sostituito l'indice statico delle guide con un navigatore sticky dotato di avanzamento, tempo stimato e ripresa della lettura salvata nel browser.
- Trasformate le mappe delle attrazioni in esploratori filtrabili per attrazioni, accessi e punti panoramici.
- Unificate mappe e schede di ristoranti, parcheggi e aree camper in un esploratore filtrabile.
- Le fotografie selezionate automaticamente da Wikimedia Commons vengono ora copiate su Vercel Blob al primo aggiornamento, mantenendo autore, licenza e pagina sorgente.
- Aggiunta la data dell'ultima rotazione automatica delle fotografie.
- L'audioguida salva la posizione per capitolo, permette il download MP3 e può riprodurre automaticamente il capitolo successivo.
- Aggiunti dati strutturati `TouristAttraction` e `BreadcrumbList` alle pagine dei due luoghi.
- Tutte le nuove interfacce sono tradotte in italiano, inglese, spagnolo e tedesco.
