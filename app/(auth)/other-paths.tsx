/**
 * OTHER PATHS (CANON-SH-01-SN-18; RULES §26.4). "Everyone signs up as a person first." A Hello Hangout,
 * an Ambassador, a Creator or an Organization is a role added to that same account — never a second
 * login. Picking one starts the personal sign-up and remembers the choice, so the "You're in" screen can
 * offer the matching set-up. No price is printed here: the Hello Hangout price is a Hello Admin setting
 * and is shown where it is paid. "Just get started" is the way on with none of them.
 */
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../src/components';
import { setPendingRole, type RoleKey } from '../../src/state/pending-role';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme';

const ROLES: RoleKey[] = ['hangout', 'ambassador', 'creator', 'organization'];

export default function OtherPathsScreen() {
  const router = useRouter();
  const pick = (role: RoleKey | null) => { setPendingRole(role); router.push('/(onboarding)/value-cards'); };
  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.column}>
          <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/(auth)/front-door'))} accessibilityRole="button" testID="paths-back">
            <Text style={styles.back}>← {t('s2c.paths.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.title} accessibilityRole="header">{t('s2c.paths.title')}</Text>
          <Text style={styles.lead}>{t('s2c.paths.lead')}</Text>
          <Text style={styles.body}>{t('s2c.paths.body')}</Text>
          {ROLES.map(r => (
            <TouchableOpacity key={r} style={styles.row} onPress={() => pick(r)} accessibilityRole="button" testID={`paths-${r}`}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{t(`s2c.paths.${r}`)}</Text>
                <Text style={styles.rowBody}>{t(`s2c.paths.${r}Body`)}</Text>
              </View>
              <Text style={styles.chev}>›</Text>
            </TouchableOpacity>
          ))}
          <Text style={styles.laterTitle}>{t('s2c.paths.laterTitle')}</Text>
          <Text style={styles.body}>{t('s2c.paths.laterBody')}</Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button title={t('s2c.paths.justStart')} onPress={() => pick(null)} testID="paths-just-start" />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 110 },
  column: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: 12 },
  back: { fontSize: 16, color: Colors.Ink, paddingVertical: 12 },
  title: { fontSize: 30, fontWeight: '800', color: Colors.Ink, letterSpacing: -0.7 },
  lead: { fontSize: 18, fontWeight: '700', color: Colors.Ink },
  body: { fontSize: 15, lineHeight: 22, color: Colors.Muted },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.Bone, borderRadius: 14, padding: 16 },
  rowTitle: { fontSize: 17, fontWeight: '800', color: Colors.Ink },
  rowBody: { fontSize: 14, lineHeight: 20, color: Colors.Muted, marginTop: 2 },
  chev: { fontSize: 22, color: Colors.Muted },
  laterTitle: { fontSize: 16, fontWeight: '800', color: Colors.Ink, marginTop: 12 },
  footer: { position: 'absolute', bottom: 24, left: 24, right: 24, width: '100%', maxWidth: 560, alignSelf: 'center' },
});
