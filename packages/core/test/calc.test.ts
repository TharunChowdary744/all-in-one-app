import { describe, expect, it } from 'vitest';

import {
  age,
  cagr,
  calculatorSpecs,
  dateDifference,
  defaultValues,
  emi,
  evaluateExpression,
  formatCalcResult,
  formatMoney,
  formatMoneyCompact,
  getTool,
  gst,
  interest,
  lumpsum,
  parseDate,
  percentage,
  runCalculator,
  sip,
  swp,
  tipSplit,
  bmi,
} from '../src';

describe('expression evaluator', () => {
  const ev = (s: string, mode: 'deg' | 'rad' = 'deg') => evaluateExpression(s, mode);
  it('handles precedence, associativity and unary minus', () => {
    expect(ev('2+3*4')).toBe(14);
    expect(ev('(2+3)*4')).toBe(20);
    expect(ev('2^3^2')).toBe(512);
    expect(ev('-2^2')).toBe(-4);
    expect(ev('10/4')).toBe(2.5);
    expect(ev('7 − 2 × 3 ÷ 2')).toBe(4);
  });
  it('supports functions, constants, factorial, percent and implicit multiplication', () => {
    expect(ev('sin(30)')).toBeCloseTo(0.5);
    expect(ev('cos(pi)', 'rad')).toBeCloseTo(-1);
    expect(ev('sqrt(16)+√9')).toBe(7);
    expect(ev('log(1000)')).toBeCloseTo(3);
    expect(ev('ln(e)')).toBeCloseTo(1);
    expect(ev('5!')).toBe(120);
    expect(ev('50%*200')).toBe(100);
    expect(ev('2π')).toBeCloseTo(2 * Math.PI);
    expect(ev('3(4+1)')).toBe(15);
    expect(ev('(1+2)(3+4)')).toBe(21);
  });
  it('reports clear errors', () => {
    expect(() => ev('1/0')).toThrow(/divide by zero/);
    expect(() => ev('(1+2')).toThrow(/closing bracket/);
    expect(() => ev('1+2)')).toThrow(/Unmatched/);
    expect(() => ev('foo(2)')).toThrow(/Unknown/);
    expect(() => ev('')).toThrow();
    expect(() => ev('2.5!')).toThrow(/whole number/);
  });
  it('formats results without float noise', () => {
    expect(formatCalcResult(0.1 + 0.2)).toBe('0.3');
    expect(formatCalcResult(1 / 3)).toBe('0.333333333333');
    expect(formatCalcResult(Infinity)).toBe('∞');
  });
});

describe('finance', () => {
  it('matches standard SIP (annuity due) results', () => {
    const r = sip({ monthly: 10000, annualRate: 12, years: 10 });
    expect(r.invested).toBe(1_200_000);
    expect(Math.round(r.value)).toBe(2_323_391);
    expect(r.yearly).toHaveLength(10);
    const stepped = sip({ monthly: 10000, annualRate: 12, years: 10, stepUp: 10 });
    expect(stepped.invested).toBeGreaterThan(r.invested);
    expect(Math.round(stepped.yearly[1]!.invested)).toBe(120000 + 132000);
  });
  it('computes lumpsum and interest', () => {
    expect(Math.round(lumpsum({ amount: 100000, annualRate: 12, years: 10 }).value)).toBe(310585);
    expect(Math.round(interest({ principal: 100000, annualRate: 7, years: 5, frequency: 4, type: 'compound' }).value)).toBe(141478);
    expect(interest({ principal: 100000, annualRate: 7, years: 5, frequency: 4, type: 'simple' }).value).toBe(135000);
  });
  it('computes EMI and a consistent amortization schedule', () => {
    const r = emi({ principal: 2_500_000, annualRate: 8.5, years: 20 });
    expect(Math.round(r.emi)).toBe(21696);
    const paid = r.yearly.reduce((a, y) => a + y.principalPaid, 0);
    expect(paid).toBeCloseTo(2_500_000, 0);
    expect(r.yearly.at(-1)!.balance).toBeCloseTo(0, 2);
    expect(emi({ principal: 12000, annualRate: 0, years: 1 }).emi).toBe(1000);
  });
  it('computes SWP depletion, CAGR and GST', () => {
    const r = swp({ corpus: 100000, monthlyWithdrawal: 10000, annualRate: 0, years: 2 });
    expect(r.depletedAtMonth).toBe(10);
    expect(r.withdrawn).toBe(100000);
    expect(cagr({ initial: 100000, final: 250000, years: 5 }).cagr).toBeCloseTo(20.11, 2);
    expect(gst({ amount: 10000, rate: 18, mode: 'add' }).gross).toBeCloseTo(11800);
    expect(gst({ amount: 11800, rate: 18, mode: 'remove' }).net).toBeCloseTo(10000);
  });
  it('formats money, including Indian lakh/crore', () => {
    expect(formatMoney(2323391, 'INR')).toBe('₹23,23,391');
    expect(formatMoneyCompact(2323391, 'INR')).toBe('₹23.2L');
    expect(formatMoneyCompact(15_000_000, 'INR')).toBe('₹1.5Cr');
    expect(formatMoneyCompact(1_250_000, 'USD')).toBe('$1.3M');
  });
});

describe('everyday', () => {
  it('computes percentages, BMI and tips', () => {
    expect(percentage('of', 15, 200).value).toBe(30);
    expect(percentage('whatPercent', 30, 200).value).toBe(15);
    expect(percentage('change', 80, 100).value).toBe(25);
    expect(percentage('discount', 1000, 20).value).toBe(800);
    const b = bmi(170, 68);
    expect(b.value).toBeCloseTo(23.53, 2);
    expect(b.category).toBe('Healthy weight');
    expect(tipSplit({ bill: 2400, tipPercent: 10, people: 4 }).perPerson).toBe(660);
  });
  it('computes calendar differences and age', () => {
    const d = dateDifference(parseDate('2020-01-31')!, parseDate('2020-03-01')!);
    expect([d.years, d.months, d.days, d.totalDays]).toEqual([0, 1, 1, 30]);
    const a = age(parseDate('1995-06-15')!, parseDate('2026-06-14')!);
    expect([a.years, a.months, a.days, a.nextBirthdayInDays]).toEqual([30, 11, 30, 1]);
    expect(parseDate('2023-02-30')).toBeNull();
  });
});

describe('calculator specs', () => {
  it('every spec belongs to a registered tool and computes with its defaults', () => {
    for (const spec of calculatorSpecs) {
      expect(getTool(spec.toolId), spec.toolId).toBeDefined();
      const r = runCalculator(spec, defaultValues(spec));
      expect(r.ok, spec.toolId).toBe(true);
      if (r.ok) expect(r.output.results.some((x) => x.primary)).toBe(true);
    }
  });
  it('rejects invalid input with a readable message', () => {
    const spec = calculatorSpecs.find((s) => s.toolId === 'sip-calculator')!;
    const r = runCalculator(spec, { ...defaultValues(spec), years: '' });
    expect(r).toEqual({ ok: false, error: 'Enter a number for “Time period”.' });
  });
});
