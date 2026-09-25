import { formatJson, minifyJson, type JsonResult } from '@omnikit/core';
import { useState } from 'react';

import { Button, Card, CopyButton, Input, Notice, Output, Row, Screen, Segmented, Toggle } from '@/components/ui';
import { shareText } from '@/lib/files';

export default function JsonFormatter() {
  const [input, setInput] = useState('{"name":"OmniKit","tools":23,"platforms":["web","mobile"]}');
  const [indent, setIndent] = useState<2 | 4>(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [result, setResult] = useState<JsonResult | null>(null);

  return (
    <Screen>
      <Input label="JSON" multiline code value={input} onChangeText={(t) => { setInput(t); setResult(null); }} style={{ minHeight: 160 }} />
      <Segmented value={indent} onChange={setIndent} options={[{ value: 2, label: '2 spaces' }, { value: 4, label: '4 spaces' }]} />
      <Toggle label="Sort keys" value={sortKeys} onChange={setSortKeys} />
      <Row>
        <Button label="✨ Beautify" onPress={() => setResult(formatJson(input, { indent, sortKeys }))} style={{ flex: 1 }} />
        <Button kind="outline" label="🗜️ Minify" onPress={() => setResult(minifyJson(input))} style={{ flex: 1 }} />
      </Row>
      {result && !result.ok && <Notice>❌ {result.error}{result.line ? ` (line ${result.line}, col ${result.column})` : ''}</Notice>}
      {result?.ok && (
        <Card title="✓ Valid JSON" right={<Row><CopyButton text={result.output} /><Button small kind="ghost" label="Share" onPress={() => shareText(result.output, 'data.json', 'application/json')} /></Row>}>
          <Output value={result.output} />
        </Card>
      )}
    </Screen>
  );
}
