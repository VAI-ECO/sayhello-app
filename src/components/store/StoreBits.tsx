/**
 * Small shared pieces for Waverly's Place, the Ambassador Shop, drawings and stands screens (S3 stage 10).
 * One scroll column, a back link, honest loading / error / empty states with a retry.
 */
import type { ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../ScreenContainer';
import { t } from '../../i18n';
import { Colors } from '../../theme/tokens';

export function StoreScreen(props: { title: string; children: ReactNode; refreshing?: boolean; onRefresh?: () => void; testID?: string; onBack?: () => void }) {
  const router = useRouter();
  return (
    <ScreenContainer style={{ paddingHorizontal: 0 }}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={props.onRefresh ? <RefreshControl refreshing={!!props.refreshing} onRefresh={props.onRefresh} /> : undefined}
        testID={props.testID}
      >
        <TouchableOpacity onPress={props.onBack ?? (() => router.back())} accessibilityRole="button" style={{ gap: 8 }} testID="store-back">
          <Text style={styles.back}>{t('store.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{props.title}</Text>
        {props.children}
      </ScrollView>
    </ScreenContainer>
  );
}

export function Loading() {
  return <ActivityIndicator color={Colors.Ink} testID="store-loading" />;
}

export function ErrorBlock(props: { message?: string; onRetry: () => void }) {
  return (
    <View style={styles.errorBox} testID="store-error">
      <Text accessibilityRole="alert" style={styles.body}>{props.message ?? t('store.loadFailed')}</Text>
      <TouchableOpacity onPress={props.onRetry} accessibilityRole="button" style={styles.outline} testID="store-retry">
        <Text style={styles.outlineText}>{t('store.retry')}</Text>
      </TouchableOpacity>
    </View>
  );
}

export function PrimaryButton(props: { label: string; onPress: () => void; disabled?: boolean; testID?: string }) {
  return (
    <TouchableOpacity onPress={props.onPress} disabled={props.disabled} accessibilityRole="button" accessibilityState={{ disabled: !!props.disabled }}
      style={[styles.solid, props.disabled && { opacity: 0.45 }]} testID={props.testID}>
      <Text style={styles.solidText}>{props.label}</Text>
    </TouchableOpacity>
  );
}

export function OutlineButton(props: { label: string; onPress: () => void; disabled?: boolean; testID?: string }) {
  return (
    <TouchableOpacity onPress={props.onPress} disabled={props.disabled} accessibilityRole="button" accessibilityState={{ disabled: !!props.disabled }}
      style={[styles.outline, props.disabled && { opacity: 0.45 }]} testID={props.testID}>
      <Text style={styles.outlineText}>{props.label}</Text>
    </TouchableOpacity>
  );
}

export const storeStyles = StyleSheet.create({
  body: { fontSize: 15.5, lineHeight: 23, color: Colors.Muted },
  meta: { fontSize: 13.5, lineHeight: 19, color: Colors.Muted },
  strong: { fontSize: 16, fontWeight: '700', color: Colors.Ink },
  card: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 12, padding: 14, gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1.5, borderColor: Colors.Line, borderRadius: 18, paddingVertical: 8, paddingHorizontal: 14 },
  chipOn: { borderColor: Colors.Ink, backgroundColor: Colors.Bone },
  chipText: { fontSize: 14, color: Colors.Ink, fontWeight: '600' },
  label: { fontSize: 12, fontWeight: '800', letterSpacing: 1.1, textTransform: 'uppercase', color: Colors.Muted },
  input: { borderWidth: 1.5, borderColor: Colors.Line, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14, fontSize: 16, color: Colors.Ink },
  error: { fontSize: 14, color: Colors.SignalRed },
});

const styles = StyleSheet.create({
  scroll: { padding: 22, gap: 14 },
  back: { fontSize: 17, fontWeight: '600', color: Colors.Ink },
  title: { fontSize: 26, fontWeight: '900', color: Colors.Ink, lineHeight: 30 },
  body: storeStyles.body,
  errorBox: { borderWidth: 1, borderColor: Colors.SignalRed, borderRadius: 12, padding: 14, gap: 10 },
  solid: { backgroundColor: Colors.Ink, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  solidText: { color: Colors.Chalk, fontSize: 16, fontWeight: '700' },
  outline: { borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  outlineText: { color: Colors.Ink, fontSize: 16, fontWeight: '700' },
});
