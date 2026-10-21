import crypto from 'node:crypto';
import { put, list, get, del } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { hasSession, codePath } from '../../../lib/auth';

const headers = { 'Cache-Control': 'private, no-store' };
export async function GET(request) {
  if (!(await hasSession(request, 'admin'))) return new Response(null, { status: 401 });
  try {
    const records = []; let cursor;
    do {
      const page = await list({ prefix: 'access-codes/', cursor });
      for (const blob of page.blobs) {
        const result = await get(blob.pathname, { access: 'private', useCache: false });
        if (result?.statusCode === 200) records.push({ id: blob.pathname, ...await new Response(result.stream).json() });
      }
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    return NextResponse.json(records, { headers });
  } catch { return NextResponse.json({ error: 'Pa ka li kòd yo.' }, { status: 503, headers }); }
}
export async function POST(request) {
  if (!(await hasSession(request, 'admin'))) return new Response(null, { status: 401 });
  const { label } = await request.json().catch(() => ({}));
  if (typeof label !== 'string' || !label.trim() || label.length > 100) return new Response(null, { status: 400 });
  try {
    const code = crypto.randomBytes(24).toString('hex');
    await put(codePath(code), JSON.stringify({ label: label.trim(), createdAt: new Date().toISOString() }), { access: 'private', addRandomSuffix: false, contentType: 'application/json' });
    return NextResponse.json({ code }, { headers });
  } catch { return NextResponse.json({ error: 'Pa ka kreye kòd la.' }, { status: 503, headers }); }
}
export async function DELETE(request) {
  if (!(await hasSession(request, 'admin'))) return new Response(null, { status: 401 });
  const { id } = await request.json().catch(() => ({}));
  if (typeof id !== 'string' || !/^access-codes\/[a-f0-9]{64}\.json$/.test(id)) return new Response(null, { status: 400 });
  try { await del(id); return NextResponse.json({ ok: true }, { headers }); }
  catch { return NextResponse.json({ error: 'Pa ka retire aksè a.' }, { status: 503, headers }); }
}
