/**
 * ADDING A ROLE (CANON-SH-01-SN-15; RULES §26.4). For someone who already has an account: it opens by
 * showing their own, because the fear at this moment is that adding a role changes what they have. Roles
 * add to one account; nothing is replaced and nothing resets. "Individual" is absent — they already are
 * one. Each row opens that role's own entry, which decides from the server what to show.
 * Reads GET /users/me (name, member-since month); no hello count is shown (the figure is not defined).
 */
import { Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { t } from '../../../src/i18n';
import { Colors } from '../../../src/theme';
import { SubScreen, subStyles } from '../../../src/components/account/SubScreen';
import { useLoader } from '../../../src/lib/use-loader';
import { api } from '../../../src/api/client';
import { ROLE_ROUTES, type RoleKey } from '../../../src/state/pending-role';

const ROLES: RoleKey[] = ['hangout', 'ambassador', 'creator', 'organization'];

export default function AddRoleScreen() {
  const router = useRouter();
  const loader = useLoader<{ displayName?: string | null; createdAt?: string | null }>(() => api.user.getProfile() as never);
  const me = loader.data;
  const since = me?.createdAt ? new Date(me.createdAt) : null;
  const month = since && !Number.isNaN(since.getTime()) ? since.toLocaleDateString(undefined, { month: 'long' }) : null;
  return (
    <SubScreen title={t('s2c.addRole.title')} state={loader.state} onRetry={loader.retry}>
      <View style={[subStyles.card, { paddingVertical: 14 }]}>
        <Text style={subStyles.rowLabel}>{me?.displayName ?? ''}</Text>
        {month ? <Text style={subStyles.rowHint}>{t('s2c.addRole.memberSince', { month })}</Text> : null}
        <Text style={[subStyles.rowHint, { marginTop: 8 }]}>{t('s2c.addRole.sameAccount')}</Text>
      </View>
      <Text style={subStyles.intro}>{t('s2c.addRole.keep')}</Text>
      <Text style={[subStyles.rowHint, { marginBottom: 8 }]}>{t('s2c.addRole.whatToAdd')}</Text>
      {ROLES.map(r => (
        <TouchableOpacity
          key={r}
          style={[subStyles.card, { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }]}
          onPress={() => router.push(ROLE_ROUTES[r] as never)}
          accessibilityRole="button"
          testID={`add-role-${r}`}
        >
          <View style={{ flex: 1 }}>
            <Text style={subStyles.rowLabel}>{t(`s2c.addRole.${r}`)}</Text>
            <Text style={subStyles.rowHint}>{t(`s2c.addRole.${r}Body`)}</Text>
          </View>
          <Text style={{ fontSize: 22, color: Colors.Muted }}>›</Text>
        </TouchableOpacity>
      ))}
      <Text style={subStyles.note}>{t('s2c.addRole.allFour')}</Text>
      <TouchableOpacity style={{ paddingVertical: 18 }} onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/profile'))} accessibilityRole="button" testID="add-role-not-now">
        <Text style={[subStyles.rowLabel, { color: Colors.Muted, textAlign: 'center' }]}>{t('s2c.addRole.notNow')}</Text>
      </TouchableOpacity>
    </SubScreen>
  );
}
