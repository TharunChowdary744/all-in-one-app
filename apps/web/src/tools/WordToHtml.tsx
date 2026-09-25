import { htmlDocument, replaceExtension } from '@omnikit/core';
import { useState } from 'react';

import { FileDrop } from '../components/FileDrop';
import { Alert, Card, CopyButton, Segmented, Spinner } from '../components/ui';
import { downloadText, errorMessage } from '../lib/files';
import { sanitizeHtml } from '../lib/sanitize';
import { useAppState } from '../state/AppState';

type View = 'preview' | 'html' | 'text';

export default function WordToHtml() {
  const [file, setFile] = useState<File | null>(null);
  const [html, setHtml] = useState('');
  const [text, setText] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [view, setView] = useState<View>('preview');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { recordFiles } = useAppState();

  const open = async (f: File) => {
    setBusy(true);
    setError('');
    setFile(f);
    try {
      const { default: mammoth } = await import('mammoth/mammoth.browser.js');
      const arrayBuffer = await f.arrayBuffer();
      const [h, t] = await Promise.all([mammoth.convertToHtml({ arrayBuffer }), mammoth.extractRawText({ arrayBuffer })]);
      setHtml(sanitizeHtml(h.value));
      setText(t.value.trim());
      setWarnings(h.messages.filter((m) => m.type === 'warning').map((m) => m.message));
      recordFiles(1);
    } catch (e) {
      setHtml('');
      setText('');
      setError(`Could not read this file. Only .docx (Word 2007+) is supported. ${errorMessage(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const title = file?.name.replace(/\.[^.]+$/, '') ?? 'document';

  return (
    <div className="tool-layout">
      <Card title="1. Choose a Word document">
        <FileDrop accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onFiles={([f]) => f && open(f)} hint="Headings, lists, tables, links, bold/italic and embedded images are preserved." />
        {busy && (
          <div className="loading">
            <Spinner /> Converting…
          </div>
        )}
        <Alert>{error}</Alert>
      </Card>
      {file && html && (
        <Card
          title="2. Result"
          actions={
            <>
              <CopyButton text={view === 'text' ? text : html} />
              <button type="button" className="btn btn-outline btn-sm" onClick={() => downloadText(text, replaceExtension(file.name, 'txt'))}>
                ⬇️ .txt
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => downloadText(htmlDocument(html, title), replaceExtension(file.name, 'html'), 'text/html')}>
                ⬇️ .html
              </button>
            </>
          }
        >
          <Segmented value={view} onChange={setView} options={[{ value: 'preview', label: 'Preview' }, { value: 'html', label: 'HTML' }, { value: 'text', label: 'Plain text' }]} />
          {view === 'preview' && <div className="doc-preview prose" dangerouslySetInnerHTML={{ __html: html }} />}
          {view === 'html' && <textarea className="code" readOnly rows={18} value={html} />}
          {view === 'text' && <textarea className="code" readOnly rows={18} value={text} />}
          {warnings.length > 0 && <Alert kind="info">Some formatting could not be converted: {warnings.slice(0, 3).join('; ')}</Alert>}
        </Card>
      )}
    </div>
  );
}
