import { evaluateExpression, formatCalcResult, type AngleMode } from '@omnikit/core';
import { Delete } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Card, CopyButton, Segmented } from '../../components/ui';

type Key = { label: string; insert?: string; action?: 'clear' | 'back' | 'equals' | 'invert' | 'ans'; kind?: 'num' | 'op' | 'fn' | 'eq' | 'util'; aria?: string; wide?: boolean };

const SCI: Key[] = [
  { label: 'sin', insert: 'sin(', kind: 'fn' }, { label: 'cos', insert: 'cos(', kind: 'fn' }, { label: 'tan', insert: 'tan(', kind: 'fn' },
  { label: 'ln', insert: 'ln(', kind: 'fn' }, { label: 'log', insert: 'log(', kind: 'fn' }, { label: '√', insert: '√(', kind: 'fn', aria: 'square root' },
  { label: 'x²', insert: '^2', kind: 'fn', aria: 'square' }, { label: 'xʸ', insert: '^', kind: 'fn', aria: 'power' }, { label: 'n!', insert: '!', kind: 'fn', aria: 'factorial' },
  { label: 'π', insert: 'π', kind: 'fn', aria: 'pi' }, { label: 'e', insert: 'e', kind: 'fn' }, { label: '1/x', action: 'invert', kind: 'fn', aria: 'reciprocal' },
  { label: '(', insert: '(', kind: 'fn' }, { label: ')', insert: ')', kind: 'fn' }, { label: 'Ans', action: 'ans', kind: 'fn', aria: 'previous answer' },
];

const PAD: Key[] = [
  { label: 'AC', action: 'clear', kind: 'util', aria: 'clear all' }, { label: '⌫', action: 'back', kind: 'util', aria: 'delete' }, { label: '%', insert: '%', kind: 'op', aria: 'percent' }, { label: '÷', insert: '÷', kind: 'op', aria: 'divide' },
  { label: '7', insert: '7', kind: 'num' }, { label: '8', insert: '8', kind: 'num' }, { label: '9', insert: '9', kind: 'num' }, { label: '×', insert: '×', kind: 'op', aria: 'multiply' },
  { label: '4', insert: '4', kind: 'num' }, { label: '5', insert: '5', kind: 'num' }, { label: '6', insert: '6', kind: 'num' }, { label: '−', insert: '−', kind: 'op', aria: 'minus' },
  { label: '1', insert: '1', kind: 'num' }, { label: '2', insert: '2', kind: 'num' }, { label: '3', insert: '3', kind: 'num' }, { label: '+', insert: '+', kind: 'op', aria: 'plus' },
  { label: '0', insert: '0', kind: 'num', wide: true }, { label: '.', insert: '.', kind: 'num', aria: 'decimal point' }, { label: '=', action: 'equals', kind: 'eq', aria: 'equals' },
];

interface Entry { expr: string; result: string }

export function ScientificCalculator() {
  const [expr, setExpr] = useState('');
  const [angle, setAngle] = useState<AngleMode>('deg');
  const [history, setHistory] = useState<Entry[]>([]);
  const [error, setError] = useState('');
  const [justEvaluated, setJustEvaluated] = useState(false);
  const ans = history[0]?.result ?? '0';

  const preview = useMemo(() => {
    if (!expr.trim()) return '';
    try {
      return formatCalcResult(evaluateExpression(expr, angle));
    } catch {
      return '';
    }
  }, [expr, angle]);

  const insert = useCallback((text: string) => {
    setError('');
    setExpr((e) => {
      // After "=", typing a digit starts fresh; typing an operator continues from the result.
      if (justEvaluated && /^[\d.(πe√a-z]/i.test(text)) return text;
      return e + text;
    });
    setJustEvaluated(false);
  }, [justEvaluated]);

  const equals = useCallback(() => {
    if (!expr.trim()) return;
    try {
      const result = formatCalcResult(evaluateExpression(expr, angle));
      setHistory((h) => [{ expr, result }, ...h].slice(0, 20));
      setExpr(result === 'Error' ? '' : result.replace('−', '-'));
      setError('');
      setJustEvaluated(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid expression');
    }
  }, [expr, angle]);

  const press = useCallback((k: Key) => {
    if (k.insert) return insert(k.insert);
    setError('');
    if (k.action === 'clear') { setExpr(''); setJustEvaluated(false); }
    if (k.action === 'back') { setExpr((e) => e.replace(/(sin\(|cos\(|tan\(|ln\(|log\(|√\(|.)$/, '')); setJustEvaluated(false); }
    if (k.action === 'equals') equals();
    if (k.action === 'invert') { setExpr((e) => (e ? `1/(${e})` : '1/')); setJustEvaluated(false); }
    if (k.action === 'ans') insert(ans);
  }, [insert, equals, ans]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.metaKey || e.ctrlKey || e.altKey || target.closest('input, textarea, select')) return;
      const map: Record<string, string> = { '*': '×', '/': '÷', '-': '−' };
      if (/^[0-9.+()^!%a-z]$/i.test(e.key) || e.key in map) { e.preventDefault(); insert(map[e.key] ?? e.key.toLowerCase()); }
      else if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); equals(); }
      else if (e.key === 'Backspace') { e.preventDefault(); press({ label: '⌫', action: 'back' }); }
      else if (e.key === 'Escape') { e.preventDefault(); press({ label: 'AC', action: 'clear' }); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [insert, equals, press]);

  const renderKey = (k: Key) => (
    <button key={k.label} type="button" className={`key key-${k.kind}${k.wide ? ' key-wide' : ''}`} aria-label={k.aria ?? k.label} onClick={() => press(k)}>
      {k.label === '⌫' ? <Delete size={18} strokeWidth={1.75} /> : k.label}
    </button>
  );

  return (
    <div className="scicalc">
      <section className="card scicalc-main" aria-label="Calculator">
        <div className="scicalc-display">
          <div className="scicalc-top">
            <Segmented value={angle} onChange={setAngle} options={[{ value: 'deg', label: 'DEG' }, { value: 'rad', label: 'RAD' }]} label="Angle unit" />
            <CopyButton text={preview || (justEvaluated ? expr : '')} label="Copy result" />
          </div>
          <div className="scicalc-expr" aria-label="Expression">{expr || '0'}</div>
          <output className={`scicalc-result ${error ? 'bad' : ''}`} aria-live="polite">
            {error || (preview && !justEvaluated ? `= ${preview}` : ' ')}
          </output>
        </div>
        <div className="scicalc-keys">
          <div className="keys-sci">{SCI.map(renderKey)}</div>
          <div className="keys-num">{PAD.map(renderKey)}</div>
        </div>
        <p className="muted">Tip: type on your keyboard. Enter evaluates, Esc clears.</p>
      </section>
      <Card title="History" className="scicalc-history" actions={history.length ? <button type="button" className="btn btn-ghost btn-sm" onClick={() => setHistory([])}>Clear</button> : undefined}>
        {history.length === 0 ? (
          <p className="muted">Calculations you run appear here. Select one to reuse its result.</p>
        ) : (
          <ul className="history-list">
            {history.map((h, i) => (
              <li key={i}>
                <button type="button" onClick={() => { setExpr(h.result); setJustEvaluated(true); }}>
                  <span className="history-expr">{h.expr}</span>
                  <span className="history-result">= {h.result}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
