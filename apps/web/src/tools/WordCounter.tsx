import { analyzeText } from '@omnikit/core';
import { useMemo, useState } from 'react';

import { Card, Stat } from '../components/ui';

export default function WordCounter() {
  const [text, setText] = useState('');
  const s = useMemo(() => analyzeText(text), [text]);
  const topWords = useMemo(() => {
    const counts = new Map<string, number>();
    for (const w of text.toLowerCase().match(/\p{L}[\p{L}'’-]{2,}/gu) ?? []) counts.set(w, (counts.get(w) ?? 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [text]);

  return (
    <div className="tool-layout">
      <section className="stats">
        <Stat label="Words" value={s.words.toLocaleString()} />
        <Stat label="Characters" value={s.characters.toLocaleString()} />
        <Stat label="No spaces" value={s.charactersNoSpaces.toLocaleString()} />
        <Stat label="Sentences" value={s.sentences} />
        <Stat label="Paragraphs" value={s.paragraphs} />
        <Stat label="Reading time" value={`${s.readingTimeMinutes} min`} />
        <Stat label="Speaking time" value={`${s.speakingTimeMinutes} min`} />
      </section>
      <Card title="Your text" actions={<button type="button" className="btn btn-ghost btn-sm" onClick={() => setText('')}>Clear</button>}>
        <textarea className="editor" value={text} onChange={(e) => setText(e.target.value)} placeholder="Start typing or paste your text here…" autoFocus aria-label="Text" />
      </Card>
      {topWords.length > 0 && (
        <Card title="Most frequent words">
          <div className="chips-row">
            {topWords.map(([w, n]) => (
              <span key={w} className="chip">
                {w} <strong>{n}</strong>
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
