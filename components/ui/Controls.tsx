import React, { memo } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme as t } from '@/constants/theme';
import { isRtl, label } from '@/services/knowledge';
interface ButtonProps { title: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'danger'; icon?: React.ComponentProps<typeof Ionicons>['name']; disabled?: boolean; compact?: boolean }
export const Button = memo(function Button({ title, onPress, variant = 'primary', icon, disabled, compact }: ButtonProps) {
  const color = variant === 'primary' ? t.colors.background : variant === 'danger' ? t.colors.danger : t.colors.text;
  return <Pressable accessibilityRole="button" accessibilityLabel={title} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, compact ? styles.compact : null, variant === 'primary' ? styles.primary : variant === 'danger' ? styles.danger : styles.secondary, { opacity: disabled ? 0.45 : pressed ? 0.75 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}>{icon ? <Ionicons name={icon} size={18} color={color} /> : null}<Text style={[styles.buttonText, { color }]}>{title}</Text></Pressable>;
});
interface InputProps { title: string; value: string; onChangeText: (v: string) => void; placeholder?: string; multiline?: boolean; numeric?: boolean }
export function Input({ title, value, onChangeText, placeholder, multiline, numeric }: InputProps) {
  return <View style={styles.inputGroup}><Text style={styles.label}>{title}</Text><TextInput accessibilityLabel={title} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={t.colors.subtle} multiline={multiline} keyboardType={numeric ? 'numeric' : 'default'} style={[styles.input, multiline ? styles.multiline : null, { textAlign: isRtl(value) ? 'right' : 'left', writingDirection: isRtl(value) ? 'rtl' : 'ltr' }]} selectionColor={t.colors.primary} /></View>;
}
interface ChoiceProps { title?: string; value: string; options: { value: string; title: string }[]; onChange: (v: string) => void }
export function Choices({ title, value, options, onChange }: ChoiceProps) {
  return <View style={styles.choiceGroup}>{title ? <Text style={styles.label}>{title}</Text> : null}<View style={styles.chipRail}><FlatList horizontal data={options} keyExtractor={x => x.value} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityState={{ selected: value === item.value }} onPress={() => onChange(item.value)} style={({ pressed }) => [styles.chip, value === item.value ? styles.chipActive : null, { opacity: pressed ? 0.7 : 1 }]}><Text style={[styles.chipText, value === item.value ? styles.chipTextActive : null]}>{item.title}</Text></Pressable>} /></View></View>;
}
export function options(values: readonly string[]) { return values.map(value => ({ value, title: label(value) })); }
interface NoticeProps { message: string; kind?: 'error' | 'success' | 'info' }
export function Notice({ message, kind = 'info' }: NoticeProps) {
  if (!message) return null;
  const color = kind === 'error' ? t.colors.danger : kind === 'success' ? t.colors.primary : t.colors.muted;
  return <View accessibilityRole="alert" style={[styles.notice, { borderColor: color }]}><Ionicons name={kind === 'error' ? 'alert-circle-outline' : kind === 'success' ? 'checkmark-circle-outline' : 'information-circle-outline'} size={20} color={color} /><Text style={[styles.noticeText, { color }]}>{message}</Text></View>;
}
interface EmptyProps { title: string; message: string; icon?: React.ComponentProps<typeof Ionicons>['name']; action?: React.ReactNode }
export const EmptyState = memo(function EmptyState({ title, message, icon = 'planet-outline', action }: EmptyProps) {
  return <View style={styles.empty}><View style={styles.emptyIcon}><Ionicons name={icon} size={32} color={t.colors.primary} /></View><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyMessage}>{message}</Text>{action ?? null}</View>;
});
interface ConfirmProps { visible: boolean; title: string; message: string; onCancel: () => void; onConfirm: () => void; pending?: boolean }
export function Confirm({ visible, title, message, onCancel, onConfirm, pending }: ConfirmProps) {
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}><View style={styles.overlay}><View style={styles.dialog}><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyMessage}>{message}</Text><Button title={pending ? 'Working…' : 'Confirm'} variant="danger" disabled={pending} onPress={onConfirm} /><Button title="Cancel" variant="secondary" disabled={pending} onPress={onCancel} /></View></View></Modal>;
}
export function Loading() { return <View style={styles.empty}><ActivityIndicator color={t.colors.primary} /><Text style={styles.emptyMessage}>Opening your local universe…</Text></View>; }
const styles = StyleSheet.create({
  button: { minHeight: 48, borderRadius: t.radius.sm, paddingHorizontal: t.space.md, paddingVertical: t.space.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.space.sm, borderWidth: 1 }, compact: { alignSelf: 'flex-start' }, primary: { backgroundColor: t.colors.primary, borderColor: t.colors.primary }, secondary: { backgroundColor: t.colors.elevated, borderColor: t.colors.border }, danger: { backgroundColor: t.colors.dangerTint, borderColor: t.colors.danger }, buttonText: { fontSize: t.font.label, fontWeight: '600', includeFontPadding: false },
  inputGroup: { gap: t.space.sm }, label: { fontSize: t.font.label, fontWeight: '500', color: t.colors.muted }, input: { color: t.colors.text, fontSize: t.font.body, backgroundColor: t.colors.background, borderWidth: 1, borderColor: t.colors.border, borderRadius: t.radius.sm, padding: t.space.md, minHeight: 52 }, multiline: { minHeight: 144, textAlignVertical: 'top', lineHeight: 26 },
  choiceGroup: { gap: t.space.sm }, chipRail: { minHeight: 48 }, chips: { alignItems: 'center', gap: t.space.sm }, chip: { minHeight: 44, paddingHorizontal: t.space.md, borderRadius: t.radius.pill, justifyContent: 'center', borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.surface }, chipActive: { backgroundColor: t.colors.primaryTint, borderColor: t.colors.primary }, chipText: { fontSize: t.font.label, color: t.colors.muted, textTransform: 'capitalize' }, chipTextActive: { color: t.colors.primary },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: t.space.sm, backgroundColor: t.colors.surface, padding: t.space.md, borderRadius: t.radius.sm, borderWidth: 1, marginVertical: t.space.sm }, noticeText: { flex: 1, fontSize: t.font.label, lineHeight: 22 },
  empty: { alignItems: 'center', paddingVertical: t.space.xxl, paddingHorizontal: t.space.lg, gap: t.space.md, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border, borderRadius: t.radius.md, marginVertical: t.space.md }, emptyIcon: { width: 72, height: 72, borderRadius: t.radius.pill, backgroundColor: t.colors.primaryTint, justifyContent: 'center', alignItems: 'center' }, emptyTitle: { color: t.colors.text, fontSize: t.font.section, fontWeight: '600' }, emptyMessage: { color: t.colors.muted, fontSize: t.font.body, lineHeight: 26, textAlign: 'center', maxWidth: 440 }, overlay: { flex: 1, backgroundColor: t.colors.overlay, justifyContent: 'center', alignItems: 'center', padding: t.space.lg }, dialog: { width: '100%', maxWidth: 420, backgroundColor: t.colors.surface, borderColor: t.colors.border, borderWidth: 1, borderRadius: t.radius.md, padding: t.space.lg, gap: t.space.md },
});
