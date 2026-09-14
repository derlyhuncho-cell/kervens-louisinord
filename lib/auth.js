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

export function hasSession(request, role) {
  const cookie = request.cookies.get(sessionCookie(role))?.value;
  const secret = secretFor(role);
  if (!cookie || !secret) return false;
  const [storedRole, expiry, received] = cookie.split('.');
  const value = `${storedRole}.${expiry}`;
  return storedRole === role && Number(expiry) > Date.now() && Boolean(received) && same(received, signature(value, secret));
}
