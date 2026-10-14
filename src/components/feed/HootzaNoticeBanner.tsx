/**
 * Cancellation notices for Hootzas the user RSVP'd to (RULES §28.6). No push provider is configured, so the
 * server queues a notice per going/maybe RSVP and it is delivered here by pull. Nothing renders when there are none.
 * GET /api/hootzas/my/notices, POST /api/hootzas/my/notices/:id/delivered
 */
import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { t } from '../../i18n';
import { Colors } from '../../theme/tokens';
import { getMyHootzaNotices, markHootzaNoticeDelivered, type HootzaNotice } from '../../api/hootzas';

export function HootzaNoticeBanner() {
  const router = useRouter();
  const [notices, setNotices] = useState<HootzaNotice[]>([]);

  useEffect(() => {
    let live = true;
    void (async () => {
      try {
        const res = await getMyHootzaNotices();
        if (live && res.data) setNotices(res.data.notices.filter((n) => n.hootza));
      } catch { /* a missing banner is not an error state */ }
    })();
    return () => { live = false; };
  }, []);

  if (notices.length === 0) return null;
  return (
    <View style={styles.wrap} testID="hootza-notices">
      {notices.map((n) => (
        <TouchableOpacity
          key={n.id}
          style={styles.card}
          accessibilityRole="button"
          testID={`hootza-notice-${n.id}`}
          onPress={() => {
            setNotices((cur) => cur.filter((x) => x.id !== n.id));
            void markHootzaNoticeDelivered(n.id);
            router.push({ pathname: '/(hootzas)/[id]', params: { id: n.hootza!.id } });
          }}
        >
          <Text style={styles.title}>
            {n.kind === 'changed'
              ? t(n.changedFields?.includes('time') && n.changedFields?.includes('place') ? 'hootzas.notice.changedBoth' : n.changedFields?.includes('place') ? 'hootzas.notice.changedPlace' : 'hootzas.notice.changedTime', { title: n.hootza!.title })
              : t('hootzas.notice.cancelled', { title: n.hootza!.title })}
          </Text>
          {n.kind === 'cancelled' && n.hootza!.cancellationReason ? <Text style={styles.body}>{n.hootza!.cancellationReason}</Text> : null}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, marginBottom: 12 },
  card: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 14, padding: 14, gap: 4, backgroundColor: Colors.Bone },
  title: { fontSize: 15, fontWeight: '700', color: Colors.Ink },
  body: { fontSize: 13, color: Colors.Muted },
});
