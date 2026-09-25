import {
  currencies,
  currencySymbol,
  defaultValues,
  getCalculatorSpec,
  runCalculator,
  type CalcField,
  type CurrencyCode,
  type FieldValues,
} from '@omnikit/core';
import { RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Alert, Card, Segmented } from '../../components/ui';
import { useAppState } from '../../state/AppState';
import { formatValue } from './format';
import { StackedBarChart } from './StackedBarChart';

function FieldControl({ field, value, onChange, currency }: { field: CalcField; value: string | number; onChange: (v: string) => void; currency: CurrencyCode }) {
  const id = `f-${field.id}`;
  if (field.type === 'select') {
    const options = field.options ?? [];
    return (
      <div className="calc-field">
        <span className="field-label" id={`${id}-label`}>{field.label}</span>
        {options.length <= 4 ? (
          <Segmented value={String(value)} onChange={onChange} options={options} label={field.label} />
        ) : (
          <select id={id} value={String(value)} onChange={(e) => onChange(e.target.value)} aria-labelledby={`${id}-label`}>
            {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        )}
        {field.hint && <span className="field-hint">{field.hint}</span>}
      </div>
    );
  }
  if (field.type === 'date') {
    return (
      <div className="calc-field">
        <label className="field-label" htmlFor={id}>{field.label}</label>
        <input id={id} type="date" value={String(value)} onChange={(e) => onChange(e.target.value)} />
        {field.hint && <span className="field-hint">{field.hint}</span>}
      </div>
    );
  }
  const prefix = field.type === 'money' ? currencySymbol(currency) : undefined;
  const suffix = field.type === 'percent' ? '%' : field.type === 'years' ? (Number(value) === 1 ? 'year' : 'years') : field.unit;
  const num = Number(value);
  return (
    <div className="calc-field">
      <div className="calc-field-row">
        <label className="field-label" htmlFor={id}>{field.label}</label>
        <span className="affix-input">
          {prefix && <span className="affix">{prefix}</span>}
          <input id={id} inputMode="decimal" value={String(value)} onChange={(e) => onChange(e.target.value.replace(/[^\d.\-]/g, ''))} aria-describedby={field.hint ? `${id}-hint` : undefined} />
          {suffix && <span className="affix">{suffix}</span>}
        </span>
      </div>
      {field.slider && (
        <input
          type="range"
          aria-label={`${field.label} slider`}
          min={field.slider.min}
          max={field.slider.max}
          step={field.slider.step}
          value={Number.isFinite(num) ? Math.min(Math.max(num, field.slider.min), field.slider.max) : field.slider.min}
          onChange={(e) => onChange(e.target.value)}
          style={{ '--fill': `${((Math.min(Math.max(num, field.slider.min), field.slider.max) - field.slider.min) / (field.slider.max - field.slider.min)) * 100}%` } as React.CSSProperties}
        />
      )}
      {field.hint && <span className="field-hint" id={`${id}-hint`}>{field.hint}</span>}
    </div>
  );
}

export function FormCalculator({ toolId }: { toolId: string }) {
  const spec = getCalculatorSpec(toolId)!;
  const { currency, setCurrency } = useAppState();
  const [values, setValues] = useState<FieldValues>(() => defaultValues(spec));
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const result = useMemo(() => runCalculator(spec, values), [spec, values]);
  const visible = spec.fields.filter((f) => !f.visible || f.visible(values));
  const set = (id: string) => (v: string) => setValues((prev) => ({ ...prev, [id]: v }));

  const output = result.ok ? result.output : null;
  const primary = output?.results.find((r) => r.primary);
  const others = output?.results.filter((r) => !r.primary) ?? [];

  return (
    <div className="calc">
      <Card
        title="Inputs"
        className="calc-inputs"
        actions={
          <>
            {spec.usesCurrency && (
              <select className="currency-select" value={currency} onChange={(e) => setCurrency(e.target.value as CurrencyCode)} aria-label="Currency">
                {currencies.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            )}
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setValues(defaultValues(spec))}>
              <RotateCcw size={14} /> Reset
            </button>
          </>
        }
      >
        {visible.map((f) => <FieldControl key={f.id} field={f} value={values[f.id] ?? ''} onChange={set(f.id)} currency={currency} />)}
      </Card>

      <section className="card calc-results" aria-live="polite" aria-label="Results">
        {!result.ok ? (
          <Alert>{result.error}</Alert>
        ) : (
          <>
            {primary && (
              <div className="calc-primary">
                <span className="field-label">{primary.label}</span>
                <output className="calc-primary-value">{formatValue(primary.value, primary.kind, currency)}</output>
              </div>
            )}
            {others.length > 0 && (
              <dl className="calc-list">
                {others.map((r) => (
                  <div key={r.label}>
                    <dt>{r.label}</dt>
                    <dd>{formatValue(r.value, r.kind, currency)}</dd>
                  </div>
                ))}
              </dl>
            )}
            {output?.summary && <p className="calc-summary">{output.summary}</p>}
          </>
        )}
      </section>

      {output?.table && (
        <Card
          className="calc-breakdown"
          title={output.table.caption}
          actions={output.chart ? <Segmented value={view} onChange={setView} options={[{ value: 'chart', label: 'Chart' }, { value: 'table', label: 'Table' }]} label="Breakdown view" /> : undefined}
        >
          {output.chart && view === 'chart' ? (
            <StackedBarChart chart={output.chart} rows={output.table.rows} currency={currency} />
          ) : (
            <div className="table-scroll">
              <table className="table num-table">
                <thead>
                  <tr>{output.table.columns.map((c) => <th key={c.id} scope="col">{c.label}</th>)}</tr>
                </thead>
                <tbody>
                  {output.table.rows.map((row, i) => (
                    <tr key={i}>
                      {output.table!.columns.map((c) => <td key={c.id}>{formatValue(row[c.id] ?? 0, c.kind, currency)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
