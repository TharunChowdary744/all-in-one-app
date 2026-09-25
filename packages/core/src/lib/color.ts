export interface Rgb {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface Hsl {
  h: number;
  s: number;
  l: number;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function hexToRgb(hex: string): Rgb | null {
  const m = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1]!;
  if (h.length <= 4) h = [...h].map((c) => c + c).join('');
  const rgb: Rgb = {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
  if (h.length === 8) rgb.a = Math.round((parseInt(h.slice(6, 8), 16) / 255) * 100) / 100;
  return rgb;
}

export function rgbToHex({ r, g, b }: Rgb): string {
  return '#' + [r, g, b].map((n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0')).join('');
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const sn = clamp(s, 0, 100) / 100;
  const ln = clamp(l, 0, 100) / 100;
  const k = (n: number) => (n + ((h % 360) + 360) / 30) % 12;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => ln - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255) };
}

/** Parse "#fff", "rgb(1, 2, 3)", "hsl(120 50% 50%)" or "12, 34, 56". */
export function parseColor(input: string): Rgb | null {
  const text = input.trim().toLowerCase();
  const hex = hexToRgb(text);
  if (hex) return hex;
  const nums = text.match(/-?\d+(\.\d+)?/g)?.map(Number);
  if (!nums || nums.length < 3) return null;
  const [a, b, c] = nums as [number, number, number];
  if (text.startsWith('hsl')) return hslToRgb({ h: a, s: b, l: c });
  if ([a, b, c].some((n) => n < 0 || n > 255)) return null;
  return { r: a, g: b, b: c };
}

export function formatRgb({ r, g, b }: Rgb): string {
  return `rgb(${r}, ${g}, ${b})`;
}

export function formatHsl({ h, s, l }: Hsl): string {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

/** WCAG relative luminance, used to pick readable text on a swatch. */
export function luminance({ r, g, b }: Rgb): number {
  const ch = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

export function readableTextColor(bg: Rgb): '#000000' | '#ffffff' {
  return contrastRatio(bg, { r: 0, g: 0, b: 0 }) >= contrastRatio(bg, { r: 255, g: 255, b: 255 }) ? '#000000' : '#ffffff';
}

/** Tints and shades from dark to light, useful for palettes. */
export function colorScale(base: Rgb, steps = 9): string[] {
  const { h, s } = rgbToHsl(base);
  return Array.from({ length: steps }, (_, i) => rgbToHex(hslToRgb({ h, s, l: Math.round(10 + (80 * i) / (steps - 1)) })));
}
