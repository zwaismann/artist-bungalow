/**
 * Minimal multi-page PDF writer (WinAnsi / Helvetica).
 * Used by the business-book download route. ASCII-only content.
 */

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN_X = 64;
const MARGIN_TOP = 72;
const MARGIN_BOTTOM = 64;

function escapePdf(text) {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrap(text, maxChars) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

function charsFor(size) {
  const width = PAGE_W - MARGIN_X * 2;
  return Math.max(24, Math.floor(width / (size * 0.5)));
}

export function buildPdfDocument(title, makeBlocks) {
  const blocks = makeBlocks({ wrap, charsFor });
  const pages = paginate(blocks);
  return assemble(title, pages);
}

function paginate(blocks) {
  const pages = [];
  let y = PAGE_H - MARGIN_TOP;
  let stream = [];

  const flush = () => {
    pages.push(stream);
    stream = [];
    y = PAGE_H - MARGIN_TOP;
  };

  const ensure = (need) => {
    if (y - need < MARGIN_BOTTOM) flush();
  };

  for (const block of blocks) {
    if (block.type === 'pagebreak') {
      flush();
      continue;
    }
    if (block.type === 'cover-rule') {
      ensure(16);
      stream.push(`0.77 0.60 0.24 RG 1.5 w ${MARGIN_X} ${y} m ${PAGE_W - MARGIN_X} ${y} l S`);
      y -= 28;
      continue;
    }
    if (block.type === 'spacer') {
      y -= block.size || 16;
      continue;
    }

    const size = block.size || 11;
    const leading = block.leading || size + 5;
    const lines = block.lines || [block.text || ''];
    ensure(leading * lines.length + (block.after || 8));

    const gray = block.gray ?? 0.1;
    stream.push('BT');
    stream.push(`/${block.font || 'F1'} ${size} Tf`);
    stream.push(`${gray} g`);
    stream.push(`${MARGIN_X} ${y} Td`);
    lines.forEach((line, i) => {
      if (i > 0) stream.push(`0 ${-leading} Td`);
      stream.push(`(${escapePdf(line)}) Tj`);
    });
    stream.push('ET');
    y -= leading * lines.length + (block.after || 8);
  }

  if (stream.length) pages.push(stream);
  if (!pages.length) pages.push([]);
  return pages;
}

function assemble(title, pageStreams) {
  const objects = [];
  const catalogId = 1;
  const pagesId = 2;
  const fontId = 3;
  const pageIds = pageStreams.map((_, i) => 4 + i * 2);
  const contentIds = pageStreams.map((_, i) => 5 + i * 2);

  objects[catalogId] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageStreams.length} >>`;
  objects[fontId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';

  pageStreams.forEach((ops, i) => {
    const pageId = pageIds[i];
    const contentId = contentIds[i];
    const header = [
      'BT',
      '/F1 8 Tf',
      '0.55 g',
      `${MARGIN_X} ${PAGE_H - 36} Td`,
      `(${escapePdf('Spatial Escapes  ·  Artist Bungalow  ·  Confidential')}) Tj`,
      'ET',
      '0.85 g 0.5 w',
      `${MARGIN_X} ${PAGE_H - 44} m ${PAGE_W - MARGIN_X} ${PAGE_H - 44} l S`,
    ];
    const footer = [
      'BT',
      '/F1 8 Tf',
      '0.55 g',
      `${MARGIN_X} 36 Td`,
      `(${escapePdf('Not for public distribution')}) Tj`,
      `${PAGE_W - MARGIN_X - 80} 0 Td`,
      `(${i + 1} / ${pageStreams.length}) Tj`,
      'ET',
    ];
    const stream = [...header, ...ops, ...footer].join('\n');
    objects[pageId] =
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] ` +
      `/Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontId} 0 R >> >> >>`;
    objects[contentId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });

  const maxId = Math.max(...Object.keys(objects).map(Number));
  let out = '%PDF-1.4\n';
  if (title) {
    out += `% ${title.replace(/[^\x20-\x7E]/g, '')}\n`;
  }
  const offsets = { 0: 0 };
  for (let id = 1; id <= maxId; id++) {
    if (!objects[id]) {
      objects[id] = '<< >>';
    }
    offsets[id] = Buffer.byteLength(out, 'latin1');
    out += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xrefPos = Buffer.byteLength(out, 'latin1');
  out += `xref\n0 ${maxId + 1}\n`;
  out += '0000000000 65535 f \n';
  for (let id = 1; id <= maxId; id++) {
    out += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
  }
  out += `trailer\n<< /Size ${maxId + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
  return Buffer.from(out, 'latin1');
}
