/**
 * LEADS — CANON-RL-05-SN-09. The LEAD is in charge and may delegate; SUPER ADMIN sits above (not listed).
 * GET/POST /api/organizations/:id/leads, DELETE /api/organizations/:id/leads/:userId.
 * Handover / removing the last lead is not ruled: the LEAD row has no Remove.
 */
import { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, TextInput } from '../../../../src/components';
import { t } from '../../../../src/i18n';
import { Colors } from '../../../../src/theme/tokens';
import { useLoader } from '../../../../src/lib/use-loader';
import { getOrgLeads, addOrgLead, removeOrgLead } from '../../../../src/api/organizations';
import { OrgScreen, Loading, ErrorState, Note, orgStyles } from '../../../../src/components/organization/parts';

export default function OrganizationLeads() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, data, retry, reload } = useLoader(() => getOrgLeads(id));
  const [phone, setPhone] = useState('');
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (state === 'loading') return <Loading />;
  if (state === 'error') return <ErrorState message={t('organizations.common.couldNotLoad')} onRetry={retry} onBack={() => router.back()} />;
  const canManage = data!.viewer.canManageLeads;

  const add = async () => {
    setBusy(true); setError(null);
    const res = await addOrgLead(id, phone.trim());
    setBusy(false);
    if (res.error) { setError(res.error.code === 'no_account_for_that_number' ? t('organizations.leads.noAccount') : t('organizations.common.saveFailed')); return; }
    setPhone(''); setAdding(false); void reload();
  };
  const remove = async (userId: string) => {
    setBusy(true); setError(null);
    const res = await removeOrgLead(id, userId);
    setBusy(false);
    if (res.error) { setError(t('organizations.common.saveFailed')); return; }
    void reload();
  };

  return (
    <OrgScreen title={t('organizations.leads.title')} onBack={() => router.back()}
      footer={canManage ? (adding ? undefined : <Button title={t('organizations.leads.add')} onPress={() => setAdding(true)} testID="org-lead-add" />) : <Text style={orgStyles.hint}>{t('organizations.leads.onlyLead')}</Text>}>
      <Text style={s.sub}>{t('organizations.leads.subtitle')}</Text>
      <Text style={orgStyles.hint}>{t('organizations.leads.body')}</Text>
      {data!.leads.map((l) => (
        <View key={l.userId} style={s.row} testID={`org-lead-${l.userId}`}>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{l.name ?? '—'}{l.isYou ? ` · ${t('organizations.leads.you')}` : ''}</Text>
            <Text style={orgStyles.hint}>{l.leadRole === 'lead' ? t('organizations.leads.setUpTag') : t('organizations.leads.addedOn', { date: new Date(l.addedAt).toLocaleDateString() })}</Text>
          </View>
          {canManage && l.leadRole === 'delegate' ? (
            <TouchableOpacity onPress={() => remove(l.userId)} disabled={busy} accessibilityRole="button" testID={`org-lead-remove-${l.userId}`}>
              <Text style={s.remove}>{t('organizations.leads.remove')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ))}
      {adding ? (
        <View style={{ gap: 8 }}>
          <Text style={orgStyles.fieldLabel}>{t('organizations.leads.phoneLabel')}</Text>
          <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" testID="org-lead-phone" />
          <Button title={t('organizations.leads.addAction')} loading={busy} disabled={phone.trim().length < 5} onPress={add} testID="org-lead-submit" />
          <Button title={t('organizations.common.back')} variant="secondary" onPress={() => { setAdding(false); setError(null); }} />
        </View>
      ) : null}
      {error ? <Text style={orgStyles.error} testID="org-lead-error">{error}</Text> : null}
      <Note title={t('organizations.leads.canTitle')} body={t('organizations.leads.canBody')} />
      <Note title={t('organizations.leads.neverTitle')} body={t('organizations.leads.neverBody')} />
      <Note title={t('organizations.leads.removingTitle')} body={t('organizations.leads.removingBody')} />
    </OrgScreen>
  );
}
const s = StyleSheet.create({
  sub: { fontSize: 16, fontWeight: '600', color: Colors.Ink },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: Colors.Hairline, gap: 12 },
  name: { fontSize: 16, color: Colors.Ink },
  remove: { fontSize: 15, color: Colors.Ink, textDecorationLine: 'underline' },
});
