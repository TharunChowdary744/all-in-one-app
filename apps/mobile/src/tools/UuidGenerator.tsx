import { uuidv4 } from '@omnikit/core';
import { useState } from 'react';

import { Button, Card, CopyButton, ResultRow, Screen, Segmented, Toggle } from '@/components/ui';

export default function UuidGenerator() {
  const [count, setCount] = useState(5);
  const [upper, setUpper] = useState(false);
  const make = (n: number, up: boolean) => Array.from({ length: n }, () => (up ? uuidv4().toUpperCase() : uuidv4()));
  const [ids, setIds] = useState(() => make(5, false));
  return (
    <Screen>
      <Segmented value={count} onChange={(n) => { setCount(n); setIds(make(n, upper)); }} options={[1, 5, 10, 25].map((n) => ({ value: n, label: `${n}` }))} />
      <Toggle label="Uppercase" value={upper} onChange={(u) => { setUpper(u); setIds(make(count, u)); }} />
      <Button label="Generate" onPress={() => setIds(make(count, upper))} />
      <Card title={`${ids.length} UUID v4`} right={<CopyButton text={ids.join('\n')} label="Copy all" />}>
        {ids.map((id, i) => <ResultRow key={`${id}-${i}`} label={`#${i + 1}`} value={id} />)}
      </Card>
    </Screen>
  );
}
