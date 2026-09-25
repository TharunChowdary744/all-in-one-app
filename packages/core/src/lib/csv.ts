export function detectDelimiter(csv: string): string {
  const firstLine = csv.split(/\r?\n/, 1)[0] ?? '';
  const candidates = [',', ';', '\t', '|'];
  let best = ',';
  let bestCount = 0;
  for (const d of candidates) {
    const count = firstLine.split(d).length - 1;
    if (count > bestCount) {
      best = d;
      bestCount = count;
    }
  }
  return best;
}

/** RFC 4180 parser: handles quoted fields, escaped quotes ("") and newlines inside quotes. */
export function parseCsv(csv: string, delimiter = detectDelimiter(csv)): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i]!;
    if (inQuotes) {
      if (ch === '"') {
        if (csv[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === delimiter) {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && csv[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += ch;
  }
  if (inQuotes) throw new Error('Unterminated quoted field');
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0] === ''));
}

function coerce(value: string): unknown {
  if (value === '') return '';
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (/^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/.test(value)) return Number(value);
  return value;
}

export function csvToJson(
  csv: string,
  options: { header?: boolean; inferTypes?: boolean; delimiter?: string } = {},
): unknown[] {
  const { header = true, inferTypes = true } = options;
  const rows = parseCsv(csv, options.delimiter ?? detectDelimiter(csv));
  const cast = inferTypes ? coerce : (v: string) => v;
  if (!header) return rows.map((r) => r.map(cast));
  const [head = [], ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((key, i) => [key, cast(r[i] ?? '')])));
}

function escapeField(value: unknown, delimiter: string): string {
  if (value === null || value === undefined) return '';
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return /["\r\n]/.test(text) || text.includes(delimiter) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function jsonToCsv(json: string | unknown, delimiter = ','): string {
  const data = typeof json === 'string' ? (JSON.parse(json) as unknown) : json;
  const rows = Array.isArray(data) ? data : [data];
  if (rows.length === 0) return '';

  if (rows.every(Array.isArray)) {
    return (rows as unknown[][]).map((r) => r.map((v) => escapeField(v, delimiter)).join(delimiter)).join('\n');
  }
  if (!rows.every((r) => r && typeof r === 'object' && !Array.isArray(r))) {
    throw new Error('JSON must be an array of objects or an array of arrays');
  }
  const keys: string[] = [];
  for (const r of rows as Record<string, unknown>[]) {
    for (const k of Object.keys(r)) if (!keys.includes(k)) keys.push(k);
  }
  const lines = [keys.map((k) => escapeField(k, delimiter)).join(delimiter)];
  for (const r of rows as Record<string, unknown>[]) {
    lines.push(keys.map((k) => escapeField(r[k], delimiter)).join(delimiter));
  }
  return lines.join('\n');
}
