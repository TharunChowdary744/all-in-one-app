import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

/** Open a PDF; call `close()` when done to release the worker resources. */
export async function openPdf(file: Blob) {
  const data = new Uint8Array(await file.arrayBuffer());
  const task = pdfjs.getDocument({ data });
  const pdf = await task.promise;
  return { pdf, close: () => task.destroy() };
}

export { pdfjs };
