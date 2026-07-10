import {get, head, put} from '@vercel/blob';

export function hasBlobStorage() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
    (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN)
  );
}

export async function readPublicJson<T>(pathname: string): Promise<T | null> {
  if (!hasBlobStorage()) return null;

  try {
    const result = await get(pathname, {access: 'public', useCache: false});
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const text = await new Response(result.stream).text();
    return JSON.parse(text) as T;
  } catch (error) {
    console.error(`Unable to read Blob JSON ${pathname}`, error);
    return null;
  }
}

export async function writePublicJson(pathname: string, value: unknown) {
  if (!hasBlobStorage()) return null;

  try {
    return await put(pathname, JSON.stringify(value, null, 2), {
      access: 'public',
      allowOverwrite: true,
      addRandomSuffix: false,
      contentType: 'application/json; charset=utf-8',
      cacheControlMaxAge: 60
    });
  } catch (error) {
    console.error(`Unable to write Blob JSON ${pathname}`, error);
    return null;
  }
}

export async function findPublicBlob(pathname: string) {
  if (!hasBlobStorage()) return null;

  try {
    return await head(pathname);
  } catch {
    return null;
  }
}

export async function writePublicBlob(
  pathname: string,
  body: ArrayBuffer | Blob | string | Buffer,
  contentType: string,
  cacheControlMaxAge = 31_536_000
) {
  if (!hasBlobStorage()) return null;

  try {
    return await put(pathname, body, {
      access: 'public',
      allowOverwrite: true,
      addRandomSuffix: false,
      contentType,
      cacheControlMaxAge
    });
  } catch (error) {
    console.error(`Unable to write Blob ${pathname}`, error);
    return null;
  }
}
