import { Tabs } from 'expo-router/js-tabs';
import { Text } from 'react-native';

import { useColors } from '@/theme/colors';

const icon = (emoji: string) =>
  function TabIcon({ focused }: { focused: boolean }) {
    return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.55 }}>{emoji}</Text>;
  };

export default function TabsLayout() {
  const c = useColors();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.border },
        headerStyle: { backgroundColor: c.surface },
        headerTintColor: c.text,
        headerTitleStyle: { fontWeight: '800' },
        sceneStyle: { backgroundColor: c.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'OmniKit', tabBarLabel: 'Home', tabBarIcon: icon('🏠') }} />
      <Tabs.Screen name="tools" options={{ title: 'All tools', tabBarLabel: 'Tools', tabBarIcon: icon('🧰') }} />
      <Tabs.Screen name="favorites" options={{ title: 'Favorites', tabBarIcon: icon('⭐') }} />
      <Tabs.Screen name="about" options={{ title: 'About', tabBarIcon: icon('ℹ️') }} />
    </Tabs>
  );
}
