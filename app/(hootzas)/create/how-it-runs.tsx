/**
 * CREATE — HOW IT RUNS (step 2)
 * POST /api/hootzas
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button, TextInput } from '../../../src/components';
import { t } from '../../../src/i18n';
import { Colors, FixedColors } from '../../../src/theme/tokens';
import { createHootza } from '../../../src/api/hootzas';
import {
  draftToCreateInput,
  getHootzaCreateDraft,
  updateHootzaCreateDraft,
} from '../../../src/state/hootza-create-draft';

function defaultStart(): Date {
  const d = new Date();
  d.setHours(d.getHours() + 2, 0, 0, 0);
  return d;
}

export default function CreateHowItRunsScreen() {
  const router = useRouter();
  const [hostModeEnabled, setHostModeEnabled] = useState(() => getHootzaCreateDraft().hostModeEnabled);
  const [intervalMinutes, setIntervalMinutes] = useState(() =>
    String(getHootzaCreateDraft().intervalMinutes)
  );
  const [windowLengthMinutes, setWindowLengthMinutes] = useState(() =>
    String(getHootzaCreateDraft().windowLengthMinutes)
  );
  const [posting, setPosting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  async function postIt() {
    const current = getHootzaCreateDraft();
    const start = current.startTimeIso ? new Date(current.startTimeIso) : defaultStart();
    const interval = Math.max(1, parseInt(intervalMinutes, 10) || 45);
    const windowLen = Math.max(1, parseInt(windowLengthMinutes, 10) || 10);

    updateHootzaCreateDraft({
      hostModeEnabled,
      intervalMinutes: interval,
      windowLengthMinutes: windowLen,
      startTimeIso: start.toISOString(),
    });

    const input = draftToCreateInput(getHootzaCreateDraft());
    if (!input) {
      setValidationError(t('hootzas.create.validationWhen'));
      return;
    }

    setPosting(true);
    setValidationError(null);
    const res = await createHootza(input);
    setPosting(false);

    if (res.error || !res.data?.hootza) {
      router.push('/(hootzas)/create/post-error');
      return;
    }

    router.replace(`/(hootzas)/${res.data.hootza.id}`);
  }

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>{t('hootzas.common.back')}</Text>
          <Text style={styles.header}>{t('hootzas.howItRuns.title')}</Text>
          <Text style={styles.step}>{t('hootzas.common.stepOf', { current: 2, total: 2 })}</Text>
        </TouchableOpacity>

        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>{t('hootzas.howItRuns.hostModeToggle')}</Text>
            <Text style={styles.toggleHint}>{t('hootzas.howItRuns.hostModeToggleHint')}</Text>
          </View>
          <Switch
            value={hostModeEnabled}
            onValueChange={setHostModeEnabled}
            testID="host-mode-enabled"
          />
        </View>

        {hostModeEnabled && (
          <View style={styles.intervalRow}>
            <View style={styles.intervalBox}>
              <Text style={styles.intervalLabel}>{t('hootzas.howItRuns.every')}</Text>
              <TextInput
                value={intervalMinutes}
                onChangeText={setIntervalMinutes}
                keyboardType="number-pad"
                testID="host-mode-interval"
              />
              <Text style={styles.intervalValue}>{t('hootzas.howItRuns.minutes')}</Text>
            </View>
            <View style={styles.intervalBox}>
              <Text style={styles.intervalLabel}>{t('hootzas.howItRuns.openFor')}</Text>
              <TextInput
                value={windowLengthMinutes}
                onChangeText={setWindowLengthMinutes}
                keyboardType="number-pad"
                testID="host-mode-window"
              />
              <Text style={styles.intervalValue}>{t('hootzas.howItRuns.minutes')}</Text>
            </View>
          </View>
        )}

        {validationError ? <Text style={styles.validation}>{validationError}</Text> : null}

        <Button
          title={posting ? t('hootzas.howItRuns.posting') : t('hootzas.common.postIt')}
          onPress={postIt}
          loading={posting}
          testID="create-post-it"
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  scroll: { paddingBottom: 32, paddingHorizontal: 22, gap: 16 },
  back: { paddingVertical: 12, marginHorizontal: -22, paddingHorizontal: 22 },
  backText: { fontSize: 17, color: Colors.Ink, fontWeight: '600' },
  header: { fontSize: 17, fontWeight: '800', color: Colors.Ink, marginTop: 8 },
  step: { fontSize: 13, color: Colors.Faint, marginTop: 2 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  toggleTitle: { fontSize: 15, fontWeight: '700', color: Colors.Ink },
  toggleHint: { fontSize: 13, color: Colors.Muted, marginTop: 2 },
  intervalRow: { flexDirection: 'row', gap: 10 },
  intervalBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.Line,
    borderRadius: 14,
    padding: 14,
  },
  intervalLabel: { fontSize: 12, color: Colors.Faint },
  intervalValue: { fontSize: 16, fontWeight: '700', color: Colors.Ink, marginTop: 4 },
  validation: { fontSize: 15, color: Colors.Ink, textAlign: 'center' },
});
