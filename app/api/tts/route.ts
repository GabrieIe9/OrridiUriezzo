import {createHash} from 'node:crypto';
import {mkdir, readFile, stat, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {findPublicBlob, hasBlobStorage, writePublicBlob} from '@/lib/blob-storage';
import {getGuide, getGuideChapter, type GuideLocale} from '@/lib/guides';
import type {AttractionSlug} from '@/data/attractions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const DEFAULT_VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb';
const DEFAULT_MODEL_ID = 'eleven_multilingual_v2';
const allowedLocales = new Set<GuideLocale>(['it', 'en', 'es', 'de']);
const allowedSlugs = new Set<AttractionSlug>(['orridi-uriezzo', 'marmitte-dei-giganti']);
const cacheDir = path.join('/tmp', 'ossola-tts-cache');
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 12;
const rateBuckets = new Map<string, {count: number; resetAt: number}>();

type AudioCacheState = 'BLOB' | 'TMP' | 'MISS';
type ElevenFailure = {status: number; detail: string; requestId: string | null};

const errorMessages: Record<GuideLocale, Record<string, string>> = {
  it: {
    missing: 'L’audioguida non è configurata: manca ELEVENLABS_API_KEY nelle variabili Vercel.',
    unauthorized: 'La chiave ElevenLabs non è valida o è stata revocata.',
    forbidden: 'La chiave ElevenLabs non dispone del permesso Text to Speech oppure ha una restrizione non compatibile.',
    voice: 'La voce ElevenLabs configurata non è disponibile per questo account.',
    invalid: 'ElevenLabs ha rifiutato il testo, la voce o il modello configurato.',
    quota: 'I crediti ElevenLabs o il limite di richieste risultano esauriti.',
    timeout: 'La generazione dell’audioguida ha superato il tempo disponibile. Riprova tra poco.',
    generic: 'Il servizio ElevenLabs non è disponibile in questo momento.'
  },
  en: {
    missing: 'The audio guide is not configured: ELEVENLABS_API_KEY is missing from the Vercel environment variables.',
    unauthorized: 'The ElevenLabs API key is invalid or has been revoked.',
    forbidden: 'The ElevenLabs key does not have Text to Speech permission or has an incompatible restriction.',
    voice: 'The configured ElevenLabs voice is not available for this account.',
    invalid: 'ElevenLabs rejected the configured text, voice or model.',
    quota: 'The ElevenLabs credits or request limit have been exhausted.',
    timeout: 'Audio generation exceeded the available time. Please try again shortly.',
    generic: 'The ElevenLabs service is currently unavailable.'
  },
  es: {
    missing: 'La audioguía no está configurada: falta ELEVENLABS_API_KEY en las variables de Vercel.',
    unauthorized: 'La clave de ElevenLabs no es válida o ha sido revocada.',
    forbidden: 'La clave de ElevenLabs no tiene permiso Text to Speech o incluye una restricción incompatible.',
    voice: 'La voz de ElevenLabs configurada no está disponible para esta cuenta.',
    invalid: 'ElevenLabs ha rechazado el texto, la voz o el modelo configurado.',
    quota: 'Se han agotado los créditos o el límite de solicitudes de ElevenLabs.',
    timeout: 'La generación del audio ha superado el tiempo disponible. Inténtalo de nuevo en unos instantes.',
    generic: 'El servicio ElevenLabs no está disponible en este momento.'
  },
  de: {
    missing: 'Der Audioguide ist nicht konfiguriert: ELEVENLABS_API_KEY fehlt in den Vercel-Umgebungsvariablen.',
    unauthorized: 'Der ElevenLabs-API-Schlüssel ist ungültig oder wurde widerrufen.',
    forbidden: 'Der ElevenLabs-Schlüssel besitzt keine Text-to-Speech-Berechtigung oder eine unpassende Einschränkung.',
    voice: 'Die konfigurierte ElevenLabs-Stimme ist für dieses Konto nicht verfügbar.',
    invalid: 'ElevenLabs hat den konfigurierten Text, die Stimme oder das Modell abgelehnt.',
    quota: 'Das ElevenLabs-Guthaben oder das Anfragelimit ist aufgebraucht.',
    timeout: 'Die Audioerzeugung hat die verfügbare Zeit überschritten. Bitte versuche es gleich noch einmal.',
    generic: 'Der ElevenLabs-Dienst ist derzeit nicht verfügbar.'
  }
};

function getClientIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(ip, {count: 1, resetAt: now + RATE_WINDOW_MS});
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_LIMIT;
}

function audioHeaders(cacheStatus: AudioCacheState) {
  return {
    'Content-Type': 'audio/mpeg',
    'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
    'X-TTS-Cache': cacheStatus,
    'X-Content-Type-Options': 'nosniff'
  };
}

function extractElevenDetail(raw: string) {
  if (!raw) return '';
  try {
    const parsed = JSON.parse(raw) as {
      detail?: string | {message?: string; status?: string};
      message?: string;
    };
    if (typeof parsed.detail === 'string') return parsed.detail;
    if (parsed.detail && typeof parsed.detail === 'object') {
      return parsed.detail.message || parsed.detail.status || raw;
    }
    return parsed.message || raw;
  } catch {
    return raw;
  }
}

function localizedFailure(locale: GuideLocale, failure: ElevenFailure) {
  const messages = errorMessages[locale];
  if (failure.status === 401) return messages.unauthorized;
  if (failure.status === 403) return messages.forbidden;
  if (failure.status === 404) return messages.voice;
  if (failure.status === 422) return messages.invalid;
  if (failure.status === 429) return messages.quota;
  return messages.generic;
}

async function createSpeech(
  apiKey: string,
  voiceId: string,
  modelId: string,
  text: string,
  signal: AbortSignal
): Promise<{audio: ArrayBuffer | null; failure: ElevenFailure | null}> {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg'
      },
      // Keep the request intentionally close to the minimal official API example.
      body: JSON.stringify({text, model_id: modelId}),
      signal,
      cache: 'no-store'
    }
  );

  if (!response.ok) {
    const raw = await response.text().catch(() => '');
    return {
      audio: null,
      failure: {
        status: response.status,
        detail: extractElevenDetail(raw).slice(0, 800),
        requestId: response.headers.get('request-id') || response.headers.get('x-request-id')
      }
    };
  }

  const audio = await response.arrayBuffer();
  if (!audio.byteLength) {
    return {
      audio: null,
      failure: {status: 502, detail: 'ElevenLabs returned an empty audio response.', requestId: null}
    };
  }

  return {audio, failure: null};
}

async function readCachedBlob(pathname: string) {
  if (!hasBlobStorage()) return null;
  const cached = await findPublicBlob(pathname);
  if (!cached?.url) return null;

  try {
    const response = await fetch(cached.url, {cache: 'force-cache'});
    if (!response.ok || !response.body) return null;
    return new Response(response.body, {headers: audioHeaders('BLOB')});
  } catch (error) {
    console.error('Unable to read cached TTS Blob', error);
    return null;
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return Response.json({error: 'Too many audio requests. Please try again shortly.'}, {status: 429});
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({error: 'Invalid JSON payload.'}, {status: 400});
  }

  const {locale, slug, chapterId} = (body || {}) as {locale?: string; slug?: string; chapterId?: string};
  if (!locale || !allowedLocales.has(locale as GuideLocale) || !slug || !allowedSlugs.has(slug as AttractionSlug)) {
    return Response.json({error: 'Unsupported language or guide.'}, {status: 400});
  }

  const safeLocale = locale as GuideLocale;
  const safeSlug = slug as AttractionSlug;
  const fallbackChapter = getGuide(safeLocale, safeSlug).chapters[0];
  const chapter = chapterId ? getGuideChapter(safeLocale, safeSlug, chapterId) : fallbackChapter;
  if (!chapter) {
    return Response.json({error: 'Unsupported guide chapter.'}, {status: 400});
  }

  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    return Response.json({error: errorMessages[safeLocale].missing}, {status: 503});
  }

  const text = `${chapter.title}. ${chapter.paragraphs.join('\n\n')}`.trim();
  const configuredVoiceId = process.env.ELEVENLABS_VOICE_ID?.trim() || DEFAULT_VOICE_ID;
  const configuredModelId = process.env.ELEVENLABS_MODEL_ID?.trim() || DEFAULT_MODEL_ID;
  const hash = createHash('sha256')
    .update(`${configuredVoiceId}:${configuredModelId}:${safeLocale}:${safeSlug}:${chapter.id}:${text}`)
    .digest('hex');
  const filename = `${chapter.id}-${hash.slice(0, 20)}.mp3`;
  const blobPath = `orridi/audio/${safeLocale}/${safeSlug}/${filename}`;
  const temporaryPath = path.join(cacheDir, filename);

  const blobResponse = await readCachedBlob(blobPath);
  if (blobResponse) return blobResponse;

  try {
    await stat(temporaryPath);
    const cachedAudio = await readFile(temporaryPath);
    return new Response(cachedAudio, {headers: audioHeaders('TMP')});
  } catch {
    // The temporary cache is best-effort and instance-local.
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55_000);

  try {
    const attempts = [
      {voiceId: configuredVoiceId, modelId: configuredModelId},
      ...(configuredModelId !== DEFAULT_MODEL_ID
        ? [{voiceId: configuredVoiceId, modelId: DEFAULT_MODEL_ID}]
        : []),
      ...(configuredVoiceId !== DEFAULT_VOICE_ID
        ? [{voiceId: DEFAULT_VOICE_ID, modelId: DEFAULT_MODEL_ID}]
        : [])
    ].filter((attempt, index, list) =>
      list.findIndex((candidate) => candidate.voiceId === attempt.voiceId && candidate.modelId === attempt.modelId) === index
    );

    let lastFailure: ElevenFailure | null = null;
    let audio: ArrayBuffer | null = null;

    for (const attempt of attempts) {
      const result = await createSpeech(apiKey, attempt.voiceId, attempt.modelId, text, controller.signal);
      if (result.audio) {
        audio = result.audio;
        break;
      }

      lastFailure = result.failure;
      // Retry only configuration-related failures. Authentication, permission and quota failures cannot be fixed by another voice/model.
      if (!lastFailure || ![404, 422].includes(lastFailure.status)) break;
    }

    if (!audio) {
      const failure = lastFailure || {status: 502, detail: 'Unknown ElevenLabs response.', requestId: null};
      console.error('ElevenLabs TTS error', {
        status: failure.status,
        detail: failure.detail,
        requestId: failure.requestId,
        locale: safeLocale,
        slug: safeSlug,
        chapterId: chapter.id
      });
      return Response.json(
        {error: localizedFailure(safeLocale, failure), code: `ELEVENLABS_${failure.status}`},
        {status: failure.status >= 400 && failure.status < 500 ? failure.status : 502}
      );
    }

    const stored = await writePublicBlob(blobPath, audio, 'audio/mpeg');
    if (!stored) {
      try {
        await mkdir(cacheDir, {recursive: true});
        await writeFile(temporaryPath, Buffer.from(audio));
      } catch (error) {
        console.error('Unable to persist temporary TTS cache', error);
      }
    }

    return new Response(audio, {headers: audioHeaders('MISS')});
  } catch (error) {
    console.error('TTS proxy failure', error);
    const message = error instanceof Error && error.name === 'AbortError'
      ? errorMessages[safeLocale].timeout
      : errorMessages[safeLocale].generic;
    return Response.json({error: message}, {status: 502});
  } finally {
    clearTimeout(timeout);
  }
}
