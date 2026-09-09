import {
  PASSKEYS_COOKIE,
  PASSKEYS_TTL_SEC,
  getCookie,
  isSecureRequest,
  cookieHeader,
  signPayload,
  signingSecret,
  verifyPayload,
} from './session.js';

function parseEnvCredentials(env = process.env) {
  const raw = env.BUSINESS_BOOK_WEBAUTHN_CREDENTIALS;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((c) => c && c.id && c.publicKey) : [];
  } catch {
    return [];
  }
}

function mergeCreds(primary, secondary) {
  const byId = new Map();
  for (const cred of primary) byId.set(cred.id, cred);
  for (const cred of secondary) byId.set(cred.id, cred);
  return [...byId.values()];
}

export async function loadPasskeys(request, env = process.env) {
  const fromEnv = parseEnvCredentials(env);
  const secret = signingSecret(env);
  const token = getCookie(request, PASSKEYS_COOKIE);
  const data = await verifyPayload(secret, token);
  const fromCookie = data?.v === 1 && Array.isArray(data.creds) ? data.creds : [];
  return mergeCreds(fromEnv, fromCookie);
}

export async function passkeysCookieHeader(request, creds, env = process.env) {
  const secret = signingSecret(env);
  if (!secret) return null;
  const now = Math.floor(Date.now() / 1000);
  const token = await signPayload(secret, {
    v: 1,
    creds,
    iat: now,
    exp: now + PASSKEYS_TTL_SEC,
  });
  return cookieHeader(PASSKEYS_COOKIE, token, {
    maxAge: PASSKEYS_TTL_SEC,
    secure: isSecureRequest(request),
  });
}

export function serializePasskeysForEnv(creds) {
  return JSON.stringify(creds, null, 2);
}
