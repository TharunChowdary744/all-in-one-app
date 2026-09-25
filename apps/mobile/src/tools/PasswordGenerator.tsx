import { defaultPasswordOptions, generatePassword, passwordStrength, type PasswordOptions } from '@omnikit/core';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';

import { Button, Card, CopyButton, Notice, Row, Screen, Segmented, Toggle } from '@/components/ui';
import { errorMessage } from '@/lib/files';
import { mono, radius, useColors } from '@/theme/colors';
import { Text } from '@/components/Text';

const COLORS = ['#b3261e', '#b8431a', '#8a5f0e', '#3f7650', '#2f6f3e'];

export default function PasswordGenerator() {
  const c = useColors();
  const [opts, setOpts] = useState<PasswordOptions>(defaultPasswordOptions);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const regenerate = useCallback(() => {
    try {
      setPassword(generatePassword(opts));
      setError('');
    } catch (e) {
      setError(errorMessage(e));
    }
  }, [opts]);
  useEffect(regenerate, [regenerate]);

  const s = passwordStrength(password);
  const set = (k: keyof PasswordOptions) => (v: boolean) => setOpts((o) => ({ ...o, [k]: v }));

  return (
    <Screen>
      <Card>
        <Text selectable style={[mono, { color: c.ink, fontSize: 22, fontWeight: '700' }]}>{password || '—'}</Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={{ flex: 1, height: 6, borderRadius: radius.sm, backgroundColor: i <= s.score ? COLORS[s.score] : c.line }} />
          ))}
        </View>
        <Text style={{ color: c.ink2 }}>
          Strength: <Text style={{ color: COLORS[s.score], fontWeight: '700' }}>{s.label}</Text> · ~{s.bits} bits
        </Text>
        <Row>
          <Button label="Generate" onPress={regenerate} style={{ flex: 1 }} />
          <CopyButton text={password} />
        </Row>
      </Card>
      <Notice>{error}</Notice>
      <Card title={`Length: ${opts.length}`}>
        <Segmented value={opts.length} onChange={(length) => setOpts((o) => ({ ...o, length }))} options={[8, 12, 16, 20, 24, 32, 48, 64].map((n) => ({ value: n, label: String(n) }))} />
        <Toggle label="Uppercase (A-Z)" value={opts.uppercase} onChange={set('uppercase')} />
        <Toggle label="Lowercase (a-z)" value={opts.lowercase} onChange={set('lowercase')} />
        <Toggle label="Numbers (0-9)" value={opts.numbers} onChange={set('numbers')} />
        <Toggle label="Symbols (!@#…)" value={opts.symbols} onChange={set('symbols')} />
        <Toggle label="Avoid look-alikes (l, 1, O, 0)" value={opts.excludeAmbiguous} onChange={set('excludeAmbiguous')} />
      </Card>
    </Screen>
  );
}
