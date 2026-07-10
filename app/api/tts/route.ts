import {createHash} from 'node:crypto';
import {mkdir, readFile, stat, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {findPublicBlob, hasBlobStorage, writePublicBlob} from '@/lib/blob-storage';
import {getGuide, getGuideChapter, type GuideLocale} from '@/lib/guides';
import type {AttractionSlug} from '@/data/attractions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const allowedLocales = new Set<GuideLocale>(['it', 'en', 'es', 'de']);
const allowedSlugs = new Set<AttractionSlug>(['orridi-uriezzo', 'marmitte-dei-giganti']);
const cacheDir = path.join('/tmp', 'ossola-tts-cache');
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 12;
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

function audioHeaders(cacheStatus: 'BLOB' | 'TMP' | 'MISS') {
  return {
    'Content-Type': 'audio/mpeg',
    'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
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

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return Response.json({error: 'Audio service is not configured.'}, {status: 503});
  }

  const text = `${chapter.title}. ${chapter.paragraphs.join('\n\n')}`;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb';
  const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';
  const hash = createHash('sha256')
    .update(`${voiceId}:${modelId}:${safeLocale}:${safeSlug}:${chapter.id}:${text}`)
    .digest('hex');
  const filename = `${chapter.id}-${hash.slice(0, 20)}.mp3`;
  const blobPath = `orridi/audio/${safeLocale}/${safeSlug}/${filename}`;
  const temporaryPath = path.join(cacheDir, filename);

  if (hasBlobStorage()) {
    const cached = await findPublicBlob(blobPath);
    if (cached?.url) {
      return Response.redirect(cached.url, 307);
    }
  }

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
    const elevenResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg'
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability: 0.55,
            similarity_boost: 0.75,
            style: 0.1,
            use_speaker_boost: true
          }
        }),
        signal: controller.signal,
        cache: 'no-store'
      }
    );

    if (!elevenResponse.ok) {
      const detail = await elevenResponse.text().catch(() => '');
      console.error('ElevenLabs TTS error', elevenResponse.status, detail.slice(0, 800));
      return Response.json({error: 'The audio guide is temporarily unavailable.'}, {status: 502});
    }

    const audio = await elevenResponse.arrayBuffer();
    if (!audio.byteLength) {
      return Response.json({error: 'The audio guide is temporarily unavailable.'}, {status: 502});
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
      ? 'The audio request timed out.'
      : 'The audio guide is temporarily unavailable.';
    return Response.json({error: message}, {status: 502});
  } finally {
    clearTimeout(timeout);
  }
}
