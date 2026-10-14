/**
 * CREATE — WHAT AND WHERE (step 1)
 * Draft only — POST /api/hootzas on step 2
 */

import { useEffect, useState } from 'react';
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
import {
  getHootzaCreateDraft,
  updateHootzaCreateDraft,
} from '../../../src/state/hootza-create-draft';
import type { VenueType } from '../../../src/api/hootzas';

export default function CreateWhatWhereScreen() {
  const router = useRouter();
  const draft = getHootzaCreateDraft();
  const [title, setTitle] = useState(draft.title);
  const [venueType, setVenueType] = useState<VenueType | null>(draft.venueType);
  const [locationName, setLocationName] = useState(draft.locationName);
  const [description, setDescription] = useState(draft.description);
  const [coverAmount, setCoverAmount] = useState(
    draft.coverChargeAmountCents != null ? String(draft.coverChargeAmountCents / 100) : ''
  );
  const [coverDesc, setCoverDesc] = useState(draft.coverChargeDescription);
  const [startDate, setStartDate] = useState(() => {
    if (draft.startTimeIso) return draft.startTimeIso.slice(0, 10);
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [startTime, setStartTime] = useState(() => {
    if (draft.startTimeIso) return draft.startTimeIso.slice(11, 16);
    return '19:00';
  });
  const [endTime, setEndTime] = useState(() => {
    if (draft.scheduledEndTimeIso) return draft.scheduledEndTimeIso.slice(11, 16);
    return '';
  });
  const [adultsOnly, setAdultsOnly] = useState(false);
  const [chatEnabled, setChatEnabled] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const startIso = startDate && startTime ? `${startDate}T${startTime}:00` : null;
    const endIso = startDate && endTime ? `${startDate}T${endTime}:00` : null;
    updateHootzaCreateDraft({
      title,
      venueType,
      locationName,
      description,
      coverChargeAmountCents: coverAmount ? Math.round(parseFloat(coverAmount) * 100) : null,
      coverChargeDescription: coverDesc,
      startTimeIso: startIso ? new Date(startIso).toISOString() : null,
      scheduledEndTimeIso: endIso ? new Date(endIso).toISOString() : null,
    });
  }, [title, venueType, locationName, description, coverAmount, coverDesc, startDate, startTime, endTime]);

  function next() {
    if (!title.trim()) {
      setValidationError(t('hootzas.create.validationTitle'));
      return;
    }
    if (!venueType) {
      setValidationError(t('hootzas.create.validationVenue'));
      return;
    }
    if (!startDate || !startTime) {
      setValidationError(t('hootzas.create.validationWhen'));
      return;
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
        <TextInput
          value={locationName}
          onChangeText={setLocationName}
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

        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>{t('hootzas.create.chatToggle')}</Text>
            <Text style={styles.toggleHint}>{t('hootzas.create.chatToggleHint')}</Text>
          </View>
          <Switch
            value={chatEnabled}
            onValueChange={setChatEnabled}
            testID="create-chat-toggle"
          />
        </View>

        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>{t('hootzas.create.adultsToggle')}</Text>
            <Text style={styles.toggleHint}>{t('hootzas.create.adultsToggleHint')}</Text>
          </View>
          <Switch
            value={adultsOnly}
            onValueChange={setAdultsOnly}
            testID="create-adults-toggle"
          />
        </View>

        <Text style={styles.expiry}>{t('hootzas.create.expiryNote')}</Text>

        {validationError ? <Text style={styles.validation}>{validationError}</Text> : null}

        <Button title={t('hootzas.common.next')} onPress={next} testID="create-next" />
      </ScrollView>
    </ScreenContainer>
  );
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
