/**
 * DELETE MY ACCOUNT (Settings → bottom)
 * POST /users/me/delete { confirm: true } → delete_personal_account() (migration 061).
 * States plainly what is cleared, what stays (pins, selfies, points record, reports — RULES §10.8,
 * §10.10, §10.11, §24.11) and what is still undecided. On success the session is ended on the
 * server and the device returns to sign-in.
 */
import { useState } from 'react';
import { Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../../src/api/client';
import { Colors } from '../../../src/theme';
import { t } from '../../../src/i18n';
import { SubScreen, subStyles } from '../../../src/components/account/SubScreen';
import { deleteMyAccount } from '../../../src/api/account';

export default function DeleteAccountScreen() {
  const router = useRouter();
  // D 1440 (RL-01-SN-57): what stays and what is pending sit side by side (1fr 1fr).
  const desktop = useWindowDimensions().width >= 1024;
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (busy || !confirmed) return;
    setBusy(true);
    setError(null);
    const res = await deleteMyAccount();
    if (res.error) {
      setBusy(false);
      setError(
        res.error.code === 'account_role_active' ? t('account.deleteAccount.roleActive')
        : res.error.code === 'deletion_unavailable' ? t('account.deleteAccount.unavailable')
        : t('account.deleteAccount.failed'),
      );
      return;
    }
    // The server has already refused this token; clearing it also stops every cached read.
    await api.auth.signOut();
    router.replace('/(auth)/sign-in-phone');
  }

  return (
    <SubScreen
      title={t('account.deleteAccount.title')}
      footer={
        <>
          {error ? <Text style={subStyles.error} accessibilityRole="alert" testID="delete-error">{error}</Text> : null}
          <TouchableOpacity
            style={[subStyles.primary, { backgroundColor: Colors.SignalRed }, (!confirmed || busy) && subStyles.disabled]}
            disabled={!confirmed || busy}
            onPress={() => void remove()}
            accessibilityRole="button"
            accessibilityState={{ disabled: !confirmed || busy }}
            testID="delete-confirm-button"
          >
            <Text style={subStyles.primaryText}>{busy ? t('account.deleteAccount.deleting') : t('account.deleteAccount.delete')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={subStyles.secondary} onPress={() => router.back()} disabled={busy} accessibilityRole="button">
            <Text style={subStyles.secondaryText}>{t('account.cancel')}</Text>
          </TouchableOpacity>
        </>
      }
    >
      <Text style={subStyles.intro}>{t('account.deleteAccount.intro')}</Text>
      <View style={desktop ? { flexDirection: 'row', gap: 24, alignItems: 'flex-start' } : null}>
        <View style={desktop ? { flex: 1 } : null}>
          <Text style={subStyles.rowLabel}>{t('account.deleteAccount.staysTitle')}</Text>
          <Text style={subStyles.intro}>{t('account.deleteAccount.stays1')}</Text>
          <Text style={subStyles.intro}>{t('account.deleteAccount.stays2')}</Text>
          <Text style={subStyles.intro}>{t('account.deleteAccount.stays3')}</Text>
        </View>
        <View style={desktop ? { flex: 1 } : null}>
          <Text style={subStyles.rowLabel}>{t('account.deleteAccount.pendingTitle')}</Text>
          <Text style={subStyles.intro}>{t('account.deleteAccount.pending1')}</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => setConfirmed(value => !value)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: confirmed }}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 }}
        testID="delete-confirm-check"
      >
        <View style={{ width: 22, height: 22, borderRadius: 5, borderWidth: 2, borderColor: Colors.Ink, backgroundColor: confirmed ? Colors.Ink : Colors.Chalk }} />
        <Text style={[subStyles.rowLabel, { flex: 1 }]}>{t('account.deleteAccount.confirmLabel')}</Text>
      </TouchableOpacity>
    </SubScreen>
  );
}
