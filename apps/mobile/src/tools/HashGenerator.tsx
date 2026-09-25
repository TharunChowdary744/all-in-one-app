import { formatBytes, hashAlgorithms, hashBytes, hashText } from '@omnikit/core';
import { File } from 'expo-file-system';
import { useState } from 'react';

import { Button, Input, Muted, Notice, ResultRow, Screen, Segmented } from '@/components/ui';
import { errorMessage } from '@/lib/files';
import { useAppState } from '@/state/AppState';

export default function HashGenerator() {
  const [mode, setMode] = useState<'text' | 'file'>('text');
  const [text, setText] = useState('hello world');
  const [fileResult, setFileResult] = useState<{ name: string; size: number; hashes: Record<string, string> } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { recordFiles } = useAppState();

  const pickFile = async () => {
    setError('');
    try {
      const picked = await File.pickFileAsync();
      if (picked.canceled) return;
      setBusy(true);
      const bytes = await picked.result.bytes();
      setFileResult({ name: picked.result.name, size: bytes.length, hashes: Object.fromEntries(hashAlgorithms.map((a) => [a.id, hashBytes(bytes, a.id)])) });
      recordFiles(1);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Segmented value={mode} onChange={setMode} options={[{ value: 'text', label: 'Text' }, { value: 'file', label: 'File checksum' }]} />
      {mode === 'text' ? (
        <>
          <Input label="Text" multiline value={text} onChangeText={setText} />
          {hashAlgorithms.map((a) => <ResultRow key={a.id} label={a.label} value={hashText(text, a.id)} />)}
        </>
      ) : (
        <>
          <Button label="📂 Choose a file" onPress={pickFile} loading={busy} />
          <Notice>{error}</Notice>
          {fileResult && (
            <>
              <Muted>{fileResult.name} · {formatBytes(fileResult.size)}</Muted>
              {hashAlgorithms.map((a) => <ResultRow key={a.id} label={a.label} value={fileResult.hashes[a.id]!} />)}
            </>
          )}
        </>
      )}
    </Screen>
  );
}
