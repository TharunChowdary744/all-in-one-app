import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/** Write text to a cache file and open the native share sheet (save to Files, AirDrop, email…). */
export async function shareText(text: string, filename: string, mimeType = 'text/plain'): Promise<void> {
  const file = new File(Paths.cache, filename);
  if (file.exists) file.delete();
  file.create();
  file.write(text);
  await shareUri(file.uri, mimeType);
}

/** Write base64 bytes (e.g. a PNG) to a cache file and share it. */
export async function shareBase64(base64: string, filename: string, mimeType: string): Promise<void> {
  const file = new File(Paths.cache, filename);
  if (file.exists) file.delete();
  file.create();
  file.write(base64, { encoding: 'base64' });
  await shareUri(file.uri, mimeType);
}

export async function shareUri(uri: string, mimeType?: string): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is not available on this device');
  await Sharing.shareAsync(uri, mimeType ? { mimeType } : undefined);
}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}
