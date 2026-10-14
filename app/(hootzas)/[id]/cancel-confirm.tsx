/**
 * CANCEL — CONFIRM
 * POST /api/hootzas/:id/cancel
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer, Button, TextInput } from '../../../src/components';
import { t } from '../../../src/i18n';
import { Colors, FixedColors } from '../../../src/theme/tokens';
import { cancelHootza, getHootza, type Hootza } from '../../../src/api/hootzas';
import { hootzaErrorMessage, isHootzaNotLiveError } from '../../../src/lib/hootza-errors';

export default function CancelConfirmScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [hootza, setHootza] = useState<Hootza | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const busy = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const res = await getHootza(id);
    if (!mounted.current) return;
    setLoading(false);
    if (res.error || !res.data?.hootza) {
      setError(hootzaErrorMessage(res.error, t('error.notFound')));
      return;
    }
    setHootza(res.data.hootza);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function confirmCancel() {
    if (!id || busy.current || hootza?.status !== 'live') return;
    busy.current = true;
    setSubmitting(true);
    setError(null);
    const res = await cancelHootza(id, reason.trim() || undefined);
    if (!mounted.current) return;
    if (res.error || !res.data) {
      busy.current = false;
      setSubmitting(false);
      setError(hootzaErrorMessage(res.error, t('hootzas.cancelConfirm.failed')));
      // Already ended or cancelled: show the real state instead of the form.
      if (isHootzaNotLiveError(res.error)) void load();
      return;
    }
    // Back to the existing page (it reloads on focus) rather than stacking a
    // second copy over a now-stale host controls screen.
    router.dismissTo(`/(hootzas)/${id}`);
  }

  if (loading) {
    return (
      <ScreenContainer>
        <ActivityIndicator color={FixedColors.hootza} testID="cancel-confirm-loading" />
      </ScreenContainer>
    );
  }

  if (error && !hootza) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <Text>{error}</Text>
          <Button title={t('error.retry')} onPress={load} />
        </View>
      </ScreenContainer>
    );
  }

  if (!hootza) {
    return (
      <ScreenContainer>
        <View style={styles.centered} testID="cancel-confirm-empty">
          <Text>{t('hootzas.common.empty')}</Text>
          <Button title={t('error.retry')} onPress={load} />
        </View>
      </ScreenContainer>
    );
  }

  if (hootza.status !== 'live') {
    return (
      <ScreenContainer>
        <View style={styles.centered} testID="cancel-confirm-not-live">
          <Text style={styles.body}>{t('hootzas.errors.notLive')}</Text>
          <Button
            title={t('hootzas.common.back')}
            onPress={() => router.dismissTo(`/(hootzas)/${id}`)}
            variant="secondary"
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>{t('hootzas.common.back')}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{t('hootzas.cancelConfirm.title')}</Text>
        <Text style={styles.body}>{t('hootzas.cancelConfirm.body')}</Text>
        <Text style={styles.body} testID="cancel-notify-not-live">
          {t('hootzas.cancelConfirm.notifyNotLive')}
        </Text>

        <Text style={styles.label}>
          {t('hootzas.cancelConfirm.reasonLabel')}{' '}
          <Text style={styles.labelSub}>({t('hootzas.cancelConfirm.reasonVisible')})</Text>
        </Text>
        <TextInput
          value={reason}
          onChangeText={setReason}
          placeholder={t('hootzas.cancelConfirm.reasonLabel')}
          testID="cancel-reason-input"
          editable={!submitting}
        />

        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

        <Button
          title={t('hootzas.cancelConfirm.confirm')}
          onPress={confirmCancel}
          loading={submitting}
          testID="cancel-confirm-submit"
          style={styles.dangerBtn}
        />
        <Button
          title={t('hootzas.cancelConfirm.keep')}
          onPress={() => router.back()}
          variant="secondary"
          disabled={submitting}
          testID="cancel-confirm-keep"
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  scroll: { paddingHorizontal: 22, paddingBottom: 32, gap: 14 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  back: { paddingVertical: 12 },
  backText: { fontSize: 17, color: Colors.Ink, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800', color: Colors.SignalRed, lineHeight: 30 },
  body: { fontSize: 16, lineHeight: 24, color: Colors.Muted },
  label: { fontSize: 15, fontWeight: '700', color: Colors.Ink, marginTop: 8 },
  labelSub: { fontWeight: '400', color: Colors.Faint },
  error: { fontSize: 15, color: Colors.Ink },
  dangerBtn: { marginTop: 8 },
});
