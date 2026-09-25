import { md5, sha1 } from '@noble/hashes/legacy.js';
import { sha256, sha384, sha512 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';

import { utf8Encode } from './encoding';

export type HashAlgorithm = 'md5' | 'sha1' | 'sha256' | 'sha384' | 'sha512';

export const hashAlgorithms: { id: HashAlgorithm; label: string }[] = [
  { id: 'md5', label: 'MD5' },
  { id: 'sha1', label: 'SHA-1' },
  { id: 'sha256', label: 'SHA-256' },
  { id: 'sha384', label: 'SHA-384' },
  { id: 'sha512', label: 'SHA-512' },
];

const fns = { md5, sha1, sha256, sha384, sha512 };

export function hashBytes(data: Uint8Array, algorithm: HashAlgorithm): string {
  return bytesToHex(fns[algorithm](data));
}

export function hashText(text: string, algorithm: HashAlgorithm): string {
  return hashBytes(utf8Encode(text), algorithm);
}
