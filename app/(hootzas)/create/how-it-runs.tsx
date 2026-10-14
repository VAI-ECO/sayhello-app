/**
 * CREATE — HOW IT RUNS (step 2)
 * POST /api/hootzas
 */

import { useEffect, useRef, useState } from 'react';
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
import { createOrgEvent } from '../../../src/api/organizations';
import {
  draftToCreateInput,
  draftToOrgEventInput,
  getHootzaCreateDraft,
  isPositiveWholeMinutes,
  resetHootzaCreateDraft,
  updateHootzaCreateDraft,
} from '../../../src/state/hootza-create-draft';
import { hootzaErrorMessage } from '../../../src/lib/hootza-errors';

function minutesText(value: number | null): string {
  return value == null ? '' : String(value);
}

/** Whole positive minutes only; anything else is null, never a substituted default. */
function parseMinutes(text: string): number | null {
  const trimmed = text.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return isPositiveWholeMinutes(value) ? value : null;
}

export default function CreateHowItRunsScreen() {
  const router = useRouter();
  const [hostModeEnabled, setHostModeEnabled] = useState(() => getHootzaCreateDraft().hostModeEnabled);
  const [intervalMinutes, setIntervalMinutes] = useState(() =>
    minutesText(getHootzaCreateDraft().intervalMinutes)
  );
  const [windowLengthMinutes, setWindowLengthMinutes] = useState(() =>
    minutesText(getHootzaCreateDraft().windowLengthMinutes)
  );
  const [posting, setPosting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  // Posting as a group (CANON-RL-01-SN-75): the feed choice draws one of the group's free posts.
  const postingAsOrgId = getHootzaCreateDraft().postingAsOrganizationId;
  const freePostsLeft = getHootzaCreateDraft().postingAsFreePostsLeft ?? 0;
  const [postToFeed, setPostToFeed] = useState(() => getHootzaCreateDraft().postToFeed && freePostsLeft > 0);
  const busy = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  async function postIt() {
    if (busy.current) return;
    const interval = parseMinutes(intervalMinutes);
    const windowLen = parseMinutes(windowLengthMinutes);

    updateHootzaCreateDraft({
      hostModeEnabled,
      intervalMinutes: interval,
      windowLengthMinutes: windowLen,
      postToFeed,
    });

    if (hostModeEnabled && (interval == null || windowLen == null)) {
      setValidationError(t('hootzas.howItRuns.validationMinutes'));
      return;
    }

    // Step 1 owns the start time; a missing one is sent back there, never invented.
    const draft = getHootzaCreateDraft();
    const orgInput = postingAsOrgId ? draftToOrgEventInput(draft) : null;
    const personalInput = postingAsOrgId ? null : draftToCreateInput(draft);
    if (!orgInput && !personalInput) {
      setValidationError(t('hootzas.create.validationWhen'));
      return;
    }

    busy.current = true;
    setPosting(true);
    setValidationError(null);
    const res = orgInput && postingAsOrgId
      ? await createOrgEvent(postingAsOrgId, orgInput)
      : await createHootza(personalInput!);
    busy.current = false;
    if (!mounted.current) return;
    setPosting(false);

    if (res.error || !res.data?.hootza) {
      // The group closed, or its free posts ran out between the choice and Post: plain stops, kept on this screen.
      if (res.error?.code === 'organization_closed') { setValidationError(t('l06.events.closedGroup')); return; }
      if (res.error?.code === 'out_of_free_posts') { setPostToFeed(false); setValidationError(t('organizations.events.compose.outOfPosts')); return; }
      // A refused form (e.g. further out than the schedule-ahead limit) will
      // refuse again on retry, so say why here. Transport and server failures
      // keep the draft and go to the retry screen.
      if (res.error?.status === 400) {
        setValidationError(
          t('hootzas.howItRuns.postFailed', {
            message: hootzaErrorMessage(res.error, t('hootzas.errors.invalidInput')),
          })
        );
        return;
      }
      router.push('/(hootzas)/create/post-error');
      return;
    }

    resetHootzaCreateDraft();
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

        {postingAsOrgId ? (
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>{t('l06.posting.feedTitle')}</Text>
              <Text style={styles.toggleHint}>
                {freePostsLeft > 0 ? t('l06.posting.feedBody') : t('organizations.events.compose.feedNone')}
              </Text>
            </View>
            <Switch
              value={postToFeed && freePostsLeft > 0}
              onValueChange={setPostToFeed}
              disabled={freePostsLeft <= 0}
              accessibilityLabel={t('l06.posting.feedTitle')}
              testID="post-as-group-feed"
            />
          </View>
        ) : null}

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
