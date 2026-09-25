import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

export interface PickedImage {
  uri: string;
  name: string;
  width: number;
  height: number;
  size: number;
}

export const outputFormats = [
  { format: SaveFormat.JPEG, label: 'JPG', ext: 'jpg', mime: 'image/jpeg' },
  { format: SaveFormat.PNG, label: 'PNG', ext: 'png', mime: 'image/png' },
  { format: SaveFormat.WEBP, label: 'WEBP', ext: 'webp', mime: 'image/webp' },
] as const;

export type OutputFormat = (typeof outputFormats)[number];

export function fileSize(uri: string): number {
  try {
    return new File(uri).size ?? 0;
  } catch {
    return 0;
  }
}

export async function pickImages(multiple: boolean): Promise<PickedImage[]> {
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: multiple,
    orderedSelection: true,
    quality: 1,
  });
  if (res.canceled) return [];
  return res.assets.map((a, i) => ({
    uri: a.uri,
    name: a.fileName ?? `image-${i + 1}.jpg`,
    width: a.width,
    height: a.height,
    size: a.fileSize ?? fileSize(a.uri),
  }));
}

export interface ProcessedImage {
  uri: string;
  width: number;
  height: number;
  size: number;
  base64?: string;
}

/** Resize (optional) and re-encode an image on-device. */
export async function processImage(
  uri: string,
  options: { format: SaveFormat; quality: number; width?: number; height?: number; base64?: boolean },
): Promise<ProcessedImage> {
  const ctx = ImageManipulator.manipulate(uri);
  if (options.width || options.height) ctx.resize({ width: options.width ?? null, height: options.height ?? null });
  const ref = await ctx.renderAsync();
  const saved = await ref.saveAsync({ format: options.format, compress: options.quality, base64: options.base64 });
  return { uri: saved.uri, width: saved.width, height: saved.height, size: fileSize(saved.uri), base64: saved.base64 };
}
