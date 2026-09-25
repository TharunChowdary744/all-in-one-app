import { csvToJson, jsonToCsv } from '@omnikit/core';
import { File } from 'expo-file-system';
import { useState } from 'react';

import { Button, Card, CopyButton, Input, Notice, Output, Row, Screen, Segmented, Toggle } from '@/components/ui';
import { errorMessage, shareText } from '@/lib/files';

type Direction = 'csv2json' | 'json2csv';

export default function CsvJson() {
  const [direction, setDirection] = useState<Direction>('csv2json');
  const [input, setInput] = useState('name,email,age\nAda Lovelace,ada@example.com,36\nAlan Turing,alan@example.com,41');
  const [header, setHeader] = useState(true);
  let output = '';
  let error = '';
  if (input.trim()) {
    try {
      output = direction === 'csv2json' ? JSON.stringify(csvToJson(input, { header }), null, 2) : jsonToCsv(input);
    } catch (e) {
      error = errorMessage(e);
    }
  }

  const openFile = async () => {
    const picked = await File.pickFileAsync();
    if (!picked.canceled) setInput(await picked.result.text());
  };

  return (
    <Screen>
      <Segmented value={direction} onChange={(d) => { if (output) setInput(output); setDirection(d); }} options={[{ value: 'csv2json', label: 'CSV → JSON' }, { value: 'json2csv', label: 'JSON → CSV' }]} />
      {direction === 'csv2json' && <Toggle label="First row is header" value={header} onChange={setHeader} />}
      <Input label={direction === 'csv2json' ? 'CSV' : 'JSON'} multiline code value={input} onChangeText={setInput} style={{ minHeight: 160 }} />
      <Button kind="outline" label="📂 Open file" onPress={() => openFile().catch(() => undefined)} />
      <Notice>{error}</Notice>
      <Card
        title={direction === 'csv2json' ? 'JSON' : 'CSV'}
        right={
          <Row>
            <CopyButton text={output} />
            <Button small kind="ghost" label="Share" disabled={!output} onPress={() => (direction === 'csv2json' ? shareText(output, 'data.json', 'application/json') : shareText(output, 'data.csv', 'text/csv'))} />
          </Row>
        }
      >
        <Output value={output} />
      </Card>
    </Screen>
  );
}
