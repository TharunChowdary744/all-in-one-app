const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const B64_LOOKUP = new Map([...B64].map((c, i) => [c, i]));

// Pure-JS UTF-8 so behaviour is identical on web and Hermes (React Native).
export function utf8Encode(text: string): Uint8Array {
  const out: number[] = [];
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (cp < 0x80) out.push(cp);
    else if (cp < 0x800) out.push(0xc0 | (cp >> 6), 0x80 | (cp & 63));
    else if (cp < 0x10000) out.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
    else out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 63), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
  }
  return new Uint8Array(out);
}

/** Strict UTF-8 decoder; throws on malformed input. */
export function utf8Decode(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; ) {
    const b0 = bytes[i]!;
    let cp: number;
    let extra: number;
    if (b0 < 0x80) [cp, extra] = [b0, 0];
    else if (b0 >= 0xc2 && b0 < 0xe0) [cp, extra] = [b0 & 31, 1];
    else if (b0 >= 0xe0 && b0 < 0xf0) [cp, extra] = [b0 & 15, 2];
    else if (b0 >= 0xf0 && b0 < 0xf5) [cp, extra] = [b0 & 7, 3];
    else throw new Error('Decoded data is not valid UTF-8 text');
    for (let j = 1; j <= extra; j++) {
      const b = bytes[i + j];
      if (b === undefined || (b & 0xc0) !== 0x80) throw new Error('Decoded data is not valid UTF-8 text');
      cp = (cp << 6) | (b & 63);
    }
    if ((extra === 2 && cp < 0x800) || (extra === 3 && (cp < 0x10000 || cp > 0x10ffff)) || (cp >= 0xd800 && cp <= 0xdfff)) {
      throw new Error('Decoded data is not valid UTF-8 text');
    }
    out += String.fromCodePoint(cp);
    i += extra + 1;
  }
  return out;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i]!;
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    out += B64[b0 >> 2];
    out += B64[((b0 & 3) << 4) | ((b1 ?? 0) >> 4)];
    out += b1 === undefined ? '=' : B64[((b1 & 15) << 2) | ((b2 ?? 0) >> 6)];
    out += b2 === undefined ? '=' : B64[b2 & 63];
  }
  return out;
}

export function base64ToBytes(input: string): Uint8Array {
  const clean = input.replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, '');
  if (clean.length % 4 === 1) throw new Error('Invalid Base64 length');
  const out: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const ch of clean) {
    const value = B64_LOOKUP.get(ch);
    if (value === undefined) throw new Error(`Invalid Base64 character: "${ch}"`);
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out.push((buffer >> bits) & 0xff);
    }
  }
  return new Uint8Array(out);
}

export function encodeBase64(text: string, urlSafe = false): string {
  const b64 = bytesToBase64(utf8Encode(text));
  return urlSafe ? b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : b64;
}

export function decodeBase64(input: string): string {
  return utf8Decode(base64ToBytes(input));
}

export function encodeUrl(text: string, mode: 'component' | 'full' = 'component'): string {
  return mode === 'full' ? encodeURI(text) : encodeURIComponent(text);
}

export function decodeUrl(text: string): string {
  try {
    return decodeURIComponent(text.replace(/\+/g, ' '));
  } catch {
    throw new Error('Malformed percent-encoding');
  }
}
