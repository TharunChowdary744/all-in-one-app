import { ArrowLeftRight } from 'lucide-react';
import { convertUnit, formatNumber, unitGroups } from '@omnikit/core';
import { useState } from 'react';

import { Card, CopyButton } from '../components/ui';

export default function UnitConverter() {
  const [groupId, setGroupId] = useState(unitGroups[0]!.id);
  const group = unitGroups.find((g) => g.id === groupId)!;
  const [from, setFrom] = useState(group.units[2]?.id ?? group.units[0]!.id);
  const [to, setTo] = useState(group.units[3]?.id ?? group.units[0]!.id);
  const [value, setValue] = useState('1');

  const pickGroup = (id: string) => {
    const g = unitGroups.find((x) => x.id === id)!;
    setGroupId(id);
    setFrom(g.units[0]!.id);
    setTo(g.units[1]!.id);
  };

  const num = Number(value);
  const valid = value.trim() !== '' && Number.isFinite(num);
  const result = valid ? formatNumber(convertUnit(num, groupId, from, to)) : '';
  const fromUnit = group.units.find((u) => u.id === from)!;

  return (
    <div className="tool-layout">
      <div className="chips-row">
        {unitGroups.map((g) => (
          <button key={g.id} type="button" className={`filter-chip ${g.id === groupId ? 'active' : ''}`} onClick={() => pickGroup(g.id)}>
            {g.name}
          </button>
        ))}
      </div>
      <Card>
        <div className="converter">
          <div className="converter-side">
            <input type="number" value={value} onChange={(e) => setValue(e.target.value)} aria-label="Value" className="big-input" />
            <select value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From unit">
              {group.units.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>)}
            </select>
          </div>
          <button type="button" className="icon-btn swap" aria-label="Swap units" onClick={() => { setFrom(to); setTo(from); }}><ArrowLeftRight size={18} /></button>
          <div className="converter-side">
            <output className="big-output">{result || '—'}</output>
            <select value={to} onChange={(e) => setTo(e.target.value)} aria-label="To unit">
              {group.units.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>)}
            </select>
          </div>
        </div>
      </Card>
      {valid && (
        <Card title={`${formatNumber(num)} ${fromUnit.symbol} in every ${group.name.toLowerCase()} unit`}>
          <div className="result-list">
            {group.units.map((u) => {
              const v = formatNumber(convertUnit(num, groupId, from, u.id));
              return (
                <div key={u.id} className="result-row">
                  <div className="result-label">{u.name}</div>
                  <code className="result-value">{v} {u.symbol}</code>
                  <CopyButton text={v} />
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
