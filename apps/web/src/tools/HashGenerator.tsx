import { formatBytes, hashAlgorithms, hashBytes, hashText } from '@omnikit/core';
import { useMemo, useState } from 'react';

import { Alert, Card, CopyButton, Segmented, Spinner } from '../components/ui';
import { FileDrop } from '../components/FileDrop';
import { errorMessage } from '../lib/files';

export default function HashGenerator() {
  const [mode, setMode] = useState<'text' | 'file'>('text');
  const [text, setText] = useState('hello world');
  const [upper, setUpper] = useState(false);
  const [fileHashes, setFileHashes] = useState<{ name: string; size: number; hashes: Record<string, string> } | null>(null);
  const [busy, setBusy] = useState(false);
  const [compare, setCompare] = useState('');
  const [error, setError] = useState('');

  const textHashes = useMemo(() => Object.fromEntries(hashAlgorithms.map((a) => [a.id, hashText(text, a.id)])), [text]);
  const hashes = mode === 'text' ? textHashes : (fileHashes?.hashes ?? {});
  const cmp = compare.trim().toLowerCase();

  const hashFile = async (file: File) => {
    setBusy(true);
    setError('');
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      setFileHashes({ name: file.name, size: file.size, hashes: Object.fromEntries(hashAlgorithms.map((a) => [a.id, hashBytes(bytes, a.id)])) });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="tool-layout">
      <div className="toolbar">
        <Segmented value={mode} onChange={setMode} options={[{ value: 'text', label: 'Text' }, { value: 'file', label: 'File checksum' }]} />
        <label className="checkbox"><input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} /> Uppercase</label>
      </div>
      <Card>
        {mode === 'text' ? (
          <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} aria-label="Text to hash" />
        ) : (
          <FileDrop accept="*/*" onFiles={([f]) => f && hashFile(f)} hint={fileHashes ? `${fileHashes.name} · ${formatBytes(fileHashes.size)}` : 'Any file — hashed locally, never uploaded.'} />
        )}
        {busy && <div className="loading"><Spinner /> Hashing…</div>}
        <Alert>{error}</Alert>
      </Card>
      {Object.keys(hashes).length > 0 && (
        <Card title="Hashes">
          <div className="result-list">
            {hashAlgorithms.map((a) => {
              const v = upper ? hashes[a.id]!.toUpperCase() : hashes[a.id]!;
              const match = cmp && hashes[a.id] === cmp;
              return (
                <div key={a.id} className={`result-row ${match ? 'match' : ''}`}>
                  <div className="result-label">{a.label}{match && ' ✓'}</div>
                  <code className="result-value break">{v}</code>
                  <CopyButton text={v} />
                </div>
              );
            })}
          </div>
          <input value={compare} onChange={(e) => setCompare(e.target.value)} placeholder="Paste an expected hash to verify…" aria-label="Compare hash" />
          {cmp && <p className={Object.values(hashes).includes(cmp) ? 'good' : 'bad'}>{Object.values(hashes).includes(cmp) ? '✓ Match found' : '✗ No match'}</p>}
        </Card>
      )}
    </div>
  );
}
