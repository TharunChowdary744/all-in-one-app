import { bytesToBase64, decodeBase64, encodeBase64, formatBytes } from '@omnikit/core';
import { useMemo, useState } from 'react';

import { Alert, Card, CopyButton, Segmented } from '../components/ui';
import { errorMessage } from '../lib/files';

export default function Base64Tool() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('Hello, OmniKit! 👋');
  const [urlSafe, setUrlSafe] = useState(false);
  const [fileInfo, setFileInfo] = useState('');
  const [dataUrl, setDataUrl] = useState('');

  const result = useMemo(() => {
    try {
      return { out: mode === 'encode' ? encodeBase64(input, urlSafe) : decodeBase64(input), error: '' };
    } catch (e) {
      return { out: '', error: errorMessage(e) };
    }
  }, [input, mode, urlSafe]);

  const encodeFile = async (file: File) => {
    const b64 = bytesToBase64(new Uint8Array(await file.arrayBuffer()));
    setMode('decode');
    setFileInfo(`${file.name} (${formatBytes(file.size)}) → data URL`);
    setInput('');
    setDataUrl(`data:${file.type || 'application/octet-stream'};base64,${b64}`);
  };

  return (
    <>
      <div className="toolbar">
        <Segmented value={mode} onChange={(m) => { setMode(m); if (result.out) setInput(result.out); setDataUrl(''); }} options={[{ value: 'encode', label: 'Encode' }, { value: 'decode', label: 'Decode' }]} />
        {mode === 'encode' && <label className="checkbox"><input type="checkbox" checked={urlSafe} onChange={(e) => setUrlSafe(e.target.checked)} /> URL-safe</label>}
        <label className="btn btn-outline btn-sm">
          📂 Encode a file
          <input type="file" hidden onChange={(e) => e.target.files?.[0] && encodeFile(e.target.files[0])} />
        </label>
      </div>
      {dataUrl ? (
        <Card title={fileInfo} actions={<><CopyButton text={dataUrl} label="Copy data URL" /><button type="button" className="btn btn-ghost btn-sm" onClick={() => setDataUrl('')}>Close</button></>}>
          {dataUrl.startsWith('data:image/') && <img src={dataUrl} alt="" className="preview-img small" />}
          <textarea className="code" rows={8} readOnly value={dataUrl} />
        </Card>
      ) : (
        <div className="split">
          <Card title={mode === 'encode' ? 'Text' : 'Base64'}>
            <textarea className="code editor" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} aria-label="Input" />
          </Card>
          <Card title={mode === 'encode' ? 'Base64' : 'Text'} actions={<CopyButton text={result.out} />}>
            {result.error ? <Alert>{result.error}</Alert> : <textarea className="code editor" readOnly value={result.out} aria-label="Output" />}
          </Card>
        </div>
      )}
    </>
  );
}
