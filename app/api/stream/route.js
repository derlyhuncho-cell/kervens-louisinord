import { get } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { hasSession } from '../../../lib/auth';
import { trackMap } from '../../../lib/tracks';

export async function GET(request) {
  if (!hasSession(request, 'album')) return NextResponse.json({ error: 'Aksè refize.' }, { status: 401 });
  const id = new URL(request.url).searchParams.get('track');
  if (!trackMap.has(id)) return NextResponse.json({ error: 'Mizik sa a pa egziste.' }, { status: 404 });
  try {
    const { stream, blob } = await get(`hegemonie/${id}.m4a`, { access: 'private' });
    return new Response(stream, { headers: { 'Content-Type': blob.contentType || 'audio/mp4', 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ error: 'Mizik sa a poko telechaje.' }, { status: 404 });
  }
}
