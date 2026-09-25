import { getTool } from '@omnikit/core';
import { Star } from 'lucide-react-native';
import { View } from 'react-native';

import { ToolCard } from '@/components/ToolCard';
import { Heading, Screen, Text } from '@/components/ui';
import { useAppState } from '@/state/AppState';
import { useColors } from '@/theme/colors';

export default function Favorites() {
  const c = useColors();
  const { favorites } = useAppState();
  const list = favorites.map(getTool).filter((t) => t !== undefined);
  return (
    <Screen>
      {list.length === 0 ? (
        <View style={{ paddingVertical: 48, gap: 12 }}>
          <Star size={28} color={c.accent} strokeWidth={1.6} />
          <Heading size={30}>Nothing starred yet.</Heading>
          <Text style={{ color: c.ink2, fontSize: 15, lineHeight: 22 }}>Tap the star on any tool to keep it here, one tap away.</Text>
        </View>
      ) : (
        <View style={{ borderTopWidth: 1, borderColor: c.ink }}>{list.map((t) => <ToolCard key={t.id} tool={t} />)}</View>
      )}
    </Screen>
  );
}
