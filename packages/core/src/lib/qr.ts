import { create } from 'qrcode';

export type QrErrorCorrection = 'L' | 'M' | 'Q' | 'H';

/** Boolean module matrix (true = dark), rendered by each platform as SVG. */
export function createQrMatrix(text: string, errorCorrectionLevel: QrErrorCorrection = 'M'): boolean[][] {
  if (!text) throw new Error('Enter some text to encode');
  const qr = create(text, { errorCorrectionLevel });
  const { size, data } = qr.modules;
  return Array.from({ length: size }, (_, y) => Array.from({ length: size }, (_, x) => Boolean(data[y * size + x])));
}

/** Compact SVG path for the dark modules (one `h1v1h-1z` square per module). */
export function qrMatrixToPath(matrix: boolean[][], margin = 0): string {
  let d = '';
  matrix.forEach((row, y) =>
    row.forEach((dark, x) => {
      if (dark) d += `M${x + margin} ${y + margin}h1v1h-1z`;
    }),
  );
  return d;
}

export function qrToSvg(
  text: string,
  options: { ecl?: QrErrorCorrection; margin?: number; dark?: string; light?: string } = {},
): string {
  const { ecl = 'M', margin = 2, dark = '#000000', light = '#ffffff' } = options;
  const matrix = createQrMatrix(text, ecl);
  const size = matrix.length + margin * 2;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">` +
    `<rect width="${size}" height="${size}" fill="${light}"/>` +
    `<path d="${qrMatrixToPath(matrix, margin)}" fill="${dark}"/></svg>`
  );
}

export function wifiQrPayload(ssid: string, password: string, security: 'WPA' | 'WEP' | 'nopass' = 'WPA', hidden = false): string {
  const esc = (s: string) => s.replace(/([\;,:"])/g, '\\$1');
  return `WIFI:T:${security};S:${esc(ssid)};${security === 'nopass' ? '' : `P:${esc(password)};`}${hidden ? 'H:true;' : ''};`;
}
