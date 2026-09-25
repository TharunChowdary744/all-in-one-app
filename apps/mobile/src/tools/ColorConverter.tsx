import { colorScale, formatHsl, formatRgb, parseColor, readableTextColor, rgbToHex, rgbToHsl } from '@omnikit/core';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Card, Input, Notice, ResultRow, Screen } from '@/components/ui';
import { mono, radius } from '@/theme/colors';

const PRESETS = ['#6d5dfc', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#ec4899', '#111827'];

export default function ColorConverter() {
  const [input, setInput] = useState('#6d5dfc');
  const rgb = parseColor(input);
  return (
    <Screen>
      <Input label="Color (HEX, rgb(), hsl())" value={input} onChangeText={setInput} autoCapitalize="none" code />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {PRESETS.map((p) => (
          <Pressable key={p} onPress={() => setInput(p)} accessibilityLabel={p} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: p }} />
        ))}
      </View>
      {!rgb && <Notice>Unrecognized color. Try #ff6347, rgb(255, 99, 71) or hsl(9, 100%, 64%).</Notice>}
      {rgb && (
        <>
          <View style={{ backgroundColor: rgbToHex(rgb), borderRadius: radius.md, padding: 28 }}>
            <Text style={[mono, { color: readableTextColor(rgb), fontSize: 26, fontWeight: '800' }]}>{rgbToHex(rgb).toUpperCase()}</Text>
          </View>
          <ResultRow label="HEX" value={rgbToHex(rgb)} />
          <ResultRow label="RGB" value={formatRgb(rgb)} />
          <ResultRow label="HSL" value={formatHsl(rgbToHsl(rgb))} />
          <Card title="Shades & tints">
            <View style={{ flexDirection: 'row', borderRadius: radius.sm, overflow: 'hidden' }}>
              {colorScale(rgb).map((hex) => (
                <Pressable key={hex} onPress={() => setInput(hex)} style={{ flex: 1, height: 48, backgroundColor: hex }} accessibilityLabel={hex} />
              ))}
            </View>
          </Card>
        </>
      )}
    </Screen>
  );
}
