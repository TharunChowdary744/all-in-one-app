import { ArrowUp } from 'lucide-react';
import { caseStyles, convertCase } from '@omnikit/core';
import { useState } from 'react';

import { Card, CopyButton } from '../components/ui';

export default function CaseConverter() {
  const [text, setText] = useState('The quick brown fox jumps over the lazy dog');
  return (
    <div className="tool-layout">
      <Card title="Input">
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} aria-label="Input text" />
      </Card>
      <div className="result-list">
        {caseStyles.map((style) => {
          const out = convertCase(text, style.id);
          return (
            <div key={style.id} className="result-row">
              <div className="result-label">{style.label}</div>
              <code className="result-value">{out || '—'}</code>
              <CopyButton text={out} />
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setText(out)} title="Use as input">
                <ArrowUp size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
