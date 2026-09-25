import { useColorScheme } from 'react-native';

const light = {
  background: '#f6f7fb',
  surface: '#ffffff',
  surface2: '#f1f3f9',
  border: '#e4e7f0',
  text: '#151826',
  text2: '#5b6178',
  muted: '#8a90a6',
  primary: '#6d5dfc',
  primaryDark: '#4f46e5',
  primarySoft: '#efedff',
  good: '#059669',
  bad: '#dc2626',
  onPrimary: '#ffffff',
};

export type Palette = typeof light;

const dark: Palette = {
  background: '#0d0f17',
  surface: '#151826',
  surface2: '#1c2031',
  border: '#272c40',
  text: '#eef0f8',
  text2: '#b0b5c9',
  muted: '#7c8299',
  primary: '#8b7bff',
  primaryDark: '#6d5dfc',
  primarySoft: '#221f45',
  good: '#34d399',
  bad: '#f87171',
  onPrimary: '#ffffff',
};

export function useColors(): Palette {
  return useColorScheme() === 'dark' ? dark : light;
}

export function useIsDark(): boolean {
  return useColorScheme() === 'dark';
}

export const radius = { sm: 10, md: 14, lg: 20 };
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const mono = { fontFamily: 'monospace' as const };
