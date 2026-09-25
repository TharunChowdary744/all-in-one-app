import { getToolCode, isToolAvailable, type ToolDefinition } from '@omnikit/core';
import { router } from 'expo-router';
import { Star } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { RegistryIcon } from '@/components/Icon';
import { Label, Text } from '@/components/Text';
import { useAppState } from '@/state/AppState';
import { fonts, radius, spacing, useColors } from '@/theme/colors';

const open = (tool: ToolDefinition) => router.push({ pathname: '/tool/[id]', params: { id: tool.id } });

/** Catalog row: icon box, code, name, description, star. Rows share hairlines. */
export function ToolCard({ tool }: { tool: ToolDefinition }) {
  const c = useColors();
  const { isFavorite, toggleFavorite } = useAppState();
  const fav = isFavorite(tool.id);
  const webOnly = !isToolAvailable(tool, 'mobile');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={tool.name}
      onPress={() => open(tool)}
      style={({ pressed }) => [styles.row, { borderColor: c.line, backgroundColor: pressed ? c.surface : 'transparent' }]}
    >
      {({ pressed }) => (
        <>
          <View style={[styles.icon, { borderColor: pressed ? c.accent : c.line, backgroundColor: c.surface }]}>
            <RegistryIcon name={tool.icon} color={pressed ? c.accent : c.ink} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <View style={styles.meta}>
              <Label>{getToolCode(tool)}</Label>
              {tool.isNew && <Label style={[styles.tag, { color: c.accent, borderColor: c.accent }]}>New</Label>}
              {webOnly && <Label style={[styles.tag, { borderColor: c.line }]}>Web</Label>}
            </View>
            <Text style={{ fontFamily: fonts.displaySemi, fontSize: 18, letterSpacing: -0.3 }}>{tool.name}</Text>
            <Text numberOfLines={2} style={{ color: c.ink2, fontSize: 13.5, lineHeight: 19 }}>
              {tool.description}
            </Text>
          </View>
          <Pressable hitSlop={14} onPress={() => toggleFavorite(tool.id)} accessibilityLabel={fav ? `Unstar ${tool.name}` : `Star ${tool.name}`}>
            <Star size={18} strokeWidth={1.6} color={fav ? c.accent : c.muted} fill={fav ? c.accent : 'none'} />
          </Pressable>
        </>
      )}
    </Pressable>
  );
}

/** Compact bordered link for recent / starred shelves. */
export function ToolPill({ tool }: { tool: ToolDefinition }) {
  const c = useColors();
  return (
    <Pressable onPress={() => open(tool)} style={({ pressed }) => [styles.pill, { borderColor: pressed ? c.ink : c.line, backgroundColor: c.surface }]}>
      <RegistryIcon name={tool.icon} size={15} color={c.accent} />
      <Text style={{ fontSize: 14 }}>{tool.name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start', paddingVertical: 14, paddingHorizontal: 2, borderBottomWidth: 1 },
  icon: { width: 42, height: 42, borderRadius: radius.sm, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  meta: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  tag: { borderWidth: 1, borderRadius: 3, paddingHorizontal: 4, fontSize: 9.5 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 36, paddingHorizontal: 12, borderWidth: 1, borderRadius: radius.sm },
});
