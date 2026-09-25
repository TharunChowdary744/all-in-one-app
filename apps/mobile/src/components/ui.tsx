import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { mono, radius, spacing, useColors } from '@/theme/colors';

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  const c = useColors();
  const body = scroll ? (
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.screen, { flex: 1 }]}>{children}</View>
  );
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      {body}
    </KeyboardAvoidingView>
  );
}

export function Card({ title, right, children, style }: { title?: string; right?: ReactNode; children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }, style]}>
      {(title || right) && (
        <View style={styles.cardHeader}>
          {title ? <Text style={[styles.cardTitle, { color: c.text }]}>{title}</Text> : <View />}
          {right}
        </View>
      )}
      {children}
    </View>
  );
}

type ButtonKind = 'primary' | 'outline' | 'ghost';

export function Button({
  label,
  onPress,
  kind = 'primary',
  disabled,
  loading,
  small,
  style,
}: {
  label: string;
  onPress: () => void;
  kind?: ButtonKind;
  disabled?: boolean;
  loading?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useColors();
  const bg = kind === 'primary' ? c.primary : kind === 'outline' ? c.surface : 'transparent';
  const fg = kind === 'primary' ? c.onPrimary : kind === 'outline' ? c.text : c.text2;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        { backgroundColor: bg, borderColor: kind === 'outline' ? c.border : 'transparent', opacity: disabled ? 0.5 : pressed ? 0.8 : 1 },
        style,
      ]}
    >
      {loading && <ActivityIndicator color={fg} size="small" />}
      <Text style={[styles.buttonText, small && { fontSize: 13 }, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Segmented<T extends string | number>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  const c = useColors();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.segmented, { backgroundColor: c.surface2 }]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            style={[styles.segment, active && { backgroundColor: c.surface, shadowOpacity: 0.08 }]}
          >
            <Text style={{ color: active ? c.text : c.text2, fontWeight: active ? '700' : '500', fontSize: 13 }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, { backgroundColor: active ? c.primary : c.surface, borderColor: active ? c.primary : c.border }]}
    >
      <Text style={{ color: active ? c.onPrimary : c.text2, fontSize: 13, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

export function Input({ label, multiline, code, style, ...props }: TextInputProps & { label?: string; code?: boolean }) {
  const c = useColors();
  return (
    <View style={{ gap: 6 }}>
      {label && <Text style={[styles.label, { color: c.text2 }]}>{label}</Text>}
      <TextInput
        placeholderTextColor={c.muted}
        multiline={multiline}
        autoCorrect={!code}
        autoCapitalize={code ? 'none' : props.autoCapitalize}
        style={[
          styles.input,
          { color: c.text, backgroundColor: c.surface, borderColor: c.border },
          multiline && { minHeight: 120, textAlignVertical: 'top' },
          code && mono,
          style,
        ]}
        {...props}
      />
    </View>
  );
}

export function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  const c = useColors();
  return (
    <View style={styles.toggle}>
      <Text style={{ color: c.text, flex: 1 }}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: c.primary, false: c.border }} />
    </View>
  );
}

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      small
      kind="ghost"
      label={copied ? '✓ Copied' : label}
      disabled={!text}
      onPress={async () => {
        await Clipboard.setStringAsync(text);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      }}
    />
  );
}

export function ResultRow({ label, value, selectable = true }: { label: string; value: string; selectable?: boolean }) {
  const c = useColors();
  return (
    <View style={[styles.resultRow, { backgroundColor: c.surface2, borderColor: c.border }]}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[styles.label, { color: c.text2 }]}>{label}</Text>
        <Text selectable={selectable} style={[mono, { color: c.text, fontSize: 14 }]}>
          {value || '—'}
        </Text>
      </View>
      <CopyButton text={value} />
    </View>
  );
}

export function Output({ value, placeholder = 'Output appears here' }: { value: string; placeholder?: string }) {
  const c = useColors();
  return (
    <View style={[styles.output, { backgroundColor: c.surface2, borderColor: c.border }]}>
      <Text selectable style={[mono, { color: value ? c.text : c.muted, fontSize: 13 }]}>
        {value || placeholder}
      </Text>
    </View>
  );
}

export function Stat({ label, value }: { label: string; value: string | number }) {
  const c = useColors();
  return (
    <View style={[styles.stat, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Text style={{ color: c.text, fontSize: 22, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: c.muted, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

export function Notice({ kind = 'error', children }: { kind?: 'error' | 'info' | 'success'; children?: ReactNode }) {
  const c = useColors();
  if (!children) return null;
  const color = kind === 'error' ? c.bad : kind === 'success' ? c.good : c.text2;
  return (
    <View style={[styles.notice, { backgroundColor: kind === 'info' ? c.primarySoft : c.surface2, borderColor: color }]}>
      <Text style={{ color }}>{children}</Text>
    </View>
  );
}

export function Row({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

export function Muted({ children }: { children: ReactNode }) {
  const c = useColors();
  return <Text style={{ color: c.muted, fontSize: 13 }}>{children}</Text>;
}

const styles = StyleSheet.create({
  screen: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 48 },
  card: { borderWidth: 1, borderRadius: radius.md, padding: spacing.lg, gap: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  button: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, paddingVertical: 12, paddingHorizontal: 18, borderWidth: 1 },
  buttonSmall: { paddingVertical: 6, paddingHorizontal: 10 },
  buttonText: { fontWeight: '700', fontSize: 15 },
  segmented: { flexDirection: 'row', borderRadius: 11, padding: 3, gap: 2 },
  segment: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowRadius: 3, shadowOpacity: 0 },
  chip: { borderWidth: 1, borderRadius: 99, paddingHorizontal: 14, paddingVertical: 7 },
  label: { fontSize: 12, fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderRadius: radius.sm, padding: spacing.md },
  output: { borderWidth: 1, borderRadius: radius.sm, padding: spacing.md, minHeight: 80 },
  stat: { flexGrow: 1, flexBasis: '22%', minWidth: 76, borderWidth: 1, borderRadius: radius.md, padding: spacing.md },
  notice: { borderLeftWidth: 4, borderRadius: radius.sm, padding: spacing.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, alignItems: 'center' },
});
