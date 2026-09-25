import { formatBytes, replaceExtension } from '@omnikit/core';
import { useEffect, useRef, useState } from 'react';

import { FileDrop } from '../components/FileDrop';
import { Alert, Card, Field, Segmented, Spinner } from '../components/ui';
import { downloadBlob, errorMessage, zipAndDownload } from '../lib/files';
import { imageFormats, loadImage, renderImage, type ImageFormat } from '../lib/image';
import { useAppState } from '../state/AppState';

interface Item {
  file: File;
  preview: string;
  result?: { blob: Blob; name: string; url: string };
  error?: string;
}

export default function ImageConverter() {
  const [items, setItems] = useState<Item[]>([]);
  const [format, setFormat] = useState<ImageFormat>('image/webp');
  const [quality, setQuality] = useState(0.9);
  const [busy, setBusy] = useState(false);
  const { recordFiles } = useAppState();
  const target = imageFormats.find((f) => f.mime === format)!;

  // Object URLs are revoked when the tool unmounts.
  const urls = useRef<string[]>([]);
  const objectUrl = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    urls.current.push(url);
    return url;
  };
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const addFiles = (files: File[]) => setItems((prev) => [...prev, ...files.map((file) => ({ file, preview: objectUrl(file) }))]);

  const convertAll = async () => {
    setBusy(true);
    const next: Item[] = [];
    for (const item of items) {
      try {
        const img = await loadImage(item.file);
        const blob = await renderImage(img, { format, quality });
        next.push({ ...item, error: undefined, result: { blob, name: replaceExtension(item.file.name, target.ext), url: objectUrl(blob) } });
      } catch (e) {
        next.push({ ...item, result: undefined, error: errorMessage(e) });
      }
    }
    setItems(next);
    recordFiles(next.filter((i) => i.result).length);
    setBusy(false);
  };

  const done = items.filter((i) => i.result);

  return (
    <div className="tool-layout">
      <Card title="1. Choose images">
        <FileDrop accept="image/*" multiple onFiles={addFiles} hint="PNG, JPG, WEBP, GIF, BMP, SVG, AVIF… Batch conversion supported." />
      </Card>

      <Card title="2. Output settings">
        <div className="form-row">
          <Field label="Convert to">
            <Segmented value={format} onChange={setFormat} options={imageFormats.map((f) => ({ value: f.mime, label: f.label }))} />
          </Field>
          {target.lossy && (
            <Field label={`Quality: ${Math.round(quality * 100)}%`}>
              <input type="range" min={0.1} max={1} step={0.05} value={quality} onChange={(e) => setQuality(Number(e.target.value))} />
            </Field>
          )}
        </div>
        <div className="actions">
          <button type="button" className="btn btn-primary" disabled={!items.length || busy} onClick={convertAll}>
            {busy ? <Spinner /> : '⚡'} Convert {items.length || ''} image{items.length === 1 ? '' : 's'} to {target.label}
          </button>
          {done.length > 1 && (
            <button type="button" className="btn btn-outline" onClick={() => zipAndDownload(done.map((i) => i.result!), `converted-${target.ext}.zip`)}>
              ⬇️ Download all (.zip)
            </button>
          )}
          {items.length > 0 && (
            <button type="button" className="btn btn-ghost" onClick={() => setItems([])}>
              Clear
            </button>
          )}
        </div>
      </Card>

      {items.length > 0 && (
        <Card title={`Files (${items.length})`}>
          <ul className="file-list">
            {items.map((item, idx) => (
              <li key={item.preview} className="file-row">
                <img src={item.result?.url ?? item.preview} alt="" className="thumb" />
                <div className="file-info">
                  <div className="file-name">{item.result?.name ?? item.file.name}</div>
                  <div className="file-meta">
                    {formatBytes(item.file.size)}
                    {item.result && (
                      <>
                        {' → '}
                        <strong>{formatBytes(item.result.blob.size)}</strong>{' '}
                        <span className={item.result.blob.size <= item.file.size ? 'good' : 'bad'}>
                          ({Math.round((item.result.blob.size / item.file.size - 1) * 100)}%)
                        </span>
                      </>
                    )}
                  </div>
                  {item.error && <div className="bad">{item.error}</div>}
                </div>
                {item.result && (
                  <button type="button" className="btn btn-sm btn-primary" onClick={() => downloadBlob(item.result!.blob, item.result!.name)}>
                    Download
                  </button>
                )}
                <button type="button" className="icon-btn" aria-label="Remove" onClick={() => setItems((all) => all.filter((_, i) => i !== idx))}>
                  ✕
                </button>
              </li>
            ))}
          </ul>
          {done.length === 0 && <Alert kind="info">Press “Convert” to process the files above.</Alert>}
        </Card>
      )}
    </div>
  );
}
