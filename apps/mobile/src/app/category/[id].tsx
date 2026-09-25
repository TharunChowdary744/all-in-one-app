import { categories, getToolsByCategory } from '@omnikit/core';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

import { ToolCard } from '@/components/ToolCard';
import { Muted, Screen } from '@/components/ui';
import { useColors } from '@/theme/colors';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useColors();
  const category = categories.find((x) => x.id === id);
  if (!category) return <Screen><Muted>Category not found.</Muted></Screen>;
  return (
    <Screen>
      <Stack.Screen options={{ title: category.name }} />
      <Text style={{ color: c.text2 }}>{category.icon} {category.description}</Text>
      {getToolsByCategory(category.id).map((t) => <ToolCard key={t.id} tool={t} />)}
    </Screen>
  );
}
