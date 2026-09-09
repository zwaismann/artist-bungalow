import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import middleware, { isProtectedPath, isPublicAuthPath } from '../middleware.js';
import { makeSessionToken, SESSION_COOKIE, signPayload, verifyPayload } from '../business/session.js';
import { dispatch } from '../business/auth-server.js';
import { buildBusinessBookPdf } from '../business/build-pdf.js';
import { BOOK } from '../business/content.js';
import { parseStaticAllowlist, stagePublic } from './stage-public.mjs';

let failed = 0;

function assert(cond, msg) {
  if (!cond) {
    failed += 1;
    console.error('FAIL', msg);
  } else {
    console.log('ok  ', msg);
  }
}

const html = readFileSync(new URL('../business/index.html', import.meta.url), 'utf8');
const loginHtml = readFileSync(new URL('../business/login/index.html', import.meta.url), 'utf8');
const enrollHtml = readFileSync(new URL('../business/enroll/index.html', import.meta.url), 'utf8');
const docs = readFileSync(new URL('../BUSINESS_BOOK.md', import.meta.url), 'utf8');
const publicHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const vaultReadme = readFileSync(new URL('../business-book/README.md', import.meta.url), 'utf8');

assert(isProtectedPath('/business'), 'gates /business');
assert(isProtectedPath('/business/'), 'gates /business/');
assert(isProtectedPath('/business/index.html'), 'gates /business/index.html');
assert(isProtectedPath('/business/book.pdf'), 'gates /business/book.pdf');
assert(isProtectedPath('/business-book/authority-to-operate.pdf'), 'gates vault PDFs');
assert(isProtectedPath('/api/business-book-pdf'), 'gates PDF API');
assert(!isProtectedPath('/'), 'does not gate /');
assert(!isProtectedPath('/artist-bungalow-guidebook.html'), 'does not gate guidebook');
assert(!isProtectedPath('/favicon.ico'), 'does not gate favicon');
assert(isPublicAuthPath('/business/login'), 'login page is public under /business');
assert(isPublicAuthPath('/business/enroll'), 'enroll page is public under /business');
assert(isPublicAuthPath('/api/business-auth/login'), 'passkey APIs are reachable without a session');

const saved = {
  password: process.env.BUSINESS_BOOK_PASSWORD,
  user: process.env.BUSINESS_BOOK_USERNAME,
  secret: process.env.BUSINESS_BOOK_SESSION_SECRET,
  token: process.env.BUSINESS_BOOK_SETUP_TOKEN,
};
delete process.env.BUSINESS_BOOK_PASSWORD;
delete process.env.BUSINESS_BOOK_USERNAME;
delete process.env.BUSINESS_BOOK_SESSION_SECRET;
delete process.env.BUSINESS_BOOK_SETUP_TOKEN;

let res = await middleware(
  new Request('https://theartistbungalow.com/business', { headers: { accept: 'text/html' } }),
);
assert(res.status === 302, 'unsigned /business redirects to login');
assert(res.headers.get('location')?.startsWith('/business/login'), 'redirects to /business/login');
assert(!res.headers.get('www-authenticate'), 'does not use HTTP Basic');

res = await middleware(new Request('https://theartistbungalow.com/api/business-book-pdf'));
assert(res.status === 401, 'unsigned PDF API returns 401');

res = await middleware(new Request('https://theartistbungalow.com/business/login'));
assert(res.headers.get('x-middleware-next') === '1', 'login page is not session-gated');

res = await middleware(new Request('https://theartistbungalow.com/'));
assert(res.headers.get('x-middleware-next') === '1', 'public homepage stays open');

process.env.BUSINESS_BOOK_SESSION_SECRET = 'test-only-session-secret';
const session = await makeSessionToken('webauthn');
res = await middleware(
  new Request('https://theartistbungalow.com/business', {
    headers: { cookie: `${SESSION_COOKIE}=${session}`, accept: 'text/html' },
  }),
);
assert(res.headers.get('x-middleware-next') === '1', 'valid passkey session continues');

const roundTrip = await verifyPayload('test-only-session-secret', await signPayload('test-only-session-secret', { v: 1, exp: Math.floor(Date.now() / 1000) + 60 }));
assert(roundTrip?.v === 1, 'signed payloads verify');

process.env.BUSINESS_BOOK_PASSWORD = 'backup-only';
const badPw = await dispatch(
  new Request('https://theartistbungalow.com/api/business-auth/password', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password: 'wrong' }),
  }),
  'password',
);
assert(badPw.status === 401, 'wrong backup password is rejected');

const goodPw = await dispatch(
  new Request('https://theartistbungalow.com/api/business-auth/password', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password: 'backup-only' }),
  }),
  'password',
);
assert(goodPw.status === 200, 'backup password can sign in');
assert((goodPw.headers.get('set-cookie') || '').includes(SESSION_COOKIE), 'password fallback sets a session cookie');

process.env.BUSINESS_BOOK_SETUP_TOKEN = 'setup-only-token';
const tokenAsPassword = await dispatch(
  new Request('https://theartistbungalow.com/api/business-auth/password', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password: 'setup-only-token' }),
  }),
  'password',
);
assert(tokenAsPassword.status === 200, 'setup token can sign in on the password form');

const enrollDenied = await dispatch(
  new Request('https://theartistbungalow.com/api/business-auth/register-options', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({}),
  }),
  'register-options',
);
assert(enrollDenied.status === 401, 'passkey enroll requires setup token or backup password');

assert(loginHtml.includes('Sign in with passkey'), 'login UX leads with passkey');
assert(loginHtml.includes('Touch ID'), 'login mentions Touch ID');
assert(enrollHtml.includes('Create passkey'), 'enroll flow exists');
assert(docs.includes('BUSINESS_BOOK_SETUP_TOKEN'), 'docs describe setup token');
assert(docs.includes('Safari'), 'docs cover Safari enroll');

if (saved.password === undefined) delete process.env.BUSINESS_BOOK_PASSWORD;
else process.env.BUSINESS_BOOK_PASSWORD = saved.password;
if (saved.user === undefined) delete process.env.BUSINESS_BOOK_USERNAME;
else process.env.BUSINESS_BOOK_USERNAME = saved.user;
if (saved.secret === undefined) delete process.env.BUSINESS_BOOK_SESSION_SECRET;
else process.env.BUSINESS_BOOK_SESSION_SECRET = saved.secret;
if (saved.token === undefined) delete process.env.BUSINESS_BOOK_SETUP_TOKEN;
else process.env.BUSINESS_BOOK_SETUP_TOKEN = saved.token;

const pdf = buildBusinessBookPdf();
const pdfText = pdf.toString('latin1');
assert(pdfText.startsWith('%PDF-1.4'), 'PDF header');
assert(pdfText.includes('%%EOF'), 'PDF EOF');
assert(pdfText.includes('XSTR-25-0107'), 'PDF includes STR number');
assert(pdfText.includes('5549021007'), 'PDF includes AIN');
assert(pdfText.includes('HSR22-003411'), 'PDF includes prior HSR as historical');
assert(pdfText.includes('HSR25-000613'), 'PDF includes HostCompliance HSR style');
assert(pdfText.includes('12015509'), 'PDF includes BTRC request ID');
assert(pdfText.includes('2025-12-22'), 'PDF includes first ATO date');
assert(pdfText.includes('do-not-reply@lapd.lacity.org'), 'PDF includes RHO receipt sender');
assert(pdfText.includes('6910 Paseo Del Serra'), 'PDF includes address');
assert(pdfText.includes('Not recorded in this book'), 'PDF marks EIN unknown');
assert(
  /does not include lockbox codes/i.test(pdfText),
  'PDF states access secrets are out of scope',
);
assert(!/Wi-?Fi password\s*[:=]/i.test(pdfText), 'PDF does not publish a Wi-Fi password');

const required = [
  'Spatial Escapes',
  'Confidential business book',
  '6910 Paseo Del Serra, Los Angeles, CA 90068',
  'Light Filled Artist Bungalow',
  '2BR / 2BA',
  '736417448669019623',
  'Superhost / Guest Favorite',
  'theartistbungalow.com',
  '@theartistbungalow',
  'Patrick Waismann',
  'Jimena Agra',
  'We-voice',
  'Sasquatch and Co.',
  '0002900916-00001-1',
  '25-000613',
  'HSR25-000613',
  'HSR22-003411',
  '12015509',
  '5549021007',
  'Spatial Escapes LLC',
  'Not recorded in this book',
  'XSTR-25-0107',
  '2026-09-08',
  '2025-12-22',
  '2025-12-11',
  'One-time registration',
  'do-not-reply@lapd.lacity.org',
  'Michelle Mesina',
  'Rentals@lapd.online',
  '(213) 996-1245',
  'd3e4b63b-65ea-4ec6-8d3a-5124d2a4f543',
  'authority-to-operate.pdf',
  'rho-compliance-registration-application.pdf',
  '2026-09-03-outbound-application-email.pdf',
  '2025-12-payment-receipt-and-first-ato.pdf',
  'Authority to Operate issued',
];
for (const snippet of required) {
  assert(html.includes(snippet), `HTML includes ${snippet}`);
}

assert(
  html.includes('does not include lockbox codes, door codes, Wi-Fi passwords'),
  'HTML states access secrets are out of scope',
);
assert(html.includes('noindex'), 'HTML asks robots not to index');
assert(!publicHtml.includes('href="/business"'), 'public homepage does not link the book');
assert(!publicHtml.includes('6910 Paseo Del Serra'), 'public homepage does not publish the street address');

assert(vaultReadme.includes('authority-to-operate.pdf'), 'vault readme names authority PDF');
assert(vaultReadme.includes('rho-compliance-registration-application.pdf'), 'vault readme names RHO PDF');
assert(vaultReadme.includes('2026-09-03-outbound-application-email.pdf'), 'vault readme names email print');
assert(vaultReadme.includes('2025-12-payment-receipt-and-first-ato.pdf'), 'vault readme names Dec 2025 extracts');
assert(html.includes('historical only'), 'HTML marks prior HSR as historical');
assert(BOOK.entities.hsrPrior === 'HSR22-003411', 'content keeps prior HSR historical');

assert(BOOK.entities.ein.includes('Do not invent'), 'content marks EIN unknown');

const ignoreText = readFileSync(new URL('../.vercelignore', import.meta.url), 'utf8');
const allow = parseStaticAllowlist(ignoreText);
assert(allow.includes('index.html'), 'static allowlist includes the guest homepage');
assert(allow.includes('business'), 'static allowlist includes /business HTML');
assert(!allow.includes('api'), 'static allowlist does not treat /api as CDN files');
assert(!allow.includes('middleware.js'), 'static allowlist leaves middleware at the project root');

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const { dest, copied } = await stagePublic({ root: repoRoot });
assert(copied > 0, 'stage-public copies static paths');
assert(existsSync(join(dest, 'index.html')), 'build output includes public/index.html');
assert(existsSync(join(dest, 'business/index.html')), 'build output includes the business book HTML');
assert(existsSync(join(dest, 'business/login/index.html')), 'build output includes the passkey login page');
assert(!existsSync(join(dest, 'business/session.js')), 'server auth modules stay out of the static output');
assert(!existsSync(join(dest, 'middleware.js')), 'middleware is not copied into public/');
assert(!existsSync(join(dest, 'api')), 'API functions stay at the project root, not public/');

if (failed) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log('\nAll business book checks passed');
