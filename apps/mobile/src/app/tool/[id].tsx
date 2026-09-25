import { getCategory, getTool, isToolAvailable } from '@omnikit/core';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Card, Muted, Screen } from '@/components/ui';
import { useAppState } from '@/state/AppState';
import { useColors } from '@/theme/colors';
import { toolScreens } from '@/tools';

export default function ToolScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useColors();
  const tool = getTool(id);
  const { isFavorite, toggleFavorite, recordVisit } = useAppState();

  useEffect(() => {
    if (tool) recordVisit(tool.id);
  }, [tool, recordVisit]);

  if (!tool) return <Screen><Muted>Tool not found.</Muted></Screen>;

  const Component = toolScreens[tool.id];
  const fav = isFavorite(tool.id);
  const header = (
    <Stack.Screen
      options={{
        title: tool.name,
        headerRight: () => (
          <Pressable hitSlop={12} onPress={() => toggleFavorite(tool.id)} accessibilityLabel="Toggle favorite" style={{ paddingHorizontal: 8 }}>
            <Text style={{ fontSize: 22, color: fav ? '#f59e0b' : c.muted }}>{fav ? '★' : '☆'}</Text>
          </Pressable>
        ),
      }}
    />
  );

  if (!Component || !isToolAvailable(tool, 'mobile')) {
    const category = getCategory(tool.category);
    return (
      <Screen>
        {header}
        <View style={{ alignItems: 'center', gap: 10, paddingVertical: 32 }}>
          <Text style={{ fontSize: 56 }}>{tool.icon}</Text>
          <Text style={{ color: c.text, fontSize: 20, fontWeight: '800' }}>{tool.name}</Text>
          <Text style={{ color: c.text2, textAlign: 'center' }}>{tool.description}</Text>
        </View>
        <Card title="💻 Available in OmniKit Web">
          <Text style={{ color: c.text2, lineHeight: 20 }}>
            This {category.name.toLowerCase()} tool needs desktop-class PDF and document engines, so it currently runs in the OmniKit web app. Open OmniKit in any browser (it works on your phone too) to use it — files still never leave your device.
          </Text>
        </Card>
      </Screen>
    );
  }

  return (
    <>
      {header}
      <Component />
    </>
  );
}
