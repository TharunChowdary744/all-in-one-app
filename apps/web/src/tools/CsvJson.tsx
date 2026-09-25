import { csvToJson, jsonToCsv } from '@omnikit/core';
import { useMemo, useState } from 'react';

import { Alert, Card, CopyButton, Segmented } from '../components/ui';
import { downloadText, errorMessage } from '../lib/files';

type Direction = 'csv2json' | 'json2csv';

export default function CsvJson() {
  const [direction, setDirection] = useState<Direction>('csv2json');
  const [input, setInput] = useState('name,email,age\nAda Lovelace,ada@example.com,36\nAlan Turing,alan@example.com,41');
  const [header, setHeader] = useState(true);
  const [infer, setInfer] = useState(true);
  const [delimiter, setDelimiter] = useState(',');

  const result = useMemo(() => {
    if (!input.trim()) return { output: '', error: '' };
    try {
      return direction === 'csv2json'
        ? { output: JSON.stringify(csvToJson(input, { header, inferTypes: infer }), null, 2), error: '' }
        : { output: jsonToCsv(input, delimiter === '\\t' ? '\t' : delimiter), error: '' };
    } catch (e) {
      return { output: '', error: errorMessage(e) };
    }
  }, [input, direction, header, infer, delimiter]);

  const swap = (d: Direction) => {
    if (d === direction) return;
    if (result.output) setInput(result.output);
    setDirection(d);
  };

  const readFile = async (file: File) => setInput(await file.text());

  return (
    <>
      <div className="toolbar">
        <Segmented value={direction} onChange={swap} options={[{ value: 'csv2json', label: 'CSV → JSON' }, { value: 'json2csv', label: 'JSON → CSV' }]} />
        {direction === 'csv2json' ? (
          <>
            <label className="checkbox"><input type="checkbox" checked={header} onChange={(e) => setHeader(e.target.checked)} /> First row is header</label>
            <label className="checkbox"><input type="checkbox" checked={infer} onChange={(e) => setInfer(e.target.checked)} /> Detect numbers & booleans</label>
          </>
        ) : (
          <label className="inline-field">
            Delimiter
            <select value={delimiter} onChange={(e) => setDelimiter(e.target.value)}>
              <option value=",">Comma ,</option>
              <option value=";">Semicolon ;</option>
              <option value="\t">Tab</option>
              <option value="|">Pipe |</option>
            </select>
          </label>
        )}
      </div>
      <div className="split">
        <Card
          title={direction === 'csv2json' ? 'CSV input' : 'JSON input'}
          actions={
            <label className="btn btn-ghost btn-sm">
              📂 Open file
              <input type="file" hidden accept={direction === 'csv2json' ? '.csv,.tsv,.txt,text/csv' : '.json,application/json'} onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0])} />
            </label>
          }
        >
          <textarea className="code editor" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} aria-label="Input" />
        </Card>
        <Card
          title={direction === 'csv2json' ? 'JSON output' : 'CSV output'}
          actions={
            <>
              <CopyButton text={result.output} />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={!result.output}
                onClick={() => (direction === 'csv2json' ? downloadText(result.output, 'data.json', 'application/json') : downloadText(result.output, 'data.csv', 'text/csv'))}
              >
                ⬇️ Download
              </button>
            </>
          }
        >
          {result.error ? <Alert>{result.error}</Alert> : <textarea className="code editor" readOnly value={result.output} aria-label="Output" />}
        </Card>
      </div>
    </>
  );
}
