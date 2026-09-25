import { Download } from 'lucide-react';
import { replaceExtension } from '@omnikit/core';
import { useEffect, useRef, useState } from 'react';

import { FileDrop } from '../components/FileDrop';
import { Alert, Card, Field, Segmented, Spinner } from '../components/ui';
import { downloadBlob, errorMessage, zipAndDownload } from '../lib/files';
import { openPdf } from '../lib/pdfjs';
import { useAppState } from '../state/AppState';

interface Rendered {
  name: string;
  blob: Blob;
  url: string;
}

export default function PdfToImages() {
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState(2);
  const [format, setFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
  const [images, setImages] = useState<Rendered[]>([]);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const { recordFiles } = useAppState();
  const urls = useRef<string[]>([]);
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const render = async () => {
    if (!file) return;
    setError('');
    setImages([]);
    try {
      const { pdf, close } = await openPdf(file);
      const out: Rendered[] = [];
      const ext = format === 'image/png' ? 'png' : 'jpg';
      for (let n = 1; n <= pdf.numPages; n++) {
        setProgress(`Rendering page ${n} of ${pdf.numPages}…`);
        const page = await pdf.getPage(n);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        await page.render({ canvas, viewport, background: '#ffffff' }).promise;
        const blob = await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('Encoding failed'))), format, 0.92));
        const url = URL.createObjectURL(blob);
        urls.current.push(url);
        out.push({ name: replaceExtension(file.name, `page-${n}.${ext}`), blob, url });
        setImages([...out]);
      }
      await close();
      recordFiles(1);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setProgress('');
    }
  };

  return (
    <div className="tool-layout">
      <Card title="1. Choose a PDF">
        <FileDrop accept="application/pdf,.pdf" onFiles={([f]) => { setFile(f ?? null); setImages([]); }} hint={file?.name} />
        <div className="form-row">
          <Field label="Format">
            <Segmented value={format} onChange={setFormat} options={[{ value: 'image/png', label: 'PNG' }, { value: 'image/jpeg', label: 'JPG' }]} />
          </Field>
          <Field label="Resolution">
            <Segmented value={scale} onChange={setScale} options={[{ value: 1, label: '72 dpi' }, { value: 2, label: '144 dpi' }, { value: 3, label: '216 dpi' }]} />
          </Field>
        </div>
        <Alert>{error}</Alert>
        <div className="actions">
          <button type="button" className="btn btn-primary" disabled={!file || !!progress} onClick={render}>
            {progress && <Spinner />} {progress || 'Convert to images'}
          </button>
          {images.length > 1 && !progress && (
            <button type="button" className="btn btn-outline" onClick={() => zipAndDownload(images, replaceExtension(file!.name, 'images.zip'))}>
              <Download size={14} /> Download all (.zip)
            </button>
          )}
        </div>
      </Card>
      {images.length > 0 && (
        <Card title={`Pages (${images.length})`}>
          <div className="thumb-grid">
            {images.map((img, i) => (
              <button key={img.url} type="button" className="thumb-tile" onClick={() => downloadBlob(img.blob, img.name)} title="Download">
                <img src={img.url} alt={`Page ${i + 1}`} />
                <span>Page {i + 1} <Download size={12} /></span>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
