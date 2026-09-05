import React from 'react';
import { ScrollView, View, Text, Pressable, TextInput, StyleSheet, useWindowDimensions, type ViewStyle, type TextInputProps, type StyleProp } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors as c } from '@/theme/tokens';

export type IconName = React.ComponentProps<typeof Feather>['name'];
export const Icon = ({ name, size = 20, color = c.ink }: { name: IconName; size?: number; color?: string }) => <Feather name={name} size={size} color={color} />;

export function Screen({ children, title, subtitle, back = false }: { children: React.ReactNode; title?: string; subtitle?: string; back?: boolean }) {
  const router = useRouter();
  return <ScrollView style={{ flex: 1, backgroundColor: c.background }} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
    <View style={s.screen}>
      {back && <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={s.back}><Icon name="arrow-left" /><Text style={s.backText}>Back</Text></Pressable>}
      {title && <View style={{ gap: 7 }}><Text accessibilityRole="header" style={s.title}>{title}</Text>{subtitle && <Text style={s.subtitle}>{subtitle}</Text>}</View>}
      {children}
      <Text style={s.footer}>MADE FOR THE LOVE OF THE GAME</Text>
    </View>
  </ScrollView>;
}

export function Row({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.row, style]}>{children}</View>;
}
export function Grid({ children }: { children: React.ReactNode }) {
  const wide = useWindowDimensions().width >= 800;
  return <View style={{ flexDirection: wide ? 'row' : 'column', gap: 16 }}>{React.Children.map(children, child => child && <View style={{ flex: 1, minWidth: 0 }}>{child}</View>)}</View>;
}
export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}
export function Heading({ title, action, onPress, kicker }: { title: string; action?: string; onPress?: () => void; kicker?: string }) {
  return <View style={{ gap: 5 }}>{kicker && <Label>{kicker}</Label>}<Row style={{ justifyContent: 'space-between' }}><Text accessibilityRole="header" style={[s.heading, { flex: 1 }]}>{title}</Text>{action && <Pressable accessibilityRole="button" onPress={onPress} style={s.link}><Text style={s.linkText}>{action}</Text><Icon name="arrow-up-right" size={15} /></Pressable>}</Row></View>;
}
export function Label({ children, color = c.muted }: { children: React.ReactNode; color?: string }) {
  return <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 1.7, color }}>{children}</Text>;
}
export function Body({ children, muted = false, style }: { children: React.ReactNode; muted?: boolean; style?: React.ComponentProps<typeof Text>['style'] }) {
  return <Text style={[{ fontSize: 14, lineHeight: 22, color: muted ? c.muted : c.ink }, style]}>{children}</Text>;
}
export function Button({ title, onPress, variant = 'primary', icon, disabled = false, compact = false }: { title: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; icon?: IconName; disabled?: boolean; compact?: boolean }) {
  const backgroundColor = variant === 'primary' ? c.green : variant === 'secondary' ? c.lime : variant === 'danger' ? '#F8E9E5' : c.soft;
  const color = variant === 'primary' ? '#FFFFFF' : variant === 'danger' ? c.danger : c.ink;
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [s.button, { backgroundColor, paddingHorizontal: compact ? 14 : 20, opacity: disabled ? 0.45 : pressed ? 0.75 : 1, alignSelf: compact ? 'flex-start' : 'stretch' }]}>{icon && <Icon name={icon} size={17} color={color} />}<Text style={{ fontSize: 13, fontWeight: '700', color, flexShrink: 1 }}>{title}</Text></Pressable>;
}
export function Chip({ title, selected, onPress, icon }: { title: string; selected?: boolean; onPress?: () => void; icon?: IconName }) {
  return <Pressable accessibilityRole={onPress ? 'button' : 'text'} accessibilityState={onPress ? { selected: !!selected } : undefined} onPress={onPress} style={[s.chip, selected && { backgroundColor: c.green, borderColor: c.green }]}>{icon && <Icon name={icon} size={13} color={selected ? '#FFF' : c.muted} />}<Text style={{ fontSize: 12, fontWeight: '600', color: selected ? '#FFF' : c.ink }}>{title}</Text></Pressable>;
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return <View style={{ gap: 7 }}><Label>{label.toUpperCase()}</Label><TextInput accessibilityLabel={label} placeholderTextColor={c.muted} {...props} style={[s.input, props.multiline && { minHeight: 90, textAlignVertical: 'top' }, props.style]} /></View>;
}
export function Avatar({ name, size = 44, color = c.soft }: { name: string; size?: number; color?: string }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: c.background }}><Text style={{ color: c.ink, fontSize: size * 0.3, fontWeight: '700' }}>{name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}</Text></View>;
}
export function Empty({ title, text, icon = 'sun', action, onPress }: { title: string; text: string; icon?: IconName; action?: string; onPress?: () => void }) {
  return <Card style={{ alignItems: 'center', paddingVertical: 35 }}><View style={s.emptyIcon}><Icon name={icon} size={26} /></View><Text style={s.heading}>{title}</Text><Body muted style={{ textAlign: 'center', maxWidth: 400 }}>{text}</Body>{action && onPress && <Button title={action} onPress={onPress} compact />}</Card>;
}
export function DemoNote({ children }: { children?: React.ReactNode }) {
  return <Row style={{ alignItems: 'flex-start', backgroundColor: c.soft, padding: 13, borderRadius: 12 }}><Icon name="info" size={16} color={c.muted} /><Text style={{ color: c.muted, fontSize: 12, lineHeight: 18, flex: 1 }}>{children ?? 'Interactive prototype. Fictional people and clubs. No real money, messages or reservations. Data resets when you reload.'}</Text></Row>;
}

export const s = StyleSheet.create({
  screen: { width: '100%', maxWidth: 1040, alignSelf: 'center', padding: 22, paddingTop: 25, gap: 24, paddingBottom: 40 },
  title: { fontSize: 32, letterSpacing: -1.2, fontWeight: '700', color: c.ink },
  subtitle: { fontSize: 14, color: c.muted, lineHeight: 22 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  card: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, padding: 20, borderRadius: 20, gap: 15 },
  heading: { color: c.ink, fontSize: 21, fontWeight: '600', letterSpacing: -0.5 },
  link: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 4 },
  linkText: { fontWeight: '600', fontSize: 12, color: c.green },
  button: { minHeight: 48, borderRadius: 13, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 9, paddingVertical: 13 },
  chip: { minHeight: 44, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: c.line, backgroundColor: c.surface },
  input: { minHeight: 49, borderWidth: 1, borderColor: c.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: c.surface, color: c.ink, fontSize: 15 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, alignSelf: 'flex-start' },
  backText: { fontSize: 13, fontWeight: '600', color: c.ink },
  emptyIcon: { backgroundColor: c.lime, borderRadius: 22, width: 55, height: 55, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  footer: { color: '#899286', letterSpacing: 2.5, fontSize: 9, textAlign: 'center', marginTop: 15 },
});
