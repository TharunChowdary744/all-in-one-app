export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'AUD';

export const currencies: { code: CurrencyCode; label: string; locale: string }[] = [
  { code: 'INR', label: '₹ INR', locale: 'en-IN' },
  { code: 'USD', label: '$ USD', locale: 'en-US' },
  { code: 'EUR', label: '€ EUR', locale: 'de-DE' },
  { code: 'GBP', label: '£ GBP', locale: 'en-GB' },
  { code: 'AED', label: 'AED', locale: 'en-AE' },
  { code: 'AUD', label: 'A$ AUD', locale: 'en-AU' },
];

const localeOf = (c: CurrencyCode) => currencies.find((x) => x.code === c)?.locale ?? 'en-US';

export function currencySymbol(currency: CurrencyCode): string {
  const part = new Intl.NumberFormat(localeOf(currency), { style: 'currency', currency }).formatToParts(0).find((p) => p.type === 'currency');
  return part?.value ?? currency;
}

export function formatMoney(value: number, currency: CurrencyCode, fractionDigits = 0): string {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat(localeOf(currency), {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/** Short axis labels: ₹12.5L / ₹1.2Cr for INR, $1.2M elsewhere. */
export function formatMoneyCompact(value: number, currency: CurrencyCode): string {
  const sym = currencySymbol(currency);
  const abs = Math.abs(value);
  const sign = value < 0 ? '−' : '';
  const trim = (n: number) => String(Number.parseFloat(n.toFixed(n >= 100 ? 0 : 1)));
  if (currency === 'INR') {
    if (abs >= 1e7) return `${sign}${sym}${trim(abs / 1e7)}Cr`;
    if (abs >= 1e5) return `${sign}${sym}${trim(abs / 1e5)}L`;
    if (abs >= 1e3) return `${sign}${sym}${trim(abs / 1e3)}K`;
    return `${sign}${sym}${Math.round(abs)}`;
  }
  if (abs >= 1e9) return `${sign}${sym}${trim(abs / 1e9)}B`;
  if (abs >= 1e6) return `${sign}${sym}${trim(abs / 1e6)}M`;
  if (abs >= 1e3) return `${sign}${sym}${trim(abs / 1e3)}K`;
  return `${sign}${sym}${Math.round(abs)}`;
}

/** Format a calculator result for display, by the kind of value it is. */
export function formatCalcValue(value: number | string, kind: 'money' | 'percent' | 'number' | 'years' | 'text' | 'multiple' | 'days', currency: CurrencyCode): string {
  if (typeof value === 'string') return value;
  if (!Number.isFinite(value)) return '—';
  switch (kind) {
    case 'money':
      return formatMoney(value, currency, Math.abs(value) < 100 && value % 1 !== 0 ? 2 : 0);
    case 'percent':
      return `${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}%`;
    case 'multiple':
      return `${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}×`;
    case 'days':
      return `${value.toLocaleString('en-US')} ${Math.abs(value) === 1 ? 'day' : 'days'}`;
    case 'years':
      return `${value} ${value === 1 ? 'year' : 'years'}`;
    default:
      return value.toLocaleString('en-US', { maximumFractionDigits: 4 });
  }
}
