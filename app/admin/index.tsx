/**
 * HELLO ADMIN › HOME — the sections this account holds (RULES §23.2: a whole section, or individual
 * permissions inside it). The list comes from the server; a section whose screen is built opens it, and a
 * section that is held but not built yet is named in words (never a dead link).
 */

import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { AdminShell, screensFor, useAdminMe, BUILT_SCREENS, sectionOfScreen } from '../../src/components/admin/AdminShell';
import { Card } from '../../src/components/role/RoleShell';

export default function AdminHomeScreen() {
  const router = useRouter();
  const { me, state } = useAdminMe();
  const built = screensFor(me);
  const builtKeys = new Set<string>(BUILT_SCREENS.flatMap((s) => [s.key, sectionOfScreen(s)]));
  const heldNotBuilt = (me?.sections ?? []).filter((s) => !builtKeys.has(s));

  return (
    <AdminShell active="home" title={t('admin.home.title')} subtitle={t('admin.home.subtitle')} testID="admin-home">
      {state === 'loading' ? (
        <ActivityIndicator color={Colors.Ink} testID="admin-home-loading" />
      ) : state === 'error' || !me ? (
        <Card tone="error" testID="admin-home-error">
          <Text accessibilityRole="alert" style={styles.body}>{t('admin.common.loadFailed')}</Text>
        </Card>
      ) : me.sections.length === 0 ? (
        <Card testID="admin-home-none">
          <Text style={styles.body}>{t('admin.home.noAccess')}</Text>
        </Card>
      ) : (
        <>
          {built.map((s) => (
            <TouchableOpacity
              key={s.key}
              onPress={() => router.push(s.href)}
              accessibilityRole="button"
              accessibilityLabel={t(s.home?.title ?? `admin.home.section.${s.key}`)}
              testID={`admin-open-${s.key}`}
            >
              <Card>
                <Text style={styles.cardTitle}>{t(s.home?.title ?? `admin.home.section.${s.key}`)}</Text>
                <Text style={styles.body}>{t(s.home?.body ?? `admin.home.sectionBody.${s.key}`)}</Text>
              </Card>
            </TouchableOpacity>
          ))}
          {heldNotBuilt.length > 0 ? (
            <Card testID="admin-home-not-built">
              <Text style={styles.cardTitle}>{t('admin.home.notBuiltTitle')}</Text>
              <Text style={styles.body}>
                {t('admin.home.notBuiltBody', { sections: heldNotBuilt.map((s) => t(`admin.home.section.${s}`)).join(' · ') })}
              </Text>
            </Card>
          ) : null}
          {!me.twoFactorEnforced ? (
            <View>
              <Text style={styles.small} testID="admin-home-2fa">{t('admin.home.twoFactor')}</Text>
              <TouchableOpacity onPress={() => router.push('/admin/two-factor')} accessibilityRole="button" accessibilityLabel={t('adminW2.twoFactor.title')} testID="admin-open-two-factor">
                <Text style={styles.cardTitle}>{t('adminW2.twoFactor.title')}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </>
      )}
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 15.5, lineHeight: 23, color: Colors.Muted },
  small: { fontSize: 13, lineHeight: 19, color: Colors.Faint },
  cardTitle: { fontSize: 16.5, fontWeight: '700', color: Colors.Ink },
});
