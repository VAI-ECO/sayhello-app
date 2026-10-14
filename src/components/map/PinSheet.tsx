/**
 * The enlarged pin sheet (CANON-RL-01-SN-33; delivered "Map and Pins" pin
 * sheet · phone and "1 The Hello — Pin · selfie sheet").
 *
 * Names on the sheet and on the photo (§10.40); a deleted person reads
 * "a Say Hello member" (§10.10). "Where" is a place name, never a distance
 * (§8.12). The selfie is the server's signed URL, after reveal (§10.43).
 * Removal is a support action handled by a person — no button here (§10.11).
 * The server returns pins only after reveal; anything else reads as not on the map.
 */

import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { t } from '../../i18n';
import { Colors } from '../../theme';
import { getPinDetail, type PinDetail } from '../../api/map';
import { getConnectionNotes } from '../../api/hellos';

function formatWhen(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

/** `panel`: tablet/desktop fixed side panel (the map stays uncovered) instead of the phone's bottom sheet. */
export function PinSheet({ pinId, onClose, panel = false }: { pinId: string; onClose: () => void; panel?: boolean }) {
  const router = useRouter();
  const [pin, setPin] = useState<PinDetail | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState('loading');
    setError(null);
    const res = await getPinDetail(pinId);
    if (res.error) {
      if (res.error.status === 404) { setState('missing'); return; }
      setError(res.error.message || t('map.common.failed'));
      setState('error');
      return;
    }
    setPin(res.data?.pin ?? null);
    setState(res.data?.pin ? 'ready' : 'missing');
  }, [pinId]);

  useEffect(() => { void load(); }, [load]);

  // The viewer's own note about this connection (DESIGN-BRIEF-11 req. 10). Whether a note may be shown to other people is
  // UNRULED (req. 12), and GET /hellos/:id/notes returns only the caller's note, so only a participant is asked and only
  // their own note appears. A failed read shows nothing (the connection screen has the editor and the honest error).
  const [myNote, setMyNote] = useState<string | null>(null);
  const participantPinId = pin?.viewerIsParticipant ? pin.id : null;
  useEffect(() => {
    setMyNote(null);
    if (!participantPinId) return;
    let cancelled = false;
    void getConnectionNotes(participantPinId).then((res) => {
      if (cancelled || res.error) return;
      const first = res.data?.notes?.[0];
      const text = (first?.noteText ?? first?.note_text ?? '').trim();
      setMyNote(text || null);
    });
    return () => { cancelled = true; };
  }, [participantPinId]);

  const [a, b] = pin?.people ?? [];
  const names = a && b ? `${a.displayName} ${t('map.pinSheet.and')} ${b.displayName}` : '';

  return (
    <View style={[styles.sheet, panel && styles.sheetPanel]} testID="pin-sheet">
      {panel ? null : <View style={styles.handle} />}
      <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel={t('map.pinSheet.close')} style={styles.close}>
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>

      {state === 'loading' ? <ActivityIndicator color={Colors.Ink} /> : null}
      {state === 'missing' ? <Text style={styles.muted}>{t('map.pinSheet.notAvailable')}</Text> : null}
      {state === 'error' ? (
        <TouchableOpacity onPress={() => void load()} accessibilityRole="button">
          <Text accessibilityRole="alert" style={styles.muted}>{error} {t('map.common.retry')}</Text>
        </TouchableOpacity>
      ) : null}

      {state === 'ready' && pin ? (
        <>
          <View style={styles.header}>
            <View style={[styles.teardrop, { backgroundColor: a?.identityColor ?? Colors.Ink }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.names} testID="pin-names">{names}</Text>
              <Text style={styles.muted}>
                {t('map.pinSheet.saidHelloHere')}
              </Text>
            </View>
          </View>

          {pin.selfieUrl ? (
            <View style={styles.photo}>
              <Image source={{ uri: pin.selfieUrl }} style={StyleSheet.absoluteFill} accessibilityLabel={t('map.pinSheet.selfieLabel')} testID="pin-selfie" />
              <View style={styles.photoNames}>
                {[a, b].filter(Boolean).map((p, i) => (
                  <View key={i} style={styles.photoName}>
                    <View style={[styles.dot, { backgroundColor: p!.identityColor ?? Colors.Chalk }]} />
                    <Text style={styles.photoNameText}>{p!.displayName}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.rows}>
            {pin.locationName ? (
              <View style={styles.row}>
                <Text style={styles.rowLabel}>{t('map.pinSheet.labelWhere')}</Text>
                <Text style={styles.rowValue}>{pin.locationName}</Text>
              </View>
            ) : null}
            {pin.hangoutName ? (
              <TouchableOpacity
                style={styles.row}
                disabled={!pin.directoryId}
                onPress={() => pin.directoryId && router.push({ pathname: '/(hangout)/directory/[id]', params: { id: pin.directoryId } })}
                accessibilityRole={pin.directoryId ? 'button' : undefined}
                testID="pin-hangout-row"
              >
                <Text style={styles.rowLabel}>{t('map.pinSheet.labelHangout')}</Text>
                <Text style={styles.rowValue}>{pin.hangoutName}</Text>
              </TouchableOpacity>
            ) : null}
            {pin.metAt ? (
              <View style={styles.row}>
                <Text style={styles.rowLabel}>{t('map.pinSheet.labelWhen')}</Text>
                <Text style={styles.rowValue}>{formatWhen(pin.metAt)}</Text>
              </View>
            ) : null}
          </View>

          {myNote ? (
            <View style={styles.myNote} testID="pin-my-note">
              <Text style={styles.rowLabel}>{t('connectionLink.yourNote')}</Text>
              <Text style={styles.myNoteText}>{myNote}</Text>
            </View>
          ) : null}

          {/* From a pin to its connection (DESIGN-BRIEF-11 req. 14): only for the two people in the Hello; the server says so. */}
          {pin.viewerIsParticipant ? (
            <TouchableOpacity
              style={styles.connectionLink}
              onPress={() => router.push({ pathname: '/(tabs)/hellos/[id]', params: { id: pin.id } })}
              accessibilityRole="button"
              testID="pin-open-connection"
            >
              <Text style={styles.connectionLinkText}>{t('connectionLink.openConnection')}</Text>
            </TouchableOpacity>
          ) : null}

          <Text style={styles.permanence}>{t('map.pinSheet.permanence')}</Text>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: Colors.Chalk,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 26,
    gap: 14,
    shadowColor: '#1F1E1C',
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -8 },
  },
  sheetPanel: { flex: 1, borderTopLeftRadius: 0, borderTopRightRadius: 0, paddingHorizontal: 24, paddingTop: 30, shadowOpacity: 0 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.Line, alignSelf: 'center' },
  close: { position: 'absolute', top: 6, right: 14, padding: 8 },
  closeText: { fontSize: 22, color: Colors.Muted },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  teardrop: {
    width: 26,
    height: 26,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    borderBottomRightRadius: 13,
    borderBottomLeftRadius: 0,
    transform: [{ rotate: '-45deg' }],
  },
  names: { fontSize: 19, fontWeight: '700', color: Colors.Ink, letterSpacing: -0.4 },
  muted: { fontSize: 14, color: Colors.Muted },
  photo: { width: '100%', aspectRatio: 4 / 3, borderRadius: 14, overflow: 'hidden', backgroundColor: '#2E2C29', justifyContent: 'flex-end' },
  photoNames: { flexDirection: 'row', gap: 10, padding: 12, backgroundColor: 'rgba(31,30,28,0.6)' },
  photoName: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 18, height: 18, borderRadius: 9 },
  photoNameText: { fontSize: 14, fontWeight: '600', color: Colors.Chalk },
  rows: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F1EFEC' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, gap: 12 },
  rowLabel: { fontSize: 15, color: Colors.Muted },
  rowValue: { fontSize: 15, fontWeight: '600', color: Colors.Ink, flexShrink: 1, textAlign: 'right' },
  myNote: { gap: 4 },
  myNoteText: { fontSize: 15, lineHeight: 21, color: Colors.Ink },
  connectionLink: { minHeight: 44, justifyContent: 'center' },
  connectionLinkText: { fontSize: 15, fontWeight: '700', color: Colors.Ink },
  permanence: { fontSize: 13.5, lineHeight: 20, color: Colors.Muted },
});
