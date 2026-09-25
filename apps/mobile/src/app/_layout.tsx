import { setRandomSource } from '@omnikit/core';
import { BricolageGrotesque_600SemiBold } from '@expo-google-fonts/bricolage-grotesque/600SemiBold';
import { BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque/700Bold';
import { IBMPlexMono_400Regular } from '@expo-google-fonts/ibm-plex-mono/400Regular';
import { IBMPlexMono_500Medium } from '@expo-google-fonts/ibm-plex-mono/500Medium';
import { IBMPlexSans_400Regular } from '@expo-google-fonts/ibm-plex-sans/400Regular';
import { IBMPlexSans_500Medium } from '@expo-google-fonts/ibm-plex-sans/500Medium';
import { IBMPlexSans_600SemiBold } from '@expo-google-fonts/ibm-plex-sans/600SemiBold';
import * as Crypto from 'expo-crypto';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppStateProvider, useAppState } from '@/state/AppState';
import { fonts, useColors, useIsDark } from '@/theme/colors';

// Hermes doesn't guarantee crypto.getRandomValues; route the shared core through expo-crypto.
setRandomSource((bytes) => Crypto.getRandomValues(bytes));

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootStack() {
  const c = useColors();
  const { ready } = useAppState();
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
  });
  const loaded = ready && (fontsLoaded || !!fontError);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => undefined);
  }, [loaded]);

  if (!loaded) return null;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: c.background },
        headerTintColor: c.ink,
        headerTitleStyle: { fontFamily: fonts.displaySemi, fontSize: 18 },
        headerShadowVisible: false,
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
      <ThemeProvider value={{ ...base, colors: { ...base.colors, primary: c.accent, background: c.background, card: c.background, text: c.ink, border: c.line } }}>
        <AppStateProvider>
          <StatusBar style={dark ? 'light' : 'dark'} />
          <RootStack />
        </AppStateProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
