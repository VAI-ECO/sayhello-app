/**
 * HELLO ADMIN › AUDIT — CANON-00-SN-12 (RULES §6.21, §23.7: its own screen, never inside Settings).
 * Append-only: this screen only reads. Each row is the drawn one — the permission the action was taken
 * under, then "who · when · what". No cap on the list (§23.16): older entries load by cursor until the
 * server says there are none. A staff member appears by display name only.
 */

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { getAudit, type AuditEntry } from '../../src/api/admin';
import { AdminShell } from '../../src/components/admin/AdminShell';
import { Card } from '../../src/components/role/RoleShell';
import { useLoader } from '../../src/lib/use-loader';
import { whenLabel, summaryFor } from '../../src/lib/admin-format';

export default function AdminAuditScreen() {
  const first = useLoader(async () => {
    const res = await getAudit();
    return res?.data ? { data: res.data } : res && res.error ? { error: res.error } : undefined;
  });
  const [older, setOlder] = useState<AuditEntry[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [olderFailed, setOlderFailed] = useState(false);

  // A fresh first page replaces whatever older pages were loaded under the previous one.
  useEffect(() => {
    setOlder([]);
    setCursor(first.data?.nextCursor ?? null);
    setOlderFailed(false);
  }, [first.data]);

  async function loadOlder() {
    if (!cursor || loadingOlder) return;
    setLoadingOlder(true);
    setOlderFailed(false);
    const res = await getAudit(cursor);
    setLoadingOlder(false);
    if (!res?.data) {
      setOlderFailed(true);
      return;
    }
    setOlder((prev) => [...prev, ...res.data!.entries]);
    setCursor(res.data.nextCursor);
  }

  const entries = [...(first.data?.entries ?? []), ...older];

  return (
    <AdminShell active="audit" title={t('admin.audit.title')} subtitle={t('admin.audit.lead')} refreshing={first.refreshing} onRefresh={first.onRefresh} testID="admin-audit">
      {first.state === 'loading' ? (
        <ActivityIndicator color={Colors.Ink} testID="admin-audit-loading" />
      ) : first.state === 'error' || !first.data ? (
        <Card tone="error" testID="admin-audit-error">
          <Text accessibilityRole="alert" style={styles.body}>
            {first.errorCode === 'forbidden' ? t('admin.common.notPermitted') : t('admin.common.loadFailed')}
          </Text>
          <TouchableOpacity onPress={first.retry} accessibilityRole="button" style={styles.outline} testID="admin-audit-retry">
            <Text style={styles.outlineText}>{t('admin.common.retry')}</Text>
          </TouchableOpacity>
        </Card>
      ) : entries.length === 0 ? (
        <Card testID="admin-audit-empty"><Text style={styles.body}>{t('admin.audit.empty')}</Text></Card>
      ) : (
        <>
          {entries.map((e) => (
            <Card key={e.id} testID={`admin-audit-row-${e.id}`}>
              <Text style={styles.kicker}>{e.permission ?? e.action}</Text>
              <Text style={styles.line}>
                {`${e.actor.name ?? t('admin.audit.unknownActor')} · ${whenLabel(e.performedAt)} · ${summaryFor(e)}`}
              </Text>
              {e.reason ? <Text style={styles.reason}>{t('admin.audit.reason', { reason: e.reason })}</Text> : null}
            </Card>
          ))}
          {cursor ? (
            <View>
              <TouchableOpacity onPress={loadOlder} disabled={loadingOlder} accessibilityRole="button" style={styles.outline} testID="admin-audit-older">
                {loadingOlder ? <ActivityIndicator color={Colors.Ink} /> : <Text style={styles.outlineText}>{t('admin.audit.older')}</Text>}
              </TouchableOpacity>
              {olderFailed ? <Text accessibilityRole="alert" style={styles.body} testID="admin-audit-older-failed">{t('admin.common.loadFailed')}</Text> : null}
            </View>
          ) : null}
        </>
      )}
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 15.5, lineHeight: 23, color: Colors.Muted },
  kicker: { fontSize: 13.5, fontWeight: '700', color: Colors.Ink, fontFamily: 'Courier' },
  line: { fontSize: 15, lineHeight: 22, color: Colors.Muted },
  reason: { fontSize: 14, lineHeight: 20, color: Colors.Muted, fontStyle: 'italic' },
  outline: { borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 29, minHeight: 54, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  outlineText: { color: Colors.Ink, fontSize: 17, fontWeight: '700' },
});
