import { APP_NAME, categories, getTool, getToolsByCategory, tools } from '@omnikit/core';
import { router } from 'expo-router';
import { Search } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IntroBand } from '@/components/IntroBand';
import { LogoMark } from '@/components/Logo';
import { Section } from '@/components/Section';
import { ToolCard, ToolPill } from '@/components/ToolCard';
import { Button, Heading, Label, Text } from '@/components/ui';
import { useAppState } from '@/state/AppState';
import { fonts, radius, spacing, useColors } from '@/theme/colors';

export default function Dashboard() {
  const c = useColors();
  const { favorites, recents, clearHistory } = useAppState();
  const recentTools = recents.map((r) => getTool(r.id)).filter((t) => t !== undefined);
  const favoriteTools = favorites.map(getTool).filter((t) => t !== undefined);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView contentContainerStyle={styles.screen}>
        <View style={styles.brandRow}>
          <LogoMark size={26} />
          <Text style={{ fontFamily: fonts.display, fontSize: 19, letterSpacing: -0.5 }}>{APP_NAME}</Text>
        </View>

        <IntroBand>
          <View style={{ gap: 6 }}>
            <Heading size={28}>All tools</Heading>
            <Text style={{ color: c.ink2, fontSize: 15, lineHeight: 22 }}>
              {tools.length} tools for files, text, code, money and everyday maths. Everything runs on your phone.
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/tools')}
            accessibilityRole="search"
            accessibilityLabel="Search tools"
            style={({ pressed }) => [styles.search, { borderColor: pressed ? c.ink : c.lineStrong, backgroundColor: c.surface }]}
          >
            <Search size={18} color={c.muted} />
            <Text style={{ color: c.muted, fontSize: 15 }}>Search by tool or file format</Text>
          </Pressable>
        </IntroBand>

        {recentTools.length > 0 && (
          <View style={{ gap: 10 }}>
            <View style={styles.shelfHead}>
              <Label style={{ color: c.ink, fontSize: 14 }}>Recently used</Label>
              <Button small kind="ghost" label="Clear history" onPress={clearHistory} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {recentTools.map((t) => <ToolPill key={t.id} tool={t} />)}
            </ScrollView>
          </View>
        )}
        {favoriteTools.length > 0 && (
          <View style={{ gap: 10 }}>
            <Label style={{ color: c.ink, fontSize: 14 }}>Starred</Label>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {favoriteTools.map((t) => <ToolPill key={t.id} tool={t} />)}
            </ScrollView>
          </View>
        )}

        {categories.map((cat) => {
          const list = getToolsByCategory(cat.id);
          return (
            <Section key={cat.id} title={cat.name} meta={`${list.length} tools`}>
              {list.map((t, i) => <ToolCard key={t.id} tool={t} last={i === list.length - 1} />)}
            </Section>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.lg, paddingTop: spacing.sm, gap: 24, paddingBottom: 56 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 40 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 50, paddingHorizontal: 14, borderWidth: 1, borderRadius: radius.lg },
  shelfHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: -6 },
});
