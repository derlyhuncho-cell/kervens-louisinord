import { NextResponse } from 'next/server';
import { createSession, sessionCookie, verifyPassword, verifyAccessCode } from '../../../lib/auth';

export async function POST(request) {
  const { password, role = 'album' } = await request.json().catch(() => ({}));
  if (!['album', 'admin'].includes(role) || typeof password !== 'string' || !(role === 'admin' ? verifyPassword(role, password) : await verifyAccessCode(password))) return NextResponse.json({ error: 'Modpas la pa kòrèk.' }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookie(role), role === 'admin' ? createSession(role) : password, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 });
  return response;
}
