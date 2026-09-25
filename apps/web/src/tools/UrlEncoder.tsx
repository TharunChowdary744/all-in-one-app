import { decodeUrl, encodeUrl } from '@omnikit/core';
import { useMemo, useState } from 'react';

import { Alert, Card, CopyButton, Segmented } from '../components/ui';
import { errorMessage } from '../lib/files';

export default function UrlEncoder() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [full, setFull] = useState(false);
  const [input, setInput] = useState('https://example.com/search?q=all in one & lang=en');

  const result = useMemo(() => {
    try {
      return { out: mode === 'encode' ? encodeUrl(input, full ? 'full' : 'component') : decodeUrl(input), error: '' };
    } catch (e) {
      return { out: '', error: errorMessage(e) };
    }
  }, [input, mode, full]);

  const params = useMemo(() => {
    try {
      const url = new URL(mode === 'decode' ? result.out : input);
      return [...url.searchParams.entries()];
    } catch {
      return [];
    }
  }, [input, mode, result.out]);

  return (
    <>
      <div className="toolbar">
        <Segmented value={mode} onChange={(m) => { setMode(m); if (result.out) setInput(result.out); }} options={[{ value: 'encode', label: 'Encode' }, { value: 'decode', label: 'Decode' }]} />
        {mode === 'encode' && (
          <label className="checkbox" title="Keep :/?#&= characters (encodeURI)">
            <input type="checkbox" checked={full} onChange={(e) => setFull(e.target.checked)} /> Keep URL structure
          </label>
        )}
      </div>
      <div className="split">
        <Card title="Input">
          <textarea className="code editor short" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} aria-label="Input" />
        </Card>
        <Card title="Output" actions={<CopyButton text={result.out} />}>
          {result.error ? <Alert>{result.error}</Alert> : <textarea className="code editor short" readOnly value={result.out} aria-label="Output" />}
        </Card>
      </div>
      {params.length > 0 && (
        <Card title="Query parameters">
          <table className="table">
            <thead><tr><th>Key</th><th>Value</th></tr></thead>
            <tbody>{params.map(([k, v], i) => <tr key={i}><td><code>{k}</code></td><td>{v}</td></tr>)}</tbody>
          </table>
        </Card>
      )}
    </>
  );
}
