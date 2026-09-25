import {
  currencies,
  currencySymbol,
  defaultValues,
  formatCalcValue,
  getCalculatorSpec,
  runCalculator,
  type CalcField,
  type CurrencyCode,
  type FieldValues,
} from '@omnikit/core';
import Slider from '@react-native-community/slider';
import { useMemo, useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';

import { DateField } from '@/components/DateField';
import { Button, Card, Chip, Heading, Label, Notice, Screen, Segmented, Text } from '@/components/ui';
import { useAppState } from '@/state/AppState';
import { fonts, radius, useColors } from '@/theme/colors';

import { StackedBarChart } from './StackedBarChart';

function NumberField({ field, value, onChange, currency, hue }: { field: CalcField; value: string; onChange: (v: string) => void; currency: CurrencyCode; hue: string }) {
  const c = useColors();
  const prefix = field.type === 'money' ? currencySymbol(currency) : undefined;
  const suffix = field.type === 'percent' ? '%' : field.type === 'years' ? (Number(value) === 1 ? 'year' : 'years') : field.unit;
  const num = Number(value);
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <Label style={{ flex: 1 }}>{field.label}</Label>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, width: 150, height: 44, paddingHorizontal: 10, borderWidth: 1, borderColor: c.lineStrong, borderRadius: radius.md, backgroundColor: c.surface }}>
          {prefix && <Text style={{ color: c.muted }}>{prefix}</Text>}
          <TextInput
            value={value}
            onChangeText={(t) => onChange(t.replace(/[^\d.\-]/g, ''))}
            keyboardType="decimal-pad"
            accessibilityLabel={field.label}
            // minWidth: 0 lets the input shrink inside the fixed-width box (react-native-web otherwise uses the browser's ~20ch default).
            style={{ flex: 1, minWidth: 0, textAlign: 'right', color: c.ink, fontFamily: fonts.sansSemi, fontSize: 16, padding: 0 }}
          />
          {suffix && <Text style={{ color: c.muted, fontSize: 13 }}>{suffix}</Text>}
        </View>
      </View>
      {field.slider && (
        <Slider
          minimumValue={field.slider.min}
          maximumValue={field.slider.max}
          step={field.slider.step}
          value={Number.isFinite(num) ? Math.min(Math.max(num, field.slider.min), field.slider.max) : field.slider.min}
          onValueChange={(v) => onChange(String(Number.parseFloat(v.toFixed(4))))}
          minimumTrackTintColor={hue}
          maximumTrackTintColor={c.line}
          thumbTintColor={hue}
          accessibilityLabel={`${field.label} slider`}
          style={{ height: 32, marginHorizontal: -8 }}
        />
      )}
      {field.hint && <Text style={{ color: c.muted, fontSize: 12.5, lineHeight: 18 }}>{field.hint}</Text>}
    </View>
  );
}

export function FormCalculator({ toolId, category }: { toolId: string; category: 'finance' | 'calculator' }) {
  const spec = getCalculatorSpec(toolId)!;
  const c = useColors();
  const hue = c.cat[category];
  const { currency, setCurrency } = useAppState();
  const [values, setValues] = useState<FieldValues>(() => defaultValues(spec));
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const result = useMemo(() => runCalculator(spec, values), [spec, values]);
  const set = (id: string) => (v: string) => setValues((p) => ({ ...p, [id]: v }));
  const output = result.ok ? result.output : null;
  const primary = output?.results.find((r) => r.primary);

  return (
    <Screen>
      {/* Headline result first on phones, so it's visible while adjusting inputs below. */}
      <Card style={{ gap: 14 }}>
        {!result.ok ? (
          <Notice>{result.error}</Notice>
        ) : (
          <>
            {primary && (
              <View style={{ gap: 2 }}>
                <Label>{primary.label}</Label>
                <Heading size={32} accessibilityLiveRegion="polite">{formatCalcValue(primary.value, primary.kind, currency)}</Heading>
              </View>
            )}
            {output!.results.filter((r) => !r.primary).map((r) => (
              <View key={r.label} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingTop: 10, borderTopWidth: 1, borderColor: c.line }}>
                <Text style={{ color: c.ink2, flexShrink: 1 }}>{r.label}</Text>
                <Text style={{ fontFamily: fonts.sansSemi, textAlign: 'right', flexShrink: 1 }}>{formatCalcValue(r.value, r.kind, currency)}</Text>
              </View>
            ))}
            {output!.summary && <Text style={{ color: c.ink2, fontSize: 13.5, lineHeight: 19, backgroundColor: c.surface2, padding: 10, borderRadius: radius.md, overflow: 'hidden' }}>{output!.summary}</Text>}
          </>
        )}
      </Card>

      <Card title="Inputs" right={<Button small kind="ghost" label="Reset" onPress={() => setValues(defaultValues(spec))} />} style={{ gap: 18 }}>
        {spec.usesCurrency && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {currencies.map((cur) => <Chip key={cur.code} label={cur.label} active={cur.code === currency} onPress={() => setCurrency(cur.code)} />)}
          </ScrollView>
        )}
        {spec.fields.filter((f) => !f.visible || f.visible(values)).map((f) => {
          const v = String(values[f.id] ?? '');
          if (f.type === 'select') {
            return (
              <View key={f.id} style={{ gap: 8 }}>
                <Label>{f.label}</Label>
                <Segmented value={v} onChange={set(f.id)} options={f.options ?? []} />
                {f.hint && <Text style={{ color: c.muted, fontSize: 12.5 }}>{f.hint}</Text>}
              </View>
            );
          }
          if (f.type === 'date') return <DateField key={f.id} label={f.label} value={v} onChange={set(f.id)} />;
          return <NumberField key={f.id} field={f} value={v} onChange={set(f.id)} currency={currency} hue={hue} />;
        })}
      </Card>

      {output?.table && (
        <Card title={output.table.caption} right={output.chart ? <Segmented value={view} onChange={setView} options={[{ value: 'chart', label: 'Chart' }, { value: 'table', label: 'Table' }]} /> : undefined}>
          {output.chart && view === 'chart' ? (
            <StackedBarChart chart={output.chart} rows={output.table.rows} currency={currency} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <View>
                <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: c.line, paddingBottom: 6 }}>
                  {output.table.columns.map((col, i) => (
                    <Text key={col.id} style={{ width: i === 0 ? 48 : 120, textAlign: i === 0 ? 'left' : 'right', fontFamily: fonts.sansSemi, fontSize: 12.5, color: c.ink2 }}>{col.label}</Text>
                  ))}
                </View>
                {output.table.rows.map((row, r) => (
                  <View key={r} style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderColor: c.line }}>
                    {output.table!.columns.map((col, i) => (
                      <Text key={col.id} style={{ width: i === 0 ? 48 : 120, textAlign: i === 0 ? 'left' : 'right', fontSize: 13.5 }}>{formatCalcValue(row[col.id] ?? 0, col.kind, currency)}</Text>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </Card>
      )}
    </Screen>
  );
}
