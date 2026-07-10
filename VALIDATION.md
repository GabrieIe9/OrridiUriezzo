# Validation report

Validated on the complete project after the mobile, Gemini chat and theme updates.

## Automated checks

- `npm run lint`: passed.
- `npm run build`: passed.
- TypeScript production type-check: passed.
- Static generation: 22 pages generated.
- Dynamic routes detected: `/api/chat` and `/api/tts`.
- `package-lock.json`: public npm registry only.

## Implemented checks

- Gemini key is read only from `GEMINI_API_KEY` server-side.
- Out-of-scope questions are rejected before calling Gemini.
- Gemini receives a fixed system instruction limiting answers to the two attractions.
- Chat input length, conversation history, request timeout and rate limit are bounded.
- Theme preference is stored in `localStorage` and initialized before page paint.
- Floating controls include accessible labels and mobile safe-area positioning.
- Service-worker cache version incremented to `ossola-guide-v2`.

## Not executed

- A live Gemini request was not executed because no `GEMINI_API_KEY` was available in the validation environment.
- A live ElevenLabs request was not executed because no `ELEVENLABS_API_KEY` was available.
