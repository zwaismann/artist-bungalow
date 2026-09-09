import { BOOK } from './content.js';
import { buildPdfDocument } from './pdf.js';

export function buildBusinessBookPdf(book = BOOK) {
  return buildPdfDocument('Spatial Escapes Artist Bungalow Business Book', ({ wrap, charsFor }) => {
    const kv = (label, value, size = 11) => [
      { type: 'text', font: 'F1', size: 8, gray: 0.45, text: label.toUpperCase(), after: 4, leading: 11 },
      {
        type: 'text',
        size,
        gray: 0.12,
        lines: wrap(value, charsFor(size)),
        after: 14,
        leading: size + 5,
      },
    ];

    const heading = (label, title) => [
      { type: 'spacer', size: 8 },
      { type: 'text', size: 8, gray: 0.55, text: label.toUpperCase(), after: 6, leading: 10 },
      { type: 'text', size: 18, gray: 0.08, text: title, after: 16, leading: 22 },
    ];

    return [
      { type: 'spacer', size: 48 },
      { type: 'text', size: 9, gray: 0.45, text: 'SPATIAL ESCAPES', after: 18, leading: 12 },
      { type: 'text', size: 28, gray: 0.08, lines: ['ARTIST BUNGALOW'], after: 10, leading: 32 },
      { type: 'text', size: 14, gray: 0.25, text: 'Confidential business book', after: 18, leading: 18 },
      { type: 'cover-rule' },
      { type: 'text', size: 11, gray: 0.2, lines: wrap(book.listingName, charsFor(11)), after: 8 },
      { type: 'text', size: 11, gray: 0.2, lines: wrap(book.address, charsFor(11)), after: 8 },
      { type: 'text', size: 10, gray: 0.4, text: `Last updated ${book.lastUpdated}`, after: 16 },
      { type: 'text', size: 9, gray: 0.4, lines: wrap(book.scopeNote, charsFor(9)), after: 12 },
      { type: 'pagebreak' },

      ...heading('01  Cover', 'Spatial Escapes · Artist Bungalow'),
      ...kv('Brand', book.brand),
      ...kv('Property', book.propertyName),
      ...kv('Document', book.confidentiality),
      ...kv('Public site', book.site),

      ...heading('02  Property', book.listingName),
      ...kv('Address', book.address),
      ...kv('AIN', book.ain),
      ...kv('Layout', book.bedrooms),
      ...kv('Airbnb listing ID', book.airbnbListingId),
      ...kv('Status', book.badges),
      ...kv('Website', book.site),
      ...kv('Instagram', book.instagram),

      ...heading('03  People', 'Host team'),
      ...kv('Host / applicant', book.people.hostApplicant),
      ...kv('Co-host', book.people.coHost),
      ...kv('Guest-facing voice', book.people.guestFacingVoice),

      ...heading('04  Business / tax IDs', 'Entities on file'),
      ...kv('LAPD applicant business', book.entities.lapdApplicant),
      ...kv('BTRC No.', book.entities.btrc),
      ...kv('BTRC portal Request ID', book.entities.btrcRequestId),
      ...kv('Current HSR', `${book.entities.hsr} (HostCompliance style ${book.entities.hsrHostCompliance})`),
      ...kv('Prior HSR (historical only)', `${book.entities.hsrPrior}. ${book.entities.hsrPriorNote}`),
      ...kv('Holdings', book.entities.holdings),
      ...kv('EIN', book.entities.ein),

      ...heading('05  STR / LAPD', 'Short-term rental registration'),
      ...kv('Updated Authority to Operate', `${book.str.authorityIssued}. ${book.str.authorityNote}`),
      ...kv('First Authority to Operate', `${book.str.firstAuthorityIssued}. ${book.str.firstAuthorityNote}`),
      ...kv('RHO', book.str.rho),
      ...kv('RHO payment', `${book.str.rhoPayment}. ${book.str.rhoPaymentNote}`),
      ...kv('Compliance', book.str.mesina),
      ...kv('LAPD info line', book.str.lapdInfoLine),

      ...heading('06  Platforms', 'Where the listing lives'),
      ...kv('Airbnb', `${book.platforms.airbnb} · listing ${book.airbnbListingId}`),
      ...kv('Hospitable property ID', book.platforms.hospitableId),
      ...kv('Public site', book.platforms.publicSite),
      ...kv('Instagram', book.platforms.instagram),

      ...heading('07  Document vault', 'Registration and email PDF backups'),
      {
        type: 'text',
        size: 10,
        gray: 0.3,
        lines: wrap(
          'Place files in /business-book/ using these names. Real PDFs may be added in a follow-up.',
          charsFor(10),
        ),
        after: 12,
      },
      ...book.vault.flatMap((item) => kv(item.title, `${item.filename} - ${item.note}`)),

      ...heading('08  Change log', 'Recorded updates'),
      ...book.changelog.flatMap((item) => kv(item.date, item.entry)),
    ];
  });
}
