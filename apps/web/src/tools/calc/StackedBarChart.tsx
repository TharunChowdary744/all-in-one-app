import { formatMoney, formatMoneyCompact, type CalcChart, type CurrencyCode } from '@omnikit/core';
import { useLayoutEffect, useRef, useState } from 'react';

const HEIGHT = 260;
const PAD = { top: 12, right: 8, bottom: 28, left: 56 };
const GAP = 2; // surface gap between stacked segments
const RADIUS = 4; // rounded data end (top of the stack only)

function niceMax(max: number): { top: number; step: number } {
  if (max <= 0) return { top: 1, step: 0.25 };
  const raw = max / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw)!;
  return { top: step * Math.ceil(max / step), step };
}

/** Path for a bar whose top corners are rounded and whose bottom sits square on its base. */
function topRounded(x: number, y: number, w: number, h: number): string {
  const r = Math.min(RADIUS, h, w / 2);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

export function StackedBarChart({ chart, rows, currency }: { chart: CalcChart; rows: Record<string, number>[]; currency: CurrencyCode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [hover, setHover] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(280, entry!.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const [base, growth] = chart.series as [CalcChart['series'][0], CalcChart['series'][0]];
  const totals = rows.map((r) => (r[base.id] ?? 0) + (r[growth.id] ?? 0));
  const { top, step } = niceMax(Math.max(...totals, 0));
  const plotW = width - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const band = plotW / Math.max(rows.length, 1);
  const barW = Math.max(3, Math.min(36, band * 0.62));
  const y = (v: number) => PAD.top + plotH - (v / top) * plotH;
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  // Label every k-th year so x labels never collide (~44px each).
  const every = Math.max(1, Math.ceil(44 / band));

  const hovered = hover !== null ? rows[hover] : null;

  return (
    <figure className="chart">
      <figcaption className="chart-head">
        <span className="chart-title">{chart.title}</span>
        <span className="legend">
          <span className="legend-item"><i style={{ background: 'var(--series-base)' }} />{base.label}</span>
          <span className="legend-item"><i style={{ background: 'var(--series-growth)' }} />{growth.label}</span>
        </span>
      </figcaption>
      <div ref={wrap} className="chart-plot" onMouseLeave={() => setHover(null)}>
        <svg width={width} height={HEIGHT} role="img" aria-label={`${chart.title}. Stacked bars per year; see the table view for exact values.`}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} className="grid" />
              <text x={PAD.left - 8} y={y(t)} className="tick" textAnchor="end" dominantBaseline="middle">
                {formatMoneyCompact(t, currency)}
              </text>
            </g>
          ))}
          {rows.map((r, i) => {
            const cx = PAD.left + band * i + band / 2;
            const x = cx - barW / 2;
            const b = r[base.id] ?? 0;
            const g = r[growth.id] ?? 0;
            const yb = y(b);
            const yt = y(b + g);
            const growthH = yb - yt - GAP;
            const dim = hover !== null && hover !== i;
            return (
              <g key={i} opacity={dim ? 0.45 : 1}>
                {growthH > 0.5 ? (
                  <>
                    <rect x={x} y={yb} width={barW} height={Math.max(0, y(0) - yb)} fill="var(--series-base)" />
                    <path d={topRounded(x, yt, barW, growthH)} fill="var(--series-growth)" />
                  </>
                ) : (
                  <path d={topRounded(x, yb, barW, Math.max(0, y(0) - yb))} fill="var(--series-base)" />
                )}
                {i % every === 0 || i === rows.length - 1 ? (
                  <text x={cx} y={HEIGHT - 8} className="tick" textAnchor="middle">
                    {chart.xLabel(r[chart.x]!)}
                  </text>
                ) : null}
                {/* Hit target covers the whole band, bigger than the mark. */}
                <rect x={PAD.left + band * i} y={PAD.top} width={band} height={plotH} fill="transparent" onMouseEnter={() => setHover(i)} onMouseMove={() => setHover(i)} />
              </g>
            );
          })}
          <line x1={PAD.left} x2={width - PAD.right} y1={y(0)} y2={y(0)} className="axis" />
        </svg>
        {hovered && hover !== null && (
          <div
            className="chart-tooltip"
            style={{ left: Math.min(Math.max(PAD.left + band * hover + band / 2, 90), width - 90), top: 4 }}
            role="status"
          >
            <strong>{chart.xLabel(hovered[chart.x]!).replace(/^Y/, 'Year ')}</strong>
            <span><i style={{ background: 'var(--series-base)' }} />{base.label}<b>{formatMoney(hovered[base.id] ?? 0, currency)}</b></span>
            <span><i style={{ background: 'var(--series-growth)' }} />{growth.label}<b>{formatMoney(hovered[growth.id] ?? 0, currency)}</b></span>
            <span className="total">Total<b>{formatMoney(totals[hover]!, currency)}</b></span>
          </div>
        )}
      </div>
    </figure>
  );
}
