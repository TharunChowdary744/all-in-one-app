import { useEffect, useRef, useState } from 'react';

import { FileDrop } from '../components/FileDrop';
import { FileOrderList } from '../components/FileOrderList';
import { Alert, Card, Field, Segmented, Spinner } from '../components/ui';
import { downloadBlob, errorMessage } from '../lib/files';
import { loadImage, renderImage } from '../lib/image';
import { useAppState } from '../state/AppState';

type PageSize = 'fit' | 'a4' | 'letter';
type Orientation = 'portrait' | 'landscape';

const SIZES: Record<Exclude<PageSize, 'fit'>, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
};

interface Item {
  file: File;
  url: string;
}

export default function ImagesToPdf() {
  const [items, setItems] = useState<Item[]>([]);
  const [size, setSize] = useState<PageSize>('a4');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [margin, setMargin] = useState(24);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { recordFiles } = useAppState();
  const urls = useRef<string[]>([]);
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const add = (files: File[]) =>
    setItems((prev) => [
      ...prev,
      ...files.map((file) => {
        const url = URL.createObjectURL(file);
        urls.current.push(url);
        return { file, url };
      }),
    ]);

  const build = async () => {
    setBusy(true);
    setError('');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const pdf = await PDFDocument.create();
      for (const { file } of items) {
        // pdf-lib embeds JPG and PNG only; everything else is re-encoded first.
        let bytes = new Uint8Array(await file.arrayBuffer());
        let kind: 'jpg' | 'png' = file.type === 'image/png' ? 'png' : 'jpg';
        if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
          const png = await renderImage(await loadImage(file), { format: 'image/png', quality: 1 });
          bytes = new Uint8Array(await png.arrayBuffer());
          kind = 'png';
        }
        const image = kind === 'png' ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);

        let [pw, ph] = size === 'fit' ? [image.width + margin * 2, image.height + margin * 2] : SIZES[size];
        if (size !== 'fit' && orientation === 'landscape') [pw, ph] = [ph, pw];
        const page = pdf.addPage([pw, ph]);
        const scale = Math.min((pw - margin * 2) / image.width, (ph - margin * 2) / image.height, size === 'fit' ? 1 : Infinity);
        const w = image.width * scale;
        const h = image.height * scale;
        page.drawImage(image, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h });
      }
      const out = await pdf.save();
      downloadBlob(new Blob([out as Uint8Array<ArrayBuffer>], { type: 'application/pdf' }), 'images.pdf');
      recordFiles(items.length);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="tool-layout">
      <Card title="1. Add images">
        <FileDrop accept="image/*" multiple onFiles={add} hint="Each image becomes one page. Reorder below." />
        {items.length > 0 && (
          <FileOrderList items={items} onChange={setItems} getKey={(i) => i.url} renderThumb={(i) => <img src={i.url} alt="" className="thumb" />} />
        )}
      </Card>
      <Card title="2. Page setup">
        <div className="form-row">
          <Field label="Page size">
            <Segmented value={size} onChange={setSize} options={[{ value: 'a4', label: 'A4' }, { value: 'letter', label: 'Letter' }, { value: 'fit', label: 'Fit image' }]} />
          </Field>
          {size !== 'fit' && (
            <Field label="Orientation">
              <Segmented value={orientation} onChange={setOrientation} options={[{ value: 'portrait', label: 'Portrait' }, { value: 'landscape', label: 'Landscape' }]} />
            </Field>
          )}
          <Field label={`Margin: ${margin}pt`}>
            <input type="range" min={0} max={72} value={margin} onChange={(e) => setMargin(Number(e.target.value))} />
          </Field>
        </div>
        <Alert>{error}</Alert>
        <div className="actions">
          <button type="button" className="btn btn-primary" disabled={!items.length || busy} onClick={build}>
            {busy ? <Spinner /> : '🗂️'} Create PDF ({items.length} page{items.length === 1 ? '' : 's'})
          </button>
        </div>
      </Card>
    </div>
  );
}
