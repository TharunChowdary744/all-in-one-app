import { FileText } from 'lucide-react';
import { useState } from 'react';

import { FileDrop } from '../components/FileDrop';
import { FileOrderList } from '../components/FileOrderList';
import { Alert, Card, Spinner } from '../components/ui';
import { downloadBlob, errorMessage } from '../lib/files';
import { useAppState } from '../state/AppState';

interface Item {
  file: File;
  key: string;
}

let seq = 0;

export default function PdfMerge() {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pages, setPages] = useState<number | null>(null);
  const { recordFiles } = useAppState();

  const merge = async () => {
    setBusy(true);
    setError('');
    try {
      const { PDFDocument } = await import('pdf-lib');
      const out = await PDFDocument.create();
      for (const { file } of items) {
        let src;
        try {
          src = await PDFDocument.load(await file.arrayBuffer());
        } catch {
          throw new Error(`“${file.name}” could not be opened (it may be encrypted or damaged)`);
        }
        const copied = await out.copyPages(src, src.getPageIndices());
        copied.forEach((p) => out.addPage(p));
      }
      setPages(out.getPageCount());
      const bytes = await out.save();
      downloadBlob(new Blob([bytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' }), 'merged.pdf');
      recordFiles(items.length);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="tool-layout">
      <Card title="Add PDFs in the order you want them merged">
        <FileDrop accept="application/pdf,.pdf" multiple onFiles={(files) => setItems((p) => [...p, ...files.map((file) => ({ file, key: String(seq++) }))])} />
        {items.length > 0 && <FileOrderList items={items} onChange={setItems} getKey={(i) => i.key} renderThumb={() => <span className="thumb thumb-icon"><FileText size={18} strokeWidth={1.6} /></span>} />}
        <Alert>{error}</Alert>
        {pages !== null && !error && <Alert kind="success">Merged into one PDF with {pages} pages.</Alert>}
        <div className="actions">
          <button type="button" className="btn btn-primary" disabled={items.length < 2 || busy} onClick={merge}>
            {busy && <Spinner />} Merge {items.length} PDFs
          </button>
          {items.length === 1 && <span className="muted">Add at least one more file.</span>}
        </div>
      </Card>
    </div>
  );
}
