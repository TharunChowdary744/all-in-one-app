export type JsonResult = { ok: true; output: string } | { ok: false; error: string; line?: number; column?: number };

function locate(input: string, message: string): { line?: number; column?: number } {
  const pos = /position (\d+)/i.exec(message);
  if (pos) {
    const before = input.slice(0, Number(pos[1]));
    const lines = before.split('\n');
    return { line: lines.length, column: lines[lines.length - 1]!.length + 1 };
  }
  const lc = /line (\d+) column (\d+)/i.exec(message);
  if (lc) return { line: Number(lc[1]), column: Number(lc[2]) };
  return {};
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .sort()
        .map((k) => [k, sortKeysDeep((value as Record<string, unknown>)[k])]),
    );
  }
  return value;
}

export function formatJson(
  input: string,
  options: { indent?: number | 'tab' | 0; sortKeys?: boolean } = {},
): JsonResult {
  if (!input.trim()) return { ok: false, error: 'Input is empty' };
  try {
    let parsed: unknown = JSON.parse(input);
    if (options.sortKeys) parsed = sortKeysDeep(parsed);
    const indent = options.indent === 'tab' ? '\t' : (options.indent ?? 2);
    return { ok: true, output: JSON.stringify(parsed, null, indent || undefined) };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, error: message, ...locate(input, message) };
  }
}

export function minifyJson(input: string): JsonResult {
  return formatJson(input, { indent: 0 });
}
