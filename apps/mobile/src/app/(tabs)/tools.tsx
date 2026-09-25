import { categories, searchTools, tools, type CategoryId } from '@omnikit/core';
import { Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ToolCard } from '@/components/ToolCard';
import { Chip, Label, Muted, Text } from '@/components/ui';
import { fonts, radius, spacing, useColors } from '@/theme/colors';

export default function AllTools() {
  const c = useColors();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<CategoryId | 'all'>('all');
  const results = useMemo(() => searchTools(query, filter === 'all' ? tools : tools.filter((t) => t.category === filter)), [query, filter]);

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <View style={styles.header}>
        <View style={[styles.search, { backgroundColor: c.surface, borderColor: c.lineStrong }]}>
          <Search size={17} color={c.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by tool or file format"
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
        <Label style={{ color: c.muted, fontFamily: fonts.sansMedium }}>
          {results.length} {results.length === 1 ? 'tool' : 'tools'}
        </Label>
      </View>
      <FlatList
        data={results}
        keyExtractor={(t) => t.id}
        renderItem={({ item, index }) => <ToolCard tool={item} last={index === results.length - 1} />}
        style={{ marginHorizontal: spacing.lg, marginBottom: spacing.lg }}
        contentContainerStyle={results.length ? { borderWidth: 1, borderColor: c.line, borderRadius: radius.lg, backgroundColor: c.surface, overflow: 'hidden' } : undefined}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={{ paddingVertical: 32, gap: 6 }}>
            <Text style={{ fontFamily: fonts.sansSemi, fontSize: 15 }}>No tools match “{query}”.</Text>
            <Muted>Try a file format such as “png”, “docx” or “csv”, or pick a category above.</Muted>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.lg, paddingBottom: 0, gap: spacing.md },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: radius.lg, paddingHorizontal: 14 },
});
