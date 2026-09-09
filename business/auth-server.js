import './cbor-init.js';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import {
  SESSION_COOKIE,
  CHALLENGE_COOKIE,
  CHALLENGE_TTL_SEC,
  SESSION_TTL_SEC,
  cookieHeader,
  clearCookieHeader,
  isSecureRequest,
  isAuthConfigured,
  makeChallengeToken,
  makeSessionToken,
  readChallenge,
  signingSecret,
  timingSafeEqual,
} from './session.js';
import { loadPasskeys, passkeysCookieHeader, serializePasskeysForEnv } from './passkey-store.js';

const MAX_PASSKEYS = 8;
const USER_ID = new Uint8Array(16);
USER_ID.set(new TextEncoder().encode('artist-bungalow-bb').subarray(0, 16));

function json(body, status = 200, extraHeaders = []) {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
  });
  for (const line of extraHeaders) {
    if (line) headers.append('Set-Cookie', line);
  }
  return new Response(JSON.stringify(body), { status, headers });
}

/** vercel dev Node handlers get IncomingMessage; production/tests pass Fetch Request. */
async function asFetchRequest(raw) {
  if (raw instanceof Request) return raw;
  if (raw && typeof raw.headers?.get === 'function' && typeof raw.json === 'function') {
    return raw;
  }

  const headers = new Headers();
  const src = raw?.headers || {};
  for (const [key, value] of Object.entries(src)) {
    if (value == null) continue;
    const lower = key.toLowerCase();
    if (lower === 'connection' || lower === 'transfer-encoding' || lower === 'keep-alive') continue;
    headers.set(key, Array.isArray(value) ? value.join(', ') : String(value));
  }

  const host = headers.get('host') || '127.0.0.1';
  const proto = headers.get('x-forwarded-proto') || 'http';
  const path = typeof raw?.url === 'string' && raw.url.startsWith('http') ? raw.url : `${proto}://${host}${raw?.url || '/'}`;
  const method = raw?.method || 'GET';
  const init = { method, headers };
  if (method !== 'GET' && method !== 'HEAD') {
    if (typeof raw.body === 'string' || Buffer.isBuffer(raw.body)) {
      init.body = raw.body;
      init.duplex = 'half';
    } else if (raw.body && typeof raw.body === 'object' && !ArrayBuffer.isView(raw.body)) {
      init.body = JSON.stringify(raw.body);
      init.duplex = 'half';
      if (!headers.has('content-type')) headers.set('content-type', 'application/json');
    } else if (typeof raw.on === 'function' && raw.readableEnded !== true) {
      const chunks = [];
      for await (const chunk of raw) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      init.body = Buffer.concat(chunks);
      init.duplex = 'half';
    }
  }
  return new Request(path, init);
}

function rpFromRequest(request) {
  const url = new URL(request.url);
  const origin = process.env.BUSINESS_BOOK_ORIGIN || url.origin;
  const rpID = process.env.BUSINESS_BOOK_RP_ID || new URL(origin).hostname;
  return {
    origin,
    rpID,
    rpName: 'Spatial Escapes · Artist Bungalow',
  };
}

async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function canEnroll(body, env = process.env) {
  const token = env.BUSINESS_BOOK_SETUP_TOKEN;
  const password = env.BUSINESS_BOOK_PASSWORD;
  const setupToken = String(body.setupToken || '').trim();
  const bodyPassword = String(body.password || '').trim();
  if (token && setupToken && timingSafeEqual(setupToken, token)) return true;
  if (password && bodyPassword && timingSafeEqual(bodyPassword, password)) return true;
  return false;
}

function toStoredPasskey(credential, transports) {
  const publicKey = credential.publicKey;
  return {
    id: credential.id,
    publicKey: typeof publicKey === 'string' ? publicKey : isoBase64URL.fromBuffer(publicKey),
    counter: credential.counter || 0,
    transports: transports || credential.transports || [],
  };
}

async function status(request) {
  const creds = await loadPasskeys(request);
  return json({
    configured: isAuthConfigured(),
    hasPasskeys: creds.length > 0,
    hasPasswordFallback: Boolean(process.env.BUSINESS_BOOK_PASSWORD),
    hasSetupToken: Boolean(process.env.BUSINESS_BOOK_SETUP_TOKEN),
  });
}

async function registerOptions(request) {
  if (!signingSecret()) {
    return json({ error: 'Auth is not configured. Set BUSINESS_BOOK_SETUP_TOKEN or BUSINESS_BOOK_PASSWORD.' }, 503);
  }
  const body = await readBody(request);
  if (!canEnroll(body)) {
    return json({ error: 'Enter the setup token or backup password to create a passkey.' }, 401);
  }
  const { rpName, rpID } = rpFromRequest(request);
  const existing = await loadPasskeys(request);
  if (existing.length >= MAX_PASSKEYS) {
    return json({ error: 'Maximum number of passkeys reached.' }, 400);
  }
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: 'spatial-escapes',
    userDisplayName: 'Artist Bungalow',
    userID: USER_ID,
    attestationType: 'none',
    excludeCredentials: existing.map((cred) => ({
      id: cred.id,
      transports: cred.transports,
    })),
    authenticatorSelection: {
      residentKey: 'required',
      requireResidentKey: true,
      userVerification: 'required',
      authenticatorAttachment: 'platform',
    },
    preferredAuthenticatorType: 'localDevice',
    supportedAlgorithmIDs: [-7, -257],
  });
  const challengeCookie = cookieHeader(CHALLENGE_COOKIE, await makeChallengeToken('reg', options.challenge), {
    maxAge: CHALLENGE_TTL_SEC,
    secure: isSecureRequest(request),
  });
  return json(options, 200, [challengeCookie]);
}

async function register(request) {
  const body = await readBody(request);
  if (!canEnroll(body)) {
    return json({ error: 'Enter the setup token or backup password to create a passkey.' }, 401);
  }
  const expectedChallenge = await readChallenge(request, 'reg');
  if (!expectedChallenge) {
    return json({ error: 'Registration challenge expired. Try creating the passkey again.' }, 400);
  }
  const { origin, rpID } = rpFromRequest(request);
  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: body.credential,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
    });
  } catch (error) {
    return json({ error: error.message || 'Could not verify that passkey.' }, 400);
  }
  if (!verification.verified || !verification.registrationInfo) {
    return json({ error: 'Passkey could not be verified.' }, 400);
  }
  const { credential } = verification.registrationInfo;
  const existing = await loadPasskeys(request);
  const stored = toStoredPasskey(credential, body.credential?.response?.transports);
  const next = [...existing.filter((c) => c.id !== stored.id), stored];
  const session = await makeSessionToken('webauthn');
  const headers = [
    await passkeysCookieHeader(request, next),
    cookieHeader(SESSION_COOKIE, session, {
      maxAge: SESSION_TTL_SEC,
      secure: isSecureRequest(request),
    }),
    clearCookieHeader(CHALLENGE_COOKIE, { secure: isSecureRequest(request) }),
  ];
  return json(
    {
      verified: true,
      credentialsJson: serializePasskeysForEnv(next),
    },
    200,
    headers,
  );
}

async function loginOptions(request) {
  if (!signingSecret()) {
    return json({ error: 'Auth is not configured. Set BUSINESS_BOOK_SESSION_SECRET or BUSINESS_BOOK_SETUP_TOKEN.' }, 503);
  }
  const { rpID } = rpFromRequest(request);
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: 'required',
    timeout: 60000,
  });
  const challengeCookie = cookieHeader(CHALLENGE_COOKIE, await makeChallengeToken('auth', options.challenge), {
    maxAge: CHALLENGE_TTL_SEC,
    secure: isSecureRequest(request),
  });
  return json(options, 200, [challengeCookie]);
}

async function login(request) {
  const body = await readBody(request);
  const expectedChallenge = await readChallenge(request, 'auth');
  if (!expectedChallenge) {
    return json({ error: 'Sign-in challenge expired. Try the passkey again.' }, 400);
  }
  const creds = await loadPasskeys(request);
  const passkey = creds.find((c) => c.id === body.id);
  if (!passkey) {
    return json(
      {
        error:
          'That passkey is not registered for this business book yet. Create a passkey first.',
      },
      401,
    );
  }
  const { origin, rpID } = rpFromRequest(request);
  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
      credential: {
        id: passkey.id,
        publicKey: isoBase64URL.toBuffer(passkey.publicKey),
        counter: passkey.counter || 0,
        transports: passkey.transports,
      },
    });
  } catch (error) {
    return json({ error: error.message || 'Could not verify that passkey.' }, 400);
  }
  if (!verification.verified) {
    return json({ error: 'Passkey could not be verified.' }, 401);
  }
  const newCounter = verification.authenticationInfo?.newCounter ?? passkey.counter;
  const updated = creds.map((c) => (c.id === passkey.id ? { ...c, counter: newCounter } : c));
  const session = await makeSessionToken('webauthn');
  return json({ verified: true }, 200, [
    await passkeysCookieHeader(request, updated),
    cookieHeader(SESSION_COOKIE, session, {
      maxAge: SESSION_TTL_SEC,
      secure: isSecureRequest(request),
    }),
    clearCookieHeader(CHALLENGE_COOKIE, { secure: isSecureRequest(request) }),
  ]);
}

async function passwordLogin(request) {
  const password = process.env.BUSINESS_BOOK_PASSWORD;
  if (!password) {
    return json({ error: 'No backup password is configured.' }, 400);
  }
  const body = await readBody(request);
  if (!body.password || !timingSafeEqual(String(body.password), password)) {
    return json({ error: 'That backup password did not match.' }, 401);
  }
  const session = await makeSessionToken('password');
  if (!session) {
    return json({ error: 'Auth is not configured.' }, 503);
  }
  return json({ verified: true, amr: 'password' }, 200, [
    cookieHeader(SESSION_COOKIE, session, {
      maxAge: SESSION_TTL_SEC,
      secure: isSecureRequest(request),
    }),
  ]);
}

async function logout(request) {
  return json({ ok: true }, 200, [
    clearCookieHeader(SESSION_COOKIE, { secure: isSecureRequest(request) }),
    clearCookieHeader(CHALLENGE_COOKIE, { secure: isSecureRequest(request) }),
  ]);
}

const routes = {
  status,
  'register-options': registerOptions,
  register,
  'login-options': loginOptions,
  login,
  password: passwordLogin,
  logout,
};

export async function dispatch(raw, action) {
  const request = await asFetchRequest(raw);
  const handler = routes[action];
  if (!handler) return json({ error: 'Not found' }, 404);
  if (action === 'status' && request.method !== 'GET' && request.method !== 'HEAD') {
    return json({ error: 'Method not allowed' }, 405);
  }
  if (action !== 'status' && request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }
  return handler(request);
}

/** vercel dev Node adapters wait on res.end(); returning a Fetch Response hangs. */
export async function nodeHandler(req, res, action) {
  try {
    const response = await dispatch(req, action);
    res.statusCode = response.status;
    const cookies = [];
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') cookies.push(value);
      else res.setHeader(key, value);
    });
    if (cookies.length) res.setHeader('set-cookie', cookies);
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('content-type', 'application/json; charset=utf-8');
    }
    res.end(JSON.stringify({ error: error?.message || 'Function error' }));
  }
}
