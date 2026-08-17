/**
 * EDIT A LIVE HOOTZA
 * PATCH /api/hootzas/:id — not live yet. Read-only + cancel link.
 * GET /api/hootzas/:id
 */

import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../../src/components';
import { t } from '../../../src/i18n';
import { Colors, FixedColors } from '../../../src/theme/tokens';
import { getHootza, getRsvpCount, type Hootza } from '../../../src/api/hootzas';
import { formatClock, formatCentsAsDollars } from '../../../src/lib/hootza-format';

export default function EditHootzaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [hootza, setHootza] = useState<Hootza | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const res = await getHootza(id);
    setLoading(false);
    if (res.error || !res.data?.hootza) {
      setError(res.error?.message ?? t('error.notFound'));
      return;
    }
    setHootza(res.data.hootza);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <ScreenContainer>
        <ActivityIndicator color={FixedColors.hootza} testID="edit-loading" />
      </ScreenContainer>
    );
  }

  if (error || !hootza) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <Text>{error ?? t('hootzas.common.empty')}</Text>
          <Button title={t('error.retry')} onPress={load} testID="edit-retry" />
        </View>
      </ScreenContainer>
    );
  }

  const going = getRsvpCount(hootza);
  const venueLabel =
    hootza.venueType === 'public_place'
      ? t('hootzas.venue.publicPlace')
      : t('hootzas.venue.privateResidence');

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>{t('hootzas.common.back')}</Text>
          <Text style={styles.header}>{t('hootzas.edit.title')}</Text>
        </TouchableOpacity>

        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>
            {t('hootzas.edit.goingBanner', { count: going })}
          </Text>
          <Text style={styles.bannerBody}>{t('hootzas.edit.goingHint')}</Text>
        </View>

        <Text style={styles.sectionHeader}>{t('hootzas.edit.toldHeader')}</Text>
        <Field label={t('hootzas.edit.startsLabel')} value={formatClock(new Date(hootza.startTime))} />
        <Field
          label={t('hootzas.edit.whereLabel')}
          value={hootza.locationName ?? t('hootzas.common.notAvailable')}
        />

        <Text style={styles.sectionHeader}>{t('hootzas.edit.quietHeader')}</Text>
        <Field label={t('hootzas.edit.calledLabel')} value={hootza.title} />
        <Field label={venueLabel} value={t('hootzas.venue.required')} />
        <Field
          label={t('hootzas.edit.detailsLabel')}
          value={hootza.description ?? t('hootzas.common.notAvailable')}
        />
        {hootza.coverChargeAmount != null && hootza.coverChargeAmount > 0 && (
          <Field
            label={t('hootzas.edit.doorLabel')}
            value={formatCentsAsDollars(hootza.coverChargeAmount)}
          />
        )}

        <Text style={styles.readOnlyNote} testID="edit-readonly-note">
          {t('hootzas.edit.readOnlyNote')}
        </Text>

        <View style={styles.cancelTray}>
          <TouchableOpacity
            onPress={() => router.push(`/(hootzas)/${id}/cancel-confirm`)}
            testID="edit-cancel-link"
          >
            <Text style={styles.cancelLink}>{t('hootzas.edit.cancelLink')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
      <Text style={styles.change}>{t('hootzas.edit.change')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  scroll: { paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  back: { paddingHorizontal: 22, paddingVertical: 12 },
  backText: { fontSize: 17, color: Colors.Ink, fontWeight: '600' },
  header: { fontSize: 17, fontWeight: '800', color: Colors.Ink, marginTop: 8 },
  banner: {
    marginHorizontal: 22,
    backgroundColor: Colors.Bone,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 6,
  },
  bannerTitle: { fontSize: 15, fontWeight: '700', color: Colors.Ink },
  bannerBody: { fontSize: 13, lineHeight: 18, color: Colors.Muted },
  sectionHeader: {
    paddingHorizontal: 22,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.Faint,
    marginBottom: 8,
    marginTop: 8,
  },
  field: {
    marginHorizontal: 22,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: Colors.Hairline,
  },
  fieldLabel: { fontSize: 13, color: Colors.Faint },
  fieldValue: { fontSize: 16, fontWeight: '600', color: Colors.Ink, marginTop: 2 },
  change: { fontSize: 14, color: Colors.Faint, marginTop: 4 },
  readOnlyNote: {
    marginHorizontal: 22,
    marginTop: 20,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.Muted,
    borderWidth: 1,
    borderColor: Colors.Line,
    borderRadius: 14,
    padding: 13,
  },
  cancelTray: {
    marginTop: 24,
    marginHorizontal: 22,
    borderTopWidth: 1,
    borderColor: Colors.Line,
    paddingTop: 16,
  },
  cancelLink: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.SignalRed,
    textDecorationLine: 'underline',
  },
});
