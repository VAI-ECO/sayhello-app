/**
 * CONNECTION DETAIL — notes for one hello
 *
 * WIRE: GET/POST/DELETE /hellos/:id/notes. Live (wired to the API); pixel pass against the design frames still open.
 * Never shows peer identity here — notes only (§10.6).
 */

import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../../src/components';
import { Colors } from '../../../src/theme';
import {
  deleteConnectionNote,
  getConnectionNotes,
  saveConnectionNote,
  type ConnectionNote,
} from '../../../src/api/hellos';

export default function ConnectionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const helloId = String(id ?? '');

  const [notes, setNotes] = useState<ConnectionNote[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!helloId) return;
    setLoading(true);
    setError(null);
    const result = await getConnectionNotes(helloId);
    if (result.error) {
      setError(result.error.message);
      setNotes([]);
    } else {
      const list = result.data?.notes ?? [];
      setNotes(list);
      setDraft(list[0]?.noteText ?? list[0]?.note_text ?? '');
    }
    setLoading(false);
  }, [helloId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onSave = async () => {
    const text = draft.trim();
    if (!text || !helloId) return;
    setSaving(true);
    setError(null);
    const result = await saveConnectionNote(helloId, text);
    setSaving(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    await load();
  };

  const onDelete = async () => {
    if (!helloId) return;
    setSaving(true);
    setError(null);
    const result = await deleteConnectionNote(helloId);
    setSaving(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    setDraft('');
    await load();
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.Ink} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} testID="connection-back">
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Connection note</Text>
        <Text style={styles.hint}>Private to you. The other person does not see this.</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          multiline
          placeholder="Add a note"
          placeholderTextColor={Colors.Ink + '66'}
          testID="connection-note-input"
        />

        <Button
          title={saving ? 'Saving…' : 'Save note'}
          onPress={onSave}
          disabled={saving || draft.trim().length === 0}
          testID="connection-note-save"
        />

        {notes.length > 0 ? (
          <Button
            title="Delete note"
            onPress={onDelete}
            disabled={saving}
            variant="secondary"
            testID="connection-note-delete"
          />
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { gap: 12, paddingBottom: 40 },
  back: { fontSize: 17, fontWeight: '600', color: Colors.Ink, marginBottom: 8 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.Ink,
    letterSpacing: -0.7,
  },
  hint: {
    fontSize: 14,
    color: Colors.Ink,
    opacity: 0.65,
    lineHeight: 20,
  },
  input: {
    minHeight: 120,
    borderWidth: 2,
    borderColor: Colors.Ink,
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
    color: Colors.Ink,
    textAlignVertical: 'top',
    backgroundColor: Colors.Chalk,
  },
  error: { fontSize: 14, color: Colors.SignalRed },
});
