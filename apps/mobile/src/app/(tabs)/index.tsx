import { APP_TAGLINE, categories, getFeaturedTools, getTool, getToolsByCategory, tools } from '@omnikit/core';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ToolCard } from '@/components/ToolCard';
import { Screen, Stat } from '@/components/ui';
import { useAppState } from '@/state/AppState';
import { radius, spacing, useColors } from '@/theme/colors';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export default function Dashboard() {
  const c = useColors();
  const { favorites, recents, usage, filesProcessed } = useAppState();
  const recentTools = recents.map((r) => getTool(r.id)).filter((t) => t !== undefined);
  const favoriteTools = favorites.map(getTool).filter((t) => t !== undefined);
  const launches = Object.values(usage).reduce((a, b) => a + b, 0);

  return (
    <Screen>
      <View style={[styles.hero, { backgroundColor: c.primary }]}>
        <Text style={styles.heroTitle}>{greeting()} 👋</Text>
        <Text style={styles.heroText}>{APP_TAGLINE} Convert images, build PDFs, format data and more — offline, on your phone.</Text>
        <Pressable onPress={() => router.push('/tools')} style={styles.heroSearch} accessibilityRole="search">
          <Text style={{ color: '#6b7280' }}>🔍  Search {tools.length} tools…</Text>
        </Pressable>
      </View>

      <View style={styles.stats}>
        <Stat label="Tools" value={tools.length} />
        <Stat label="Favorites" value={favorites.length} />
        <Stat label="Launches" value={launches} />
        <Stat label="Files" value={filesProcessed} />
      </View>

      {recentTools.length > 0 && (
        <Section title="🕘 Recently used">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
            {recentTools.map((t) => <ToolCard key={t.id} tool={t} compact />)}
          </ScrollView>
        </Section>
      )}

      {favoriteTools.length > 0 && (
        <Section title="⭐ Favorites">
          {favoriteTools.slice(0, 4).map((t) => <ToolCard key={t.id} tool={t} />)}
        </Section>
      )}

      <Section title="🗂️ Categories">
        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => router.push({ pathname: '/category/[id]', params: { id: cat.id } })}
              style={({ pressed }) => [styles.category, { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.85 : 1 }]}
            >
              <View style={[styles.catIcon, { backgroundColor: cat.color + '22' }]}>
                <Text style={{ fontSize: 22 }}>{cat.icon}</Text>
              </View>
              <Text style={{ color: c.text, fontWeight: '700' }} numberOfLines={1}>{cat.name}</Text>
              <Text style={{ color: cat.color, fontWeight: '700', fontSize: 12 }}>{getToolsByCategory(cat.id).length} tools</Text>
            </Pressable>
          ))}
        </View>
      </Section>

      <Section title="✨ Popular tools">
        {getFeaturedTools().map((t) => <ToolCard key={t.id} tool={t} />)}
      </Section>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const c = useColors();
  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={{ color: c.text, fontSize: 18, fontWeight: '800' }}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.lg, padding: spacing.xl, gap: spacing.sm },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '800' },
  heroText: { color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 20 },
  heroSearch: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginTop: spacing.sm },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  category: { flexBasis: '31%', flexGrow: 1, borderWidth: 1, borderRadius: radius.md, padding: spacing.md, gap: 6 },
  catIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
