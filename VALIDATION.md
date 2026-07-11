# Validazione

## Comandi eseguiti

```text
npm ci: superato
npm run lint: superato
npm run build: superato
TypeScript: superato
21 pagine generate
```

## Route dinamiche

```text
/api/chat
/api/cron/refresh
```

La route `/api/tts` non è presente: l'audioguida usa la voce del browser.

## Percorso AIDA

- **Attention:** hero con proposta di valore, immagini distinte e CTA immediate.
- **Interest:** benefici concreti della guida presentati in tre schede.
- **Desire:** confronto visivo tra Orridi e Marmitte e collegamento della stessa escursione.
- **Action:** CTA finale, condivisione e azioni ripetute nelle pagine delle attrazioni.
- testi AIDA presenti in italiano, inglese, spagnolo e tedesco;
- nessuna prova sociale fittizia o affermazione non verificabile;
- layout responsive con CTA a larghezza piena su smartphone;
- contrasto e dark mode coperti dai nuovi stili.

## Audioguida

- usa `speechSynthesis` e `SpeechSynthesisUtterance` nel browser;
- non usa ElevenLabs;
- non genera o scarica MP3;
- supporta capitoli, pausa, ripresa, stop, velocità, voce e avanzamento automatico;
- salva localmente la posizione raggiunta;
- mostra un messaggio dedicato nei browser senza sintesi vocale.

## Sicurezza

- nessuna chiave ElevenLabs richiesta o inclusa;
- Gemini resta esclusivamente server-side;
- `.env`, `.env.local`, `.next` e `node_modules` sono esclusi dal progetto distribuibile.
