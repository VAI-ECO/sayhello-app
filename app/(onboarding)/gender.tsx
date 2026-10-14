/**
 * ONBOARDING STEP 5 of 6 — GENDER AND PRONOUNS (NEW-ONB-07; RULES §13.20-13.38)
 *
 * One line: gender radio, then the pronouns dropdown (§13.38). Gender is PRIVATE matching input and is
 * never shown to anyone (§13.24); pronouns are the only field other people see (§13.31) and are never
 * guessed from gender (§13.30). "Other" opens a curated list, no free text (§13.22). Both are skippable
 * ("Skip these") — nothing here blocks the account. Also reachable from Settings with ?edit=1, where it
 * loads the saved values and returns to Settings on Save.
 * PATCH /users/me { gender, genderDetail, pronouns, pronounsCustom } (migration 075).
 */
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer, Button, TextInput } from '../../src/components';
import { OptionField, RadioRow } from '../../src/components/consumer/OptionSheet';
import { api } from '../../src/api/client';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme';

export const GENDER_DETAILS = ['non_binary', 'genderqueer', 'genderfluid', 'agender', 'prefer_not_to_say'] as const;
export const PRONOUN_KEYS = ['he_him', 'she_her', 'they_them', 'he_they', 'she_they', 'any', 'name_only', 'prefer_not_to_say', 'custom'] as const;

export default function GenderScreen() {
  const router = useRouter();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const editing = edit === '1';
  const [gender, setGender] = useState<string | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const [pronouns, setPronouns] = useState<string | null>(null);
  const [custom, setCustom] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const busy = useRef(false);

  useEffect(() => {
    if (!editing) return;
    let live = true;
    void api.user.getProfile().then(res => {
      const u = res.data as Record<string, unknown> | undefined;
      if (!live || !u) return;
      setGender((u.gender as string) ?? null);
      setDetail((u.genderDetail as string) ?? null);
      setPronouns((u.pronouns as string) ?? null);
      setCustom((u.pronounsCustom as string) ?? '');
    });
    return () => { live = false; };
  }, [editing]);

  const nothing = !gender && !pronouns;
  // "Other" needs its curated choice before it can be saved.
  const incomplete = (gender === 'other' && !detail) || (pronouns === 'custom' && !custom.trim());

  const leave = () => {
    if (editing) router.back();
    else router.push('/(onboarding)/location');
  };

  const save = async () => {
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    setError('');
    const body: Record<string, unknown> = {};
    if (gender) body.gender = gender;
    if (gender === 'other' && detail) body.genderDetail = detail;
    if (pronouns) {
      body.pronouns = pronouns;
      if (pronouns === 'custom') body.pronounsCustom = custom.trim();
    }
    const res = await api.user.updateProfile(body);
    busy.current = false;
    setSaving(false);
    if (res.error) {
      setError(res.error.message || t('s2c.gender.saveFailed'));
      return;
    }
    leave();
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.column}>
          {editing ? null : <Text style={styles.step}>{t('s2c.gender.step')}</Text>}
          <Text style={styles.title} accessibilityRole="header">{editing ? t('s2c.gender.editTitle') : t('s2c.gender.title')}</Text>
          <Text style={styles.subtitle}>{t('s2c.gender.subtitle')}</Text>

          <Text style={styles.label}>{t('s2c.gender.genderLabel')}</Text>
          <RadioRow
            testIDPrefix="gender"
            value={gender}
            onChange={v => { setGender(v); if (v !== 'other') setDetail(null); }}
            options={[
              { value: 'female', label: t('s2c.gender.female') },
              { value: 'male', label: t('s2c.gender.male') },
              { value: 'other', label: t('s2c.gender.other') },
            ]}
          />
          {gender === 'other' ? (
            <View style={{ marginTop: 12 }}>
              <OptionField
                title={t('s2c.gender.otherTitle')}
                placeholder={t('s2c.gender.pronounsPick')}
                value={detail}
                onChange={setDetail}
                testID="gender-detail"
                options={GENDER_DETAILS.map(v => ({ value: v, label: t(`s2c.gender.detail.${v}`) }))}
              />
            </View>
          ) : (
            <Text style={styles.hint}>{t('s2c.gender.otherHint')}</Text>
          )}

          <View style={{ height: 22 }} />
          <OptionField
            label={t('s2c.gender.pronounsLabel')}
            title={t('s2c.gender.pronounsLabel')}
            placeholder={t('s2c.gender.pronounsPick')}
            value={pronouns}
            onChange={v => { setPronouns(v); if (v !== 'custom') setCustom(''); }}
            testID="pronouns"
            options={PRONOUN_KEYS.map(v => ({ value: v, label: t(`s2c.gender.pronouns.${v}`) }))}
          />
          {pronouns === 'custom' ? (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.label}>{t('s2c.gender.customLabel')}</Text>
              <TextInput
                value={custom}
                onChangeText={setCustom}
                placeholder={t('s2c.gender.customPlaceholder')}
                maxLength={40}
                testID="pronouns-custom"
              />
            </View>
          ) : null}
          <Text style={styles.hint}>{t('s2c.gender.pronounsHint')}</Text>
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.column}>
          <Button
            title={editing ? t('s2c.gender.save') : t('s2c.gender.next')}
            onPress={nothing ? leave : save}
            loading={saving}
            disabled={incomplete}
            testID="gender-next"
          />
          {editing ? null : (
            <TouchableOpacity onPress={leave} style={styles.skip} accessibilityRole="button" testID="gender-skip">
              <Text style={styles.skipText}>{t('s2c.gender.skip')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 28, paddingBottom: 150 },
  column: { width: '100%', maxWidth: 560, alignSelf: 'center' },
  step: { fontSize: 13, fontWeight: '700', color: Colors.Muted, marginBottom: 10 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.Ink, letterSpacing: -0.7, marginBottom: 12 },
  subtitle: { fontSize: 16, lineHeight: 23, color: Colors.Muted, marginBottom: 28 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.Muted, marginBottom: 8 },
  hint: { fontSize: 13, lineHeight: 19, color: Colors.Muted, marginTop: 10 },
  error: { fontSize: 14, color: Colors.SignalRed, marginTop: 12 },
  footer: { position: 'absolute', bottom: 24, left: 24, right: 24 },
  skip: { alignItems: 'center', paddingVertical: 14 },
  skipText: { fontSize: 15, fontWeight: '600', color: Colors.Muted },
});
