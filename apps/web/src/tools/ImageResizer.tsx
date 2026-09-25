import { Download, Lock, LockOpen } from 'lucide-react';
import { formatBytes, replaceExtension } from '@omnikit/core';
import { useEffect, useState } from 'react';

import { FileDrop } from '../components/FileDrop';
import { Alert, Card, Field, Segmented, Spinner } from '../components/ui';
import { downloadBlob, errorMessage } from '../lib/files';
import { imageFormats, loadImage, renderImage, type ImageFormat } from '../lib/image';
import { useAppState } from '../state/AppState';

const PRESETS = [25, 50, 75, 100];

export default function ImageResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lock, setLock] = useState(true);
  const [format, setFormat] = useState<ImageFormat>('image/jpeg');
  const [quality, setQuality] = useState(0.8);
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { recordFiles } = useAppState();
  const target = imageFormats.find((f) => f.mime === format)!;

  useEffect(() => () => void (result && URL.revokeObjectURL(result.url)), [result]);

  const open = async (f: File) => {
    setError('');
    setResult(null);
    try {
      const image = await loadImage(f);
      setFile(f);
      setImg(image);
      setWidth(image.naturalWidth);
      setHeight(image.naturalHeight);
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  const ratio = img ? img.naturalWidth / img.naturalHeight : 1;
  const setW = (w: number) => {
    setWidth(w);
    if (lock) setHeight(Math.max(1, Math.round(w / ratio)));
  };
  const setH = (h: number) => {
    setHeight(h);
    if (lock) setWidth(Math.max(1, Math.round(h * ratio)));
  };

  const run = async () => {
    if (!img) return;
    setBusy(true);
    setError('');
    try {
      const blob = await renderImage(img, { format, quality, width, height });
      setResult({ blob, url: URL.createObjectURL(blob) });
      recordFiles(1);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="tool-layout">
      <Card title="1. Choose an image">
        <FileDrop accept="image/*" onFiles={([f]) => f && open(f)} hint={file ? `${file.name} · ${img?.naturalWidth}×${img?.naturalHeight} · ${formatBytes(file.size)}` : 'Any image your browser can display'} />
        <Alert>{error}</Alert>
      </Card>

      {img && (
        <Card title="2. Size & compression">
          <div className="form-row">
            <Field label="Width (px)">
              <input type="number" min={1} max={20000} value={width} onChange={(e) => setW(Number(e.target.value))} />
            </Field>
            <button type="button" className={`icon-btn lock ${lock ? 'active' : ''}`} onClick={() => setLock(!lock)} aria-pressed={lock} title="Lock aspect ratio">
              {lock ? <Lock size={15} /> : <LockOpen size={15} />}
            </button>
            <Field label="Height (px)">
              <input type="number" min={1} max={20000} value={height} onChange={(e) => setH(Number(e.target.value))} />
            </Field>
          </div>
          <div className="chips-row">
            {PRESETS.map((p) => (
              <button key={p} type="button" className="filter-chip" onClick={() => { setWidth(Math.round((img.naturalWidth * p) / 100)); setHeight(Math.round((img.naturalHeight * p) / 100)); }}>
                {p}%
              </button>
            ))}
          </div>
          <div className="form-row">
            <Field label="Format">
              <Segmented value={format} onChange={setFormat} options={imageFormats.map((f) => ({ value: f.mime, label: f.label }))} />
            </Field>
            {target.lossy && (
              <Field label={`Quality: ${Math.round(quality * 100)}%`} hint="Lower quality = smaller file">
                <input type="range" min={0.1} max={1} step={0.05} value={quality} onChange={(e) => setQuality(Number(e.target.value))} />
              </Field>
            )}
          </div>
          <div className="actions">
            <button type="button" className="btn btn-primary" onClick={run} disabled={busy || width < 1 || height < 1}>
              {busy && <Spinner />} Resize image
            </button>
          </div>
        </Card>
      )}

      {result && file && (
        <Card
          title="Result"
          actions={
            <button type="button" className="btn btn-primary btn-sm" onClick={() => downloadBlob(result.blob, replaceExtension(file.name, `${width}x${height}.${target.ext}`))}>
              <Download size={14} /> Download
            </button>
          }
        >
          <div className="compare">
            <div>
              <div className="muted">Before</div>
              <strong>{img!.naturalWidth}×{img!.naturalHeight}</strong> · {formatBytes(file.size)}
            </div>
            <div>
              <div className="muted">After</div>
              <strong>{width}×{height}</strong> · {formatBytes(result.blob.size)}{' '}
              <span className={result.blob.size <= file.size ? 'good' : 'bad'}>({Math.round((result.blob.size / file.size - 1) * 100)}%)</span>
            </div>
          </div>
          <img src={result.url} alt="Resized preview" className="preview-img" />
        </Card>
      )}
    </div>
  );
}
