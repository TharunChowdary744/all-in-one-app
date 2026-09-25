import { parseDate, toDateInput } from '@omnikit/core';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { CalendarDays } from 'lucide-react-native';
import { Platform, Pressable, View } from 'react-native';

import { Label, Text } from '@/components/Text';
import { radius, useColors } from '@/theme/colors';

/** Native date picker: compact inline picker on iOS, system dialog on Android. Value is "YYYY-MM-DD". */
export function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const c = useColors();
  const date = parseDate(value) ?? new Date();
  const pretty = date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  if (Platform.OS === 'ios') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <Label>{label}</Label>
        <DateTimePicker value={date} mode="date" display="compact" accentColor={c.accentStrong} onValueChange={(_, d) => onChange(toDateInput(d))} />
      </View>
    );
  }

  return (
    <View style={{ gap: 6 }}>
      <Label>{label}</Label>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${pretty}. Change date`}
        onPress={() => DateTimePickerAndroid.open({ value: date, mode: 'date', onValueChange: (_, d) => onChange(toDateInput(d)) })}
        style={({ pressed }) => ({
          flexDirection: 'row', alignItems: 'center', gap: 10, height: 48, paddingHorizontal: 12,
          borderWidth: 1, borderRadius: radius.md, borderColor: pressed ? c.ink : c.lineStrong, backgroundColor: c.surface,
        })}
      >
        <CalendarDays size={18} color={c.muted} strokeWidth={1.75} />
        <Text style={{ fontSize: 15 }}>{pretty}</Text>
      </Pressable>
    </View>
  );
}
