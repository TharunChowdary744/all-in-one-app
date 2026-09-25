export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadText(text: string, filename: string, type = 'text/plain'): void {
  downloadBlob(new Blob([text], { type: `${type};charset=utf-8` }), filename);
}

export async function zipAndDownload(files: { name: string; blob: Blob }[], zipName: string): Promise<void> {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const used = new Set<string>();
  for (const f of files) {
    let name = f.name;
    for (let i = 1; used.has(name); i++) name = f.name.replace(/(\.[^.]*)?$/, `-${i}$1`);
    used.add(name);
    zip.file(name, f.blob);
  }
  downloadBlob(await zip.generateAsync({ type: 'blob' }), zipName);
}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}
