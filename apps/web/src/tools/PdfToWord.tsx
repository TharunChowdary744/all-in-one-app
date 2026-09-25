import { Download } from 'lucide-react';
import { replaceExtension } from '@omnikit/core';
import { useState } from 'react';

import { FileDrop } from '../components/FileDrop';
import { Alert, Card, CopyButton, Spinner } from '../components/ui';
import { downloadBlob, downloadText, errorMessage } from '../lib/files';
import { extractPdfText, type ExtractedPage } from '../lib/pdfText';
import { useAppState } from '../state/AppState';

async function buildDocx(pages: ExtractedPage[], keepPageBreaks: boolean): Promise<Blob> {
  const { Document, HeadingLevel, Packer, Paragraph, TextRun } = await import('docx');
  const children = pages.flatMap((page, pi) =>
    page.paragraphs.map(
      (p, i) =>
        new Paragraph({
          pageBreakBefore: keepPageBreaks && pi > 0 && i === 0,
          heading: p.heading ? HeadingLevel.HEADING_2 : undefined,
          spacing: { after: 160 },
          children: [new TextRun({ text: p.text, size: p.heading ? undefined : 22 })],
        }),
    ),
  );
  const doc = new Document({
    creator: 'OmniKit',
    styles: { default: { document: { run: { font: 'Calibri' } } } },
    sections: [{ children: children.length ? children : [new Paragraph('')] }],
  });
  return Packer.toBlob(doc);
}

export default function PdfToWord() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<ExtractedPage[] | null>(null);
  const [progress, setProgress] = useState('');
  const [keepBreaks, setKeepBreaks] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { recordFiles } = useAppState();

  const plainText = pages?.map((p) => p.paragraphs.map((x) => x.text).join('\n\n')).join('\n\n\f\n\n') ?? '';
  const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;

  const open = async (f: File) => {
    setFile(f);
    setPages(null);
    setError('');
    setBusy(true);
    try {
      const result = await extractPdfText(f, (d, t) => setProgress(`Reading page ${d} of ${t}…`));
      setPages(result);
    } catch (e) {
      setError(errorMessage(e).includes('password') ? 'This PDF is password-protected.' : errorMessage(e));
    } finally {
      setBusy(false);
      setProgress('');
    }
  };

  const download = async () => {
    if (!pages || !file) return;
    setBusy(true);
    try {
      downloadBlob(await buildDocx(pages, keepBreaks), replaceExtension(file.name, 'docx'));
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
        <FileDrop accept="application/pdf,.pdf" onFiles={([f]) => f && open(f)} hint="Text, paragraphs and headings are detected and rebuilt as an editable Word document." />
        {busy && progress && (
          <div className="loading">
            <Spinner /> {progress}
          </div>
        )}
        <Alert>{error}</Alert>
      </Card>

      {pages && file && (
        <Card
          title={`2. Preview · ${pages.length} pages · ${wordCount.toLocaleString()} words`}
          actions={
            <>
              <CopyButton text={plainText} label="Copy text" />
              <button type="button" className="btn btn-outline btn-sm" onClick={() => downloadText(plainText, replaceExtension(file.name, 'txt'))}>
                .txt
              </button>
              <button type="button" className="btn btn-primary btn-sm" disabled={busy || wordCount === 0} onClick={download}>
                <Download size={14} /> Download .docx
              </button>
            </>
          }
        >
          <label className="checkbox">
            <input type="checkbox" checked={keepBreaks} onChange={(e) => setKeepBreaks(e.target.checked)} /> Keep original page breaks
          </label>
          {wordCount === 0 ? (
            <Alert kind="info">No selectable text was found. This PDF is probably a scanned image — try “PDF to Images” instead.</Alert>
          ) : (
            <div className="doc-preview">
              {pages.map((page, pi) => (
                <div key={pi} className="doc-page">
                  <div className="doc-page-label">Page {pi + 1}</div>
                  {page.paragraphs.map((p, i) => (p.heading ? <h3 key={i}>{p.text}</h3> : <p key={i}>{p.text}</p>))}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
