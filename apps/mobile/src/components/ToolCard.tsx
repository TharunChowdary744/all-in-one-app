import { getCategory, isToolAvailable, type ToolDefinition } from '@omnikit/core';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppState } from '@/state/AppState';
import { radius, spacing, useColors } from '@/theme/colors';

export function ToolCard({ tool, compact = false }: { tool: ToolDefinition; compact?: boolean }) {
  const c = useColors();
  const { isFavorite, toggleFavorite } = useAppState();
  const category = getCategory(tool.category);
  const fav = isFavorite(tool.id);
  const available = isToolAvailable(tool, 'mobile');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={tool.name}
      onPress={() => router.push({ pathname: '/tool/[id]', params: { id: tool.id } })}
      style={({ pressed }) => [
        compact ? styles.compact : styles.card,
        { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
    >
      <View style={[compact ? styles.iconSmall : styles.icon, { backgroundColor: category.color + '22' }]}>
        <Text style={{ fontSize: compact ? 20 : 24 }}>{tool.icon}</Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text numberOfLines={compact ? 2 : 1} style={[styles.title, { color: c.text }]}>
          {tool.name}
        </Text>
        {!compact && (
          <Text numberOfLines={2} style={{ color: c.text2, fontSize: 13 }}>
            {tool.description}
          </Text>
        )}
        {!compact && (
          <View style={styles.meta}>
            <Text style={[styles.badge, { color: category.color, backgroundColor: c.surface2 }]}>{category.name}</Text>
            {!available && <Text style={[styles.badge, { color: c.muted, backgroundColor: c.surface2 }]}>Web only</Text>}
            {tool.isNew && <Text style={[styles.badge, { color: '#047857', backgroundColor: '#dcfce7' }]}>NEW</Text>}
          </View>
        )}
      </View>
      {!compact && (
        <Pressable hitSlop={12} onPress={() => toggleFavorite(tool.id)} accessibilityLabel={fav ? 'Remove from favorites' : 'Add to favorites'}>
          <Text style={{ fontSize: 20, color: fav ? '#f59e0b' : c.muted }}>{fav ? '★' : '☆'}</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: spacing.md, alignItems: 'center', padding: spacing.md, borderRadius: radius.md, borderWidth: 1 },
  compact: { width: 124, gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1 },
  icon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  iconSmall: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '700' },
  meta: { flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  badge: { fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99, overflow: 'hidden' },
});
