import { caseStyles, convertCase } from '@omnikit/core';
import { useState } from 'react';

import { Input, ResultRow, Screen } from '@/components/ui';

export default function CaseConverter() {
  const [text, setText] = useState('The quick brown fox jumps over the lazy dog');
  return (
    <Screen>
      <Input label="Input" multiline value={text} onChangeText={setText} />
      {caseStyles.map((s) => (
        <ResultRow key={s.id} label={s.label} value={convertCase(text, s.id)} />
      ))}
    </Screen>
  );
}
