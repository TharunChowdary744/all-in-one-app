import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Heading, Text } from '@/components/Text';
import { radius, useColors } from '@/theme/colors';

/** Titled group of rows inside a single bordered container. */
export function Section({ title, meta, children }: { title: string; meta?: string; children: ReactNode }) {
  const c = useColors();
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
        <Heading size={20} style={{ flex: 1 }}>{title}</Heading>
        {meta && <Text style={{ fontSize: 13, color: c.muted }}>{meta}</Text>}
      </View>
      <View style={{ borderWidth: 1, borderColor: c.line, borderRadius: radius.lg, backgroundColor: c.surface, overflow: 'hidden' }}>{children}</View>
    </View>
  );
}
