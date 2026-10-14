/**
 * ONBOARDING — YOU'RE IN (CANON-RL-01-SN-23)
 * "Keep the app closed. We'll find you when someone's near." — the thesis stated at the moment the
 * person is most primed to keep scrolling. One button, straight to the map (SN-24 coach mark there).
 */
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button, Waverly } from '../../src/components';
import { useEffect, useState } from 'react';
import { takePendingRole, getPendingRole, ROLE_ROUTES, type RoleKey } from '../../src/state/pending-role';
import {
  clearAudienceContinuation,
  restoreAudienceContinuation,
} from '../../src/state/pending-audience-continuation';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme';

export default function DoneScreen() {
  const router = useRouter();
  const [role] = useState(getPendingRole());
  // A creator link's audience (member/business/ambassador) survives onboarding and is offered at this
  // same moment as the pre-account role choice. Loaded from storage so a restart mid-onboarding keeps it;
  // either button consumes it, so it can never resurface later.
  const [audience, setAudience] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    void restoreAudienceContinuation().then(a => { if (live) setAudience(a); });
    return () => { live = false; };
  }, []);
  const audienceRoleKey: RoleKey | null =
    audience === 'business' ? 'hangout' : audience === 'ambassador' ? 'ambassador' : null;
  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Waverly size={120} wave />
        <Text style={styles.title} accessibilityRole="header">{t('s2c.done.title')}</Text>
        <Text style={styles.body}>{t('s2c.done.body')}</Text>
      </View>
      <View style={styles.footer}>
        {role ? (
          <Button
            title={t('s2c.paths.afterSignup', { role: t(`s2c.paths.${role}`) })}
            onPress={() => { takePendingRole(); router.replace('/(tabs)/home'); router.push(ROLE_ROUTES[role] as never); }}
            testID="done-role"
          />
        ) : null}
        {audienceRoleKey ? (
          <Button
            title={t('s2c.paths.afterSignup', { role: t(`s2c.paths.${audienceRoleKey}`) })}
            onPress={() => { clearAudienceContinuation(); router.replace('/(tabs)/home'); router.push(ROLE_ROUTES[audienceRoleKey] as never); }}
            testID="done-audience"
          />
        ) : null}
        <Button
          title={t('s2c.done.cta')}
          variant={role || audienceRoleKey ? 'secondary' : 'primary'}
          onPress={() => { takePendingRole(); clearAudienceContinuation(); router.replace('/(tabs)/map'); }}
          testID="done-cta"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 12 },
  title: { fontSize: 34, fontWeight: '800', color: Colors.Ink, letterSpacing: -0.8, textAlign: 'center' },
  body: { fontSize: 18, lineHeight: 26, color: Colors.Ink, opacity: 0.8, textAlign: 'center' },
  footer: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: 12 },
});
