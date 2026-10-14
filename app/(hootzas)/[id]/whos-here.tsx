/**
 * WHO'S HERE (host-only counts — no attendee list API)
 * GET /api/hootzas/:id
 */

import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../../src/components';
import { t } from '../../../src/i18n';
import { Colors, FixedColors } from '../../../src/theme/tokens';
import { getCheckinCount, getHootza, getRsvpCount, type Hootza } from '../../../src/api/hootzas';
import { api } from '../../../src/api/client';

export default function WhosHereScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [hootza, setHootza] = useState<Hootza | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [hootzaRes, profileRes] = await Promise.all([getHootza(id), api.user.getProfile()]);
    setLoading(false);
    if (hootzaRes.error || !hootzaRes.data?.hootza) {
      setError(hootzaRes.error?.message ?? t('error.notFound'));
      return;
    }
    const h = hootzaRes.data.hootza;
    setHootza(h);
    const profile = profileRes.data as { id?: string } | undefined;
    setIsHost(Boolean(profile?.id && h.hostUserId === profile.id));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <ScreenContainer>
        <ActivityIndicator color={FixedColors.hootza} testID="whos-here-loading" />
      </ScreenContainer>
    );
  }

  if (error || !hootza) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <Text>{error}</Text>
          <Button title={t('error.retry')} onPress={load} />
        </View>
      </ScreenContainer>
    );
  }

  if (!isHost) {
    return (
      <ScreenContainer>
        <View style={styles.centered} testID="whos-here-forbidden">
          <Text style={styles.privacy}>{t('hootzas.whosHere.privacy')}</Text>
          <Button title={t('common.done')} onPress={() => router.back()} />
        </View>
      </ScreenContainer>
    );
  }

  const checkedIn = getCheckinCount(hootza);
  const going = getRsvpCount(hootza);
  const notScanned = Math.max(going - checkedIn, 0);

  return (
    <ScreenContainer style={styles.screen}>
      <TouchableOpacity onPress={() => router.back()} style={styles.header}>
        <Text style={styles.back}>{t('hootzas.common.back')}</Text>
        <View>
          <Text style={styles.title}>{t('hootzas.whosHere.title')}</Text>
          <Text style={styles.sub}>
            {t('hootzas.whosHere.subtitle', { checkedIn, going })}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.body}>
        <Text style={styles.privacy}>{t('hootzas.whosHere.privacy')}</Text>
        <Text style={styles.unavailable} testID="whos-here-api-note">
          {t('hootzas.whosHere.unavailable')}
        </Text>
        <Text style={styles.section}>{t('hootzas.whosHere.notScannedHeader')}</Text>
        <Text style={styles.sectionBody}>
          {t('hootzas.whosHere.notScannedBody', { count: notScanned })}
        </Text>
      </View>

      <Text style={styles.footer}>{t('hootzas.whosHere.clearsAtEnd')}</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
  header: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  back: { fontSize: 17, color: Colors.Ink },
  title: { fontSize: 16, fontWeight: '700', color: Colors.Ink },
  sub: { fontSize: 13, color: Colors.Muted },
  body: { flex: 1, paddingHorizontal: 20, gap: 14 },
  privacy: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.Muted,
    borderWidth: 1,
    borderColor: Colors.Line,
    borderRadius: 14,
    padding: 13,
  },
  unavailable: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
  section: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.Faint,
  },
  sectionBody: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
  footer: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.Faint,
    paddingBottom: 26,
  },
});
