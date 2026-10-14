/**
 * END VS CANCEL — reference screen (§28.8)
 * Not an action screen — explains the distinction.
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../../../src/components';
import { t } from '../../../src/i18n';
import { Colors } from '../../../src/theme/tokens';

export default function EndVsCancelScreen() {
  const router = useRouter();

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>{t('hootzas.common.back')}</Text>
          <Text style={styles.title}>{t('hootzas.endVsCancel.title')}</Text>
        </TouchableOpacity>

        <View style={styles.columns}>
          <View style={styles.endCol} testID="end-vs-cancel-end">
            <Text style={styles.colTitle}>{t('hootzas.endVsCancel.endTitle')}</Text>
            <Text style={styles.colLead}>{t('hootzas.endVsCancel.endLead')}</Text>
            <Bullet text={t('hootzas.endVsCancel.endPointsStay')} />
            <Bullet text={t('hootzas.endVsCancel.endPinsStay')} />
            <Bullet text={t('hootzas.endVsCancel.endNoNotify')} />
            <Bullet text={t('hootzas.endVsCancel.endPage')} />
            <Text style={styles.fallback}>{t('hootzas.endVsCancel.endFallback')}</Text>
          </View>

          <View style={styles.cancelCol} testID="end-vs-cancel-cancel">
            <Text style={styles.colTitle}>{t('hootzas.endVsCancel.cancelTitle')}</Text>
            <Text style={styles.colLead}>{t('hootzas.endVsCancel.cancelLead')}</Text>
            <Bullet text={t('hootzas.endVsCancel.cancelNotify')} />
            <Bullet text={t('hootzas.endVsCancel.cancelReason')} />
            <Bullet text={t('hootzas.endVsCancel.cancelPage')} />
            <Bullet text={t('hootzas.endVsCancel.cancelNoUndo')} />
            <Text style={styles.fallback}>{t('hootzas.endVsCancel.cancelOnlyYou')}</Text>
          </View>
        </View>

        <Text style={styles.placement}>{t('hootzas.endVsCancel.placement')}</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>·</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  scroll: { paddingBottom: 32 },
  back: { paddingHorizontal: 22, paddingVertical: 12 },
  backText: { fontSize: 17, color: Colors.Ink, fontWeight: '600' },
  title: { fontSize: 17, fontWeight: '800', color: Colors.Ink, marginTop: 8 },
  columns: { flexDirection: 'row', gap: 12, paddingHorizontal: 22, marginTop: 16 },
  endCol: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.Ink,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  cancelCol: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.SignalRed,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  colTitle: { fontSize: 16, fontWeight: '800', color: Colors.Ink },
  colLead: { fontSize: 14, lineHeight: 20, color: Colors.Muted },
  bulletRow: { flexDirection: 'row', gap: 6, paddingLeft: 2 },
  bulletDot: { fontSize: 16, color: Colors.Muted },
  bulletText: { flex: 1, fontSize: 13, lineHeight: 18, color: Colors.Ink },
  fallback: { fontSize: 12, lineHeight: 17, color: Colors.Faint, marginTop: 4 },
  placement: {
    marginHorizontal: 22,
    marginTop: 20,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.Muted,
    textAlign: 'center',
  },
});
