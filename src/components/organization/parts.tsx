/** Small shared pieces for the organization screens (ROLE-5). */
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import type { ReactNode } from 'react';
import { ScreenContainer, Button } from '../index';
import { t } from '../../i18n';
import { Colors, FixedColors } from '../../theme/tokens';

export function OrgScreen({ title, step, onBack, children, footer }: {
  title?: string; step?: string; onBack?: () => void; children: ReactNode; footer?: ReactNode;
}) {
  return (
    <ScreenContainer style={{ padding: 0 }}>
      <View style={s.header}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} accessibilityRole="button" accessibilityLabel={t('organizations.common.back')} testID="org-back">
            <Text style={s.back}>{t('organizations.common.back')}</Text>
          </TouchableOpacity>
        ) : <View />}
        {step ? <Text style={s.step}>{step}</Text> : null}
      </View>
      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        {title ? <Text style={s.title}>{title}</Text> : null}
        {children}
      </ScrollView>
      {footer ? <View style={s.footer}>{footer}</View> : null}
    </ScreenContainer>
  );
}

export function Loading() {
  return <ScreenContainer><View style={s.center}><ActivityIndicator color={FixedColors.hootza} testID="org-loading" /></View></ScreenContainer>;
}

export function ErrorState({ message, onRetry, onBack }: { message: string; onRetry: () => void; onBack?: () => void }) {
  return (
    <ScreenContainer>
      <View style={s.center} testID="org-error">
        <Text style={s.body2}>{message}</Text>
        <Button title={t('error.retry')} onPress={onRetry} />
        {onBack ? <Button title={t('organizations.common.back')} variant="secondary" onPress={onBack} /> : null}
      </View>
    </ScreenContainer>
  );
}

export function Choice({ label, hint, selected, onPress, testID }: { label: string; hint?: string; selected: boolean; onPress: () => void; testID?: string }) {
  return (
    <TouchableOpacity onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected }} style={[s.choice, selected && s.choiceOn]} testID={testID}>
      <Text style={s.choiceLabel}>{label}</Text>
      {hint ? <Text style={s.hint}>{hint}</Text> : null}
    </TouchableOpacity>
  );
}

export function Note({ title, body }: { title: string; body: string }) {
  return (
    <View style={s.note}>
      <Text style={s.noteTitle}>{title}</Text>
      <Text style={s.hint}>{body}</Text>
    </View>
  );
}

export function Row({ label, value, onPress, testID }: { label: string; value?: string; onPress?: () => void; testID?: string }) {
  const inner = (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      {value ? <Text style={s.rowValue}>{value}</Text> : onPress ? <Text style={s.rowValue}>›</Text> : null}
    </View>
  );
  return onPress ? <TouchableOpacity onPress={onPress} accessibilityRole="button" testID={testID}>{inner}</TouchableOpacity> : inner;
}

export const orgStyles = {
  fieldLabel: { fontSize: 13, color: Colors.Muted, marginTop: 8, marginBottom: 4 } as const,
  error: { color: FixedColors.error, fontSize: 14 } as const,
  hint: { fontSize: 14, lineHeight: 20, color: Colors.Muted } as const,
};

const s = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 12 },
  back: { fontSize: 17, color: Colors.Ink },
  step: { fontSize: 13, color: Colors.Faint },
  body: { paddingHorizontal: 22, paddingBottom: 24, gap: 12 },
  title: { fontSize: 26, fontWeight: '700', color: Colors.Ink },
  footer: { padding: 22, gap: 10, borderTopWidth: 1, borderColor: Colors.Hairline },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
  body2: { fontSize: 15, color: Colors.Muted, textAlign: 'center' },
  choice: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 14, padding: 14, gap: 4 },
  choiceOn: { borderColor: FixedColors.hootza, backgroundColor: Colors.Bone },
  choiceLabel: { fontSize: 16, fontWeight: '600', color: Colors.Ink },
  hint: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
  note: { borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.Line, borderRadius: 14, padding: 14, gap: 4 },
  noteTitle: { fontSize: 15, fontWeight: '700', color: Colors.Ink },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderColor: Colors.Hairline },
  rowLabel: { fontSize: 16, color: Colors.Ink, flexShrink: 1 },
  rowValue: { fontSize: 16, color: Colors.Muted },
});
