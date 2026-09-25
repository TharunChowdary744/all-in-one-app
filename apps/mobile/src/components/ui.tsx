import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Check, Copy } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { Label, Text } from '@/components/Text';
import { fonts, radius, spacing, useColors } from '@/theme/colors';

export { Heading, Label, Text } from '@/components/Text';

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

/** Panel with a hairline border and a monospace header rule. */
export function Card({ title, right, children, style }: { title?: string; right?: ReactNode; children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.line }, style]}>
      {(title || right) && (
        <View style={[styles.cardHeader, { borderColor: c.line }]}>
          {title ? <Label style={{ color: c.ink, flex: 1 }}>{title}</Label> : <View />}
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
  icon,
  style,
}: {
  label: string;
  onPress: () => void;
  kind?: ButtonKind;
  disabled?: boolean;
  loading?: boolean;
  small?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useColors();
  const bg = kind === 'primary' ? c.ink : kind === 'outline' ? c.surface : 'transparent';
  const fg = kind === 'primary' ? c.background : kind === 'outline' ? c.ink : c.ink2;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        {
          backgroundColor: pressed && kind === 'primary' ? c.accent : bg,
          borderColor: kind === 'outline' ? (pressed ? c.ink : c.line) : 'transparent',
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} size="small" /> : icon}
      <Text style={{ fontFamily: fonts.sansMedium, fontSize: small ? 13 : 15, color: fg }}>{label}</Text>
    </Pressable>
  );
}

export function Segmented<T extends string | number>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  const c = useColors();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.segmented, { borderColor: c.line, backgroundColor: c.background }]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            style={[styles.segment, active && { backgroundColor: c.ink }]}
          >
            <Text style={{ color: active ? c.background : c.ink2, fontSize: 13, fontFamily: active ? fonts.sansMedium : fonts.sans }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable onPress={onPress} style={[styles.chip, { backgroundColor: active ? c.ink : 'transparent', borderColor: active ? c.ink : c.line }]}>
      <Text style={{ color: active ? c.background : c.ink2, fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

export function Input({ label, multiline, code, style, ...props }: TextInputProps & { label?: string; code?: boolean }) {
  const c = useColors();
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      {label && <Label style={{ color: c.ink2 }}>{label}</Label>}
      <TextInput
        placeholderTextColor={c.muted}
        multiline={multiline}
        autoCorrect={!code}
        autoCapitalize={code ? 'none' : props.autoCapitalize}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          { color: c.ink, backgroundColor: c.surface, borderColor: focused ? c.ink : c.line, fontFamily: code ? fonts.mono : fonts.sans },
          multiline && { minHeight: 120, textAlignVertical: 'top' },
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
      <Text style={{ flex: 1, fontSize: 15 }}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: c.ink, false: c.line }} thumbColor={value ? c.accent : c.surface} />
    </View>
  );
}

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const c = useColors();
  const [copied, setCopied] = useState(false);
  return (
    <Button
      small
      kind="ghost"
      label={copied ? 'Copied' : label}
      icon={copied ? <Check size={14} color={c.good} /> : <Copy size={14} color={c.ink2} strokeWidth={1.6} />}
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

/** Label / value row separated by hairlines. */
export function ResultRow({ label, value }: { label: string; value: string }) {
  const c = useColors();
  return (
    <View style={[styles.resultRow, { borderColor: c.line }]}>
      <View style={{ flex: 1, gap: 3 }}>
        <Label style={{ color: c.ink2 }}>{label}</Label>
        <Text selectable style={{ fontFamily: fonts.mono, fontSize: 14 }}>
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
    <View style={[styles.output, { backgroundColor: c.background, borderColor: c.line }]}>
      <Text selectable style={{ fontFamily: fonts.mono, color: value ? c.ink : c.muted, fontSize: 13, lineHeight: 20 }}>
        {value || placeholder}
      </Text>
    </View>
  );
}

/** Ledger cell: big display numeral over a mono label. */
export function Stat({ label, value }: { label: string; value: string | number }) {
  const c = useColors();
  return (
    <View style={[styles.stat, { borderColor: c.line }]}>
      <Text style={{ fontFamily: fonts.displaySemi, fontSize: 28, letterSpacing: -0.8, lineHeight: 30 }}>{value}</Text>
      <Label>{label}</Label>
    </View>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  const c = useColors();
  return <View style={[styles.statGrid, { borderColor: c.ink }]}>{children}</View>;
}

export function Notice({ kind = 'error', children }: { kind?: 'error' | 'info' | 'success'; children?: ReactNode }) {
  const c = useColors();
  if (!children) return null;
  const color = kind === 'error' ? c.bad : kind === 'success' ? c.good : c.ink2;
  return (
    <View style={[styles.notice, { borderColor: kind === 'info' ? c.muted : color, backgroundColor: c.surface }]}>
      <Text style={{ color, fontSize: 14 }}>{children}</Text>
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
  screen: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 56 },
  card: { borderWidth: StyleSheet.hairlineWidth * 2, borderRadius: radius.md, padding: spacing.lg, gap: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm, paddingBottom: spacing.sm, borderBottomWidth: 1, minHeight: 30 },
  button: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, height: 46, paddingHorizontal: 18, borderWidth: 1 },
  buttonSmall: { height: 32, paddingHorizontal: 10, gap: 6 },
  segmented: { flexDirection: 'row', borderRadius: radius.sm, borderWidth: 1, padding: 2, gap: 2 },
  segment: { paddingVertical: 7, paddingHorizontal: 13, borderRadius: 3 },
  chip: { borderWidth: 1, borderRadius: 99, paddingHorizontal: 13, paddingVertical: 6 },
  input: { borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 36 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 10, borderBottomWidth: 1 },
  output: { borderWidth: 1, borderRadius: radius.sm, padding: spacing.md, minHeight: 80 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1 },
  stat: { width: '50%', paddingVertical: 12, paddingRight: 12, gap: 4, borderBottomWidth: 1 },
  notice: { borderLeftWidth: 3, borderRadius: radius.sm, padding: spacing.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, alignItems: 'center' },
});
