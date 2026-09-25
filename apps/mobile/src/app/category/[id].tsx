import { categories, getToolsByCategory } from '@omnikit/core';
import { Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { ToolCard } from '@/components/ToolCard';
import { Muted, Screen, Text } from '@/components/ui';
import { useColors } from '@/theme/colors';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useColors();
  const category = categories.find((x) => x.id === id);
  if (!category) return <Screen><Muted>Section not found.</Muted></Screen>;
  return (
    <Screen>
      <Stack.Screen options={{ title: category.name }} />
      <Text style={{ color: c.ink2 }}>{category.description}</Text>
      <View style={{ borderTopWidth: 1, borderColor: c.ink }}>{getToolsByCategory(category.id).map((t) => <ToolCard key={t.id} tool={t} />)}</View>
    </Screen>
  );
}
