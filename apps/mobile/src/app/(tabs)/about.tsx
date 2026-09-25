import { APP_NAME, categories, isToolAvailable, tools } from '@omnikit/core';
import Constants from 'expo-constants';
import { Alert, View } from 'react-native';

import { LogoMark } from '@/components/Logo';
import { Button, Card, Heading, Label, Screen, Text } from '@/components/ui';
import { useAppState } from '@/state/AppState';
import { useColors } from '@/theme/colors';

export default function About() {
  const c = useColors();
  const { clearHistory } = useAppState();
  const mobileCount = tools.filter((t) => isToolAvailable(t, 'mobile')).length;

  return (
    <Screen>
      <View style={{ gap: 12, paddingVertical: 8 }}>
        <LogoMark size={44} />
        <Heading size={34}>{APP_NAME}</Heading>
        <Label>Version {Constants.expoConfig?.version ?? '1.0.0'}</Label>
      </View>
      <Card title="Private by design">
        <Text style={{ color: c.ink2, lineHeight: 21 }}>
          Every conversion runs on your device. Nothing is uploaded; results leave the app only when you share them.
        </Text>
      </Card>
      <Card title="What's inside">
        <Text style={{ color: c.ink2, lineHeight: 21 }}>
          {tools.length} tools in {categories.length} sections. {mobileCount} run natively here; the others (PDF merge and split, PDF → Word, Word → HTML…) are in the OmniKit web app and are marked “Web”.
        </Text>
      </Card>
      <Card title="Data">
        <Button
          kind="outline"
          label="Clear recent tools and stats"
          onPress={() =>
            Alert.alert('Clear history?', 'Recent tools and usage stats will be reset. Starred tools are kept.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Clear', style: 'destructive', onPress: clearHistory },
            ])
          }
        />
      </Card>
    </Screen>
  );
}
