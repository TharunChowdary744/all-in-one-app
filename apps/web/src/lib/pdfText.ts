import type { TextItem } from 'pdfjs-dist/types/src/display/api';

import { openPdf } from './pdfjs';

export interface ExtractedParagraph {
  text: string;
  /** Average font size in PDF points. */
  fontSize: number;
  heading: boolean;
}

export interface ExtractedPage {
  paragraphs: ExtractedParagraph[];
}

interface Line {
  y: number;
  x: number;
  size: number;
  text: string;
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)]!;
}

/** Group positioned text runs into lines (same baseline) ordered top-to-bottom. */
function toLines(items: TextItem[]): Line[] {
  const runs = items
    .filter((i) => i.str.trim() !== '' || i.str === ' ')
    .map((i) => ({ x: i.transform[4] as number, y: i.transform[5] as number, size: Math.abs(i.transform[3] as number) || i.height, w: i.width, str: i.str }))
    .sort((a, b) => b.y - a.y || a.x - b.x);

  const lines: (Line & { end: number; sizes: number[] })[] = [];
  for (const r of runs) {
    const line = lines.find((l) => Math.abs(l.y - r.y) < Math.max(2, r.size * 0.45));
    if (!line) {
      lines.push({ y: r.y, x: r.x, size: r.size, text: r.str, end: r.x + r.w, sizes: [r.size] });
      continue;
    }
    const gap = r.x - line.end;
    const needsSpace = gap > r.size * 0.15 && !line.text.endsWith(' ') && !r.str.startsWith(' ');
    line.text += (needsSpace ? ' ' : '') + r.str;
    line.end = Math.max(line.end, r.x + r.w);
    line.sizes.push(r.size);
  }
  return lines
    .map((l) => ({ y: l.y, x: l.x, size: median(l.sizes), text: l.text.replace(/\s+/g, ' ').trim() }))
    .filter((l) => l.text)
    .sort((a, b) => b.y - a.y);
}

function toParagraphs(lines: Line[], bodySize: number): ExtractedParagraph[] {
  const paragraphs: ExtractedParagraph[] = [];
  let current: { lines: Line[] } | null = null;
  let prev: Line | null = null;

  const flush = () => {
    if (!current) return;
    const text = current.lines.reduce((acc, l) => {
      if (!acc) return l.text;
      // Re-join words hyphenated across a line break.
      return /\w-$/.test(acc) ? acc.slice(0, -1) + l.text : `${acc} ${l.text}`;
    }, '');
    const fontSize = median(current.lines.map((l) => l.size));
    paragraphs.push({ text, fontSize, heading: fontSize >= bodySize * 1.2 && text.length < 160 });
    current = null;
  };

  for (const line of lines) {
    if (prev && current) {
      const gap = prev.y - line.y;
      const sizeChanged = Math.abs(line.size - prev.size) > bodySize * 0.15;
      if (gap > Math.max(line.size, prev.size) * 1.6 || sizeChanged) flush();
    }
    if (!current) current = { lines: [] };
    current.lines.push(line);
    prev = line;
  }
  flush();
  return paragraphs;
}

export async function extractPdfText(file: Blob, onProgress?: (done: number, total: number) => void): Promise<ExtractedPage[]> {
  const { pdf, close } = await openPdf(file);
  const pageLines: Line[][] = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const content = await page.getTextContent();
    pageLines.push(toLines(content.items.filter((i): i is TextItem => 'str' in i)));
    onProgress?.(n, pdf.numPages);
  }
  await close();
  const bodySize = median(pageLines.flat().map((l) => l.size)) || 11;
  return pageLines.map((lines) => ({ paragraphs: toParagraphs(lines, bodySize) }));
}
