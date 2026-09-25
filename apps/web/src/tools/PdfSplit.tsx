import { chunkPages, parsePageRanges, replaceExtension } from '@omnikit/core';
import { useState } from 'react';
import type { PDFDocument as PDFDocumentType } from 'pdf-lib';

import { FileDrop } from '../components/FileDrop';
import { Alert, Card, Field, Segmented, Spinner } from '../components/ui';
import { downloadBlob, errorMessage, zipAndDownload } from '../lib/files';
import { useAppState } from '../state/AppState';

type Mode = 'extract' | 'every' | 'each';

export default function PdfSplit() {
  const [file, setFile] = useState<File | null>(null);
  const [doc, setDoc] = useState<PDFDocumentType | null>(null);
  const [mode, setMode] = useState<Mode>('extract');
  const [ranges, setRanges] = useState('1-2');
  const [every, setEvery] = useState(2);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { recordFiles } = useAppState();
  const total = doc?.getPageCount() ?? 0;

  const open = async (f: File) => {
    setError('');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const d = await PDFDocument.load(await f.arrayBuffer());
      setFile(f);
      setDoc(d);
      setRanges(`1-${Math.min(2, d.getPageCount())}`);
    } catch {
      setError('This PDF could not be opened (it may be encrypted or damaged).');
    }
  };

  const subset = async (indexes: number[]) => {
    const { PDFDocument } = await import('pdf-lib');
    const out = await PDFDocument.create();
    (await out.copyPages(doc!, indexes)).forEach((p) => out.addPage(p));
    return new Blob([(await out.save()) as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
  };

  const run = async () => {
    if (!doc || !file) return;
    setBusy(true);
    setError('');
    try {
      if (mode === 'extract') {
        const pages = parsePageRanges(ranges, total);
        downloadBlob(await subset(pages), replaceExtension(file.name, 'extract.pdf'));
      } else {
        const groups = mode === 'each' ? chunkPages(total, 1) : chunkPages(total, Math.max(1, every));
        const parts = [];
        for (const g of groups) {
          const label = g.length === 1 ? `page-${g[0]! + 1}` : `pages-${g[0]! + 1}-${g[g.length - 1]! + 1}`;
          parts.push({ name: replaceExtension(file.name, `${label}.pdf`), blob: await subset(g) });
        }
        await zipAndDownload(parts, replaceExtension(file.name, 'split.zip'));
      }
      recordFiles(1);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="tool-layout">
      <Card title="1. Choose a PDF">
        <FileDrop accept="application/pdf,.pdf" onFiles={([f]) => f && open(f)} hint={file ? `${file.name} · ${total} pages` : undefined} />
      </Card>
      {doc && (
        <Card title="2. How do you want to split it?">
          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: 'extract', label: 'Extract pages' },
              { value: 'every', label: 'Every N pages' },
              { value: 'each', label: 'One file per page' },
            ]}
          />
          <div className="form-row">
            {mode === 'extract' && (
              <Field label="Pages" hint={`e.g. 1-3, 5, 8- (document has ${total} pages)`}>
                <input value={ranges} onChange={(e) => setRanges(e.target.value)} />
              </Field>
            )}
            {mode === 'every' && (
              <Field label="Pages per file" hint={`Creates ${Math.ceil(total / Math.max(1, every))} files`}>
                <input type="number" min={1} max={total} value={every} onChange={(e) => setEvery(Number(e.target.value))} />
              </Field>
            )}
            {mode === 'each' && <p className="muted">Creates {total} single-page PDFs in a .zip file.</p>}
          </div>
          <Alert>{error}</Alert>
          <div className="actions">
            <button type="button" className="btn btn-primary" disabled={busy} onClick={run}>
              {busy ? <Spinner /> : '✂️'} Split PDF
            </button>
          </div>
        </Card>
      )}
      {!doc && <Alert>{error}</Alert>}
    </div>
  );
}
