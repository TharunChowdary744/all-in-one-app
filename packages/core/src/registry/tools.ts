import type { CategoryId, Platform, ToolDefinition } from './types';

const BOTH: Platform[] = ['web', 'mobile'];
const WEB: Platform[] = ['web'];

export const tools: ToolDefinition[] = [
  // Image
  {
    id: 'image-converter',
    name: 'Image Converter',
    description: 'Convert images between PNG, JPG and WEBP',
    category: 'image',
    icon: '🔄',
    keywords: ['png', 'jpg', 'jpeg', 'webp', 'format', 'convert', 'photo'],
    platforms: BOTH,
    featured: true,
  },
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    description: 'Resize and compress images to any size',
    category: 'image',
    icon: '📐',
    keywords: ['resize', 'compress', 'scale', 'width', 'height', 'shrink', 'quality'],
    platforms: BOTH,
    featured: true,
  },
  // PDF
  {
    id: 'images-to-pdf',
    name: 'Images to PDF',
    description: 'Combine photos and images into one PDF',
    category: 'pdf',
    icon: '🗂️',
    keywords: ['jpg to pdf', 'png to pdf', 'photo', 'scan', 'combine'],
    platforms: BOTH,
    featured: true,
  },
  {
    id: 'pdf-merge',
    name: 'Merge PDF',
    description: 'Join multiple PDF files into one',
    category: 'pdf',
    icon: '🧩',
    keywords: ['combine', 'join', 'merge', 'append'],
    platforms: WEB,
  },
  {
    id: 'pdf-split',
    name: 'Split PDF',
    description: 'Extract pages or page ranges from a PDF',
    category: 'pdf',
    icon: '✂️',
    keywords: ['extract', 'pages', 'range', 'split', 'separate'],
    platforms: WEB,
  },
  {
    id: 'pdf-to-images',
    name: 'PDF to Images',
    description: 'Render every PDF page as a PNG image',
    category: 'pdf',
    icon: '🖨️',
    keywords: ['pdf to png', 'pdf to jpg', 'render', 'pages', 'export'],
    platforms: WEB,
  },
  // Documents
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Convert PDF text into an editable DOCX file',
    category: 'document',
    icon: '📝',
    keywords: ['pdf to doc', 'pdf to docx', 'word', 'editable', 'extract text'],
    platforms: WEB,
    featured: true,
  },
  {
    id: 'word-to-html',
    name: 'Word to HTML / Text',
    description: 'Convert DOCX files to clean HTML or plain text',
    category: 'document',
    icon: '🌐',
    keywords: ['docx', 'doc to html', 'doc to text', 'word', 'extract'],
    platforms: WEB,
  },
  {
    id: 'markdown-to-html',
    name: 'Markdown to HTML',
    description: 'Preview Markdown and export it as HTML',
    category: 'document',
    icon: 'Ⓜ️',
    keywords: ['md', 'markdown', 'html', 'preview', 'readme'],
    platforms: BOTH,
    isNew: true,
  },
  {
    id: 'csv-json',
    name: 'CSV ⇄ JSON',
    description: 'Convert spreadsheets (CSV) to JSON and back',
    category: 'document',
    icon: '📊',
    keywords: ['csv', 'json', 'spreadsheet', 'table', 'excel'],
    platforms: BOTH,
  },
  // Text
  {
    id: 'word-counter',
    name: 'Word Counter',
    description: 'Count words, characters, sentences and reading time',
    category: 'text',
    icon: '🔢',
    keywords: ['count', 'characters', 'words', 'reading time', 'length'],
    platforms: BOTH,
  },
  {
    id: 'case-converter',
    name: 'Case Converter',
    description: 'UPPER, lower, Title, camelCase, snake_case and more',
    category: 'text',
    icon: '🔠',
    keywords: ['uppercase', 'lowercase', 'title', 'camel', 'snake', 'kebab', 'slug'],
    platforms: BOTH,
  },
  {
    id: 'text-cleaner',
    name: 'Text Cleaner',
    description: 'Trim spaces, remove duplicate lines, sort lines',
    category: 'text',
    icon: '🧹',
    keywords: ['trim', 'duplicate', 'sort', 'lines', 'whitespace', 'clean'],
    platforms: BOTH,
  },
  // Developer
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Validate, beautify and minify JSON',
    category: 'developer',
    icon: '🧾',
    keywords: ['json', 'pretty', 'minify', 'validate', 'beautify'],
    platforms: BOTH,
    featured: true,
  },
  {
    id: 'base64',
    name: 'Base64 Encoder',
    description: 'Encode and decode Base64 text',
    category: 'developer',
    icon: '🔡',
    keywords: ['base64', 'encode', 'decode'],
    platforms: BOTH,
  },
  {
    id: 'url-encoder',
    name: 'URL Encoder',
    description: 'Percent-encode and decode URLs and query strings',
    category: 'developer',
    icon: '🔗',
    keywords: ['url', 'uri', 'percent', 'encode', 'decode', 'query'],
    platforms: BOTH,
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate random v4 UUIDs in bulk',
    category: 'developer',
    icon: '🆔',
    keywords: ['uuid', 'guid', 'id', 'random'],
    platforms: BOTH,
  },
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    description: 'Create QR codes for links, text and Wi-Fi',
    category: 'developer',
    icon: '🔳',
    keywords: ['qr', 'barcode', 'link', 'wifi', 'share'],
    platforms: BOTH,
    featured: true,
  },
  // Converters
  {
    id: 'unit-converter',
    name: 'Unit Converter',
    description: 'Length, weight, temperature, data, speed and more',
    category: 'converter',
    icon: '📏',
    keywords: ['length', 'weight', 'mass', 'temperature', 'celsius', 'km', 'miles', 'bytes'],
    platforms: BOTH,
    featured: true,
  },
  {
    id: 'color-converter',
    name: 'Color Converter',
    description: 'Convert HEX, RGB and HSL colors',
    category: 'converter',
    icon: '🎨',
    keywords: ['hex', 'rgb', 'hsl', 'color', 'colour', 'picker'],
    platforms: BOTH,
  },
  {
    id: 'timestamp-converter',
    name: 'Timestamp Converter',
    description: 'Convert Unix timestamps to dates and back',
    category: 'converter',
    icon: '⏱️',
    keywords: ['unix', 'epoch', 'date', 'time', 'iso'],
    platforms: BOTH,
  },
  // Security
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Create strong random passwords',
    category: 'security',
    icon: '🔑',
    keywords: ['password', 'random', 'secure', 'passphrase', 'strength'],
    platforms: BOTH,
    featured: true,
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    description: 'MD5, SHA-1, SHA-256 and SHA-512 checksums',
    category: 'security',
    icon: '#️⃣',
    keywords: ['md5', 'sha', 'sha256', 'checksum', 'hash', 'digest'],
    platforms: BOTH,
  },
];

const byId = new Map(tools.map((t) => [t.id, t]));

export function getTool(id: string): ToolDefinition | undefined {
  return byId.get(id);
}

export function isToolAvailable(tool: ToolDefinition, platform: Platform): boolean {
  return tool.platforms.includes(platform);
}

export function getToolsByCategory(category: CategoryId): ToolDefinition[] {
  return tools.filter((t) => t.category === category);
}

export function getFeaturedTools(): ToolDefinition[] {
  return tools.filter((t) => t.featured);
}

/**
 * Ranked search over name, description, category and keywords.
 * Every whitespace-separated term must match somewhere.
 */
export function searchTools(query: string, list: ToolDefinition[] = tools): ToolDefinition[] {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return list;

  const scored: { tool: ToolDefinition; score: number }[] = [];
  for (const tool of list) {
    const name = tool.name.toLowerCase();
    const haystack = [tool.description, tool.category, ...tool.keywords].join(' ').toLowerCase();
    let score = 0;
    let matchedAll = true;
    for (const term of terms) {
      if (name.startsWith(term)) score += 10;
      else if (name.includes(term)) score += 6;
      else if (haystack.includes(term)) score += 2;
      else {
        matchedAll = false;
        break;
      }
    }
    if (matchedAll) scored.push({ tool, score });
  }
  return scored.sort((a, b) => b.score - a.score).map((s) => s.tool);
}
