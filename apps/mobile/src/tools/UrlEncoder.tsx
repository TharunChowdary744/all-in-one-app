import { decodeUrl, encodeUrl } from '@omnikit/core';
import { useState } from 'react';

import { Card, CopyButton, Input, Notice, Output, Screen, Segmented, Toggle } from '@/components/ui';
import { errorMessage } from '@/lib/files';

export default function UrlEncoder() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [full, setFull] = useState(false);
  const [input, setInput] = useState('https://example.com/search?q=all in one & lang=en');
  let out = '';
  let error = '';
  try {
    out = mode === 'encode' ? encodeUrl(input, full ? 'full' : 'component') : decodeUrl(input);
  } catch (e) {
    error = errorMessage(e);
  }
  return (
    <Screen>
      <Segmented value={mode} onChange={(m) => { if (out) setInput(out); setMode(m); }} options={[{ value: 'encode', label: 'Encode' }, { value: 'decode', label: 'Decode' }]} />
      {mode === 'encode' && <Toggle label="Keep URL structure (:/?&=)" value={full} onChange={setFull} />}
      <Input label="Input" multiline code value={input} onChangeText={setInput} />
      <Notice>{error}</Notice>
      <Card title="Output" right={<CopyButton text={out} />}>
        <Output value={out} />
      </Card>
    </Screen>
  );
}
