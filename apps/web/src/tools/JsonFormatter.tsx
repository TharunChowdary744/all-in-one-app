import { Download } from 'lucide-react';
import { formatJson, minifyJson, type JsonResult } from '@omnikit/core';
import { useState } from 'react';

import { Alert, Card, CopyButton, Segmented } from '../components/ui';
import { downloadText } from '../lib/files';

export default function JsonFormatter() {
  const [input, setInput] = useState('{"name":"OmniKit","tools":23,"platforms":["web","mobile"],"offline":true}');
  const [indent, setIndent] = useState<2 | 4 | 'tab'>(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [result, setResult] = useState<JsonResult | null>(null);

  const run = (kind: 'format' | 'minify') => setResult(kind === 'format' ? formatJson(input, { indent, sortKeys }) : minifyJson(input));

  return (
    <>
      <div className="toolbar">
        <button type="button" className="btn btn-primary" onClick={() => run('format')}>Format JSON</button>
        <button type="button" className="btn btn-outline" onClick={() => run('minify')}>Minify</button>
        <Segmented value={indent} onChange={setIndent} label="Indentation" options={[{ value: 2, label: '2 spaces' }, { value: 4, label: '4 spaces' }, { value: 'tab', label: 'Tabs' }]} />
        <label className="checkbox"><input type="checkbox" checked={sortKeys} onChange={(e) => setSortKeys(e.target.checked)} /> Sort keys</label>
      </div>
      <div className="split">
        <Card title="Input">
          <textarea className="code editor" value={input} onChange={(e) => { setInput(e.target.value); setResult(null); }} spellCheck={false} aria-label="JSON input" />
        </Card>
        <Card
          title="Output"
          actions={
            result?.ok && (
              <>
                <CopyButton text={result.output} />
                <button type="button" className="btn btn-primary btn-sm" onClick={() => downloadText(result.output, 'data.json', 'application/json')}><Download size={14} /> .json</button>
              </>
            )
          }
        >
          {!result && <p className="muted">Press Beautify or Minify.</p>}
          {result && !result.ok && (
            <Alert>
              Invalid JSON: {result.error}
              {result.line ? ` (line ${result.line}, column ${result.column})` : ''}
            </Alert>
          )}
          {result?.ok && (
            <>
              <Alert kind="success">Valid JSON</Alert>
              <textarea className="code editor" readOnly value={result.output} aria-label="JSON output" />
            </>
          )}
        </Card>
      </div>
    </>
  );
}
