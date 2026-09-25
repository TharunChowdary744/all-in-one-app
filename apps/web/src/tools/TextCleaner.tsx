import { cleanText, type CleanOptions } from '@omnikit/core';
import { useMemo, useState } from 'react';

import { Card, CopyButton, Segmented } from '../components/ui';

export default function TextCleaner() {
  const [text, setText] = useState('  banana\napple  \n\napple\ncherry   pie\n');
  const [opts, setOpts] = useState<CleanOptions>({ trimLines: true, collapseSpaces: true, removeEmptyLines: true, removeDuplicateLines: true, sort: 'none' });
  const output = useMemo(() => cleanText(text, opts), [text, opts]);
  const toggle = (k: keyof Omit<CleanOptions, 'sort'>) => setOpts((o) => ({ ...o, [k]: !o[k] }));

  const checks: [keyof Omit<CleanOptions, 'sort'>, string][] = [
    ['trimLines', 'Trim each line'],
    ['collapseSpaces', 'Collapse repeated spaces'],
    ['removeEmptyLines', 'Remove empty lines'],
    ['removeDuplicateLines', 'Remove duplicate lines'],
  ];

  return (
    <>
      <div className="toolbar">
        {checks.map(([k, label]) => (
          <label key={k} className="checkbox">
            <input type="checkbox" checked={!!opts[k]} onChange={() => toggle(k)} /> {label}
          </label>
        ))}
        <Segmented value={opts.sort ?? 'none'} onChange={(sort) => setOpts((o) => ({ ...o, sort }))} options={[{ value: 'none', label: 'No sort' }, { value: 'asc', label: 'A → Z' }, { value: 'desc', label: 'Z → A' }]} />
      </div>
      <div className="split">
        <Card title="Input">
          <textarea className="code editor" value={text} onChange={(e) => setText(e.target.value)} aria-label="Input" />
        </Card>
        <Card title={`Output · ${output ? output.split('\n').length : 0} lines`} actions={<CopyButton text={output} />}>
          <textarea className="code editor" readOnly value={output} aria-label="Output" />
        </Card>
      </div>
    </>
  );
}
