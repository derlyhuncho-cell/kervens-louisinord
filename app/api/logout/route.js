import { NextResponse } from 'next/server';
import { sessionCookie } from '../../../lib/auth';

export async function POST(request) {
  const { role = 'album' } = await request.json().catch(() => ({}));
  const response = NextResponse.json({ ok: true });
  if (['album', 'admin'].includes(role)) response.cookies.set(sessionCookie(role), '', { path: '/', maxAge: 0 });
  return response;
}
