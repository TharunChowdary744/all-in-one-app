import { StyleSheet, Text as RNText, type TextProps, type TextStyle } from 'react-native';

import { fonts, useColors } from '@/theme/colors';

/**
 * App-wide Text: defaults to IBM Plex Sans in ink and maps `fontWeight` to the matching
 * font file (custom fonts ignore fontWeight on Android).
 */
export function Text({ style, ...props }: TextProps) {
  const c = useColors();
  const flat = (StyleSheet.flatten(style) ?? {}) as TextStyle;
  let fontFamily = flat.fontFamily;
  if (!fontFamily) {
    const w = Number(flat.fontWeight ?? 400);
    fontFamily = w >= 600 ? fonts.sansSemi : w >= 500 ? fonts.sansMedium : fonts.sans;
  }
  return <RNText {...props} style={[{ color: c.ink }, flat, { fontFamily, fontWeight: undefined }]} />;
}

/** Small supporting label (field labels, group titles). */
export function Label({ style, ...props }: TextProps) {
  const c = useColors();
  return <Text {...props} style={[{ fontFamily: fonts.sansSemi, fontSize: 13, color: c.ink2 }, style]} />;
}

/** Display heading in Bricolage Grotesque. */
export function Heading({ style, size = 26, ...props }: TextProps & { size?: number }) {
  return <Text {...props} style={[{ fontFamily: fonts.display, fontSize: size, lineHeight: size * 1.05, letterSpacing: -size * 0.03 }, style]} />;
}
