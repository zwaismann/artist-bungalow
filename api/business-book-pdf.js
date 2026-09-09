import { buildBusinessBookPdf } from '../business/build-pdf.js';

export function GET() {
  const pdf = buildBusinessBookPdf();
  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition':
        'attachment; filename="spatial-escapes-artist-bungalow-business-book.pdf"',
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
    },
  });
}

export default GET;
