/**
 * HELLO ADMIN › APPLICATIONS — Ambassador and Creator applications ("Applications are reviewed.
 * Territories are limited." — ROLE-3 §2, ROLE-4 §2). NO DELIVERED FRAME: this is a plain working
 * surface, listed in the ledger as owed a design; nothing here is a design claim.
 *
 * Permission: RULES §23.3 enumerates every Hello Admin permission and none names application decisions.
 * Approving adds a role to an account (§26.4), so the server gates it by `roles.grant` — a recorded,
 * reversible choice (owner-decisions.md). The screen shows only what the applicant submitted for this
 * purpose; never a birthday, chat or encounter (§23.12–23.13). Oldest first, no cap (§23.16). Each
 * decision writes the audit log; a decision that cannot be recorded does not stand.
 */

import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { decideApplication, getApplications, type ApplicationKind, type ApplicationRow } from '../../src/api/admin';
import { AdminShell } from '../../src/components/admin/AdminShell';
import { Card, Eyebrow } from '../../src/components/role/RoleShell';
import { useLoader } from '../../src/lib/use-loader';
import { whenLabel } from '../../src/lib/admin-format';

export default function AdminApplicationsScreen() {
  const [kind, setKind] = useState<ApplicationKind>('ambassador');
  const list = useLoader(async () => {
    const res = await getApplications(kind);
    return res?.data ? { data: res.data.applications } : res && res.error ? { error: res.error } : undefined;
  });
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; kind: 'ok' | 'error'; text: string } | null>(null);

  function switchKind(next: ApplicationKind) {
    if (next === kind) return;
    setKind(next);
    setFeedback(null);
  }

  // The loader reads the latest fetcher; a different kind is a different list, so show loading, not the old rows.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    list.retry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  async function decide(a: ApplicationRow, verb: 'approve' | 'decline') {
    if (busyId) return;
    setBusyId(a.id);
    const res = await decideApplication(kind, a.id, verb, notes[a.id]?.trim() || undefined);
    setBusyId(null);
    if (res?.data) {
      setFeedback({ id: a.id, kind: 'ok', text: verb === 'approve' ? t('admin.applications.approved') : t('admin.applications.declined') });
      void list.reload();
      return;
    }
    const code = res?.error?.code;
    setFeedback({
      id: a.id,
      kind: 'error',
      text: code === 'already_decided' ? t('admin.applications.alreadyDecided') : code === 'not_grantable' ? t('admin.applications.notGrantable') : t('admin.applications.decideFailed'),
    });
    if (code === 'already_decided') void list.reload();
  }

  return (
    <AdminShell active="applications" title={t('admin.applications.title')} subtitle={t('admin.applications.lead')} refreshing={list.refreshing} onRefresh={list.onRefresh} testID="admin-applications">
      <View style={styles.tabs} accessibilityRole="tablist">
        {(['ambassador', 'influencer'] as ApplicationKind[]).map((k) => (
          <TouchableOpacity
            key={k}
            onPress={() => switchKind(k)}
            accessibilityRole="tab"
            accessibilityState={{ selected: kind === k }}
            style={[styles.tab, kind === k && styles.tabOn]}
            testID={`admin-applications-tab-${k}`}
          >
            <Text style={[styles.tabText, kind === k && styles.tabTextOn]}>{k === 'ambassador' ? t('admin.applications.tabAmbassador') : t('admin.applications.tabCreator')}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {list.state === 'loading' ? (
        <ActivityIndicator color={Colors.Ink} testID="admin-applications-loading" />
      ) : list.state === 'error' || !list.data ? (
        <Card tone="error" testID="admin-applications-error">
          <Text accessibilityRole="alert" style={styles.body}>
            {list.errorCode === 'forbidden' ? t('admin.common.notPermitted') : list.errorCode === 'applications_unavailable' ? t('admin.applications.unavailable') : t('admin.common.loadFailed')}
          </Text>
          <TouchableOpacity onPress={list.retry} accessibilityRole="button" style={styles.outline} testID="admin-applications-retry">
            <Text style={styles.outlineText}>{t('admin.common.retry')}</Text>
          </TouchableOpacity>
        </Card>
      ) : list.data.length === 0 ? (
        <Card testID="admin-applications-empty"><Text style={styles.body}>{t('admin.applications.empty')}</Text></Card>
      ) : (
        list.data.map((a) => (
          <Card key={a.id} testID={`admin-application-${a.id}`}>
            <Text style={styles.cardTitle}>{a.fullName}</Text>
            <Text style={styles.small}>{t('admin.applications.submitted', { when: whenLabel(a.createdAt) })}</Text>
            {kind === 'ambassador' ? (
              <>
                <Field label={t('admin.applications.where')} value={a.workArea} />
                <Field label={t('admin.applications.places')} value={a.startingPlaces} />
                {a.referredByCode ? <Text style={styles.body}>{t('admin.applications.cameThrough', { code: a.referredByCode })}</Text> : null}
              </>
            ) : (
              <Field label={t('admin.applications.channel')} value={a.channel} />
            )}
            <Field label={t('admin.applications.phone')} value={a.phone} />

            <Eyebrow>{t('admin.applications.note')}</Eyebrow>
            <TextInput
              value={notes[a.id] ?? ''}
              onChangeText={(v) => setNotes((cur) => ({ ...cur, [a.id]: v }))}
              style={styles.input}
              accessibilityLabel={t('admin.applications.note')}
              testID={`admin-application-note-${a.id}`}
            />
            <TouchableOpacity onPress={() => decide(a, 'approve')} disabled={busyId !== null} accessibilityRole="button" accessibilityState={{ disabled: busyId !== null }} style={[styles.primary, busyId !== null && styles.primaryOff]} testID={`admin-application-approve-${a.id}`}>
              {busyId === a.id ? <ActivityIndicator color={Colors.Chalk} /> : <Text style={styles.primaryText}>{t('admin.applications.approve')}</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => decide(a, 'decline')} disabled={busyId !== null} accessibilityRole="button" accessibilityState={{ disabled: busyId !== null }} style={styles.outline} testID={`admin-application-decline-${a.id}`}>
              <Text style={styles.outlineText}>{t('admin.applications.decline')}</Text>
            </TouchableOpacity>
            {feedback?.id === a.id ? (
              <Text accessibilityRole={feedback.kind === 'error' ? 'alert' : undefined} style={[styles.body, feedback.kind === 'error' && styles.error]} testID={`admin-application-feedback-${a.id}`}>{feedback.text}</Text>
            ) : null}
          </Card>
        ))
      )}
      {feedback?.kind === 'ok' && !(list.data ?? []).some((a) => a.id === feedback.id) ? (
        <Text style={styles.body} testID="admin-applications-done">{feedback.text}</Text>
      ) : null}
    </AdminShell>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View>
      <Eyebrow>{label}</Eyebrow>
      <Text style={styles.body}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 15.5, lineHeight: 23, color: Colors.Muted },
  small: { fontSize: 13, lineHeight: 19, color: Colors.Faint },
  error: { color: Colors.SignalRed },
  cardTitle: { fontSize: 16.5, fontWeight: '700', color: Colors.Ink },
  tabs: { flexDirection: 'row', gap: 8 },
  tab: { borderWidth: 1.5, borderColor: Colors.Line, borderRadius: 22, paddingHorizontal: 16, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  tabOn: { borderColor: Colors.Ink, backgroundColor: Colors.Ink },
  tabText: { fontSize: 15, fontWeight: '700', color: Colors.Ink },
  tabTextOn: { color: Colors.Chalk },
  input: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 12, paddingHorizontal: 14, minHeight: 48, fontSize: 16, color: Colors.Ink },
  primary: { backgroundColor: Colors.Ink, borderRadius: 29, minHeight: 54, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  primaryOff: { opacity: 0.4 },
  primaryText: { color: Colors.Chalk, fontSize: 17, fontWeight: '700' },
  outline: { borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 29, minHeight: 54, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  outlineText: { color: Colors.Ink, fontSize: 17, fontWeight: '700' },
});
