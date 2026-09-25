export interface GrowthRow {
  year: number;
  invested: number;
  value: number;
  gains: number;
}

/**
 * SIP future value with monthly contributions at the start of each month (annuity due),
 * matching common Indian mutual-fund calculators. Optional yearly step-up in %.
 */
export function sip(p: { monthly: number; annualRate: number; years: number; stepUp?: number }) {
  const i = p.annualRate / 100 / 12;
  const months = Math.round(p.years * 12);
  let value = 0;
  let invested = 0;
  let contribution = p.monthly;
  const yearly: GrowthRow[] = [];
  for (let m = 1; m <= months; m++) {
    value = (value + contribution) * (1 + i);
    invested += contribution;
    if (m % 12 === 0 || m === months) {
      yearly.push({ year: Math.ceil(m / 12), invested, value, gains: value - invested });
      if (m % 12 === 0) contribution *= 1 + (p.stepUp ?? 0) / 100;
    }
  }
  return { invested, value, gains: value - invested, yearly };
}

/** One-time investment compounded annually. */
export function lumpsum(p: { amount: number; annualRate: number; years: number }) {
  const r = p.annualRate / 100;
  const yearly: GrowthRow[] = [];
  for (let y = 1; y <= Math.ceil(p.years); y++) {
    const t = Math.min(y, p.years);
    const value = p.amount * (1 + r) ** t;
    yearly.push({ year: y, invested: p.amount, value, gains: value - p.amount });
  }
  const value = p.amount * (1 + r) ** p.years;
  return { invested: p.amount, value, gains: value - p.amount, yearly };
}

export interface SwpRow {
  year: number;
  withdrawn: number;
  balance: number;
}

/** Systematic withdrawal: corpus grows monthly, a fixed amount is withdrawn at each month end. */
export function swp(p: { corpus: number; monthlyWithdrawal: number; annualRate: number; years: number }) {
  const i = p.annualRate / 100 / 12;
  const months = Math.round(p.years * 12);
  let balance = p.corpus;
  let withdrawn = 0;
  let depletedAtMonth: number | null = null;
  const yearly: SwpRow[] = [];
  for (let m = 1; m <= months; m++) {
    balance *= 1 + i;
    const take = Math.min(p.monthlyWithdrawal, balance);
    balance -= take;
    withdrawn += take;
    if (balance <= 0.005 && depletedAtMonth === null) {
      depletedAtMonth = m;
      balance = 0;
    }
    if (m % 12 === 0 || m === months) yearly.push({ year: Math.ceil(m / 12), withdrawn, balance });
  }
  return { withdrawn, finalBalance: balance, depletedAtMonth, yearly };
}

export interface AmortizationRow {
  year: number;
  principalPaid: number;
  interestPaid: number;
  balance: number;
}

/** Equated monthly instalment with a yearly amortization schedule. */
export function emi(p: { principal: number; annualRate: number; years: number }) {
  const i = p.annualRate / 100 / 12;
  const n = Math.round(p.years * 12);
  const payment = i === 0 ? p.principal / n : (p.principal * i * (1 + i) ** n) / ((1 + i) ** n - 1);
  let balance = p.principal;
  const yearly: AmortizationRow[] = [];
  let yPrincipal = 0;
  let yInterest = 0;
  for (let m = 1; m <= n; m++) {
    const interest = balance * i;
    const principalPart = Math.min(payment - interest, balance);
    balance -= principalPart;
    yPrincipal += principalPart;
    yInterest += interest;
    if (m % 12 === 0 || m === n) {
      yearly.push({ year: Math.ceil(m / 12), principalPaid: yPrincipal, interestPaid: yInterest, balance: Math.max(0, balance) });
      yPrincipal = 0;
      yInterest = 0;
    }
  }
  const totalPayment = payment * n;
  return { emi: payment, totalInterest: totalPayment - p.principal, totalPayment, yearly };
}

/** Compound (k times a year) or simple interest, e.g. fixed deposits. */
export function interest(p: { principal: number; annualRate: number; years: number; frequency: number; type: 'compound' | 'simple' }) {
  const r = p.annualRate / 100;
  const at = (t: number) => (p.type === 'simple' ? p.principal * (1 + r * t) : p.principal * (1 + r / p.frequency) ** (p.frequency * t));
  const yearly: GrowthRow[] = [];
  for (let y = 1; y <= Math.ceil(p.years); y++) {
    const value = at(Math.min(y, p.years));
    yearly.push({ year: y, invested: p.principal, value, gains: value - p.principal });
  }
  const value = at(p.years);
  const effectiveRate = p.type === 'simple' ? p.annualRate : ((1 + r / p.frequency) ** p.frequency - 1) * 100;
  return { value, interest: value - p.principal, effectiveRate, yearly };
}

/** Compound annual growth rate between two values. */
export function cagr(p: { initial: number; final: number; years: number }) {
  const rate = ((p.final / p.initial) ** (1 / p.years) - 1) * 100;
  return { cagr: rate, absoluteReturn: ((p.final - p.initial) / p.initial) * 100, multiple: p.final / p.initial };
}

/** Add GST to a net price, or extract it from a GST-inclusive price. */
export function gst(p: { amount: number; rate: number; mode: 'add' | 'remove' }) {
  const net = p.mode === 'add' ? p.amount : p.amount / (1 + p.rate / 100);
  const tax = net * (p.rate / 100);
  return { net, tax, gross: net + tax, cgst: tax / 2, sgst: tax / 2 };
}
