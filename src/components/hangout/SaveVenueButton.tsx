/** Save / Saved toggle on a Hello Hangout page. Private to the member (S3/080). Optimistic, rolls back on error. */
import { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { t } from '../../i18n';
import { Colors } from '../../theme';
import { saveVenue, unsaveVenue } from '../../api/hangout-business';

export function SaveVenueButton({ id, initial }: { id: string; initial: boolean }) {
  const [saved, setSaved] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    const next = !saved;
    setBusy(true);
    setSaved(next);
    const res = next ? await saveVenue(id) : await unsaveVenue(id);
    setBusy(false);
    if (res.error) setSaved(!next);
  }

  return (
    <TouchableOpacity
      style={[styles.button, saved && styles.on]}
      onPress={() => void toggle()}
      accessibilityRole="button"
      accessibilityState={{ selected: saved }}
      testID="save-venue"
    >
      <Text style={[styles.text, saved && styles.textOn]}>{saved ? t('hangoutBiz.saved.unsave') : t('hangoutBiz.saved.save')}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { alignSelf: 'flex-start', borderWidth: 1, borderColor: Colors.Ink, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 16, marginBottom: 12 },
  on: { backgroundColor: Colors.Ink },
  text: { fontSize: 14, fontWeight: '700', color: Colors.Ink },
  textOn: { color: Colors.Chalk },
});
