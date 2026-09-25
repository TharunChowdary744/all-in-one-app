import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { radius, useColors } from '@/theme/colors';

/** The home screen's one gradient: a warm wash that frames the primary task (search). */
export function IntroBand({ children }: { children: ReactNode }) {
  const c = useColors();
  return (
    <View style={[styles.band, { borderColor: c.line, backgroundColor: c.surface }]}>
      <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none" viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id="warm" cx="0" cy="0" r="95" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={c.accent} stopOpacity={0.18} />
            <Stop offset="1" stopColor={c.accent} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="cool" cx="100" cy="100" r="80" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={c.cat.converter} stopOpacity={0.12} />
            <Stop offset="1" stopColor={c.cat.converter} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100" height="100" fill="url(#warm)" />
        <Rect width="100" height="100" fill="url(#cool)" />
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  band: { borderWidth: 1, borderRadius: radius.xl, padding: 20, gap: 14, overflow: 'hidden' },
});
