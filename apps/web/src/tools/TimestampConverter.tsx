import { describeTimestamp, parseTimestamp } from '@omnikit/core';
import { useEffect, useState } from 'react';

import { Alert, Card, CopyButton } from '../components/ui';

export default function TimestampConverter() {
  const [now, setNow] = useState(() => new Date());
  const [input, setInput] = useState(() => String(Math.floor(Date.now() / 1000)));

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const date = input.trim() ? parseTimestamp(input) : null;
  const info = date ? describeTimestamp(date, now) : null;
  const rows = info
    ? [
        ['Unix (seconds)', String(info.seconds)],
        ['Unix (milliseconds)', String(info.milliseconds)],
        ['ISO 8601', info.iso],
        ['UTC', info.utc],
        ['Local time', info.local],
        ['Relative', info.relative],
      ]
    : [];

  return (
    <div className="tool-layout">
      <Card title="Current time">
        <div className="clock">
          <div>
            <div className="muted">Unix seconds</div>
            <strong className="mono">{Math.floor(now.getTime() / 1000)}</strong>
          </div>
          <div>
            <div className="muted">Local</div>
            <strong>{now.toLocaleString()}</strong>
          </div>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setInput(String(Math.floor(now.getTime() / 1000)))}>Use now</button>
        </div>
      </Card>
      <Card title="Convert">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="1700000000, 1700000000000 or 2024-05-01T12:00:00Z" aria-label="Timestamp or date" />
        <p className="muted">Enter a Unix timestamp (seconds or milliseconds) or any date string.</p>
        {input.trim() && !info && <Alert>Couldn't understand that date or timestamp.</Alert>}
        {info && (
          <div className="result-list">
            {rows.map(([label, value]) => (
              <div key={label} className="result-row">
                <div className="result-label">{label}</div>
                <code className="result-value">{value}</code>
                <CopyButton text={value!} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
