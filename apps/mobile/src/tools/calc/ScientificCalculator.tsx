import { evaluateExpression, formatCalcResult, type AngleMode } from '@omnikit/core';
import * as Haptics from 'expo-haptics';
import { Delete } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Card, CopyButton, Screen, Segmented, Text } from '@/components/ui';
import { fonts, radius, useColors } from '@/theme/colors';

type Key = { label: string; insert?: string; action?: 'clear' | 'back' | 'equals' | 'invert' | 'ans'; kind: 'num' | 'op' | 'fn' | 'eq' | 'util'; a11y?: string; wide?: boolean };

const SCI: Key[] = [
  { label: 'sin', insert: 'sin(', kind: 'fn' }, { label: 'cos', insert: 'cos(', kind: 'fn' }, { label: 'tan', insert: 'tan(', kind: 'fn' }, { label: 'ln', insert: 'ln(', kind: 'fn' }, { label: 'log', insert: 'log(', kind: 'fn' },
  { label: '√', insert: '√(', kind: 'fn', a11y: 'square root' }, { label: 'x²', insert: '^2', kind: 'fn', a11y: 'square' }, { label: 'xʸ', insert: '^', kind: 'fn', a11y: 'power' }, { label: 'n!', insert: '!', kind: 'fn', a11y: 'factorial' }, { label: 'π', insert: 'π', kind: 'fn', a11y: 'pi' },
  { label: 'e', insert: 'e', kind: 'fn' }, { label: '1/x', action: 'invert', kind: 'fn', a11y: 'reciprocal' }, { label: '(', insert: '(', kind: 'fn' }, { label: ')', insert: ')', kind: 'fn' }, { label: 'Ans', action: 'ans', kind: 'fn', a11y: 'previous answer' },
];
const PAD: Key[] = [
  { label: 'AC', action: 'clear', kind: 'util', a11y: 'clear all' }, { label: '⌫', action: 'back', kind: 'util', a11y: 'delete' }, { label: '%', insert: '%', kind: 'op', a11y: 'percent' }, { label: '÷', insert: '÷', kind: 'op', a11y: 'divide' },
  { label: '7', insert: '7', kind: 'num' }, { label: '8', insert: '8', kind: 'num' }, { label: '9', insert: '9', kind: 'num' }, { label: '×', insert: '×', kind: 'op', a11y: 'multiply' },
  { label: '4', insert: '4', kind: 'num' }, { label: '5', insert: '5', kind: 'num' }, { label: '6', insert: '6', kind: 'num' }, { label: '−', insert: '−', kind: 'op', a11y: 'minus' },
  { label: '1', insert: '1', kind: 'num' }, { label: '2', insert: '2', kind: 'num' }, { label: '3', insert: '3', kind: 'num' }, { label: '+', insert: '+', kind: 'op', a11y: 'plus' },
  { label: '0', insert: '0', kind: 'num', wide: true }, { label: '.', insert: '.', kind: 'num', a11y: 'decimal point' }, { label: '=', action: 'equals', kind: 'eq', a11y: 'equals' },
];

export function ScientificCalculator() {
  const c = useColors();
  const [expr, setExpr] = useState('');
  const [angle, setAngle] = useState<AngleMode>('deg');
  const [history, setHistory] = useState<{ expr: string; result: string }[]>([]);
  const [error, setError] = useState('');
  const [evaluated, setEvaluated] = useState(false);

  const preview = useMemo(() => {
    if (!expr.trim()) return '';
    try { return formatCalcResult(evaluateExpression(expr, angle)); } catch { return ''; }
  }, [expr, angle]);

  const press = (k: Key) => {
    Haptics.selectionAsync().catch(() => undefined);
    setError('');
    if (k.insert) {
      const text = k.insert;
      setExpr((e) => (evaluated && /^[\d.(πe√a-z]/i.test(text) ? text : e + text));
      setEvaluated(false);
      return;
    }
    if (k.action === 'clear') { setExpr(''); setEvaluated(false); }
    if (k.action === 'back') { setExpr((e) => e.replace(/(sin\(|cos\(|tan\(|ln\(|log\(|√\(|.)$/, '')); setEvaluated(false); }
    if (k.action === 'invert') { setExpr((e) => (e ? `1/(${e})` : '1/')); setEvaluated(false); }
    if (k.action === 'ans') { setExpr((e) => (evaluated ? history[0]?.result ?? '' : e + (history[0]?.result ?? ''))); setEvaluated(false); }
    if (k.action === 'equals' && expr.trim()) {
      try {
        const result = formatCalcResult(evaluateExpression(expr, angle));
        setHistory((h) => [{ expr, result }, ...h].slice(0, 20));
        setExpr(result === 'Error' ? '' : result);
        setEvaluated(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Invalid expression');
      }
    }
  };

  const keyStyle = (k: Key, pressed: boolean) => {
    const bg = k.kind === 'eq' ? (pressed ? c.accentStrong : c.ink) : k.kind === 'fn' ? c.background : pressed ? c.surface2 : c.surface;
    return {
      flexGrow: k.wide ? 2 : 1, flexBasis: 0, height: k.kind === 'fn' ? 42 : 56, borderRadius: radius.md, borderWidth: 1,
      borderColor: k.kind === 'eq' ? c.ink : c.line, backgroundColor: bg, alignItems: 'center' as const, justifyContent: 'center' as const,
    };
  };
  const keyText = (k: Key) => ({
    fontSize: k.kind === 'fn' ? 15 : 21,
    fontFamily: k.kind === 'num' ? fonts.sansMedium : fonts.sansSemi,
    color: k.kind === 'eq' ? c.background : k.kind === 'op' ? c.accentStrong : k.kind === 'num' ? c.ink : c.ink2,
  });
  const renderRows = (keys: Key[], perRow: number) => {
    const rows: Key[][] = [];
    let row: Key[] = [];
    let width = 0;
    for (const k of keys) {
      row.push(k);
      width += k.wide ? 2 : 1;
      if (width >= perRow) { rows.push(row); row = []; width = 0; }
    }
    if (row.length) rows.push(row);
    return rows.map((r, i) => (
      <View key={i} style={{ flexDirection: 'row', gap: 8 }}>
        {r.map((k) => (
          <Pressable key={k.label} accessibilityRole="button" accessibilityLabel={k.a11y ?? k.label} onPress={() => press(k)} style={({ pressed }) => keyStyle(k, pressed)}>
            {k.label === '⌫' ? <Delete size={20} color={c.ink2} strokeWidth={1.75} /> : <Text style={keyText(k)}>{k.label}</Text>}
          </Pressable>
        ))}
      </View>
    ));
  };

  return (
    <Screen>
      <View style={{ gap: 6, padding: 14, borderRadius: radius.lg, borderWidth: 1, borderColor: c.line, backgroundColor: c.surface }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Segmented value={angle} onChange={setAngle} options={[{ value: 'deg', label: 'DEG' }, { value: 'rad', label: 'RAD' }]} />
          <CopyButton text={preview} label="Copy" />
        </View>
        <Text selectable style={{ fontFamily: fonts.mono, fontSize: 28, textAlign: 'right', minHeight: 38 }} accessibilityLabel="Expression">{expr || '0'}</Text>
        <Text style={{ textAlign: 'right', fontSize: 17, color: error ? c.bad : c.ink2, minHeight: 24 }} accessibilityLiveRegion="polite">
          {error || (preview && !evaluated ? `= ${preview}` : ' ')}
        </Text>
      </View>
      <View style={{ gap: 8 }}>{renderRows(SCI, 5)}</View>
      <View style={{ gap: 8 }}>{renderRows(PAD, 4)}</View>
      {history.length > 0 && (
        <Card title="History" right={<CopyButton text={history.map((h) => `${h.expr} = ${h.result}`).join('\n')} label="Copy all" />}>
          {history.map((h, i) => (
            <Pressable key={i} onPress={() => { setExpr(h.result); setEvaluated(true); }} style={{ alignItems: 'flex-end', paddingVertical: 6, borderTopWidth: i ? 1 : 0, borderColor: c.line }}>
              <Text style={{ fontFamily: fonts.mono, fontSize: 13, color: c.muted }}>{h.expr}</Text>
              <Text style={{ fontFamily: fonts.sansSemi, fontSize: 16 }}>= {h.result}</Text>
            </Pressable>
          ))}
        </Card>
      )}
    </Screen>
  );
}
