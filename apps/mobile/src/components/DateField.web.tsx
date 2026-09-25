import { createElement } from 'react';
import { View } from 'react-native';

import { Label } from '@/components/Text';
import { radius, useColors } from '@/theme/colors';

/** Web build (react-native-web): the browser's own date input. */
export function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const c = useColors();
  return (
    <View style={{ gap: 6 }}>
      <Label>{label}</Label>
      {createElement('input', {
        type: 'date',
        value,
        'aria-label': label,
        onChange: (e: { target: { value: string } }) => onChange(e.target.value),
        style: { height: 46, padding: '0 12px', borderRadius: radius.md, border: `1px solid ${c.lineStrong}`, background: c.surface, color: c.ink, fontSize: 15, fontFamily: 'inherit' },
      })}
    </View>
  );
}
