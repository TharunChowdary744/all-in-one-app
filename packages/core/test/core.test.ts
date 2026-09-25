import { describe, expect, it } from 'vitest';

import {
  analyzeText,
  categories,
  chunkPages,
  convertCase,
  convertUnit,
  createQrMatrix,
  csvToJson,
  decodeBase64,
  decodeUrl,
  encodeBase64,
  formatBytes,
  formatJson,
  formatNumber,
  getToolCode,
  generatePassword,
  hashText,
  hexToRgb,
  hslToRgb,
  jsonToCsv,
  markdownToHtml,
  minifyJson,
  parseColor,
  parsePageRanges,
  parseTimestamp,
  passwordStrength,
  replaceExtension,
  rgbToHex,
  rgbToHsl,
  searchTools,
  slugify,
  tools,
  uuidv4,
  cleanText,
  wifiQrPayload,
} from '../src';

describe('registry', () => {
  it('has unique tool ids that reference known categories', () => {
    const ids = tools.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    const categoryIds = new Set(categories.map((c) => c.id));
    for (const t of tools) {
      expect(categoryIds.has(t.category)).toBe(true);
      expect(t.platforms.length).toBeGreaterThan(0);
    }
  });

  it('numbers tools within their category', () => {
    expect(getToolCode(tools.find((t) => t.id === 'pdf-merge')!)).toBe('PDF-02');
    expect(getToolCode(tools[0]!)).toBe('IMG-01');
  });

  it('searches by name, keyword and multiple terms', () => {
    expect(searchTools('pdf to doc')[0]?.id).toBe('pdf-to-word');
    expect(searchTools('webp').map((t) => t.id)).toContain('image-converter');
    expect(searchTools('sha256').map((t) => t.id)).toEqual(['hash-generator']);
    expect(searchTools('zzzz')).toEqual([]);
    expect(searchTools('  ')).toHaveLength(tools.length);
  });
});

describe('text', () => {
  it('analyzes text', () => {
    const s = analyzeText('Hello world. How are you?\n\nFine!');
    expect(s.words).toBe(6);
    expect(s.sentences).toBe(3);
    expect(s.paragraphs).toBe(2);
    expect(s.lines).toBe(3);
    expect(analyzeText('').words).toBe(0);
  });

  it('converts case', () => {
    expect(convertCase('hello world-foo', 'camel')).toBe('helloWorldFoo');
    expect(convertCase('helloWorld fooBar', 'snake')).toBe('hello_world_foo_bar');
    expect(convertCase('XMLHttpRequest', 'kebab')).toBe('xml-http-request');
    expect(convertCase('the QUICK fox', 'title')).toBe('The Quick Fox');
    expect(convertCase('hi. there', 'sentence')).toBe('Hi. There');
    expect(convertCase('a b', 'constant')).toBe('A_B');
    expect(slugify('Héllo, Wörld!')).toBe('hello-world');
  });

  it('cleans text', () => {
    expect(cleanText(' b \n\na\n b ', { trimLines: true, removeEmptyLines: true, removeDuplicateLines: true, sort: 'asc' })).toBe('a\nb');
  });
});

describe('encoding', () => {
  it('round-trips unicode base64', () => {
    const text = 'héllo 👋 世界';
    expect(decodeBase64(encodeBase64(text))).toBe(text);
    expect(encodeBase64('hello')).toBe('aGVsbG8=');
    expect(encodeBase64('ÿÿ', true)).not.toMatch(/[+/=]/);
    expect(() => decodeBase64('***')).toThrow();
    expect(() => decodeBase64('/w==')).toThrow(/UTF-8/);
  });

  it('decodes urls', () => {
    expect(decodeUrl('a%20b+c')).toBe('a b c');
    expect(() => decodeUrl('%E0%A4%A')).toThrow();
  });
});

describe('json & csv', () => {
  it('formats and minifies', () => {
    const r = formatJson('{"b":1,"a":[1,2]}', { indent: 2, sortKeys: true });
    expect(r).toEqual({ ok: true, output: '{\n  "a": [\n    1,\n    2\n  ],\n  "b": 1\n}' });
    expect(minifyJson('{ "a" : 1 }')).toEqual({ ok: true, output: '{"a":1}' });
    const bad = formatJson('{"a":\n}');
    expect(bad.ok).toBe(false);
  });

  it('converts csv both ways', () => {
    const csv = 'name,age,note\nAda,36,"likes ""math"", logic"\nBob,,"multi\nline"';
    const json = csvToJson(csv);
    expect(json).toEqual([
      { name: 'Ada', age: 36, note: 'likes "math", logic' },
      { name: 'Bob', age: '', note: 'multi\nline' },
    ]);
    expect(csvToJson(jsonToCsv(json))).toEqual(json);
    expect(csvToJson('a;b\n1;2')).toEqual([{ a: 1, b: 2 }]);
  });
});

describe('units & colors', () => {
  it('converts units', () => {
    expect(convertUnit(1, 'length', 'mi', 'km')).toBeCloseTo(1.609344);
    expect(convertUnit(100, 'temperature', 'c', 'f')).toBeCloseTo(212);
    expect(convertUnit(0, 'temperature', 'k', 'c')).toBeCloseTo(-273.15);
    expect(convertUnit(1, 'data', 'gib', 'mib')).toBe(1024);
    expect(formatNumber(0.1 + 0.2)).toBe('0.3');
  });

  it('converts colors', () => {
    expect(hexToRgb('#0af')).toEqual({ r: 0, g: 170, b: 255 });
    expect(rgbToHex({ r: 255, g: 99, b: 71 })).toBe('#ff6347');
    expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 });
    expect(hslToRgb({ h: 120, s: 100, l: 25 })).toEqual({ r: 0, g: 128, b: 0 });
    expect(parseColor('rgb(1, 2, 3)')).toEqual({ r: 1, g: 2, b: 3 });
    expect(parseColor('hsl(0, 100%, 50%)')).toEqual({ r: 255, g: 0, b: 0 });
    expect(parseColor('nope')).toBeNull();
  });
});

describe('time', () => {
  it('parses seconds, milliseconds and ISO', () => {
    expect(parseTimestamp('0')?.toISOString()).toBe('1970-01-01T00:00:00.000Z');
    expect(parseTimestamp(1700000000)?.getTime()).toBe(1700000000000);
    expect(parseTimestamp('1700000000000')?.getTime()).toBe(1700000000000);
    expect(parseTimestamp('2024-01-01T00:00:00Z')?.getTime()).toBe(1704067200000);
    expect(parseTimestamp('not a date')).toBeNull();
  });
});

describe('random & hashing', () => {
  it('generates passwords with every selected set', () => {
    for (let i = 0; i < 20; i++) {
      const p = generatePassword({ length: 12, lowercase: true, uppercase: true, numbers: true, symbols: false, excludeAmbiguous: true });
      expect(p).toHaveLength(12);
      expect(p).toMatch(/[a-z]/);
      expect(p).toMatch(/[A-Z]/);
      expect(p).toMatch(/\d/);
      expect(p).not.toMatch(/[il1Lo0O]/);
    }
    expect(() => generatePassword({ length: 8, lowercase: false, uppercase: false, numbers: false, symbols: false, excludeAmbiguous: false })).toThrow();
    expect(passwordStrength('abc').score).toBe(0);
    expect(passwordStrength('aB3$aB3$aB3$aB3$aB3$').score).toBe(4);
  });

  it('generates v4 uuids', () => {
    expect(uuidv4()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('hashes text', () => {
    expect(hashText('abc', 'md5')).toBe('900150983cd24fb0d6963f7d28e17f72');
    expect(hashText('abc', 'sha1')).toBe('a9993e364706816aba3e25717850c26c9cd0d89d');
    expect(hashText('abc', 'sha256')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });
});

describe('qr, markdown, files', () => {
  it('creates a QR matrix', () => {
    const m = createQrMatrix('https://example.com');
    expect(m.length).toBeGreaterThanOrEqual(21);
    expect(m.every((row) => row.length === m.length)).toBe(true);
    expect(wifiQrPayload('My;Net', 'p:w')).toBe(String.raw`WIFI:T:WPA;S:My\;Net;P:p\:w;;`);
  });

  it('renders markdown', () => {
    expect(markdownToHtml('# Hi\n\n**bold**')).toContain('<h1>Hi</h1>');
  });

  it('handles files and page ranges', () => {
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(replaceExtension('photo.final.PNG', 'webp')).toBe('photo.final.webp');
    expect(parsePageRanges('1-3, 5, 2, 7-', 8)).toEqual([0, 1, 2, 4, 6, 7]);
    expect(() => parsePageRanges('9', 8)).toThrow();
    expect(chunkPages(5, 2)).toEqual([[0, 1], [2, 3], [4]]);
  });
});
