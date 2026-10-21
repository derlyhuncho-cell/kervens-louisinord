import { albumStorageOptions } from '../../../lib/album-storage';
import { get, head } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { hasSession } from '../../../lib/auth';
import { trackMap } from '../../../lib/tracks';

export async function GET(request) {
  if (!(await hasSession(request, 'album'))) return NextResponse.json({ error: 'Aksè refize.' }, { status: 401 });
  const id = new URL(request.url).searchParams.get('track');
  if (!trackMap.has(id)) return NextResponse.json({ error: 'Mizik sa a pa egziste.' }, { status: 404 });
  try {
    const pathname = `hegemonie/${id}.m4a`;
    const options = albumStorageOptions();
    const metadata = await head(pathname, options);
    const range = request.headers.get('range');
    let partial;
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (match && (match[1] || match[2])) {
        const size = metadata.size;
        const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
        const end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
        if (Number.isSafeInteger(start) && Number.isSafeInteger(end) && start >= 0 && start <= end && start < size) partial = { start, end };
      }
      if (!partial) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${metadata.size}`, 'Cache-Control': 'private, no-store' } });
    }
    const result = await get(pathname, { ...options, access: 'private', ...(partial ? { headers: { Range: `bytes=${partial.start}-${partial.end}` } } : {}) });
    if (!result?.stream) return NextResponse.json({ error: 'Mizik sa a poko telechaje.' }, { status: 404 });
    const headers = new Headers({ 'Content-Type': result.blob.contentType || metadata.contentType, 'Cache-Control': 'private, no-store', 'Accept-Ranges': 'bytes' });
    const contentRange = result.headers.get('content-range');
    if (contentRange) headers.set('Content-Range', contentRange);
    const length = result.headers.get('content-length');
    if (length) headers.set('Content-Length', length);
    return new Response(result.stream, { status: contentRange ? 206 : 200, headers });
  } catch {
    return NextResponse.json({ error: 'Mizik sa a poko telechaje.' }, { status: 404 });
  }
}
