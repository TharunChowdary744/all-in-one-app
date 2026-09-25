import { APP_NAME, APP_TAGLINE, categories, isToolAvailable, tools } from '@omnikit/core';
import Constants from 'expo-constants';
import { Alert, Image, Text, View } from 'react-native';

import { Button, Card, Muted, Screen } from '@/components/ui';
import { useAppState } from '@/state/AppState';
import { useColors } from '@/theme/colors';

export default function About() {
  const c = useColors();
  const { clearHistory } = useAppState();
  const mobileCount = tools.filter((t) => isToolAvailable(t, 'mobile')).length;

  return (
    <Screen>
      <View style={{ alignItems: 'center', gap: 8, paddingVertical: 12 }}>
        <Image source={require('@/assets/images/icon.png')} style={{ width: 72, height: 72, borderRadius: 18 }} />
        <Text style={{ color: c.text, fontSize: 24, fontWeight: '800' }}>{APP_NAME}</Text>
        <Text style={{ color: c.text2 }}>{APP_TAGLINE}</Text>
        <Muted>Version {Constants.expoConfig?.version ?? '1.0.0'}</Muted>
      </View>
      <Card title="🔒 Private by design">
        <Text style={{ color: c.text2, lineHeight: 20 }}>
          Every conversion runs on your device. Files are never uploaded to a server — results are shared only when you tap Share.
        </Text>
      </Card>
      <Card title="📦 What's inside">
        <Text style={{ color: c.text2, lineHeight: 20 }}>
          {tools.length} tools across {categories.length} categories. {mobileCount} run natively on mobile; the rest (PDF merge/split, PDF → Word, Word → HTML…) are available in the OmniKit web app.
        </Text>
      </Card>
      <Card title="🧹 Data">
        <Button
          kind="outline"
          label="Clear recent tools & stats"
          onPress={() =>
            Alert.alert('Clear history?', 'Recent tools and usage stats will be reset. Favorites are kept.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Clear', style: 'destructive', onPress: clearHistory },
            ])
          }
        />
      </Card>
    </Screen>
  );
}
