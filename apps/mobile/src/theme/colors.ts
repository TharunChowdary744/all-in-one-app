import { useColorScheme } from 'react-native';

// "Workbench catalog" palette — warm paper, ink, one signal-orange accent. Mirrors apps/web/src/styles.css.
const light = {
  background: '#f3f0e8',
  surface: '#faf8f3',
  surface2: '#ebe7dc',
  line: '#d9d3c4',
  ink: '#1c1b17',
  ink2: '#57544a',
  muted: '#8a8577',
  accent: '#e0531f',
  accentInk: '#ffffff',
  accentSoft: '#f6dccd',
  good: '#3d7a4a',
  bad: '#c0352b',
};

export type Palette = typeof light;

const dark: Palette = {
  background: '#141310',
  surface: '#1b1a16',
  surface2: '#24221d',
  line: '#333029',
  ink: '#efebe0',
  ink2: '#b7b2a4',
  muted: '#7f7a6c',
  accent: '#ff6a33',
  accentInk: '#141310',
  accentSoft: '#3a2318',
  good: '#7fb88a',
  bad: '#ef6b5f',
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

export const radius = { sm: 4, md: 6 };
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const mono = { fontFamily: fonts.mono };
