import {revalidatePath} from 'next/cache';
import {refreshCommonsVisuals} from '@/lib/commons-images';
import {refreshNewsArchive} from '@/lib/news';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== 'production';
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({error: 'Unauthorized'}, {status: 401});
  }

  const [news, photos] = await Promise.allSettled([
    refreshNewsArchive(),
    refreshCommonsVisuals(false)
  ]);

  const anyUpdated =
    (news.status === 'fulfilled' && news.value.updated) ||
    (photos.status === 'fulfilled' && photos.value.updated);

  if (anyUpdated) {
    for (const locale of ['it', 'en', 'es', 'de']) {
      revalidatePath(`/${locale}`);
      revalidatePath(`/${locale}/orridi-uriezzo`);
      revalidatePath(`/${locale}/marmitte-dei-giganti`);
      revalidatePath(`/${locale}/news`);
    }
  }

  const payload = {
    executedAt: new Date().toISOString(),
    news: news.status === 'fulfilled'
      ? {ok: true, updated: news.value.updated, items: news.value.archive.weeks[0]?.items.length || 0, sourceCount: news.value.sourceCount}
      : {ok: false, error: news.reason instanceof Error ? news.reason.message : 'Unknown error'},
    photos: photos.status === 'fulfilled'
      ? {ok: true, updated: photos.value.updated, updatedAt: photos.value.archive.updatedAt}
      : {ok: false, error: photos.reason instanceof Error ? photos.reason.message : 'Unknown error'}
  };

  const status = payload.news.ok || payload.photos.ok ? 200 : 500;
  return Response.json(payload, {
    status,
    headers: {'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'}
  });
}
