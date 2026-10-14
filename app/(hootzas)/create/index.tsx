/**
 * CREATE — WHAT AND WHERE (step 1)
 * Draft only — POST /api/hootzas on step 2
 */

import { useContext, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { NavigationContext } from 'expo-router/react-navigation';
import { ScreenContainer, Button, TextInput } from '../../../src/components';
import { LocationPicker } from '../../../src/components/hootza/LocationPicker';
import { t } from '../../../src/i18n';
import { Colors, FixedColors } from '../../../src/theme/tokens';
import {
  getHootzaCreateDraft,
  getHootzaCreateDraftVersion,
  updateHootzaCreateDraft,
} from '../../../src/state/hootza-create-draft';
import type { VenueType } from '../../../src/api/hootzas';

export default function CreateWhatWhereScreen() {
  const router = useRouter();
  const draft = getHootzaCreateDraft();
  const [title, setTitle] = useState(draft.title);
  const [venueType, setVenueType] = useState<VenueType | null>(draft.venueType);
  const [locationName, setLocationName] = useState(draft.locationName);
  const [pinLat, setPinLat] = useState<number | null>(draft.locationLat);
  const [pinLng, setPinLng] = useState<number | null>(draft.locationLng);
  const [graceText, setGraceText] = useState(draft.endGraceMinutes != null ? String(draft.endGraceMinutes) : '');
  const [description, setDescription] = useState(draft.description);
  const [coverAmount, setCoverAmount] = useState(
    draft.coverChargeAmountCents != null ? String(draft.coverChargeAmountCents / 100) : ''
  );
  const [coverDesc, setCoverDesc] = useState(draft.coverChargeDescription);
  const [chatOn, setChatOn] = useState(draft.chatEnabled);
  const [adultsOnly, setAdultsOnly] = useState(draft.adultsOnly);
  // §28.9: no pre-filled date or time. A restored draft shows its own local values.
  const [startDate, setStartDate] = useState(() =>
    draft.startTimeIso ? localDatePart(new Date(draft.startTimeIso)) : ''
  );
  const [startTime, setStartTime] = useState(() =>
    draft.startTimeIso ? localClockPart(new Date(draft.startTimeIso)) : ''
  );
  const [endTime, setEndTime] = useState(() =>
    draft.scheduledEndTimeIso ? localClockPart(new Date(draft.scheduledEndTimeIso)) : ''
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const navigation = useContext(NavigationContext);
  const shownVersion = useRef(getHootzaCreateDraftVersion());

  // Back on this screen after the draft was posted or replaced: show the
  // current draft instead of fields that would re-post the previous one.
  useEffect(() => {
    if (!navigation) return;
    return navigation.addListener('focus', () => {
      if (shownVersion.current === getHootzaCreateDraftVersion()) return;
      shownVersion.current = getHootzaCreateDraftVersion();
      const current = getHootzaCreateDraft();
      setTitle(current.title);
      setVenueType(current.venueType);
      setLocationName(current.locationName);
      setPinLat(current.locationLat);
      setPinLng(current.locationLng);
      setGraceText(current.endGraceMinutes != null ? String(current.endGraceMinutes) : '');
      setDescription(current.description);
      setCoverAmount(current.coverChargeAmountCents != null ? String(current.coverChargeAmountCents / 100) : '');
      setCoverDesc(current.coverChargeDescription);
      setChatOn(current.chatEnabled);
      setAdultsOnly(current.adultsOnly);
      setStartDate(current.startTimeIso ? localDatePart(new Date(current.startTimeIso)) : '');
      setStartTime(current.startTimeIso ? localClockPart(new Date(current.startTimeIso)) : '');
      setEndTime(current.scheduledEndTimeIso ? localClockPart(new Date(current.scheduledEndTimeIso)) : '');
      setValidationError(null);
    });
  }, [navigation]);

  useEffect(() => {
    const start = parseLocalDateTime(startDate, startTime);
    const end = endTime ? parseLocalDateTime(startDate, endTime) : null;
    const coverDollars = Number(coverAmount);
    updateHootzaCreateDraft({
      title,
      venueType,
      locationName,
      locationLat: pinLat,
      locationLng: pinLng,
      endGraceMinutes: end && /^\d+$/.test(graceText.trim()) ? Number(graceText.trim()) : null,
      description,
      coverChargeAmountCents:
        coverAmount.trim() && Number.isFinite(coverDollars) && coverDollars >= 0
          ? Math.round(coverDollars * 100)
          : null,
      coverChargeDescription: coverDesc,
      chatEnabled: chatOn,
      adultsOnly,
      startTimeIso: start ? start.toISOString() : null,
      scheduledEndTimeIso: end ? end.toISOString() : null,
    });
  }, [title, venueType, locationName, pinLat, pinLng, graceText, description, coverAmount, coverDesc, chatOn, adultsOnly, startDate, startTime, endTime]);

  function next() {
    if (!title.trim()) {
      setValidationError(t('hootzas.create.validationTitle'));
      return;
    }
    if (!venueType) {
      setValidationError(t('hootzas.create.validationVenue'));
      return;
    }
    if (!startDate.trim() || !startTime.trim()) {
      setValidationError(t('hootzas.create.validationWhen'));
      return;
    }
    if (!DATE_RE.test(startDate.trim())) {
      setValidationError(t('hootzas.create.validationDate'));
      return;
    }
    const start = parseLocalDateTime(startDate, startTime);
    if (!start) {
      setValidationError(
        CLOCK_RE.test(startTime.trim()) ? t('hootzas.create.validationDate') : t('hootzas.create.validationTime')
      );
      return;
    }
    if (endTime.trim()) {
      const end = parseLocalDateTime(startDate, endTime);
      if (!end) {
        setValidationError(t('hootzas.create.validationTime'));
        return;
      }
      if (end.getTime() <= start.getTime()) {
        setValidationError(t('hootzas.create.validationEndBeforeStart'));
        return;
      }
    }
    setValidationError(null);
    router.push('/(hootzas)/create/how-it-runs');
  }

  const fromPostAgain = Boolean(draft.postAgainSourceId);

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>{t('hootzas.common.back')}</Text>
          <Text style={styles.header}>{t('hootzas.common.newHootza')}</Text>
          <Text style={styles.step}>{t('hootzas.common.stepOf', { current: 1, total: 2 })}</Text>
        </TouchableOpacity>

        {fromPostAgain && (
          <View style={styles.postAgainBanner} testID="post-again-banner">
            <Text style={styles.bannerTitle}>{t('hootzas.create.postAgainBannerTitle')}</Text>
            <Text style={styles.bannerBody}>{t('hootzas.create.postAgainBannerBody')}</Text>
          </View>
        )}

        <Text style={styles.label}>{t('hootzas.create.whatLabel')}</Text>
        <Text style={styles.hint}>{t('hootzas.create.whatHint')}</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder={t('hootzas.create.calledLabel')}
          testID="create-title"
        />

        <Text style={styles.label}>{t('hootzas.create.whenLabel')}</Text>
        <Text style={styles.hint}>{t('hootzas.create.monthLimit')}</Text>
        <Text style={styles.subLabel}>{t('hootzas.create.dateLabel')}</Text>
        <TextInput
          value={startDate}
          onChangeText={setStartDate}
          placeholder="YYYY-MM-DD"
          testID="create-date"
        />
        <Text style={styles.subLabel}>{t('hootzas.create.startsLabel')}</Text>
        <TextInput
          value={startTime}
          onChangeText={setStartTime}
          placeholder="19:00"
          testID="create-start-time"
        />
        <Text style={styles.subLabel}>{t('hootzas.create.endLabel')}</Text>
        <TextInput
          value={endTime}
          onChangeText={setEndTime}
          placeholder="22:00"
          testID="create-end-time"
        />
        <Text style={styles.hint}>{t('hootzas.create.endHint')}</Text>
        {endTime.trim() ? (
          <>
            <Text style={styles.subLabel}>{t('hootzas.graceLabel')}</Text>
            <TextInput
              value={graceText}
              onChangeText={(v) => setGraceText(v.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              testID="create-grace"
            />
            <Text style={styles.hint}>{t('hootzas.graceHint')}</Text>
          </>
        ) : null}

        <Text style={styles.label}>{t('hootzas.venue.pickOne')}</Text>
        <View style={styles.venueRow}>
          <VenueOption
            selected={venueType === 'public_place'}
            title={t('hootzas.venue.publicPlace')}
            hint={t('hootzas.venue.publicPlaceHint')}
            onPress={() => setVenueType('public_place')}
            testID="venue-public"
          />
          <VenueOption
            selected={venueType === 'private_residence'}
            title={t('hootzas.venue.privateResidence')}
            hint={t('hootzas.venue.privateResidenceHint')}
            onPress={() => setVenueType('private_residence')}
            testID="venue-private"
          />
        </View>

        {venueType === 'private_residence' && (
          <View style={styles.privateBanner}>
            <Text style={styles.bannerTitle}>{t('hootzas.venue.privateBannerTitle')}</Text>
            <Text style={styles.bannerBody}>{t('hootzas.venue.privateBannerBody')}</Text>
          </View>
        )}

        <Text style={styles.label}>{t('hootzas.venue.addressLabel')}</Text>
        <LocationPicker
          name={locationName}
          onName={setLocationName}
          lat={pinLat}
          lng={pinLng}
          onPin={(la, ln) => { setPinLat(la); setPinLng(ln); }}
          placeholder={t('hootzas.venue.addressPlaceholder')}
          testID="create-location"
        />

        <Text style={styles.label}>{t('hootzas.create.detailsLabel')}</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder={t('hootzas.create.detailsLabel')}
          testID="create-description"
        />

        <Text style={styles.label}>
          {t('hootzas.create.coverLabel')}{' '}
          <Text style={styles.optional}>({t('hootzas.create.optional')})</Text>
        </Text>
        <Text style={styles.hint}>{t('hootzas.create.coverHint')}</Text>
        <TextInput
          value={coverAmount}
          onChangeText={setCoverAmount}
          placeholder="$"
          keyboardType="decimal-pad"
          testID="create-cover-amount"
        />
        <TextInput
          value={coverDesc}
          onChangeText={setCoverDesc}
          placeholder={t('hootzas.create.youCollect')}
          testID="create-cover-desc"
        />

        {/* Both are host-set and off by default (RULES §28.18, §28.19); POST /api/hootzas saves them. */}
        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>{t('hootzas.create.chatToggle')}</Text>
            <Text style={styles.toggleHint}>{t('hootzas.create.chatToggleHint')}</Text>
          </View>
          <Switch value={chatOn} onValueChange={setChatOn} accessibilityLabel={t('hootzas.create.chatToggle')} testID="create-chat-toggle" />
        </View>

        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>{t('hootzas.create.adultsToggle')}</Text>
            <Text style={styles.toggleHint}>{t('hootzas.create.adultsToggleHint')}</Text>
          </View>
          <Switch value={adultsOnly} onValueChange={setAdultsOnly} accessibilityLabel={t('hootzas.create.adultsToggle')} testID="create-adults-toggle" />
        </View>

        <Text style={styles.expiry}>{t('hootzas.create.expiryNote')}</Text>

        {validationError ? <Text style={styles.validation}>{validationError}</Text> : null}

        <Button title={t('hootzas.common.next')} onPress={next} testID="create-next" />
      </ScrollView>
    </ScreenContainer>
  );
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const CLOCK_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Local wall-clock date + time → Date, or null if either is not a real value. */
function parseLocalDateTime(date: string, clock: string): Date | null {
  const d = DATE_RE.exec(date.trim());
  const c = CLOCK_RE.exec(clock.trim());
  if (!d || !c) return null;
  const [year, month, day] = [Number(d[1]), Number(d[2]), Number(d[3])];
  const result = new Date(year, month - 1, day, Number(c[1]), Number(c[2]), 0, 0);
  // Reject roll-overs such as 2026-02-31.
  if (result.getFullYear() !== year || result.getMonth() !== month - 1 || result.getDate() !== day) {
    return null;
  }
  return result;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function localDatePart(d: Date): string {
  return Number.isNaN(d.getTime()) ? '' : `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function localClockPart(d: Date): string {
  return Number.isNaN(d.getTime()) ? '' : `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function VenueOption({
  selected,
  title,
  hint,
  onPress,
  testID,
}: {
  selected: boolean;
  title: string;
  hint: string;
  onPress: () => void;
  testID: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.venueOption, selected && styles.venueSelected]}
      onPress={onPress}
      testID={testID}
    >
      <Text style={styles.venueTitle}>{title}</Text>
      <Text style={styles.venueHint}>{hint}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  scroll: { paddingBottom: 32, paddingHorizontal: 22, gap: 10 },
  back: { paddingVertical: 12, marginHorizontal: -22, paddingHorizontal: 22 },
  backText: { fontSize: 17, color: Colors.Ink, fontWeight: '600' },
  header: { fontSize: 17, fontWeight: '800', color: Colors.Ink, marginTop: 8 },
  step: { fontSize: 13, color: Colors.Faint, marginTop: 2 },
  postAgainBanner: {
    backgroundColor: Colors.Bone,
    borderRadius: 14,
    padding: 14,
    gap: 4,
    marginBottom: 8,
  },
  privateBanner: {
    backgroundColor: Colors.Bone,
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  bannerTitle: { fontSize: 15, fontWeight: '700', color: Colors.Ink },
  bannerBody: { fontSize: 13, lineHeight: 18, color: Colors.Muted },
  label: { fontSize: 15, fontWeight: '700', color: Colors.Ink, marginTop: 8 },
  subLabel: { fontSize: 13, fontWeight: '600', color: Colors.Muted, marginTop: 6 },
  hint: { fontSize: 13, lineHeight: 18, color: Colors.Muted },
  optional: { fontWeight: '400', color: Colors.Faint },
  venueRow: { flexDirection: 'row', gap: 10 },
  venueOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.Line,
    borderRadius: 14,
    padding: 12,
  },
  venueSelected: { borderColor: FixedColors.hootza, borderWidth: 1.5 },
  venueTitle: { fontSize: 14, fontWeight: '700', color: Colors.Ink },
  venueHint: { fontSize: 12, color: Colors.Muted, marginTop: 2 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: Colors.Hairline,
  },
  toggleTitle: { fontSize: 15, fontWeight: '700', color: Colors.Ink },
  toggleHint: { fontSize: 13, color: Colors.Muted, marginTop: 2 },
  expiry: { fontSize: 13, color: Colors.Faint, textAlign: 'center', marginVertical: 8 },
  validation: { fontSize: 15, color: Colors.Ink, textAlign: 'center' },
});
