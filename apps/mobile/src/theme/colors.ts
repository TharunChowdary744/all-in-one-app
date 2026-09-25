import type { CategoryId } from '@omnikit/core';
import { useColorScheme } from 'react-native';

// Warm paper neutrals, ink, a signal-orange brand accent and one muted hue per tool category.
// Mirrors the tokens in apps/web/src/styles.css; every text/background pair meets WCAG AA.
const light = {
  background: '#f3f0e8',
  surface: '#faf8f3',
  surface2: '#ebe7dc',
  line: '#ddd7c9',
  ink: '#1c1b17',
  ink2: '#57544a',
  muted: '#6b665a',
  lineStrong: '#c9c1ae',
  accent: '#e0531f',
  accentStrong: '#b8431a',
  accentInk: '#ffffff',
  accentSoft: '#f7dfd1',
  good: '#2f6f3e',
  bad: '#b3261e',
  warn: '#8a5f0e',
  cat: {
    image: '#a84a22',
    pdf: '#a8323e',
    document: '#2f6690',
    text: '#8a5f0e',
    developer: '#3f7650',
    converter: '#1f6f73',
    security: '#6a4a8c',
    finance: '#5f6a12',
    calculator: '#4f5f70',
  } as Record<CategoryId, string>,
  // Chart series, validated for colour-blind separation and contrast on `surface`.
  series: { base: '#2a6fc2', growth: '#d0622c' },
};

export type Palette = typeof light;

const dark: Palette = {
  background: '#141310',
  surface: '#1b1a16',
  surface2: '#24221d',
  line: '#2f2c25',
  ink: '#efebe0',
  ink2: '#bdb8aa',
  muted: '#958f80',
  lineStrong: '#454036',
  accent: '#ff6a33',
  accentStrong: '#ff8a5c',
  accentInk: '#141310',
  accentSoft: '#3a2318',
  good: '#7fc28e',
  bad: '#f07a70',
  warn: '#d9a646',
  cat: {
    image: '#e58a5e',
    pdf: '#e8808a',
    document: '#86b4dc',
    text: '#d9a646',
    developer: '#88c296',
    converter: '#6cc0c2',
    security: '#b99bdc',
    finance: '#c4c75a',
    calculator: '#a9b8c8',
  },
  series: { base: '#4d8fe0', growth: '#e2703a' },
};

export function useColors(): Palette {
  return useColorScheme() === 'dark' ? dark : light;
}

export function useIsDark(): boolean {
  return useColorScheme() === 'dark';
}

/** Font family names registered in the root layout via expo-font. */
export const fonts = {
  display: 'BricolageGrotesque_700Bold',
  displaySemi: 'BricolageGrotesque_600SemiBold',
  sans: 'IBMPlexSans_400Regular',
  sansMedium: 'IBMPlexSans_500Medium',
  sansSemi: 'IBMPlexSans_600SemiBold',
  mono: 'IBMPlexMono_400Regular',
  monoMedium: 'IBMPlexMono_500Medium',
};

export const radius = { sm: 6, md: 8, lg: 12, xl: 16 };
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const mono = { fontFamily: fonts.mono };

/** Hex colour with alpha, for category tints (e.g. withAlpha('#a84a22', 0.12)). */
export function withAlpha(hex: string, alpha: number): string {
  return hex + Math.round(alpha * 255).toString(16).padStart(2, '0');
}
