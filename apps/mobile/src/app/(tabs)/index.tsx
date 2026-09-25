import { APP_NAME, categories, getTool, getToolsByCategory, tools } from '@omnikit/core';
import { router } from 'expo-router';
import { Search } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LogoMark } from '@/components/Logo';
import { Section } from '@/components/Section';
import { ToolCard, ToolPill } from '@/components/ToolCard';
import { Heading, Label, Stat, StatGrid, Text } from '@/components/ui';
import { useAppState } from '@/state/AppState';
import { fonts, radius, spacing, useColors } from '@/theme/colors';

const pad = (n: number) => String(n).padStart(2, '0');

export default function Dashboard() {
  const c = useColors();
  const { favorites, recents, usage, filesProcessed } = useAppState();
  const recentTools = recents.map((r) => getTool(r.id)).filter((t) => t !== undefined);
  const favoriteTools = favorites.map(getTool).filter((t) => t !== undefined);
  const launches = Object.values(usage).reduce((a, b) => a + b, 0);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView contentContainerStyle={styles.screen}>
        <View style={styles.brandRow}>
          <LogoMark />
          <Text style={{ fontFamily: fonts.display, fontSize: 20, letterSpacing: -0.6 }}>{APP_NAME}</Text>
        </View>

        <View style={{ gap: 12 }}>
          <Label>Index · {tools.length} tools in {categories.length} sections</Label>
          <View>
            <Heading size={44}>Everyday tools.</Heading>
            <Heading size={44} style={{ color: c.accent }}>No uploads.</Heading>
          </View>
          <Text style={{ color: c.ink2, fontSize: 15, lineHeight: 22 }}>
            Convert images, build PDFs, format data and generate secrets. Everything runs on your phone.
          </Text>
        </View>

        <StatGrid>
          <Stat label="Tools" value={pad(tools.length)} />
          <Stat label="Starred" value={pad(favorites.length)} />
          <Stat label="Launches" value={pad(launches)} />
          <Stat label="Files processed" value={pad(filesProcessed)} />
        </StatGrid>

        <Pressable onPress={() => router.push('/tools')} style={[styles.search, { borderColor: c.line, backgroundColor: c.surface }]} accessibilityRole="search">
          <Search size={17} color={c.muted} />
          <Text style={{ color: c.muted }}>Search by name or format</Text>
        </Pressable>

        {(recentTools.length > 0 || favoriteTools.length > 0) && (
          <View style={{ gap: 14 }}>
            {recentTools.length > 0 && (
              <View style={{ gap: 8 }}>
                <Label>Recently used</Label>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {recentTools.map((t) => <ToolPill key={t.id} tool={t} />)}
                </ScrollView>
              </View>
            )}
            {favoriteTools.length > 0 && (
              <View style={{ gap: 8 }}>
                <Label>Starred</Label>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {favoriteTools.map((t) => <ToolPill key={t.id} tool={t} />)}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {categories.map((cat, i) => {
          const list = getToolsByCategory(cat.id);
          return (
            <Section key={cat.id} index={i + 1} title={cat.name} meta={pad(list.length)}>
              {list.map((t) => <ToolCard key={t.id} tool={t} />)}
            </Section>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.lg, paddingTop: spacing.sm, gap: 28, paddingBottom: 56 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 46, paddingHorizontal: 14, borderWidth: 1, borderRadius: radius.sm },
});
