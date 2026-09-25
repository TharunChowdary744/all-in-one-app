import { decodeBase64, encodeBase64 } from '@omnikit/core';
import { useState } from 'react';

import { Card, CopyButton, Input, Notice, Output, Screen, Segmented, Toggle } from '@/components/ui';
import { errorMessage } from '@/lib/files';

export default function Base64Tool() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('Hello, OmniKit! 👋');
  const [urlSafe, setUrlSafe] = useState(false);
  let out = '';
  let error = '';
  try {
    out = mode === 'encode' ? encodeBase64(input, urlSafe) : decodeBase64(input);
  } catch (e) {
    error = errorMessage(e);
  }
  return (
    <Screen>
      <Segmented value={mode} onChange={(m) => { if (out) setInput(out); setMode(m); }} options={[{ value: 'encode', label: 'Encode' }, { value: 'decode', label: 'Decode' }]} />
      {mode === 'encode' && <Toggle label="URL-safe alphabet" value={urlSafe} onChange={setUrlSafe} />}
      <Input label={mode === 'encode' ? 'Text' : 'Base64'} multiline code value={input} onChangeText={setInput} />
      <Notice>{error}</Notice>
      <Card title={mode === 'encode' ? 'Base64' : 'Text'} right={<CopyButton text={out} />}>
        <Output value={out} />
      </Card>
    </Screen>
  );
}
