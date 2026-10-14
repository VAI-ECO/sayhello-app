/**
 * INFLUENCER ACCOUNT — CANON-RL-04-SN-06. "Influencers do not leave" (ROLE-4 §7): they are paid on
 * direct action; the code keeps attributing and recurring payments continue on Hello Hangouts they
 * originated for as long as those renew — there is no opt-out unwind. Payouts belong to the payout
 * provider, which is not connected; the screen says so rather than implying anything is owed to a bank.
 * The role is added to a personal account (§26.4) — there is no second login.
 */

import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { getInfluencerMe, createCreatorPayoutAccount } from '../../src/api/influencer';
import { TrolleyRecipientForm } from '../../src/components/ambassador/TrolleyRecipientForm';
import { InfluencerShell } from '../../src/components/influencer/InfluencerShell';
import { Card } from '../../src/components/role/RoleShell';
import { useLoader } from '../../src/lib/use-loader';

export default function InfluencerAccountScreen() {
  const { state, data, retry, refreshing, onRefresh } = useLoader(async () => {
    const res = await getInfluencerMe();
    return res?.data ? { data: res.data.me } : res && res.error ? { error: res.error } : undefined;
  });

  return (
    <InfluencerShell active="account" title={t('influencer.account.title')} refreshing={refreshing} onRefresh={onRefresh} testID="creator-account">
      {state === 'loading' ? (
        <ActivityIndicator color={Colors.Ink} testID="creator-account-loading" />
      ) : state === 'error' || !data ? (
        <Card tone="error" testID="creator-account-error">
          <Text accessibilityRole="alert" style={styles.body}>{t('influencer.account.loadFailed')}</Text>
          <TouchableOpacity onPress={retry} accessibilityRole="button" style={styles.outline} testID="creator-account-retry">
            <Text style={styles.outlineText}>{t('influencer.common.retry')}</Text>
          </TouchableOpacity>
        </Card>
      ) : (
        <>
          <Card>
            <Text style={styles.eyebrow}>{t('influencer.account.codeLabel')}</Text>
            <Text style={styles.code} testID="creator-account-code">{data.code?.code ?? '—'}</Text>
          </Card>
          <Card testID="creator-account-leave">
            <Text style={styles.cardTitle}>{t('influencer.account.leaveTitle')}</Text>
            <Text style={styles.body}>{t('influencer.account.leaveBody')}</Text>
          </Card>
          <Card testID="creator-account-payout">
            <Text style={styles.cardTitle}>{t('influencer.account.payoutTitle')}</Text>
            <Text style={styles.body}>{t('influencer.account.payoutBody')}</Text>
          </Card>
          <TrolleyRecipientForm onSubmit={createCreatorPayoutAccount} />
          <View>
            <Text style={styles.small}>{t('figures.ma05Disclaimer')}</Text>
          </View>
        </>
      )}
    </InfluencerShell>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 15.5, lineHeight: 23, color: Colors.Muted },
  small: { fontSize: 13, lineHeight: 19, color: Colors.Faint, textAlign: 'center' },
  eyebrow: { fontSize: 11.5, fontWeight: '700', letterSpacing: 1.6, textTransform: 'uppercase', color: Colors.Muted },
  code: { fontSize: 22, fontWeight: '700', color: Colors.Ink },
  cardTitle: { fontSize: 16.5, fontWeight: '700', color: Colors.Ink },
  outline: { borderWidth: 1.5, borderColor: Colors.Ink, borderRadius: 29, minHeight: 54, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  outlineText: { color: Colors.Ink, fontSize: 17, fontWeight: '700' },
});
