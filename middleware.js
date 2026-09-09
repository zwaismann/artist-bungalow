import { next } from '@vercel/functions';
import { isAuthConfigured, readSession } from './business/session.js';

export const config = {
  matcher: [
    '/business',
    '/business/:path*',
    '/business-book',
    '/business-book/:path*',
    '/api/business-book-pdf',
    '/api/business-auth/:path*',
  ],
};

const PROTECTED_PREFIXES = ['/business/', '/business-book/'];
const PROTECTED_EXACT = ['/business', '/business-book', '/api/business-book-pdf'];

const PUBLIC_EXACT = [
  '/business/login',
  '/business/login/',
  '/business/login/index.html',
  '/business/enroll',
  '/business/enroll/',
  '/business/enroll/index.html',
];

export function isProtectedPath(pathname) {
  if (PROTECTED_EXACT.includes(pathname)) return true;
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isPublicAuthPath(pathname) {
  if (PUBLIC_EXACT.includes(pathname)) return true;
  return pathname.startsWith('/api/business-auth/');
}

function wantsHtml(request) {
  const accept = request.headers.get('accept') || '';
  return request.method === 'GET' && accept.includes('text/html');
}

function safeNext(pathname) {
  if (pathname.startsWith('/business') || pathname.startsWith('/business-book')) {
    return pathname;
  }
  return '/business';
}

function loginRedirect(request) {
  const url = new URL(request.url);
  const nextPath = safeNext(url.pathname + url.search);
  const path = `/business/login?next=${encodeURIComponent(nextPath)}`;
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const location =
    forwardedHost && forwardedProto ? `${forwardedProto}://${forwardedHost}${path}` : path;
  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
    },
  });
}

function unauthorized() {
  return new Response(
    JSON.stringify({ error: 'Sign in with a passkey at /business/login' }),
    {
      status: 401,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'private, no-store',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
      },
    },
  );
}

export default async function middleware(request) {
  const pathname = new URL(request.url).pathname;
  if (!isProtectedPath(pathname) && !isPublicAuthPath(pathname)) {
    return next();
  }

  if (isPublicAuthPath(pathname)) {
    return next({
      headers: {
        'Cache-Control': 'private, no-store',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
      },
    });
  }

  const session = await readSession(request);
  if (session) {
    return next({
      headers: {
        'Cache-Control': 'private, no-store',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
      },
    });
  }

  if (!isAuthConfigured() && wantsHtml(request)) {
    return loginRedirect(request);
  }

  if (wantsHtml(request)) {
    return loginRedirect(request);
  }
  return unauthorized();
}
