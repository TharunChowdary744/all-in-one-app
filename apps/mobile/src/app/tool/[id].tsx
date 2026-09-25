import { getTool, getToolCode, isToolAvailable } from '@omnikit/core';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Monitor, Star } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';

import { RegistryIcon } from '@/components/Icon';
import { Card, Heading, Label, Muted, Screen, Text } from '@/components/ui';
import { useAppState } from '@/state/AppState';
import { radius, useColors } from '@/theme/colors';
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
          <Pressable hitSlop={12} onPress={() => toggleFavorite(tool.id)} accessibilityLabel={fav ? 'Unstar' : 'Star'} style={{ paddingHorizontal: 8 }}>
            <Star size={21} strokeWidth={1.6} color={fav ? c.accent : c.ink} fill={fav ? c.accent : 'none'} />
          </Pressable>
        ),
      }}
    />
  );

  if (!Component || !isToolAvailable(tool, 'mobile')) {
    return (
      <Screen>
        {header}
        <View style={{ gap: 14, paddingVertical: 16 }}>
          <View style={{ width: 56, height: 56, borderWidth: 1, borderColor: c.ink, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' }}>
            <RegistryIcon name={tool.icon} size={26} color={c.ink} />
          </View>
          <Label>{getToolCode(tool)}</Label>
          <Heading size={36}>{tool.name}</Heading>
          <Text style={{ color: c.ink2, fontSize: 16, lineHeight: 23 }}>{tool.description}</Text>
        </View>
        <Card title="Available on the web">
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Monitor size={20} color={c.accent} strokeWidth={1.6} />
            <Text style={{ color: c.ink2, lineHeight: 21, flex: 1 }}>
              This tool relies on desktop-class PDF and document engines, so it runs in the OmniKit web app. It works in any browser, including your phone's, and files still never leave your device.
            </Text>
          </View>
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
