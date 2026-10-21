import { get } from '@vercel/blob';
import crypto from 'node:crypto';

const sessions = { album: 'hegemonie_album', admin: 'hegemonie_admin' };

function secretFor(role) {
  return role === 'admin' ? process.env.ADMIN_PASSWORD : process.env.ALBUM_PASSWORD;
}

function signature(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function same(a, b) {
  const left = Buffer.from(a || '');
  const right = Buffer.from(b || '');
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function sessionCookie(role) { return sessions[role]; }

export function verifyPassword(role, password) {
  const secret = secretFor(role);
  return Boolean(secret) && same(password, secret);
}

export function createSession(role) {
  const secret = secretFor(role);
  if (!secret) throw new Error('Missing password configuration');
  const expires = Date.now() + 1000 * 60 * 60 * 24 * 30;
  const value = `${role}.${expires}`;
  return `${value}.${signature(value, secret)}`;
}

export async function hasSession(request, role) {
  if (role === 'album') {
    const code = request.cookies.get(sessionCookie(role))?.value;
    return verifyAccessCode(code);
  }
  const cookie = request.cookies.get(sessionCookie(role))?.value;
  const secret = secretFor(role);
  if (!cookie || !secret) return false;
  const [storedRole, expiry, received] = cookie.split('.');
  const value = `${storedRole}.${expiry}`;
  return storedRole === role && Number(expiry) > Date.now() && Boolean(received) && same(received, signature(value, secret));
}

export function codePath(code) {
  return `access-codes/${crypto.createHash('sha256').update(code).digest('hex')}.json`;
}

export async function verifyAccessCode(code) {
  if (typeof code !== 'string' || !/^[a-f0-9]{48}$/.test(code)) return false;
  try {
    const result = await get(codePath(code), { access: 'private', useCache: false });
    return result?.statusCode === 200;
  } catch { return false; }
}
