import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Heading, Text } from '@/components/Text';
import { fonts, useColors } from '@/theme/colors';

/** Numbered catalog section: "01  Images" over a strong rule. */
export function Section({ index, title, meta, children }: { index?: number; title: string; meta?: string; children: ReactNode }) {
  const c = useColors();
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, paddingBottom: 10, borderBottomWidth: 1, borderColor: c.ink }}>
        {index !== undefined && <Text style={{ fontFamily: fonts.mono, fontSize: 12, color: c.accent }}>{String(index).padStart(2, '0')}</Text>}
        <Heading size={24} style={{ flex: 1 }}>{title}</Heading>
        {meta && <Text style={{ fontFamily: fonts.mono, fontSize: 12, color: c.muted }}>{meta}</Text>}
      </View>
      {children}
    </View>
  );
}
