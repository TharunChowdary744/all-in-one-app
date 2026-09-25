import { getTool } from '@omnikit/core';
import { Star } from 'lucide-react-native';
import { View } from 'react-native';

import { ToolCard } from '@/components/ToolCard';
import { Heading, Screen, Text } from '@/components/ui';
import { useAppState } from '@/state/AppState';
import { radius, useColors } from '@/theme/colors';

export default function Favorites() {
  const c = useColors();
  const { favorites } = useAppState();
  const list = favorites.map(getTool).filter((t) => t !== undefined);
  return (
    <Screen>
      {list.length === 0 ? (
        <View style={{ paddingVertical: 40, gap: 10 }}>
          <Star size={24} color={c.accent} strokeWidth={1.75} />
          <Heading size={22}>No starred tools yet</Heading>
          <Text style={{ color: c.ink2, fontSize: 15, lineHeight: 22 }}>Tap the star next to any tool to keep it here and at the top of the Tools tab.</Text>
        </View>
      ) : (
        <View style={{ borderWidth: 1, borderColor: c.line, borderRadius: radius.lg, backgroundColor: c.surface, overflow: 'hidden' }}>
          {list.map((t, i) => <ToolCard key={t.id} tool={t} last={i === list.length - 1} />)}
        </View>
      )}
    </Screen>
  );
}
