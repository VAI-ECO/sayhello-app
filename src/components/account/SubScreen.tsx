/**
 * Shared frame for the account sub-screens (Notifications, Host Mode, Edit profile, Delete account,
 * Legal): header with back, then loading / error+retry / ready content. Stream S1.
 */
import { ReactNode } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../theme';
import { t } from '../../i18n';
import { useColumnStyle } from '../ScreenContainer';
import { KeyboardAware } from '../KeyboardAware';
import { StatusBarSpacer } from '../StatusBarSpacer';

export function SubScreen(props: {
  title: string;
  state?: 'loading' | 'error' | 'ready';
  onRetry?: () => void;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  const router = useRouter();
  const state = props.state ?? 'ready';
  const column = useColumnStyle();
  return (
    <View style={styles.container}>
    <KeyboardAware style={[styles.column, column]}>
      <StatusBarSpacer height={46} testID="subscreen-status-spacer" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/profile'))}
          accessibilityRole="button"
          accessibilityLabel={t('account.back')}
          style={styles.backTarget}
          testID="subscreen-back"
        >
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title} accessibilityRole="header">{props.title}</Text>
      </View>
      {state === 'loading' ? (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.Ink} testID="subscreen-loading" /></View>
      ) : state === 'error' ? (
        <View style={styles.center}>
          <Text style={styles.errorText} accessibilityRole="alert">{t('account.loadFailed')}</Text>
          {props.onRetry ? (
            <TouchableOpacity style={styles.retry} onPress={props.onRetry} accessibilityRole="button" testID="subscreen-retry">
              <Text style={styles.retryText}>{t('account.retry')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} keyboardShouldPersistTaps="handled">{props.children}</ScrollView>
      )}
      {state === 'ready' && props.footer ? <View style={styles.footer}>{props.footer}</View> : null}
    </KeyboardAware>
    </View>
  );
}

export const subStyles = StyleSheet.create({
  intro: { fontSize: 15, lineHeight: 22, color: Colors.Muted, marginBottom: 16 },
  card: { backgroundColor: Colors.Bone, borderRadius: 12, paddingHorizontal: 14, marginBottom: 16 },
  rowLabel: { fontSize: 16, fontWeight: '600', color: Colors.Ink },
  rowHint: { fontSize: 13, color: Colors.Muted, marginTop: 2 },
  error: { fontSize: 14, color: Colors.SignalRed, marginVertical: 8 },
  note: { fontSize: 13, lineHeight: 19, color: Colors.Muted, marginTop: 4 },
  primary: { backgroundColor: Colors.Ink, borderRadius: 27, paddingVertical: 15, alignItems: 'center' },
  primaryText: { color: Colors.Chalk, fontSize: 16, fontWeight: '700' },
  secondary: { borderRadius: 27, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.Faint },
  secondaryText: { color: Colors.Ink, fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.4 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.Chalk },
  column: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, paddingBottom: 14, gap: 12 },
  // 44 x 44 minimum touch target (Apple HIG); the arrow glyph itself stays the drawn size.
  backTarget: { minWidth: 44, minHeight: 44, justifyContent: 'center' },
  back: { fontSize: 17, color: Colors.Ink },
  title: { fontSize: 17, fontWeight: '800', color: Colors.Ink },
  content: { flex: 1 },
  contentInner: { paddingHorizontal: 18, paddingBottom: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 26, gap: 12 },
  errorText: { fontSize: 15, lineHeight: 22, color: Colors.Muted, textAlign: 'center' },
  retry: { backgroundColor: Colors.Ink, borderRadius: 27, paddingHorizontal: 32, paddingVertical: 14 },
  retryText: { color: Colors.Chalk, fontSize: 16, fontWeight: '700' },
  footer: { paddingHorizontal: 18, paddingBottom: 28, paddingTop: 8, gap: 10 },
});
