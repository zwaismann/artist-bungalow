import { readFileSync } from 'node:fs';
import { credentialsMatch, isProtectedPath, parseBasicAuth } from '../middleware.js';
import middleware from '../middleware.js';
import { buildBusinessBookPdf } from '../business/build-pdf.js';
import { BOOK } from '../business/content.js';

let failed = 0;

function assert(cond, msg) {
  if (!cond) {
    failed += 1;
    console.error('FAIL', msg);
  } else {
    console.log('ok  ', msg);
  }
}

function authHeader(user, password) {
  return `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`;
}

const html = readFileSync(new URL('../business/index.html', import.meta.url), 'utf8');
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

const savedPass = process.env.BUSINESS_BOOK_PASSWORD;
const savedUser = process.env.BUSINESS_BOOK_USERNAME;
delete process.env.BUSINESS_BOOK_PASSWORD;
delete process.env.BUSINESS_BOOK_USERNAME;

let res = await middleware(new Request('https://theartistbungalow.com/business'));
assert(res.status === 503, 'unconfigured password returns 503');

process.env.BUSINESS_BOOK_PASSWORD = 'test-only-local-password';
res = await middleware(new Request('https://theartistbungalow.com/business'));
assert(res.status === 401, 'missing basic auth returns 401');
assert(res.headers.get('www-authenticate')?.includes('Basic'), 'sends WWW-Authenticate');

res = await middleware(
  new Request('https://theartistbungalow.com/business', {
    headers: { authorization: authHeader('spatial', 'wrong') },
  }),
);
assert(res.status === 401, 'wrong password returns 401');

res = await middleware(
  new Request('https://theartistbungalow.com/business', {
    headers: { authorization: authHeader('anyone', 'test-only-local-password') },
  }),
);
assert(res.status === 200 || res.status === 204 || res.body === null, 'valid password continues');
assert(res.headers.get('x-middleware-next') === '1', 'valid password sets x-middleware-next');

process.env.BUSINESS_BOOK_USERNAME = 'spatial';
res = await middleware(
  new Request('https://theartistbungalow.com/business', {
    headers: { authorization: authHeader('wrong-user', 'test-only-local-password') },
  }),
);
assert(res.status === 401, 'wrong username rejected when username is set');

res = await middleware(
  new Request('https://theartistbungalow.com/', {
    headers: { authorization: authHeader('spatial', 'nope') },
  }),
);
assert(res.headers.get('x-middleware-next') === '1', 'public path continues even without matching password');

res = await middleware(
  new Request('https://theartistbungalow.com/business', {
    headers: { authorization: authHeader('spatial', 'test-only-local-password') },
  }),
);
assert(res.headers.get('x-middleware-next') === '1', 'matching username and password continue');

assert(
  credentialsMatch(parseBasicAuth(authHeader('spatial', 'test-only-local-password')), {
    BUSINESS_BOOK_PASSWORD: 'test-only-local-password',
    BUSINESS_BOOK_USERNAME: 'spatial',
  }).ok,
  'credentialsMatch accepts matching pair',
);

if (savedPass === undefined) delete process.env.BUSINESS_BOOK_PASSWORD;
else process.env.BUSINESS_BOOK_PASSWORD = savedPass;
if (savedUser === undefined) delete process.env.BUSINESS_BOOK_USERNAME;
else process.env.BUSINESS_BOOK_USERNAME = savedUser;

const pdf = buildBusinessBookPdf();
const pdfText = pdf.toString('latin1');
assert(pdfText.startsWith('%PDF-1.4'), 'PDF header');
assert(pdfText.includes('%%EOF'), 'PDF EOF');
assert(pdfText.includes('XSTR-25-0107'), 'PDF includes STR number');
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
  'Spatial Escapes LLC',
  'Not recorded in this book',
  'XSTR-25-0107',
  '2026-09-08',
  'One-time registration',
  'Michelle Mesina',
  'Rentals@lapd.online',
  '(213) 996-1245',
  'd3e4b63b-65ea-4ec6-8d3a-5124d2a4f543',
  'authority-to-operate.pdf',
  'rho-compliance-registration-application.pdf',
  '2026-09-03-outbound-application-email.pdf',
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

assert(BOOK.entities.ein.includes('Do not invent'), 'content marks EIN unknown');

if (failed) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log('\nAll business book checks passed');
