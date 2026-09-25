import { defaultPasswordOptions, generatePassword, passwordStrength, type PasswordOptions } from '@omnikit/core';
import { useCallback, useEffect, useState } from 'react';

import { Alert, Card, CopyButton, Field } from '../components/ui';
import { errorMessage } from '../lib/files';

const strengthColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

export default function PasswordGenerator() {
  const [opts, setOpts] = useState<PasswordOptions>(defaultPasswordOptions);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  const regenerate = useCallback(() => {
    try {
      const p = generatePassword(opts);
      setPassword(p);
      setHistory((h) => [p, ...h].slice(0, 5));
      setError('');
    } catch (e) {
      setError(errorMessage(e));
    }
  }, [opts]);

  useEffect(regenerate, [regenerate]);

  const strength = passwordStrength(password);
  const toggle = (k: 'lowercase' | 'uppercase' | 'numbers' | 'symbols' | 'excludeAmbiguous') => setOpts((o) => ({ ...o, [k]: !o[k] }));

  return (
    <div className="tool-layout">
      <Card>
        <div className="password-box">
          <code className="password">{password || '—'}</code>
          <button type="button" className="icon-btn" aria-label="Regenerate" onClick={regenerate}>🔄</button>
          <CopyButton text={password} />
        </div>
        <div className="meter" aria-label={`Strength: ${strength.label}`}>
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} style={{ background: i <= strength.score ? strengthColors[strength.score] : undefined }} />
          ))}
        </div>
        <div className="muted">
          Strength: <strong style={{ color: strengthColors[strength.score] }}>{strength.label}</strong> · ~{strength.bits} bits of entropy
        </div>
        <Alert>{error}</Alert>
      </Card>
      <Card title="Options">
        <Field label={`Length: ${opts.length}`}>
          <input type="range" min={4} max={64} value={opts.length} onChange={(e) => setOpts((o) => ({ ...o, length: Number(e.target.value) }))} />
        </Field>
        <div className="checks-grid">
          <label className="checkbox"><input type="checkbox" checked={opts.uppercase} onChange={() => toggle('uppercase')} /> Uppercase (A-Z)</label>
          <label className="checkbox"><input type="checkbox" checked={opts.lowercase} onChange={() => toggle('lowercase')} /> Lowercase (a-z)</label>
          <label className="checkbox"><input type="checkbox" checked={opts.numbers} onChange={() => toggle('numbers')} /> Numbers (0-9)</label>
          <label className="checkbox"><input type="checkbox" checked={opts.symbols} onChange={() => toggle('symbols')} /> Symbols (!@#…)</label>
          <label className="checkbox"><input type="checkbox" checked={opts.excludeAmbiguous} onChange={() => toggle('excludeAmbiguous')} /> Avoid look-alikes (l, 1, O, 0)</label>
        </div>
      </Card>
      {history.length > 1 && (
        <Card title="Recently generated (this session only)">
          <ul className="mono-list">
            {history.slice(1).map((p, i) => (
              <li key={i}><code>{p}</code><CopyButton text={p} /></li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
