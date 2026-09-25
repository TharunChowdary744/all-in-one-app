import { formatMoney, formatMoneyCompact, type CalcChart, type CurrencyCode } from '@omnikit/core';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { Text } from '@/components/Text';
import { fonts, useColors } from '@/theme/colors';

const HEIGHT = 220;
const PAD = { top: 10, right: 4, bottom: 24, left: 48 };
const GAP = 2;

function niceMax(max: number) {
  if (max <= 0) return { top: 1, step: 0.25 };
  const raw = max / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((x) => x >= raw)!;
  return { top: step * Math.ceil(max / step), step };
}

const topRounded = (x: number, y: number, w: number, h: number) => {
  const r = Math.min(4, h, w / 2);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
};

/** Stacked bars per year. Tap a bar to see its exact values (the selection defaults to the last year). */
export function StackedBarChart({ chart, rows, currency }: { chart: CalcChart; rows: Record<string, number>[]; currency: CurrencyCode }) {
  const c = useColors();
  const [width, setWidth] = useState(320);
  const [selected, setSelected] = useState(rows.length - 1);
  const [base, growth] = chart.series as [CalcChart['series'][0], CalcChart['series'][0]];
  const totals = rows.map((r) => (r[base.id] ?? 0) + (r[growth.id] ?? 0));
  const { top, step } = niceMax(Math.max(...totals, 0));
  const plotW = width - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const band = plotW / Math.max(rows.length, 1);
  const barW = Math.max(3, Math.min(28, band * 0.62));
  const y = (v: number) => PAD.top + plotH - (v / top) * plotH;
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const every = Math.max(1, Math.ceil(36 / band));
  const sel = Math.min(selected, rows.length - 1);
  const row = rows[sel];

  const swatch = (color: string) => <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: color }} />;

  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: c.ink2, fontSize: 13 }}>{chart.title}</Text>
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>{swatch(c.series.base)}<Text style={{ fontSize: 13, color: c.ink2 }}>{base.label}</Text></View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>{swatch(c.series.growth)}<Text style={{ fontSize: 13, color: c.ink2 }}>{growth.label}</Text></View>
      </View>
      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} accessible accessibilityLabel={`${chart.title}. Tap a bar for details; exact values are in the table view.`}>
        <Svg width={width} height={HEIGHT}>
          {ticks.map((t) => (
            <G key={t}>
              <Line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke={c.line} strokeWidth={1} />
              <SvgText x={PAD.left - 6} y={y(t) + 4} fontSize={10.5} fill={c.muted} textAnchor="end" fontFamily={fonts.sans}>
                {formatMoneyCompact(t, currency)}
              </SvgText>
            </G>
          ))}
          {rows.map((r, i) => {
            const cx = PAD.left + band * i + band / 2;
            const x = cx - barW / 2;
            const b = r[base.id] ?? 0;
            const g = r[growth.id] ?? 0;
            const yb = y(b);
            const growthH = yb - y(b + g) - GAP;
            const opacity = i === sel ? 1 : 0.5;
            return (
              <G key={i} opacity={opacity}>
                {growthH > 0.5 ? (
                  <>
                    <Rect x={x} y={yb} width={barW} height={Math.max(0, y(0) - yb)} fill={c.series.base} />
                    <Path d={topRounded(x, y(b + g), barW, growthH)} fill={c.series.growth} />
                  </>
                ) : (
                  <Path d={topRounded(x, yb, barW, Math.max(0, y(0) - yb))} fill={c.series.base} />
                )}
                {(i % every === 0 || i === rows.length - 1) && (
                  <SvgText x={cx} y={HEIGHT - 6} fontSize={10.5} fill={i === sel ? c.ink : c.muted} textAnchor="middle" fontFamily={fonts.sans}>
                    {chart.xLabel(r[chart.x]!)}
                  </SvgText>
                )}
              </G>
            );
          })}
          <Line x1={PAD.left} x2={width - PAD.right} y1={y(0)} y2={y(0)} stroke={c.lineStrong} strokeWidth={1} />
        </Svg>
        {/* Transparent hit targets, one per band — larger than the bars. */}
        <View style={{ position: 'absolute', left: PAD.left, top: 0, height: HEIGHT, flexDirection: 'row' }}>
          {rows.map((r, i) => (
            <Pressable key={i} onPress={() => setSelected(i)} style={{ width: band, height: HEIGHT }} accessibilityRole="button" accessibilityLabel={`Year ${r[chart.x]}`} />
          ))}
        </View>
      </View>
      {row && (
        <View style={{ borderWidth: 1, borderColor: c.line, borderRadius: 8, padding: 12, gap: 6, backgroundColor: c.background }}>
          <Text style={{ fontFamily: fonts.sansSemi }}>Year {row[chart.x]}</Text>
          {[base, growth].map((sr, k) => (
            <View key={sr.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {swatch(k === 0 ? c.series.base : c.series.growth)}
              <Text style={{ color: c.ink2, flex: 1 }}>{sr.label}</Text>
              <Text style={{ fontFamily: fonts.sansSemi }}>{formatMoney(row[sr.id] ?? 0, currency)}</Text>
            </View>
          ))}
          <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: c.line, paddingTop: 6 }}>
            <Text style={{ color: c.ink2, flex: 1 }}>Total</Text>
            <Text style={{ fontFamily: fonts.sansSemi }}>{formatMoney(totals[sel]!, currency)}</Text>
          </View>
        </View>
      )}
    </View>
  );
}
