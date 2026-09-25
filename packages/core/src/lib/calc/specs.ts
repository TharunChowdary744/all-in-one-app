import { addToDate, age, bmi, dateDifference, parseDate, percentage, tipSplit, toDateInput, type PercentMode } from './everyday';
import { cagr, emi, gst, interest, lumpsum, sip, swp } from './finance';

/**
 * Declarative form calculators. Each spec lists its inputs and a pure `compute` that returns
 * results, an optional year-by-year table and an optional stacked-bar chart. The web and mobile
 * apps render any spec with one generic component, so every calculator looks and behaves alike.
 */

export type ValueKind = 'money' | 'percent' | 'number' | 'years' | 'text' | 'multiple' | 'days';

export type FieldValue = number | string;
export type FieldValues = Record<string, FieldValue>;

export interface CalcField {
  id: string;
  label: string;
  type: 'money' | 'percent' | 'number' | 'years' | 'select' | 'date';
  default: FieldValue | (() => FieldValue);
  /** Slider range for numeric fields; typed values may go beyond it within [min, max]. */
  slider?: { min: number; max: number; step: number };
  min?: number;
  max?: number;
  unit?: string;
  hint?: string;
  options?: { value: string; label: string }[];
  /** Hide the field unless this returns true for the current values. */
  visible?: (v: FieldValues) => boolean;
}

export interface CalcResult {
  label: string;
  value: number | string;
  kind: ValueKind;
  /** The headline figure (shown larger). */
  primary?: boolean;
}

export interface CalcTable {
  caption: string;
  columns: { id: string; label: string; kind: ValueKind }[];
  rows: Record<string, number>[];
}

export interface CalcChart {
  title: string;
  /** Row key for the x axis (e.g. "year"). */
  x: string;
  xLabel: (x: number) => string;
  /** Stacked from the baseline up: `base` is the user's money / principal, `growth` is gains / interest. */
  series: { id: string; label: string; role: 'base' | 'growth' }[];
}

export interface CalcOutput {
  results: CalcResult[];
  /** One plain-language sentence summarising the outcome. */
  summary?: string;
  table?: CalcTable;
  chart?: CalcChart;
}

export interface CalculatorSpec {
  toolId: string;
  /** Show the currency picker (money fields/results). */
  usesCurrency?: boolean;
  fields: CalcField[];
  /** Return an error message for invalid input, or null. */
  validate?: (v: FieldValues) => string | null;
  compute: (v: FieldValues) => CalcOutput;
}

const n = (v: FieldValues, k: string) => Number(v[k]);
const s = (v: FieldValues, k: string) => String(v[k]);
const positive = (v: FieldValues, keys: string[], label: Record<string, string>) => {
  for (const k of keys) if (!(n(v, k) > 0)) return `${label[k]} must be greater than 0.`;
  return null;
};
const yearLabel = (y: number) => `Y${y}`;
/** "1 day" / "2 days". */
const plural = (count: number, unit: string) => `${count.toLocaleString('en-US')} ${unit}${count === 1 ? '' : 's'}`;
const ymd = (r: { years: number; months: number; days: number }) => `${plural(r.years, 'year')}, ${plural(r.months, 'month')}, ${plural(r.days, 'day')}`;
const wd = (r: { weeks: number; remainderDays: number }) => `${plural(r.weeks, 'week')}, ${plural(r.remainderDays, 'day')}`;

const growthTable = (rows: { year: number; invested: number; value: number; gains: number }[], investedLabel = 'Invested'): CalcTable => ({
  caption: 'Year-by-year growth',
  columns: [
    { id: 'year', label: 'Year', kind: 'number' },
    { id: 'invested', label: investedLabel, kind: 'money' },
    { id: 'gains', label: 'Returns', kind: 'money' },
    { id: 'value', label: 'Value', kind: 'money' },
  ],
  rows: rows.map((r) => ({ ...r })),
});

const growthChart = (title: string, baseLabel = 'Invested'): CalcChart => ({
  title,
  x: 'year',
  xLabel: yearLabel,
  series: [
    { id: 'invested', label: baseLabel, role: 'base' },
    { id: 'gains', label: 'Returns', role: 'growth' },
  ],
});

export const calculatorSpecs: CalculatorSpec[] = [
  {
    toolId: 'sip-calculator',
    usesCurrency: true,
    fields: [
      { id: 'monthly', label: 'Monthly investment', type: 'money', default: 10000, min: 1, slider: { min: 500, max: 200000, step: 500 } },
      { id: 'rate', label: 'Expected return (p.a.)', type: 'percent', default: 12, min: 0, max: 50, slider: { min: 1, max: 30, step: 0.5 } },
      { id: 'years', label: 'Time period', type: 'years', default: 10, min: 1, max: 60, slider: { min: 1, max: 40, step: 1 } },
      { id: 'stepUp', label: 'Annual step-up', type: 'percent', default: 0, min: 0, max: 100, slider: { min: 0, max: 25, step: 1 }, hint: 'Increase your monthly investment by this much every year. Leave at 0 for a flat SIP.' },
    ],
    validate: (v) => positive(v, ['monthly', 'years'], { monthly: 'Monthly investment', years: 'Time period' }),
    compute: (v) => {
      const r = sip({ monthly: n(v, 'monthly'), annualRate: n(v, 'rate'), years: n(v, 'years'), stepUp: n(v, 'stepUp') });
      return {
        results: [
          { label: 'Estimated value', value: r.value, kind: 'money', primary: true },
          { label: 'Total invested', value: r.invested, kind: 'money' },
          { label: 'Estimated returns', value: r.gains, kind: 'money' },
          { label: 'Wealth gain', value: r.invested ? (r.gains / r.invested) * 100 : 0, kind: 'percent' },
        ],
        table: growthTable(r.yearly),
        chart: growthChart('Invested vs returns by year'),
      };
    },
  },
  {
    toolId: 'lumpsum-calculator',
    usesCurrency: true,
    fields: [
      { id: 'amount', label: 'Investment amount', type: 'money', default: 100000, min: 1, slider: { min: 1000, max: 10000000, step: 1000 } },
      { id: 'rate', label: 'Expected return (p.a.)', type: 'percent', default: 12, min: 0, max: 50, slider: { min: 1, max: 30, step: 0.5 } },
      { id: 'years', label: 'Time period', type: 'years', default: 10, min: 1, max: 60, slider: { min: 1, max: 40, step: 1 } },
    ],
    validate: (v) => positive(v, ['amount', 'years'], { amount: 'Investment amount', years: 'Time period' }),
    compute: (v) => {
      const r = lumpsum({ amount: n(v, 'amount'), annualRate: n(v, 'rate'), years: n(v, 'years') });
      return {
        results: [
          { label: 'Estimated value', value: r.value, kind: 'money', primary: true },
          { label: 'Invested', value: r.invested, kind: 'money' },
          { label: 'Estimated returns', value: r.gains, kind: 'money' },
          { label: 'Growth multiple', value: r.value / r.invested, kind: 'multiple' },
        ],
        table: growthTable(r.yearly),
        chart: growthChart('Invested vs returns by year'),
      };
    },
  },
  {
    toolId: 'swp-calculator',
    usesCurrency: true,
    fields: [
      { id: 'corpus', label: 'Total investment', type: 'money', default: 1000000, min: 1, slider: { min: 10000, max: 50000000, step: 10000 } },
      { id: 'withdrawal', label: 'Monthly withdrawal', type: 'money', default: 10000, min: 1, slider: { min: 500, max: 500000, step: 500 } },
      { id: 'rate', label: 'Expected return (p.a.)', type: 'percent', default: 8, min: 0, max: 50, slider: { min: 1, max: 20, step: 0.5 } },
      { id: 'years', label: 'Time period', type: 'years', default: 10, min: 1, max: 60, slider: { min: 1, max: 40, step: 1 } },
    ],
    validate: (v) => positive(v, ['corpus', 'withdrawal', 'years'], { corpus: 'Total investment', withdrawal: 'Monthly withdrawal', years: 'Time period' }),
    compute: (v) => {
      const r = swp({ corpus: n(v, 'corpus'), monthlyWithdrawal: n(v, 'withdrawal'), annualRate: n(v, 'rate'), years: n(v, 'years') });
      const depleted = r.depletedAtMonth;
      return {
        results: [
          { label: 'Final balance', value: r.finalBalance, kind: 'money', primary: true },
          { label: 'Total withdrawn', value: r.withdrawn, kind: 'money' },
          { label: 'Investment', value: n(v, 'corpus'), kind: 'money' },
        ],
        summary: depleted
          ? `At this rate the money runs out after ${plural(Math.floor(depleted / 12), 'year')} ${plural(depleted % 12, 'month')}.`
          : 'Your investment lasts the whole period.',
        table: {
          caption: 'Balance by year',
          columns: [
            { id: 'year', label: 'Year', kind: 'number' },
            { id: 'withdrawn', label: 'Withdrawn so far', kind: 'money' },
            { id: 'balance', label: 'Balance', kind: 'money' },
          ],
          rows: r.yearly.map((x) => ({ ...x })),
        },
        chart: {
          title: 'Remaining balance vs amount withdrawn',
          x: 'year',
          xLabel: yearLabel,
          series: [
            { id: 'balance', label: 'Balance', role: 'base' },
            { id: 'withdrawn', label: 'Withdrawn so far', role: 'growth' },
          ],
        },
      };
    },
  },
  {
    toolId: 'emi-calculator',
    usesCurrency: true,
    fields: [
      { id: 'principal', label: 'Loan amount', type: 'money', default: 2500000, min: 1, slider: { min: 10000, max: 50000000, step: 10000 } },
      { id: 'rate', label: 'Interest rate (p.a.)', type: 'percent', default: 8.5, min: 0, max: 50, slider: { min: 1, max: 20, step: 0.05 } },
      { id: 'years', label: 'Loan tenure', type: 'years', default: 20, min: 1, max: 40, slider: { min: 1, max: 30, step: 1 } },
    ],
    validate: (v) => positive(v, ['principal', 'years'], { principal: 'Loan amount', years: 'Loan tenure' }),
    compute: (v) => {
      const r = emi({ principal: n(v, 'principal'), annualRate: n(v, 'rate'), years: n(v, 'years') });
      return {
        results: [
          { label: 'Monthly EMI', value: r.emi, kind: 'money', primary: true },
          { label: 'Principal', value: n(v, 'principal'), kind: 'money' },
          { label: 'Total interest', value: r.totalInterest, kind: 'money' },
          { label: 'Total payment', value: r.totalPayment, kind: 'money' },
        ],
        table: {
          caption: 'Amortization schedule (yearly)',
          columns: [
            { id: 'year', label: 'Year', kind: 'number' },
            { id: 'principalPaid', label: 'Principal paid', kind: 'money' },
            { id: 'interestPaid', label: 'Interest paid', kind: 'money' },
            { id: 'balance', label: 'Balance', kind: 'money' },
          ],
          rows: r.yearly.map((x) => ({ ...x })),
        },
        chart: {
          title: 'Principal vs interest paid each year',
          x: 'year',
          xLabel: yearLabel,
          series: [
            { id: 'principalPaid', label: 'Principal', role: 'base' },
            { id: 'interestPaid', label: 'Interest', role: 'growth' },
          ],
        },
      };
    },
  },
  {
    toolId: 'interest-calculator',
    usesCurrency: true,
    fields: [
      {
        id: 'type', label: 'Interest type', type: 'select', default: 'compound',
        options: [{ value: 'compound', label: 'Compound' }, { value: 'simple', label: 'Simple' }],
      },
      { id: 'principal', label: 'Principal amount', type: 'money', default: 100000, min: 1, slider: { min: 1000, max: 10000000, step: 1000 } },
      { id: 'rate', label: 'Interest rate (p.a.)', type: 'percent', default: 7, min: 0, max: 50, slider: { min: 1, max: 15, step: 0.05 } },
      { id: 'years', label: 'Time period', type: 'years', default: 5, min: 0.25, max: 60, slider: { min: 1, max: 30, step: 1 } },
      {
        id: 'frequency', label: 'Compounding', type: 'select', default: '4',
        options: [{ value: '12', label: 'Monthly' }, { value: '4', label: 'Quarterly' }, { value: '2', label: 'Half-yearly' }, { value: '1', label: 'Yearly' }],
        visible: (v) => v.type === 'compound',
        hint: 'Most bank fixed deposits compound quarterly.',
      },
    ],
    validate: (v) => positive(v, ['principal', 'years'], { principal: 'Principal amount', years: 'Time period' }),
    compute: (v) => {
      const r = interest({ principal: n(v, 'principal'), annualRate: n(v, 'rate'), years: n(v, 'years'), frequency: n(v, 'frequency'), type: s(v, 'type') as 'compound' | 'simple' });
      return {
        results: [
          { label: 'Maturity value', value: r.value, kind: 'money', primary: true },
          { label: 'Principal', value: n(v, 'principal'), kind: 'money' },
          { label: 'Interest earned', value: r.interest, kind: 'money' },
          { label: 'Effective annual rate', value: r.effectiveRate, kind: 'percent' },
        ],
        table: growthTable(r.yearly, 'Principal'),
        chart: growthChart('Principal vs interest by year', 'Principal'),
      };
    },
  },
  {
    toolId: 'cagr-calculator',
    usesCurrency: true,
    fields: [
      { id: 'initial', label: 'Initial value', type: 'money', default: 100000, min: 0.01 },
      { id: 'final', label: 'Final value', type: 'money', default: 250000, min: 0.01 },
      { id: 'years', label: 'Duration', type: 'years', default: 5, min: 0.1, max: 100, slider: { min: 1, max: 30, step: 1 } },
    ],
    validate: (v) => positive(v, ['initial', 'final', 'years'], { initial: 'Initial value', final: 'Final value', years: 'Duration' }),
    compute: (v) => {
      const r = cagr({ initial: n(v, 'initial'), final: n(v, 'final'), years: n(v, 'years') });
      return {
        results: [
          { label: 'CAGR', value: r.cagr, kind: 'percent', primary: true },
          { label: 'Absolute return', value: r.absoluteReturn, kind: 'percent' },
          { label: 'Growth multiple', value: r.multiple, kind: 'multiple' },
        ],
        summary: `Growing at ${r.cagr.toFixed(2)}% a year turns the initial value into the final value in ${n(v, 'years')} years.`,
      };
    },
  },
  {
    toolId: 'gst-calculator',
    usesCurrency: true,
    fields: [
      {
        id: 'mode', label: 'Calculation', type: 'select', default: 'add',
        options: [{ value: 'add', label: 'Add GST' }, { value: 'remove', label: 'Remove GST' }],
      },
      { id: 'amount', label: 'Amount', type: 'money', default: 10000, min: 0, hint: 'Price before GST when adding; GST-inclusive price when removing.' },
      {
        id: 'rate', label: 'GST rate', type: 'select', default: '18',
        options: ['3', '5', '12', '18', '28'].map((x) => ({ value: x, label: `${x}%` })),
      },
    ],
    validate: (v) => (n(v, 'amount') >= 0 ? null : 'Amount cannot be negative.'),
    compute: (v) => {
      const r = gst({ amount: n(v, 'amount'), rate: n(v, 'rate'), mode: s(v, 'mode') as 'add' | 'remove' });
      return {
        results: [
          { label: s(v, 'mode') === 'add' ? 'Total incl. GST' : 'Price excl. GST', value: s(v, 'mode') === 'add' ? r.gross : r.net, kind: 'money', primary: true },
          { label: 'Net price', value: r.net, kind: 'money' },
          { label: `GST (${n(v, 'rate')}%)`, value: r.tax, kind: 'money' },
          { label: 'CGST', value: r.cgst, kind: 'money' },
          { label: 'SGST', value: r.sgst, kind: 'money' },
        ],
        summary: 'For inter-state supplies the full amount is charged as IGST instead of CGST + SGST.',
      };
    },
  },
  {
    toolId: 'percentage-calculator',
    fields: [
      {
        id: 'mode', label: 'What do you want to work out?', type: 'select', default: 'of',
        options: [
          { value: 'of', label: 'X% of Y' },
          { value: 'whatPercent', label: 'X is what % of Y' },
          { value: 'change', label: '% change from X to Y' },
          { value: 'discount', label: 'Price after discount' },
        ],
      },
      { id: 'a', label: 'X', type: 'number', default: 15 },
      { id: 'b', label: 'Y', type: 'number', default: 200 },
    ],
    validate: (v) => {
      if (!Number.isFinite(n(v, 'a')) || !Number.isFinite(n(v, 'b'))) return 'Enter both numbers.';
      if (v.mode === 'whatPercent' && n(v, 'b') === 0) return 'Y cannot be 0.';
      if (v.mode === 'change' && n(v, 'a') === 0) return 'The starting value X cannot be 0.';
      return null;
    },
    compute: (v) => {
      const mode = s(v, 'mode') as PercentMode;
      const a = n(v, 'a');
      const b = n(v, 'b');
      const r = percentage(mode, a, b);
      const fmt = (x: number) => String(Number.parseFloat(x.toFixed(4)));
      switch (mode) {
        case 'of':
          return { results: [{ label: `${fmt(a)}% of ${fmt(b)}`, value: r.value, kind: 'number', primary: true }] };
        case 'whatPercent':
          return { results: [{ label: `${fmt(a)} is this much of ${fmt(b)}`, value: r.value, kind: 'percent', primary: true }] };
        case 'change':
          return {
            results: [
              { label: r.value >= 0 ? 'Increase' : 'Decrease', value: Math.abs(r.value), kind: 'percent', primary: true },
              { label: 'Difference', value: r.difference ?? 0, kind: 'number' },
            ],
          };
        case 'discount':
          return {
            results: [
              { label: 'Final price', value: r.value, kind: 'number', primary: true },
              { label: 'You save', value: r.saved ?? 0, kind: 'number' },
            ],
          };
      }
    },
  },
  {
    toolId: 'bmi-calculator',
    fields: [
      { id: 'system', label: 'Units', type: 'select', default: 'metric', options: [{ value: 'metric', label: 'Metric (cm, kg)' }, { value: 'imperial', label: 'Imperial (ft, lb)' }] },
      { id: 'heightCm', label: 'Height', type: 'number', unit: 'cm', default: 170, min: 50, max: 272, slider: { min: 120, max: 220, step: 1 }, visible: (v) => v.system === 'metric' },
      { id: 'weightKg', label: 'Weight', type: 'number', unit: 'kg', default: 68, min: 2, max: 650, slider: { min: 30, max: 200, step: 0.5 }, visible: (v) => v.system === 'metric' },
      { id: 'heightFt', label: 'Height (feet)', type: 'number', unit: 'ft', default: 5, min: 1, max: 8, visible: (v) => v.system === 'imperial' },
      { id: 'heightIn', label: 'Height (inches)', type: 'number', unit: 'in', default: 7, min: 0, max: 11.99, visible: (v) => v.system === 'imperial' },
      { id: 'weightLb', label: 'Weight', type: 'number', unit: 'lb', default: 150, min: 5, max: 1400, slider: { min: 66, max: 440, step: 1 }, visible: (v) => v.system === 'imperial' },
    ],
    validate: (v) => {
      const h = v.system === 'metric' ? n(v, 'heightCm') : n(v, 'heightFt') * 30.48 + n(v, 'heightIn') * 2.54;
      const w = v.system === 'metric' ? n(v, 'weightKg') : n(v, 'weightLb') * 0.45359237;
      return h > 0 && w > 0 ? null : 'Enter your height and weight.';
    },
    compute: (v) => {
      const metric = v.system === 'metric';
      const heightCm = metric ? n(v, 'heightCm') : n(v, 'heightFt') * 30.48 + n(v, 'heightIn') * 2.54;
      const weightKg = metric ? n(v, 'weightKg') : n(v, 'weightLb') * 0.45359237;
      const r = bmi(heightCm, weightKg);
      const unit = metric ? 'kg' : 'lb';
      const conv = (kg: number) => (metric ? kg : kg / 0.45359237);
      return {
        results: [
          { label: 'Body mass index', value: Math.round(r.value * 10) / 10, kind: 'number', primary: true },
          { label: 'Category', value: r.category, kind: 'text' },
          { label: 'Healthy weight for your height', value: `${conv(r.healthyMinKg).toFixed(1)}–${conv(r.healthyMaxKg).toFixed(1)} ${unit}`, kind: 'text' },
        ],
        summary: 'BMI is a screening measure for adults. It does not account for muscle mass, age or body composition — talk to a doctor for health advice.',
      };
    },
  },
  {
    toolId: 'date-calculator',
    fields: [
      {
        id: 'mode', label: 'Calculate', type: 'select', default: 'age',
        options: [{ value: 'age', label: 'Age' }, { value: 'diff', label: 'Days between dates' }, { value: 'add', label: 'Add or subtract' }],
      },
      { id: 'birth', label: 'Date of birth', type: 'date', default: '1995-06-15', visible: (v) => v.mode === 'age' },
      { id: 'asOf', label: 'Age on', type: 'date', default: () => toDateInput(new Date()), visible: (v) => v.mode === 'age' },
      { id: 'from', label: 'Start date', type: 'date', default: () => toDateInput(new Date()), visible: (v) => v.mode !== 'age' },
      { id: 'to', label: 'End date', type: 'date', default: () => toDateInput(addToDate(new Date(), 100, 'days')), visible: (v) => v.mode === 'diff' },
      { id: 'amount', label: 'Amount', type: 'number', default: 90, hint: 'Use a negative number to go back in time.', visible: (v) => v.mode === 'add' },
      {
        id: 'unit', label: 'Unit', type: 'select', default: 'days',
        options: [{ value: 'days', label: 'Days' }, { value: 'weeks', label: 'Weeks' }, { value: 'months', label: 'Months' }, { value: 'years', label: 'Years' }],
        visible: (v) => v.mode === 'add',
      },
    ],
    validate: (v) => {
      const need = v.mode === 'age' ? ['birth', 'asOf'] : v.mode === 'diff' ? ['from', 'to'] : ['from'];
      for (const k of need) if (!parseDate(s(v, k))) return 'Enter a valid date.';
      if (v.mode === 'age' && parseDate(s(v, 'birth'))! > parseDate(s(v, 'asOf'))!) return 'Date of birth must be before the “age on” date.';
      if (v.mode === 'add' && !Number.isFinite(n(v, 'amount'))) return 'Enter an amount.';
      return null;
    },
    compute: (v) => {
      const long = (d: Date) => d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      if (v.mode === 'age') {
        const r = age(parseDate(s(v, 'birth'))!, parseDate(s(v, 'asOf'))!);
        return {
          results: [
            { label: 'Age', value: ymd(r), kind: 'text', primary: true },
            { label: 'Total days', value: r.totalDays, kind: 'days' },
            { label: 'Total weeks', value: wd(r), kind: 'text' },
            { label: 'Next birthday', value: r.nextBirthdayInDays === 0 ? 'Today!' : `in ${plural(r.nextBirthdayInDays, 'day')} (${long(r.nextBirthday)})`, kind: 'text' },
          ],
        };
      }
      if (v.mode === 'diff') {
        let a = parseDate(s(v, 'from'))!;
        let b = parseDate(s(v, 'to'))!;
        const reversed = a > b;
        if (reversed) [a, b] = [b, a];
        const r = dateDifference(a, b);
        return {
          results: [
            { label: 'Difference', value: r.totalDays, kind: 'days', primary: true },
            { label: 'In years, months, days', value: ymd(r), kind: 'text' },
            { label: 'In weeks', value: wd(r), kind: 'text' },
          ],
          summary: reversed ? 'The end date is before the start date, so the dates were swapped.' : undefined,
        };
      }
      const result = addToDate(parseDate(s(v, 'from'))!, n(v, 'amount'), s(v, 'unit') as 'days');
      return { results: [{ label: 'Resulting date', value: long(result), kind: 'text', primary: true }] };
    },
  },
  {
    toolId: 'tip-calculator',
    usesCurrency: true,
    fields: [
      { id: 'bill', label: 'Bill amount', type: 'money', default: 2400, min: 0 },
      { id: 'tip', label: 'Tip', type: 'percent', default: 10, min: 0, max: 100, slider: { min: 0, max: 30, step: 1 } },
      { id: 'people', label: 'Number of people', type: 'number', default: 4, min: 1, max: 100, slider: { min: 1, max: 20, step: 1 } },
    ],
    validate: (v) => (n(v, 'bill') >= 0 && n(v, 'people') >= 1 ? null : 'Enter a bill amount and at least 1 person.'),
    compute: (v) => {
      const r = tipSplit({ bill: n(v, 'bill'), tipPercent: n(v, 'tip'), people: Math.round(n(v, 'people')) });
      return {
        results: [
          { label: 'Each person pays', value: r.perPerson, kind: 'money', primary: true },
          { label: 'Tip', value: r.tip, kind: 'money' },
          { label: 'Total with tip', value: r.total, kind: 'money' },
          { label: 'Tip per person', value: r.tipPerPerson, kind: 'money' },
        ],
      };
    },
  },
];

const specById = new Map(calculatorSpecs.map((x) => [x.toolId, x]));

export function getCalculatorSpec(toolId: string): CalculatorSpec | undefined {
  return specById.get(toolId);
}

export function defaultValues(spec: CalculatorSpec): FieldValues {
  return Object.fromEntries(spec.fields.map((f) => [f.id, typeof f.default === 'function' ? f.default() : f.default]));
}

/** Run a spec safely: validation, then compute; guards against non-finite output. */
export function runCalculator(spec: CalculatorSpec, values: FieldValues): { ok: true; output: CalcOutput } | { ok: false; error: string } {
  for (const f of spec.fields) {
    if (f.visible && !f.visible(values)) continue;
    if (f.type === 'select' || f.type === 'date') continue;
    const x = Number(values[f.id]);
    if (values[f.id] === '' || !Number.isFinite(x)) return { ok: false, error: `Enter a number for “${f.label}”.` };
    if (f.min !== undefined && x < f.min) return { ok: false, error: `${f.label} must be at least ${f.min}${f.unit ? ` ${f.unit}` : ''}.` };
    if (f.max !== undefined && x > f.max) return { ok: false, error: `${f.label} can be at most ${f.max}${f.unit ? ` ${f.unit}` : ''}.` };
  }
  const invalid = spec.validate?.(values);
  if (invalid) return { ok: false, error: invalid };
  const output = spec.compute(values);
  if (output.results.some((r) => typeof r.value === 'number' && !Number.isFinite(r.value))) {
    return { ok: false, error: 'These inputs produce a result too large to show. Try smaller values.' };
  }
  return { ok: true, output };
}
