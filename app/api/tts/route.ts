import {createHash} from 'node:crypto';
import {mkdir, readFile, stat, writeFile} from 'node:fs/promises';
import path from 'node:path';
import it from '@/messages/it.json';
import en from '@/messages/en.json';
import es from '@/messages/es.json';
import de from '@/messages/de.json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type Locale = 'it' | 'en' | 'es' | 'de';
type Slug = 'orridi-uriezzo' | 'marmitte-dei-giganti';

type MessageShape = typeof it;

const messages: Record<Locale, MessageShape> = {it, en, es, de};
const allowedLocales = new Set<Locale>(['it', 'en', 'es', 'de']);
const allowedSlugs = new Set<Slug>(['orridi-uriezzo', 'marmitte-dei-giganti']);
const cacheDir = path.join('/tmp', 'ossola-tts-cache');
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 6;
const rateBuckets = new Map<string, {count: number; resetAt: number}>();

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

function getNarration(locale: Locale, slug: Slug) {
  const namespace = slug === 'orridi-uriezzo' ? 'orridi' : 'marmitte';
  return messages[locale][namespace].narration;
}

function audioHeaders(cacheStatus: 'HIT' | 'MISS') {
  return {
    'Content-Type': 'audio/mpeg',
    'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
    'X-TTS-Cache': cacheStatus,
    'X-Content-Type-Options': 'nosniff'
  };
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

  const {locale, slug} = (body || {}) as {locale?: string; slug?: string};
  if (!locale || !allowedLocales.has(locale as Locale) || !slug || !allowedSlugs.has(slug as Slug)) {
    return Response.json({error: 'Unsupported language or guide.'}, {status: 400});
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return Response.json({error: 'Audio service is not configured.'}, {status: 503});
  }

  const safeLocale = locale as Locale;
  const safeSlug = slug as Slug;
  const text = getNarration(safeLocale, safeSlug);
  const voiceId = process.env.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb';
  const cacheKey = createHash('sha256')
    .update(`${voiceId}:${safeLocale}:${safeSlug}:${text}`)
    .digest('hex');
  const cachePath = path.join(cacheDir, `${cacheKey}.mp3`);

  try {
    await stat(cachePath);
    const cachedAudio = await readFile(cachePath);
    return new Response(cachedAudio, {headers: audioHeaders('HIT')});
  } catch {
    // Cache miss. /tmp is intentionally best-effort on serverless runtimes.
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55_000);

  try {
    const elevenResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/stream?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg'
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.55,
            similarity_boost: 0.75,
            style: 0.15,
            use_speaker_boost: true
          }
        }),
        signal: controller.signal
      }
    );

    if (!elevenResponse.ok || !elevenResponse.body) {
      const detail = await elevenResponse.text().catch(() => '');
      console.error('ElevenLabs TTS error', elevenResponse.status, detail.slice(0, 500));
      return Response.json({error: 'The audio guide is temporarily unavailable.'}, {status: 502});
    }

    await mkdir(cacheDir, {recursive: true});
    const reader = elevenResponse.body.getReader();
    const chunks: Uint8Array[] = [];

    const stream = new ReadableStream<Uint8Array>({
      async pull(streamController) {
        try {
          const {done, value} = await reader.read();
          if (done) {
            const completeAudio = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
            try {
              await writeFile(cachePath, completeAudio);
            } catch (error) {
              console.error('Unable to persist temporary TTS cache', error);
            }
            streamController.close();
            return;
          }

          chunks.push(value);
          streamController.enqueue(value);
        } catch (error) {
          streamController.error(error);
        }
      },
      cancel() {
        void reader.cancel();
      }
    });

    return new Response(stream, {headers: audioHeaders('MISS')});
  } catch (error) {
    console.error('TTS proxy failure', error);
    const message = error instanceof Error && error.name === 'AbortError'
      ? 'The audio request timed out.'
      : 'The audio guide is temporarily unavailable.';
    return Response.json({error: message}, {status: 502});
  } finally {
    clearTimeout(timeout);
  }
}
