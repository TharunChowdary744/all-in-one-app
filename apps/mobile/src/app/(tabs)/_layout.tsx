import { Tabs } from 'expo-router/js-tabs';
import { Info, LayoutGrid, Search, Star, type LucideIcon } from 'lucide-react-native';
import type { ColorValue } from 'react-native';

import { fonts, useColors } from '@/theme/colors';

const icon = (Icon: LucideIcon) =>
  function TabIcon({ color }: { color: ColorValue }) {
    return <Icon size={21} color={color as string} strokeWidth={1.6} />;
  };

export default function TabsLayout() {
  const c = useColors();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: c.accentStrong,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: { backgroundColor: c.background, borderTopColor: c.line },
        tabBarLabelStyle: { fontFamily: fonts.sansMedium, fontSize: 11 },
        headerStyle: { backgroundColor: c.background },
        headerShadowVisible: false,
        headerTintColor: c.ink,
        headerTitleStyle: { fontFamily: fonts.displaySemi, fontSize: 18 },
        headerTitleAlign: 'left',
        sceneStyle: { backgroundColor: c.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Tools', headerShown: false, tabBarIcon: icon(LayoutGrid) }} />
      <Tabs.Screen name="tools" options={{ title: 'Search', headerTitle: 'Search tools', tabBarIcon: icon(Search) }} />
      <Tabs.Screen name="favorites" options={{ title: 'Starred', tabBarIcon: icon(Star) }} />
      <Tabs.Screen name="about" options={{ title: 'About', tabBarIcon: icon(Info) }} />
    </Tabs>
  );
}
