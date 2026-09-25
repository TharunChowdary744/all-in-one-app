export interface TimestampInfo {
  date: Date;
  seconds: number;
  milliseconds: number;
  iso: string;
  utc: string;
  local: string;
  relative: string;
}

/** Accepts seconds or milliseconds (auto-detected), ISO strings, or any Date-parsable text. */
export function parseTimestamp(input: string | number): Date | null {
  if (typeof input === 'number' || /^-?\d+(\.\d+)?$/.test(String(input).trim())) {
    const n = Number(input);
    // Values with more than 11 integer digits are treated as milliseconds.
    const ms = Math.abs(n) >= 1e11 ? n : n * 1000;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(String(input).trim());
  return Number.isNaN(d.getTime()) ? null : d;
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
  ['second', 1],
];

export function relativeTime(date: Date, now: Date = new Date()): string {
  const diff = Math.round((date.getTime() - now.getTime()) / 1000);
  if (Math.abs(diff) < 5) return 'just now';
  for (const [unit, secs] of UNITS) {
    if (Math.abs(diff) >= secs) {
      const value = Math.round(diff / secs);
      const label = `${Math.abs(value)} ${unit}${Math.abs(value) === 1 ? '' : 's'}`;
      return value < 0 ? `${label} ago` : `in ${label}`;
    }
  }
  return 'just now';
}

export function describeTimestamp(date: Date, now: Date = new Date()): TimestampInfo {
  return {
    date,
    seconds: Math.floor(date.getTime() / 1000),
    milliseconds: date.getTime(),
    iso: date.toISOString(),
    utc: date.toUTCString(),
    local: date.toLocaleString(),
    relative: relativeTime(date, now),
  };
}
