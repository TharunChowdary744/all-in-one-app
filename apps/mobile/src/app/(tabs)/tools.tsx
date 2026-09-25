import { categories, searchTools, tools, type CategoryId } from '@omnikit/core';
import { Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ToolCard } from '@/components/ToolCard';
import { Chip, Label, Muted } from '@/components/ui';
import { fonts, radius, spacing, useColors } from '@/theme/colors';

export default function AllTools() {
  const c = useColors();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<CategoryId | 'all'>('all');
  const results = useMemo(() => searchTools(query, filter === 'all' ? tools : tools.filter((t) => t.category === filter)), [query, filter]);

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <View style={styles.header}>
        <View style={[styles.search, { backgroundColor: c.surface, borderColor: c.line }]}>
          <Search size={17} color={c.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="“webp”, “json”, “pdf to word”"
            placeholderTextColor={c.muted}
            clearButtonMode="while-editing"
            autoCorrect={false}
            autoCapitalize="none"
            style={{ flex: 1, color: c.ink, fontFamily: fonts.sans, fontSize: 15, paddingVertical: 12 }}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          <Chip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
          {categories.map((cat) => (
            <Chip key={cat.id} label={cat.name} active={filter === cat.id} onPress={() => setFilter(cat.id)} />
          ))}
        </ScrollView>
        <Label style={{ paddingBottom: 8, borderBottomWidth: 1, borderColor: c.ink, color: c.ink }}>
          {String(results.length).padStart(2, '0')} {results.length === 1 ? 'match' : 'matches'}
        </Label>
      </View>
      <FlatList
        data={results}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => <ToolCard tool={item} />}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<View style={{ paddingVertical: 32 }}><Muted>Nothing matches. Try a file format like “png” or “csv”.</Muted></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.lg, paddingBottom: 0, gap: spacing.md },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: 12 },
});
