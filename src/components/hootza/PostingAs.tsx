/**
 * POSTING AS (CANON-RL-01-SN-75, drawn in Organizations.dc.html): "posting as is a state, not a second flow".
 * Shown on the first create step only to a user who leads at least one active organization. Choosing the group
 * states the split before anything is posted: the group gets the check-ins, the person gets the points, the person's
 * name is on the action. The free-post figure is the group's server figure (setting feed_organization_posts_per_month),
 * never a number written here. Nothing renders when the user has no group or the lookup fails.
 */
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { t } from '../../i18n';
import { Colors, FixedColors } from '../../theme/tokens';
import { getMyOrganizations, getOrgDashboard, type MyOrg } from '../../api/organizations';

export function PostingAs({ organizationId, onChange }: {
  organizationId: string | null;
  /** `freePostsLeft` is null when posting as yourself or while the group's figure is unknown. */
  onChange: (organizationId: string | null, freePostsLeft: number | null, freePostsPerMonth: number | null) => void;
}) {
  const [groups, setGroups] = useState<MyOrg[]>([]);
  const [quota, setQuota] = useState<{ left: number; perMonth: number } | null>(null);
  const [quotaFailed, setQuotaFailed] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const res = await getMyOrganizations();
        if (live && !res.error) setGroups((res.data?.organizations ?? []).filter((g) => g.status === 'active'));
      } catch { /* no chooser: the user simply posts as themselves */ }
    })();
    return () => { live = false; };
  }, []);

  // Read the chosen group's figure whenever the choice changes (also restores a draft that already named a group).
  useEffect(() => {
    setQuota(null); setQuotaFailed(false);
    if (!organizationId) return;
    let live = true;
    (async () => {
      try {
        const res = await getOrgDashboard(organizationId);
        if (!live) return;
        if (res.error || !res.data) { setQuotaFailed(true); onChange(organizationId, null, null); return; }
        setQuota({ left: res.data.quota.remaining, perMonth: res.data.quota.freePosts });
        onChange(organizationId, res.data.quota.remaining, res.data.quota.freePosts);
      } catch { if (live) { setQuotaFailed(true); onChange(organizationId, null, null); } }
    })();
    return () => { live = false; };
    // onChange is the parent's setter wrapper; the choice is what drives this read.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  if (groups.length === 0) return null;

  return (
    <View style={s.box} testID="posting-as">
      <Text style={s.eyebrow}>{t('l06.posting.title')}</Text>
      <Choice label={t('l06.posting.you')} selected={organizationId === null} onPress={() => onChange(null, null, null)} testID="posting-as-me" />
      {groups.map((g) => (
        <Choice key={g.id} label={g.name} selected={organizationId === g.id} onPress={() => onChange(g.id, null, null)} testID={`posting-as-${g.id}`} />
      ))}
      {organizationId ? (
        <View style={s.split} testID="posting-as-split">
          <Text style={s.splitTitle}>{t('l06.posting.splitTitle')}</Text>
          <Row label={t('l06.posting.checkInsLabel')} value={t('l06.posting.checkInsValue')} />
          <Row label={t('l06.posting.pointsLabel')} value={t('l06.posting.pointsValue')} />
          <Row label={t('l06.posting.nameLabel')} value={t('l06.posting.nameValue')} />
          <Text style={s.note} testID="posting-as-quota">
            {quota
              ? quota.left > 0
                ? t('l06.posting.quotaLeft', { perMonth: quota.perMonth, left: quota.left })
                : t('l06.posting.quotaNone', { perMonth: quota.perMonth })
              : quotaFailed ? t('l06.posting.quotaUnknown') : t('l06.posting.quotaLoading')}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function Choice({ label, selected, onPress, testID }: { label: string; selected: boolean; onPress: () => void; testID: string }) {
  return (
    <TouchableOpacity onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected }} style={s.choice} testID={testID}>
      <View style={[s.radio, selected && s.radioOn]} />
      <Text style={[s.choiceLabel, selected && s.choiceLabelOn]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  box: { borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 12, padding: 12, gap: 6, marginTop: 8 },
  eyebrow: { fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: Colors.Faint, fontWeight: '700' },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 11, minHeight: 44 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.Line },
  radioOn: { borderWidth: 7, borderColor: FixedColors.hootza },
  choiceLabel: { fontSize: 16, color: Colors.Ink },
  choiceLabelOn: { fontWeight: '600' },
  split: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 12, overflow: 'hidden', marginTop: 4 },
  splitTitle: { padding: 11, backgroundColor: Colors.Bone, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: Colors.Faint, fontWeight: '700' },
  row: { padding: 11, borderTopWidth: 1, borderColor: Colors.Hairline, flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  rowLabel: { fontSize: 14, color: Colors.Ink, flexShrink: 1 },
  rowValue: { fontSize: 13, fontWeight: '700', color: FixedColors.hootza },
  note: { padding: 11, borderTopWidth: 1, borderColor: Colors.Hairline, fontSize: 13, lineHeight: 19, color: Colors.Muted },
});
