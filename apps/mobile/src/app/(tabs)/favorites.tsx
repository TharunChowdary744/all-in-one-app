import { getTool } from '@omnikit/core';
import { Text, View } from 'react-native';

import { ToolCard } from '@/components/ToolCard';
import { Screen } from '@/components/ui';
import { useAppState } from '@/state/AppState';
import { useColors } from '@/theme/colors';

export default function Favorites() {
  const c = useColors();
  const { favorites } = useAppState();
  const list = favorites.map(getTool).filter((t) => t !== undefined);
  return (
    <Screen>
      {list.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 60, gap: 8 }}>
          <Text style={{ fontSize: 44 }}>⭐</Text>
          <Text style={{ color: c.text, fontSize: 17, fontWeight: '700' }}>No favorites yet</Text>
          <Text style={{ color: c.text2, textAlign: 'center' }}>Tap the ☆ on any tool to pin it here for quick access.</Text>
        </View>
      ) : (
        list.map((t) => <ToolCard key={t.id} tool={t} />)
      )}
    </Screen>
  );
}
