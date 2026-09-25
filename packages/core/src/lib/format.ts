export function formatBytes(bytes: number, decimals = 1): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${Number.parseFloat((bytes / 1024 ** i).toFixed(i === 0 ? 0 : decimals))} ${units[i]}`;
}

/** Replace a file's extension (or append one). */
export function replaceExtension(filename: string, ext: string): string {
  const base = filename.replace(/\.[^./\\]+$/, '');
  return `${base || 'file'}.${ext.replace(/^\./, '')}`;
}

/**
 * Parse page selections like "1-3, 5, 8-" against a document of `total` pages.
 * Returns zero-based page indexes in the order given, without duplicates.
 */
export function parsePageRanges(input: string, total: number): number[] {
  const pages: number[] = [];
  const seen = new Set<number>();
  for (const raw of input.split(',')) {
    const part = raw.trim();
    if (!part) continue;
    const m = /^(\d*)\s*-\s*(\d*)$/.exec(part);
    let start: number;
    let end: number;
    if (m) {
      start = m[1] ? Number(m[1]) : 1;
      end = m[2] ? Number(m[2]) : total;
    } else if (/^\d+$/.test(part)) {
      start = end = Number(part);
    } else {
      throw new Error(`Invalid page range: "${part}"`);
    }
    if (start < 1 || end > total || start > end) {
      throw new Error(`Range "${part}" is outside 1–${total}`);
    }
    for (let p = start; p <= end; p++) {
      if (!seen.has(p)) {
        seen.add(p);
        pages.push(p - 1);
      }
    }
  }
  if (pages.length === 0) throw new Error('No pages selected');
  return pages;
}

/** Split a document into ranges, e.g. every 2 pages of 5 → [[0,1],[2,3],[4]]. */
export function chunkPages(total: number, size: number): number[][] {
  const chunks: number[][] = [];
  for (let i = 0; i < total; i += size) chunks.push(Array.from({ length: Math.min(size, total - i) }, (_, k) => i + k));
  return chunks;
}
