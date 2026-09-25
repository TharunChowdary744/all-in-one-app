import { Download } from 'lucide-react';
import { uuidv4 } from '@omnikit/core';
import { useState } from 'react';

import { Card, CopyButton, Field } from '../components/ui';
import { downloadText } from '../lib/files';

const make = (n: number, upper: boolean, hyphens: boolean) =>
  Array.from({ length: n }, () => {
    let id = uuidv4();
    if (!hyphens) id = id.replace(/-/g, '');
    return upper ? id.toUpperCase() : id;
  });

export default function UuidGenerator() {
  const [count, setCount] = useState(5);
  const [upper, setUpper] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [ids, setIds] = useState(() => make(5, false, true));
  const text = ids.join('\n');

  return (
    <div className="tool-layout">
      <Card title="Options">
        <div className="form-row">
          <Field label="How many?">
            <input type="number" min={1} max={1000} value={count} onChange={(e) => setCount(Math.min(1000, Math.max(1, Number(e.target.value))))} />
          </Field>
          <label className="checkbox"><input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} /> Uppercase</label>
          <label className="checkbox"><input type="checkbox" checked={hyphens} onChange={(e) => setHyphens(e.target.checked)} /> Hyphens</label>
        </div>
        <div className="actions">
          <button type="button" className="btn btn-primary" onClick={() => setIds(make(count, upper, hyphens))}>Generate</button>
        </div>
      </Card>
      <Card title={`${ids.length} UUID v4`} actions={<><CopyButton text={text} label="Copy all" /><button type="button" className="btn btn-outline btn-sm" onClick={() => downloadText(text, 'uuids.txt')}><Download size={14} /> .txt</button></>}>
        <ul className="mono-list">
          {ids.map((id, i) => (
            <li key={i}>
              <code>{id}</code>
              <CopyButton text={id} />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
