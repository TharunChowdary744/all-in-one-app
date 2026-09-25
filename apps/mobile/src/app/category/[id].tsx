import { categories, getToolsByCategory } from '@omnikit/core';
import { Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { ToolCard } from '@/components/ToolCard';
import { Muted, Screen, Text } from '@/components/ui';
import { radius, useColors } from '@/theme/colors';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useColors();
  const category = categories.find((x) => x.id === id);
  if (!category) return <Screen><Muted>Category not found.</Muted></Screen>;
  return (
    <Screen>
      <Stack.Screen options={{ title: category.name }} />
      <Text style={{ color: c.ink2 }}>{category.description}</Text>
      <View style={{ borderWidth: 1, borderColor: c.line, borderRadius: radius.lg, backgroundColor: c.surface, overflow: 'hidden' }}>
        {getToolsByCategory(category.id).map((t, i, all) => <ToolCard key={t.id} tool={t} last={i === all.length - 1} />)}
      </View>
    </Screen>
  );
}
