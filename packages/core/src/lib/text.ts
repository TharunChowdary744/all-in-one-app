export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  /** Minutes at ~225 words per minute, rounded up (0 for empty text). */
  readingTimeMinutes: number;
  /** Minutes at ~150 words per minute, rounded up (0 for empty text). */
  speakingTimeMinutes: number;
}

export function analyzeText(text: string): TextStats {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  return {
    characters: [...text].length,
    charactersNoSpaces: [...text.replace(/\s/g, '')].length,
    words,
    sentences: trimmed ? (trimmed.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? []).filter((s) => s.trim()).length : 0,
    paragraphs: trimmed ? trimmed.split(/\n\s*\n/).filter((p) => p.trim()).length : 0,
    lines: text ? text.split(/\r\n|\r|\n/).length : 0,
    readingTimeMinutes: Math.ceil(words / 225),
    speakingTimeMinutes: Math.ceil(words / 150),
  };
}

export type CaseStyle =
  | 'upper'
  | 'lower'
  | 'title'
  | 'sentence'
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'kebab'
  | 'constant'
  | 'alternating'
  | 'inverse';

export const caseStyles: { id: CaseStyle; label: string }[] = [
  { id: 'upper', label: 'UPPER CASE' },
  { id: 'lower', label: 'lower case' },
  { id: 'title', label: 'Title Case' },
  { id: 'sentence', label: 'Sentence case' },
  { id: 'camel', label: 'camelCase' },
  { id: 'pascal', label: 'PascalCase' },
  { id: 'snake', label: 'snake_case' },
  { id: 'kebab', label: 'kebab-case' },
  { id: 'constant', label: 'CONSTANT_CASE' },
  { id: 'alternating', label: 'aLtErNaTiNg' },
  { id: 'inverse', label: 'iNVERSE' },
];

/** Split identifiers and prose into lowercase words ("helloWorld-foo_bar" → hello, world, foo, bar). */
export function splitWords(text: string): string[] {
  return text
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

const capitalize = (w: string) => (w ? w[0]!.toUpperCase() + w.slice(1) : w);

export function convertCase(text: string, style: CaseStyle): string {
  switch (style) {
    case 'upper':
      return text.toUpperCase();
    case 'lower':
      return text.toLowerCase();
    case 'title':
      return text.toLowerCase().replace(/(^|[\s\-_/([{"'])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase());
    case 'sentence':
      return text.toLowerCase().replace(/(^\s*|[.!?]\s+)(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase());
    case 'camel': {
      const [first = '', ...rest] = splitWords(text);
      return first + rest.map(capitalize).join('');
    }
    case 'pascal':
      return splitWords(text).map(capitalize).join('');
    case 'snake':
      return splitWords(text).join('_');
    case 'kebab':
      return splitWords(text).join('-');
    case 'constant':
      return splitWords(text).join('_').toUpperCase();
    case 'alternating': {
      let i = 0;
      return [...text]
        .map((ch) => {
          if (!/\p{L}/u.test(ch)) return ch;
          return i++ % 2 === 0 ? ch.toLowerCase() : ch.toUpperCase();
        })
        .join('');
    }
    case 'inverse':
      return [...text]
        .map((ch) => (ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase()))
        .join('');
  }
}

export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface CleanOptions {
  trimLines?: boolean;
  collapseSpaces?: boolean;
  removeEmptyLines?: boolean;
  removeDuplicateLines?: boolean;
  sort?: 'none' | 'asc' | 'desc';
}

export function cleanText(text: string, options: CleanOptions): string {
  let lines = text.split(/\r\n|\r|\n/);
  if (options.collapseSpaces) lines = lines.map((l) => l.replace(/[ \t]+/g, ' '));
  if (options.trimLines) lines = lines.map((l) => l.trim());
  if (options.removeEmptyLines) lines = lines.filter((l) => l.trim() !== '');
  if (options.removeDuplicateLines) lines = [...new Set(lines)];
  if (options.sort === 'asc') lines = [...lines].sort((a, b) => a.localeCompare(b));
  if (options.sort === 'desc') lines = [...lines].sort((a, b) => b.localeCompare(a));
  return lines.join('\n');
}
