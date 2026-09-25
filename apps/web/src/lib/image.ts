export type ImageFormat = 'image/png' | 'image/jpeg' | 'image/webp';

export const imageFormats: { mime: ImageFormat; label: string; ext: string; lossy: boolean }[] = [
  { mime: 'image/png', label: 'PNG', ext: 'png', lossy: false },
  { mime: 'image/jpeg', label: 'JPG', ext: 'jpg', lossy: true },
  { mime: 'image/webp', label: 'WEBP', ext: 'webp', lossy: true },
];

export function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('This file could not be read as an image'));
    };
    img.src = url;
  });
}

export interface RenderOptions {
  format: ImageFormat;
  /** 0–1, used for lossy formats. */
  quality: number;
  width?: number;
  height?: number;
  /** Fill color for formats without transparency (JPG). */
  background?: string;
}

export async function renderImage(source: CanvasImageSource & { width: number; height: number }, options: RenderOptions): Promise<Blob> {
  const width = Math.max(1, Math.round(options.width ?? source.width));
  const height = Math.max(1, Math.round(options.height ?? source.height));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not supported in this browser');
  if (options.format === 'image/jpeg') {
    ctx.fillStyle = options.background ?? '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, width, height);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error('Encoding failed'));
        else if (blob.type !== options.format) reject(new Error(`Your browser cannot encode ${options.format}`));
        else resolve(blob);
      },
      options.format,
      options.quality,
    ),
  );
}
