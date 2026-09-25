import { isToolAvailable, type ToolDefinition } from '@omnikit/core';
import { router } from 'expo-router';
import { Star } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { RegistryIcon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { useAppState } from '@/state/AppState';
import { fonts, radius, spacing, useColors, withAlpha } from '@/theme/colors';

const open = (tool: ToolDefinition) => router.push({ pathname: '/tool/[id]', params: { id: tool.id } });

/** List row inside a grouped section: tinted category icon, name, description, star. */
export function ToolCard({ tool, last = false }: { tool: ToolDefinition; last?: boolean }) {
  const c = useColors();
  const { isFavorite, toggleFavorite } = useAppState();
  const fav = isFavorite(tool.id);
  const webOnly = !isToolAvailable(tool, 'mobile');
  const hue = c.cat[tool.category];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${tool.name}. ${tool.description}${webOnly ? '. Web only' : ''}`}
      onPress={() => open(tool)}
      style={({ pressed }) => [styles.row, { borderColor: c.line, borderBottomWidth: last ? 0 : 1, backgroundColor: pressed ? withAlpha(hue, 0.06) : 'transparent' }]}
    >
      <View style={[styles.icon, { backgroundColor: withAlpha(hue, 0.13) }]}>
        <RegistryIcon name={tool.icon} color={hue} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: fonts.sansSemi, fontSize: 15.5 }}>{tool.name}</Text>
        <Text numberOfLines={2} style={{ color: c.ink2, fontSize: 13.5, lineHeight: 19 }}>
          {tool.description}
        </Text>
        {(webOnly || tool.isNew) && (
          <View style={styles.tags}>
            {tool.isNew && <Text style={[styles.tag, { color: c.accentStrong, backgroundColor: c.accentSoft }]}>New</Text>}
            {webOnly && <Text style={[styles.tag, { color: c.ink2, backgroundColor: c.surface2 }]}>Web only</Text>}
          </View>
        )}
      </View>
      <Pressable
        hitSlop={10}
        style={styles.star}
        onPress={() => toggleFavorite(tool.id)}
        accessibilityRole="button"
        accessibilityLabel={fav ? `Unstar ${tool.name}` : `Star ${tool.name}`}
        accessibilityState={{ selected: fav }}
      >
        <Star size={19} strokeWidth={1.75} color={fav ? c.accent : c.muted} fill={fav ? c.accent : 'none'} />
      </Pressable>
    </Pressable>
  );
}

/** Compact link for recent / starred shelves. */
export function ToolPill({ tool }: { tool: ToolDefinition }) {
  const c = useColors();
  return (
    <Pressable onPress={() => open(tool)} style={({ pressed }) => [styles.pill, { borderColor: c.line, backgroundColor: pressed ? c.surface2 : c.surface }]}>
      <RegistryIcon name={tool.icon} size={16} color={c.cat[tool.category]} />
      <Text style={{ fontSize: 14 }}>{tool.name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start', paddingVertical: 14, paddingLeft: 14, paddingRight: 6 },
  icon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  tags: { flexDirection: 'row', gap: 6, marginTop: 6 },
  tag: { fontSize: 11.5, fontFamily: fonts.sansMedium, paddingHorizontal: 7, paddingVertical: 1, borderRadius: 99, overflow: 'hidden' },
  star: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginTop: -6 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 38, paddingHorizontal: 12, borderWidth: 1, borderRadius: radius.md },
});
