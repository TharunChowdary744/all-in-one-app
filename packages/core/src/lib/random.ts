type RandomSource = (bytes: Uint8Array) => Uint8Array;

let source: RandomSource | null = null;

/**
 * Override the CSPRNG. The mobile app wires this to `expo-crypto` because
 * Hermes does not guarantee `crypto.getRandomValues`.
 */
export function setRandomSource(fn: RandomSource): void {
  source = fn;
}

export function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  if (source) return source(bytes);
  const c = (globalThis as { crypto?: { getRandomValues?: (b: Uint8Array) => Uint8Array } }).crypto;
  if (!c?.getRandomValues) throw new Error('No secure random source available');
  return c.getRandomValues(bytes);
}

/** Unbiased integer in [0, max). */
export function randomInt(max: number): number {
  if (max <= 0 || max > 2 ** 32) throw new RangeError('max must be in (0, 2^32]');
  const limit = Math.floor(2 ** 32 / max) * max;
  for (;;) {
    const b = randomBytes(4);
    const n = ((b[0]! << 24) | (b[1]! << 16) | (b[2]! << 8) | b[3]!) >>> 0;
    if (n < limit) return n % max;
  }
}

export function uuidv4(): string {
  const b = randomBytes(16);
  b[6] = (b[6]! & 0x0f) | 0x40;
  b[8] = (b[8]! & 0x3f) | 0x80;
  const hex = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export interface PasswordOptions {
  length: number;
  lowercase: boolean;
  uppercase: boolean;
  numbers: boolean;
  symbols: boolean;
  /** Skip look-alike characters such as l, 1, I, O and 0. */
  excludeAmbiguous: boolean;
}

export const defaultPasswordOptions: PasswordOptions = {
  length: 16,
  lowercase: true,
  uppercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: false,
};

const SETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>?/~',
};
const AMBIGUOUS = /[il1Lo0O|]/g;

export function generatePassword(options: PasswordOptions): string {
  const pools = (Object.keys(SETS) as (keyof typeof SETS)[])
    .filter((k) => options[k])
    .map((k) => (options.excludeAmbiguous ? SETS[k].replace(AMBIGUOUS, '') : SETS[k]));
  if (pools.length === 0) throw new Error('Select at least one character set');
  const length = Math.max(pools.length, Math.min(256, Math.floor(options.length)));
  const all = pools.join('');

  // Guarantee one character from every selected set, then fill and shuffle.
  const chars = pools.map((p) => p[randomInt(p.length)]!);
  while (chars.length < length) chars.push(all[randomInt(all.length)]!);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j]!, chars[i]!];
  }
  return chars.join('');
}

export type Strength = 'very weak' | 'weak' | 'fair' | 'strong' | 'very strong';

/** Entropy estimate based on the character classes present in the password. */
export function passwordStrength(password: string): { bits: number; label: Strength; score: 0 | 1 | 2 | 3 | 4 } {
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/\d/.test(password)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(password)) pool += 32;
  const bits = password.length && pool ? Math.round(password.length * Math.log2(pool)) : 0;
  const score = bits < 28 ? 0 : bits < 40 ? 1 : bits < 60 ? 2 : bits < 90 ? 3 : 4;
  const labels: Strength[] = ['very weak', 'weak', 'fair', 'strong', 'very strong'];
  return { bits, label: labels[score]!, score };
}
