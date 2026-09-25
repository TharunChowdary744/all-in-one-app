import { cleanText, type CleanOptions } from '@omnikit/core';
import { useState } from 'react';

import { Card, CopyButton, Input, Output, Screen, Segmented, Toggle } from '@/components/ui';

export default function TextCleaner() {
  const [text, setText] = useState('  banana\napple  \n\napple\ncherry   pie');
  const [o, setO] = useState<CleanOptions>({ trimLines: true, collapseSpaces: true, removeEmptyLines: true, removeDuplicateLines: true, sort: 'none' });
  const out = cleanText(text, o);
  const set = (k: keyof CleanOptions) => (v: boolean) => setO((x) => ({ ...x, [k]: v }));
  return (
    <Screen>
      <Input label="Input" multiline code value={text} onChangeText={setText} />
      <Card title="Options">
        <Toggle label="Trim each line" value={!!o.trimLines} onChange={set('trimLines')} />
        <Toggle label="Collapse repeated spaces" value={!!o.collapseSpaces} onChange={set('collapseSpaces')} />
        <Toggle label="Remove empty lines" value={!!o.removeEmptyLines} onChange={set('removeEmptyLines')} />
        <Toggle label="Remove duplicate lines" value={!!o.removeDuplicateLines} onChange={set('removeDuplicateLines')} />
        <Segmented value={o.sort ?? 'none'} onChange={(sort) => setO((x) => ({ ...x, sort }))} options={[{ value: 'none', label: 'No sort' }, { value: 'asc', label: 'A → Z' }, { value: 'desc', label: 'Z → A' }]} />
      </Card>
      <Card title="Output" right={<CopyButton text={out} />}>
        <Output value={out} />
      </Card>
    </Screen>
  );
}
