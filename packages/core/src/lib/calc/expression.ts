/**
 * Safe arithmetic expression evaluator for the scientific calculator (no eval / Function).
 *
 * Grammar (recursive descent):
 *   expr    := term (('+' | '-') term)*
 *   term    := unary (('*' | '/' | implicit) unary)*
 *   unary   := ('-' | '+') unary | power
 *   power   := postfix ('^' unary)?          right-associative, so 2^3^2 = 2^9 and -2^2 = -4
 *   postfix := primary ('!' | '%')*
 *   primary := number | constant | func '(' expr ')' | '(' expr ')'
 * Implicit multiplication is supported: 2π, 3(4+1), (1+2)(3+4), 2sin(30).
 */

export type AngleMode = 'deg' | 'rad';

type Token =
  | { t: 'num'; v: number }
  | { t: 'id'; v: string }
  | { t: 'op'; v: string }
  | { t: '('; v: '(' }
  | { t: ')'; v: ')' };

const FUNCS = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sqrt', 'cbrt', 'log', 'ln', 'abs', 'exp'] as const;
type Func = (typeof FUNCS)[number];

export class ExpressionError extends Error {}

function tokenize(input: string): Token[] {
  const s = input.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/√/g, 'sqrt').replace(/π/g, 'pi');
  const tokens: Token[] = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i]!;
    if (/\s/.test(ch)) {
      i++;
    } else if (/[0-9.]/.test(ch)) {
      const m = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i.exec(s.slice(i));
      if (!m) throw new ExpressionError(`Unexpected “${ch}”`);
      tokens.push({ t: 'num', v: Number(m[0]) });
      i += m[0].length;
    } else if (/[a-z]/i.test(ch)) {
      const m = /^[a-z]+/i.exec(s.slice(i))!;
      tokens.push({ t: 'id', v: m[0].toLowerCase() });
      i += m[0].length;
    } else if ('+-*/^!%'.includes(ch)) {
      tokens.push({ t: 'op', v: ch });
      i++;
    } else if (ch === '(' || ch === ')') {
      tokens.push({ t: ch, v: ch } as Token);
      i++;
    } else {
      throw new ExpressionError(`Unexpected “${ch}”`);
    }
  }
  return tokens;
}

function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) throw new ExpressionError('Factorial needs a whole number ≥ 0');
  if (n > 170) return Infinity;
  let r = 1;
  for (let k = 2; k <= n; k++) r *= k;
  return r;
}

export function evaluateExpression(input: string, angle: AngleMode = 'deg'): number {
  const tokens = tokenize(input);
  if (tokens.length === 0) throw new ExpressionError('Enter an expression');
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];
  const toRad = (x: number) => (angle === 'deg' ? (x * Math.PI) / 180 : x);
  const fromRad = (x: number) => (angle === 'deg' ? (x * 180) / Math.PI : x);

  const applyFunc = (f: Func, x: number): number => {
    switch (f) {
      case 'sin': return Math.sin(toRad(x));
      case 'cos': return Math.cos(toRad(x));
      case 'tan': return Math.tan(toRad(x));
      case 'asin': return fromRad(Math.asin(x));
      case 'acos': return fromRad(Math.acos(x));
      case 'atan': return fromRad(Math.atan(x));
      case 'sqrt': return Math.sqrt(x);
      case 'cbrt': return Math.cbrt(x);
      case 'log': return Math.log10(x);
      case 'ln': return Math.log(x);
      case 'abs': return Math.abs(x);
      case 'exp': return Math.exp(x);
    }
  };

  const startsPrimary = (tok: Token | undefined) => !!tok && (tok.t === 'num' || tok.t === 'id' || tok.t === '(');

  function primary(): number {
    const tok = next();
    if (!tok) throw new ExpressionError('Expression ends unexpectedly');
    if (tok.t === 'num') return tok.v;
    if (tok.t === '(') {
      const v = expr();
      if (next()?.t !== ')') throw new ExpressionError('Missing closing bracket');
      return v;
    }
    if (tok.t === 'id') {
      if (tok.v === 'pi') return Math.PI;
      if (tok.v === 'e') return Math.E;
      if ((FUNCS as readonly string[]).includes(tok.v)) {
        // Allow "sqrt 9" as well as "sqrt(9)".
        const arg = peek()?.t === '(' ? primary() : unary();
        return applyFunc(tok.v as Func, arg);
      }
      throw new ExpressionError(`Unknown name “${tok.v}”`);
    }
    throw new ExpressionError(`Unexpected “${tok.v}”`);
  }

  function postfix(): number {
    let v = primary();
    for (;;) {
      const tok = peek();
      if (tok?.t === 'op' && tok.v === '!') { next(); v = factorial(v); }
      else if (tok?.t === 'op' && tok.v === '%') { next(); v = v / 100; }
      else return v;
    }
  }

  function power(): number {
    const base = postfix();
    const tok = peek();
    if (tok?.t === 'op' && tok.v === '^') {
      next();
      return base ** unary();
    }
    return base;
  }

  function unary(): number {
    const tok = peek();
    if (tok?.t === 'op' && (tok.v === '-' || tok.v === '+')) {
      next();
      const v = unary();
      return tok.v === '-' ? -v : v;
    }
    return power();
  }

  function term(): number {
    let v = unary();
    for (;;) {
      const tok = peek();
      if (tok?.t === 'op' && (tok.v === '*' || tok.v === '/')) {
        next();
        const r = unary();
        if (tok.v === '/' && r === 0) throw new ExpressionError('Cannot divide by zero');
        v = tok.v === '*' ? v * r : v / r;
      } else if (startsPrimary(tok)) {
        v *= unary();
      } else {
        return v;
      }
    }
  }

  function expr(): number {
    let v = term();
    for (;;) {
      const tok = peek();
      if (tok?.t === 'op' && (tok.v === '+' || tok.v === '-')) {
        next();
        const r = term();
        v = tok.v === '+' ? v + r : v - r;
      } else {
        return v;
      }
    }
  }

  const result = expr();
  if (pos < tokens.length) {
    const tok = tokens[pos]!;
    throw new ExpressionError(tok.t === ')' ? 'Unmatched closing bracket' : `Unexpected “${tok.v}”`);
  }
  if (Number.isNaN(result)) throw new ExpressionError('Result is undefined');
  return result;
}

/** Display a calculator result without float noise (0.1+0.2 → 0.3). */
export function formatCalcResult(value: number): string {
  if (!Number.isFinite(value)) return value > 0 ? '∞' : value < 0 ? '−∞' : 'Error';
  if (value !== 0 && (Math.abs(value) >= 1e15 || Math.abs(value) < 1e-9)) return value.toExponential(8).replace(/\.?0+e/, 'e');
  return String(Number.parseFloat(value.toPrecision(12)));
}
