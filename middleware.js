import { next } from '@vercel/functions';

export const config = {
  matcher: [
    '/business',
    '/business/:path*',
    '/business-book',
    '/business-book/:path*',
    '/api/business-book-pdf',
  ],
};

const PROTECTED_PREFIXES = ['/business/', '/business-book/'];
const PROTECTED_EXACT = ['/business', '/business-book', '/api/business-book-pdf'];

export function isProtectedPath(pathname) {
  if (PROTECTED_EXACT.includes(pathname)) return true;
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function encodeUtf8(str) {
  return new TextEncoder().encode(str);
}

export function timingSafeEqual(a, b) {
  const aa = encodeUtf8(String(a));
  const bb = encodeUtf8(String(b));
  const len = Math.max(aa.length, bb.length, 1);
  let mismatch = aa.length === bb.length ? 0 : 1;
  for (let i = 0; i < len; i++) {
    mismatch |= (aa[i] ?? 0) ^ (bb[i] ?? 0);
  }
  return mismatch === 0;
}

export function parseBasicAuth(header) {
  if (!header || !header.startsWith('Basic ')) return null;
  try {
    const decoded = atob(header.slice(6));
    const colon = decoded.indexOf(':');
    if (colon === -1) return null;
    return {
      username: decoded.slice(0, colon),
      password: decoded.slice(colon + 1),
    };
  } catch {
    return null;
  }
}

export function credentialsMatch(parsed, env = process.env) {
  const password = env.BUSINESS_BOOK_PASSWORD;
  if (!password) return { ok: false, reason: 'unconfigured' };
  if (!parsed) return { ok: false, reason: 'missing' };

  const expectedUser = env.BUSINESS_BOOK_USERNAME;
  const userOk =
    expectedUser == null || expectedUser === ''
      ? true
      : timingSafeEqual(parsed.username, expectedUser);
  const passOk = timingSafeEqual(parsed.password, password);
  return { ok: userOk && passOk, reason: userOk && passOk ? 'ok' : 'mismatch' };
}

function challenge(status, body) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
      ...(status === 401
        ? { 'WWW-Authenticate': 'Basic realm="Spatial Escapes Business Book", charset="UTF-8"' }
        : {}),
    },
  });
}

const GATE_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="robots" content="noindex, nofollow" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Business Book - Spatial Escapes</title>
  <style>
    body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
      background:#1A1A1A; color:#FAF6F0; font-family:"Space Grotesk", system-ui, sans-serif; }
    main { max-width: 28rem; padding: 2rem; text-align:center; }
    p.label { letter-spacing:0.28em; text-transform:uppercase; font-size:11px; color:#C49A3C; }
    h1 { font-family: Georgia, serif; font-weight:400; font-size:1.75rem; margin:12px 0 16px; }
    p { color: rgba(250,246,240,0.65); font-size:14px; line-height:1.6; }
    a { color:#C49A3C; }
  </style>
</head>
<body>
  <main>
    <p class="label">Spatial Escapes</p>
    <h1>Artist Bungalow</h1>
    <p>__MESSAGE__</p>
    <p><a href="/">Return to the public site</a></p>
  </main>
</body>
</html>`;

export default function middleware(request) {
  const pathname = new URL(request.url).pathname;
  if (!isProtectedPath(pathname)) {
    return next();
  }

  const result = credentialsMatch(parseBasicAuth(request.headers.get('authorization')));
  if (result.reason === 'unconfigured') {
    return challenge(
      503,
      GATE_PAGE.replace(
        '__MESSAGE__',
        'This business book is not configured. Set BUSINESS_BOOK_PASSWORD on the host and redeploy.',
      ),
    );
  }
  if (!result.ok) {
    return challenge(
      401,
      GATE_PAGE.replace(
        '__MESSAGE__',
        'This accompanying URL is private. Enter the business book username and password to continue.',
      ),
    );
  }

  return next({
    headers: {
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
    },
  });
}
