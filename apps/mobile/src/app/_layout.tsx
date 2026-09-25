import { setRandomSource } from '@omnikit/core';
import * as Crypto from 'expo-crypto';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppStateProvider, useAppState } from '@/state/AppState';
import { useColors, useIsDark } from '@/theme/colors';

// Hermes doesn't guarantee crypto.getRandomValues; route the shared core through expo-crypto.
setRandomSource((bytes) => Crypto.getRandomValues(bytes));

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootStack() {
  const c = useColors();
  const { ready } = useAppState();

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: c.surface },
        headerTintColor: c.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: c.background },
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="tool/[id]" options={{ title: '' }} />
      <Stack.Screen name="category/[id]" options={{ title: '' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const dark = useIsDark();
  const c = useColors();
  const base = dark ? DarkTheme : DefaultTheme;
  return (
    <SafeAreaProvider>
      <ThemeProvider value={{ ...base, colors: { ...base.colors, primary: c.primary, background: c.background, card: c.surface, text: c.text, border: c.border } }}>
        <AppStateProvider>
          <StatusBar style={dark ? 'light' : 'dark'} />
          <RootStack />
        </AppStateProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
