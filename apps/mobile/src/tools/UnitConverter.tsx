import { convertUnit, formatNumber, unitGroups } from '@omnikit/core';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Card, Chip, Input, ResultRow, Screen } from '@/components/ui';
import { fonts, radius, useColors } from '@/theme/colors';
import { Text } from '@/components/Text';

export default function UnitConverter() {
  const c = useColors();
  const [groupId, setGroupId] = useState(unitGroups[0]!.id);
  const group = unitGroups.find((g) => g.id === groupId)!;
  const [from, setFrom] = useState(group.units[2]!.id);
  const [value, setValue] = useState('1');
  const num = Number(value.replace(',', '.'));
  const valid = value.trim() !== '' && Number.isFinite(num);
  const fromUnit = group.units.find((u) => u.id === from) ?? group.units[0]!;

  return (
    <Screen>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {unitGroups.map((g) => (
          <Chip key={g.id} label={g.name} active={g.id === groupId} onPress={() => { setGroupId(g.id); setFrom(g.units[0]!.id); }} />
        ))}
      </ScrollView>
      <Input label={`Value in ${fromUnit.name}`} value={value} onChangeText={setValue} keyboardType="numbers-and-punctuation" style={{ fontSize: 26, fontFamily: fonts.displaySemi }} />
      <Card title="From unit">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {group.units.map((u) => (
            <Pressable key={u.id} onPress={() => setFrom(u.id)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.sm, backgroundColor: u.id === fromUnit.id ? c.accent : c.surface2 }}>
              <Text style={{ color: u.id === fromUnit.id ? c.accentInk : c.ink, fontWeight: '600' }}>{u.symbol}</Text>
            </Pressable>
          ))}
        </View>
      </Card>
      {valid &&
        group.units
          .filter((u) => u.id !== fromUnit.id)
          .map((u) => <ResultRow key={u.id} label={u.name} value={`${formatNumber(convertUnit(num, groupId, fromUnit.id, u.id))} ${u.symbol}`} />)}
    </Screen>
  );
}
