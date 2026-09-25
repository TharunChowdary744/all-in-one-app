import { categories, searchTools, tools, type CategoryId } from '@omnikit/core';
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ToolCard } from '@/components/ToolCard';
import { Chip, Muted } from '@/components/ui';
import { radius, spacing, useColors } from '@/theme/colors';

export default function AllTools() {
  const c = useColors();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<CategoryId | 'all'>('all');
  const results = useMemo(() => searchTools(query, filter === 'all' ? tools : tools.filter((t) => t.category === filter)), [query, filter]);

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <View style={styles.header}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search tools… e.g. “webp”, “json”"
          placeholderTextColor={c.muted}
          clearButtonMode="while-editing"
          autoCorrect={false}
          style={[styles.search, { backgroundColor: c.surface, borderColor: c.border, color: c.text }]}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
          <Chip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
          {categories.map((cat) => (
            <Chip key={cat.id} label={`${cat.icon} ${cat.name}`} active={filter === cat.id} onPress={() => setFilter(cat.id)} />
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={results}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => <ToolCard tool={item} />}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: 0, gap: spacing.sm }}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<Muted>No tools match your search.</Muted>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.lg, gap: spacing.md },
  search: { borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
});
