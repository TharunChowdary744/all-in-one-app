import { describeTimestamp, parseTimestamp } from '@omnikit/core';
import { useEffect, useState } from 'react';

import { Button, Card, Input, Notice, ResultRow, Screen } from '@/components/ui';
import { fonts, useColors } from '@/theme/colors';
import { Text } from '@/components/Text';

export default function TimestampConverter() {
  const c = useColors();
  const [now, setNow] = useState(() => new Date());
  const [input, setInput] = useState(() => String(Math.floor(Date.now() / 1000)));
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const date = input.trim() ? parseTimestamp(input) : null;
  const info = date ? describeTimestamp(date, now) : null;
  return (
    <Screen>
      <Card title="Now" right={<Button small kind="outline" label="Use now" onPress={() => setInput(String(Math.floor(now.getTime() / 1000)))} />}>
        <Text style={{ fontFamily: fonts.displaySemi, fontSize: 30, letterSpacing: -0.8 }}>{Math.floor(now.getTime() / 1000)}</Text>
        <Text style={{ color: c.ink2 }}>{now.toLocaleString()}</Text>
      </Card>
      <Input label="Unix timestamp (s or ms) or date" value={input} onChangeText={setInput} autoCapitalize="none" code />
      {input.trim() && !info && <Notice>Couldn't understand that date or timestamp.</Notice>}
      {info && (
        <>
          <ResultRow label="Unix (seconds)" value={String(info.seconds)} />
          <ResultRow label="Unix (milliseconds)" value={String(info.milliseconds)} />
          <ResultRow label="ISO 8601" value={info.iso} />
          <ResultRow label="UTC" value={info.utc} />
          <ResultRow label="Local" value={info.local} />
          <ResultRow label="Relative" value={info.relative} />
        </>
      )}
    </Screen>
  );
}
