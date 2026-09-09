/** Edge-safe HMAC cookies for the business book gate. */

export const SESSION_COOKIE = 'bb_session';
export const CHALLENGE_COOKIE = 'bb_challenge';
export const PASSKEYS_COOKIE = 'bb_passkeys';

const SESSION_TTL_SEC = 60 * 60 * 24 * 14;
const CHALLENGE_TTL_SEC = 60 * 5;
const PASSKEYS_TTL_SEC = 60 * 60 * 24 * 400;

function encodeUtf8(str) {
  return new TextEncoder().encode(String(str));
}

export function timingSafeEqual(a, b) {
  const aa = encodeUtf8(a);
  const bb = encodeUtf8(b);
  const len = Math.max(aa.length, bb.length, 1);
  let mismatch = aa.length === bb.length ? 0 : 1;
  for (let i = 0; i < len; i++) {
    mismatch |= (aa[i] ?? 0) ^ (bb[i] ?? 0);
  }
  return mismatch === 0;
}

export function bytesToB64url(bytes) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = '';
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function b64urlToBytes(value) {
  const pad = '='.repeat((4 - (value.length % 4)) % 4);
  const b64 = value.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function getCookie(request, name) {
  const header = request.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    if (trimmed.slice(0, eq) === name) {
      return decodeURIComponent(trimmed.slice(eq + 1));
    }
  }
  return null;
}

export function signingSecret(env = process.env) {
  return (
    env.BUSINESS_BOOK_SESSION_SECRET ||
    env.BUSINESS_BOOK_SETUP_TOKEN ||
    env.BUSINESS_BOOK_PASSWORD ||
    ''
  );
}

export function isAuthConfigured(env = process.env) {
  return Boolean(signingSecret(env) || env.BUSINESS_BOOK_WEBAUTHN_CREDENTIALS);
}

async function hmacSign(secret, payload) {
  const key = await crypto.subtle.importKey(
    'raw',
    encodeUtf8(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encodeUtf8(payload));
  return bytesToB64url(sig);
}

export async function signPayload(secret, obj) {
  const payload = bytesToB64url(encodeUtf8(JSON.stringify(obj)));
  const sig = await hmacSign(secret, payload);
  return `${payload}.${sig}`;
}

export async function verifyPayload(secret, token) {
  if (!secret || !token) return null;
  const i = token.lastIndexOf('.');
  if (i < 1) return null;
  const payload = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expected = await hmacSign(secret, payload);
  if (!timingSafeEqual(sig, expected)) return null;
  try {
    const json = JSON.parse(new TextDecoder().decode(b64urlToBytes(payload)));
    if (json.exp && Date.now() / 1000 > json.exp) return null;
    return json;
  } catch {
    return null;
  }
}

export function cookieHeader(name, value, { maxAge, secure, path = '/' } = {}) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${path}`,
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export function clearCookieHeader(name, { secure, path = '/' } = {}) {
  return cookieHeader(name, '', { maxAge: 0, secure, path });
}

export function isSecureRequest(request) {
  return new URL(request.url).protocol === 'https:';
}

export async function readSession(request, env = process.env) {
  const secret = signingSecret(env);
  const token = getCookie(request, SESSION_COOKIE);
  const data = await verifyPayload(secret, token);
  if (!data || data.v !== 1 || data.sub !== 'business-book') return null;
  return data;
}

export async function makeSessionToken(amr, env = process.env) {
  const secret = signingSecret(env);
  if (!secret) return null;
  const now = Math.floor(Date.now() / 1000);
  return signPayload(secret, {
    v: 1,
    sub: 'business-book',
    amr,
    iat: now,
    exp: now + SESSION_TTL_SEC,
  });
}

export async function makeChallengeToken(type, challenge, env = process.env) {
  const secret = signingSecret(env);
  const now = Math.floor(Date.now() / 1000);
  return signPayload(secret, {
    v: 1,
    t: type,
    challenge,
    iat: now,
    exp: now + CHALLENGE_TTL_SEC,
  });
}

export async function readChallenge(request, type, env = process.env) {
  const secret = signingSecret(env);
  const data = await verifyPayload(secret, getCookie(request, CHALLENGE_COOKIE));
  if (!data || data.v !== 1 || data.t !== type || !data.challenge) return null;
  return data.challenge;
}

export { SESSION_TTL_SEC, CHALLENGE_TTL_SEC, PASSKEYS_TTL_SEC };
