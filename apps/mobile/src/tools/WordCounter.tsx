import { analyzeText } from '@omnikit/core';
import { useState } from 'react';

import { Button, Input, Screen, Stat, StatGrid } from '@/components/ui';

export default function WordCounter() {
  const [text, setText] = useState('');
  const s = analyzeText(text);
  return (
    <Screen>
      <StatGrid>
        <Stat label="Words" value={s.words} />
        <Stat label="Characters" value={s.characters} />
        <Stat label="No spaces" value={s.charactersNoSpaces} />
        <Stat label="Sentences" value={s.sentences} />
        <Stat label="Paragraphs" value={s.paragraphs} />
        <Stat label="Read time" value={`${s.readingTimeMinutes}m`} />
      </StatGrid>
      <Input multiline value={text} onChangeText={setText} placeholder="Type or paste your text…" style={{ minHeight: 240 }} />
      {text.length > 0 && <Button kind="ghost" label="Clear" onPress={() => setText('')} />}
    </Screen>
  );
}
