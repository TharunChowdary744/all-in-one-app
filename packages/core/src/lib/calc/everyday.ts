export type PercentMode = 'of' | 'whatPercent' | 'change' | 'discount';

export function percentage(mode: PercentMode, a: number, b: number) {
  switch (mode) {
    case 'of':
      return { value: (a / 100) * b };
    case 'whatPercent':
      return { value: (a / b) * 100 };
    case 'change':
      return { value: ((b - a) / Math.abs(a)) * 100, difference: b - a };
    case 'discount': {
      const saved = (a * b) / 100; // a = price, b = discount %
      return { value: a - saved, saved };
    }
  }
}

export type BmiCategory = 'Underweight' | 'Healthy weight' | 'Overweight' | 'Obesity';

/** WHO adult BMI classes. */
export function bmi(heightCm: number, weightKg: number) {
  const m = heightCm / 100;
  const value = weightKg / (m * m);
  const category: BmiCategory = value < 18.5 ? 'Underweight' : value < 25 ? 'Healthy weight' : value < 30 ? 'Overweight' : 'Obesity';
  return { value, category, healthyMinKg: 18.5 * m * m, healthyMaxKg: 24.9 * m * m };
}

const DAY = 86_400_000;

/** Parse "YYYY-MM-DD" as a local calendar date (not UTC). */
export function parseDate(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.getMonth() === Number(m[2]) - 1 ? d : null;
}

export function toDateInput(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const utcDays = (d: Date) => Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY);

/** Add whole months, clamping to the last day of the target month (Jan 31 + 1 month = Feb 28/29). */
function addMonthsClamped(d: Date, months: number): Date {
  const target = new Date(d.getFullYear(), d.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(d.getDate(), lastDay));
}

/** Calendar difference in years / months / days (from ≤ to), plus totals. */
export function dateDifference(from: Date, to: Date) {
  let totalMonths = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  if (utcDays(addMonthsClamped(from, totalMonths)) > utcDays(to)) totalMonths -= 1;
  const anchor = addMonthsClamped(from, totalMonths);
  const totalDays = utcDays(to) - utcDays(from);
  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    days: utcDays(to) - utcDays(anchor),
    totalDays,
    weeks: Math.floor(totalDays / 7),
    remainderDays: totalDays % 7,
  };
}

export function age(birth: Date, asOf: Date) {
  const diff = dateDifference(birth, asOf);
  let next = new Date(asOf.getFullYear(), birth.getMonth(), birth.getDate());
  if (utcDays(next) < utcDays(asOf)) next = new Date(asOf.getFullYear() + 1, birth.getMonth(), birth.getDate());
  return { ...diff, nextBirthdayInDays: utcDays(next) - utcDays(asOf), nextBirthday: next };
}

export function addToDate(date: Date, amount: number, unit: 'days' | 'weeks' | 'months' | 'years'): Date {
  const d = new Date(date);
  if (unit === 'days') d.setDate(d.getDate() + amount);
  if (unit === 'weeks') d.setDate(d.getDate() + amount * 7);
  if (unit === 'months') d.setMonth(d.getMonth() + amount);
  if (unit === 'years') d.setFullYear(d.getFullYear() + amount);
  return d;
}

export function tipSplit(p: { bill: number; tipPercent: number; people: number }) {
  const tip = (p.bill * p.tipPercent) / 100;
  const total = p.bill + tip;
  return { tip, total, perPerson: total / p.people, tipPerPerson: tip / p.people };
}
