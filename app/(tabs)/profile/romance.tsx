/**
 * ROMANCE SETTINGS (Settings → What you share → Romance; NEW-ONB-08; RULES §13.14-13.38)
 *
 * Looking for (Men / Women / Anyone), the age range, and "Romantic nudges only". All private: nothing
 * here is ever shown to anybody, and nobody is told it was turned on (§13.37). No orientation label is
 * collected (§13.20). Matching needs the person's own gender too (§13.33), so without one the screen says
 * so and links to Gender and pronouns. A mismatch still produces an ordinary hello (§13.18).
 * Reads GET /users/me and GET /users/me/notification-preferences; saves PATCH /users/me and
 * PUT /users/me/notification-preferences (migration 075). The matching producer itself is not built:
 * discovery is an open owner ruling (RULES §8.2-8.3), so this stores the choices only.
 */
import { useEffect, useMemo, useState } from 'react';
import { Switch, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../src/theme';
import { t } from '../../../src/i18n';
import { SubScreen, subStyles } from '../../../src/components/account/SubScreen';
import { OptionField, RadioRow } from '../../../src/components/consumer/OptionSheet';
import { useLoader } from '../../../src/lib/use-loader';
import { api } from '../../../src/api/client';
import { getPublicConfig, getRomanticPreference, saveRomanticPreference } from '../../../src/api/account';

type Me = { gender?: string | null; romanceLookingFor?: string | null; romanceMinAge?: number | null; romanceMaxAge?: number | null; romanceEnabled?: boolean };
const AGE_CEILING = 100;

export default function RomanceScreen() {
  const router = useRouter();
  const loader = useLoader<{ me: Me; nudgesOnly: boolean; floor: number | null }>(async () => {
    const [me, prefs, cfg] = await Promise.all([api.user.getProfile(), getRomanticPreference(), getPublicConfig()]);
    if (me.error || !me.data) return { error: me.error ?? { message: 'load' } };
    return {
      data: {
        me: me.data as Me,
        nudgesOnly: prefs.data?.preferences?.romanticNudgesOnly === true,
        floor: cfg.data && Number.isInteger(cfg.data.minimumAge) ? cfg.data.minimumAge : null,
      },
    };
  });
  const [lookingFor, setLookingFor] = useState<string | null>(null);
  const [minAge, setMinAge] = useState<string | null>(null);
  const [maxAge, setMaxAge] = useState<string | null>(null);
  const [nudgesOnly, setNudgesOnly] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loader.data && !seeded) {
      const { me } = loader.data;
      setLookingFor(me.romanceLookingFor ?? null);
      setMinAge(me.romanceMinAge != null ? String(me.romanceMinAge) : null);
      setMaxAge(me.romanceMaxAge != null ? String(me.romanceMaxAge) : null);
      setNudgesOnly(loader.data.nudgesOnly);
      setSeeded(true);
    }
  }, [loader.data, seeded]);

  const floor = loader.data?.floor ?? 18;
  const ages = useMemo(
    () => Array.from({ length: AGE_CEILING - floor + 1 }, (_, i) => ({ value: String(floor + i), label: String(floor + i) })),
    [floor],
  );
  const hasGender = Boolean(loader.data?.me.gender);
  const orderBad = minAge !== null && maxAge !== null && Number(minAge) > Number(maxAge);
  const complete = lookingFor !== null && minAge !== null && maxAge !== null && !orderBad;

  async function save() {
    if (saving || !complete) return;
    setSaving(true);
    setError(null);
    const res = await api.user.updateProfile({
      romanceEnabled: true,
      romanceLookingFor: lookingFor,
      romanceMinAge: Number(minAge),
      romanceMaxAge: Number(maxAge),
    });
    const pref = res.error ? null : await saveRomanticPreference(nudgesOnly);
    setSaving(false);
    if (res.error || pref?.error) {
      setError(t('s2c.romance.saveFailed'));
      return;
    }
    router.back();
  }

  async function clearAll() {
    if (saving) return;
    setSaving(true);
    setError(null);
    const res = await api.user.updateProfile({ romanceEnabled: false, romanceLookingFor: null, romanceMinAge: null, romanceMaxAge: null });
    const pref = res.error ? null : await saveRomanticPreference(false);
    setSaving(false);
    if (res.error || pref?.error) {
      setError(t('s2c.romance.saveFailed'));
      return;
    }
    router.back();
  }

  return (
    <SubScreen
      title={t('s2c.romance.title')}
      state={loader.state}
      onRetry={loader.retry}
      footer={
        <TouchableOpacity
          style={[subStyles.primary, (!complete || saving) && subStyles.disabled]}
          disabled={!complete || saving}
          onPress={() => void save()}
          accessibilityRole="button"
          testID="romance-save"
        >
          <Text style={subStyles.primaryText}>{saving ? t('s2c.common.saving') : t('s2c.common.save')}</Text>
        </TouchableOpacity>
      }
    >
      <Text style={subStyles.intro}>{t('s2c.romance.intro')}</Text>

      {!hasGender ? (
        <View style={subStyles.card}>
          <Text style={[subStyles.rowHint, { paddingVertical: 12 }]}>{t('s2c.romance.needGender')}</Text>
          <TouchableOpacity
            onPress={() => router.push('/(onboarding)/gender?edit=1' as never)}
            accessibilityRole="button"
            style={{ paddingBottom: 14 }}
            testID="romance-add-gender"
          >
            <Text style={[subStyles.rowLabel, { textDecorationLine: 'underline' }]}>{t('s2c.romance.addGender')}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <Text style={subStyles.rowHint}>{t('s2c.romance.lookingFor')}</Text>
      <View style={{ height: 8 }} />
      <RadioRow
        testIDPrefix="romance-looking"
        value={lookingFor}
        onChange={setLookingFor}
        options={[
          { value: 'men', label: t('s2c.romance.men') },
          { value: 'women', label: t('s2c.romance.women') },
          { value: 'anyone', label: t('s2c.romance.anyone') },
        ]}
      />
      <Text style={[subStyles.note, { marginBottom: 18 }]}>{t('s2c.romance.anyoneHint')}</Text>

      <Text style={subStyles.rowHint}>{t('s2c.romance.ageRange')}</Text>
      <View style={{ height: 8 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <OptionField compact title={t('s2c.romance.pickAge')} placeholder={t('s2c.romance.pickAge')} options={ages} value={minAge} onChange={setMinAge} testID="romance-min-age" />
        <Text style={subStyles.rowLabel}>{t('s2c.romance.to')}</Text>
        <OptionField compact title={t('s2c.romance.pickAge')} placeholder={t('s2c.romance.pickAge')} options={ages} value={maxAge} onChange={setMaxAge} testID="romance-max-age" />
      </View>
      {orderBad ? <Text style={subStyles.error} accessibilityRole="alert">{t('s2c.romance.ageOrder')}</Text> : null}
      <Text style={[subStyles.note, { marginBottom: 18 }]}>{t('s2c.romance.ageHint')}</Text>

      <View style={[subStyles.card, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 }]}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={subStyles.rowLabel}>{t('s2c.romance.nudgesOnly')}</Text>
          <Text style={subStyles.rowHint}>{t('s2c.romance.nudgesOnlyHint')}</Text>
        </View>
        <Switch value={nudgesOnly} onValueChange={setNudgesOnly} accessibilityLabel={t('s2c.romance.nudgesOnly')} testID="romance-nudges-only" />
      </View>

      <Text style={subStyles.note}>{t('s2c.romance.mismatch')}</Text>
      {error ? <Text style={subStyles.error} accessibilityRole="alert">{error}</Text> : null}
      {loader.data?.me.romanceEnabled ? (
        <TouchableOpacity onPress={() => void clearAll()} accessibilityRole="button" style={{ paddingVertical: 18 }} testID="romance-clear">
          <Text style={[subStyles.rowLabel, { color: Colors.Muted, textDecorationLine: 'underline' }]}>{t('s2c.romance.clear')}</Text>
        </TouchableOpacity>
      ) : null}
    </SubScreen>
  );
}
