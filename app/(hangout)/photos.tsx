/**
 * HELLO HANGOUT PHOTOS — the owner's business photos (S3 stage 06; API 080).
 * GET/POST/DELETE /hello-hangouts/:id/photos. Bytes go up as the picker's own bytes with the content type
 * read from them; the server strips location from JPEGs and refuses anything that is not an image.
 * Ownership is the server's call. States: loading, empty, error+retry, uploading, limit, permission.
 */
import { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image, Platform } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { deletePhoto, listPhotos, uploadPhoto, type BusinessPhoto } from '../../src/api/hangout-business';
import { toArrayBuffer } from '../../src/lib/photo-bytes';
import { toUploadablePhoto } from '../../src/lib/photo-normalize';

const PICKER: ImagePicker.ImagePickerOptions = { allowsEditing: true, aspect: [4, 3], quality: 0.8, base64: true }; // quality < 1: iOS delivers JPEG, not HEIC

export default function HangoutPhotosScreen() {
  const router = useRouter();
  const { helloHangoutId } = useLocalSearchParams<{ helloHangoutId?: string }>();
  const [photos, setPhotos] = useState<BusinessPhoto[]>([]);
  const [max, setMax] = useState<number | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error' | 'unavailable'>('loading');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const inFlight = useRef(false);

  const load = useCallback(async () => {
    if (!helloHangoutId) { setState('error'); return; }
    const res = await listPhotos(helloHangoutId);
    if (res.error) { setState(res.error.status === 503 ? 'unavailable' : 'error'); return; }
    setPhotos(res.data?.photos ?? []);
    setMax(res.data?.max ?? null);
    setState('ready');
  }, [helloHangoutId]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const atLimit = max !== null && max > 0 && photos.length >= max;

  async function pick(source: 'camera' | 'library') {
    if (!helloHangoutId || inFlight.current || atLimit) return;
    const perm = source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') { setMessage(t('hangoutBiz.photos.permission')); return; }
    const result = source === 'camera' ? await ImagePicker.launchCameraAsync(PICKER) : await ImagePicker.launchImageLibraryAsync(PICKER);
    if (result.canceled || !result.assets[0]) return;
    const ready = await toUploadablePhoto(result.assets[0]); // HEIC/WebP -> JPEG; API takes JPEG/PNG only
    if (!ready) { setMessage(t('hangoutBiz.photos.notAnImage')); return; }
    const { bytes, mime } = ready;
    inFlight.current = true;
    setBusy(true);
    setMessage(null);
    const res = await uploadPhoto(helloHangoutId, toArrayBuffer(bytes), mime);
    inFlight.current = false;
    setBusy(false);
    if (res.error) {
      setMessage(
        res.error.code === 'photo_limit_reached' ? t('hangoutBiz.photos.limit')
          : res.error.status === 413 ? t('hangoutBiz.photos.tooBig')
            : res.error.status === 503 && res.error.code === 'business_unavailable' ? t('hangoutBiz.notSetUp')
              : t('hangoutBiz.photos.uploadFailed'),
      );
      return;
    }
    await load();
  }

  function confirmRemove(p: BusinessPhoto) {
    Alert.alert(t('hangoutBiz.photos.removeTitle'), t('hangoutBiz.photos.removeBody'), [
      { text: t('hangoutBiz.back'), style: 'cancel' },
      {
        text: t('hangoutBiz.photos.remove'),
        style: 'destructive',
        onPress: async () => {
          if (!helloHangoutId) return;
          const res = await deletePhoto(helloHangoutId, p.id);
          if (res.error) setMessage(t('hangoutBiz.loadFailed'));
          else await load();
        },
      },
    ]);
  }

  function addPhoto() {
    // Alert.alert is a no-op on web; the browser's file picker is the library.
    if (Platform.OS === 'web') { void pick('library'); return; }
    Alert.alert(t('hangoutBiz.photos.add'), undefined, [
      { text: t('hangoutBiz.photos.takeOne'), onPress: () => void pick('camera') },
      { text: t('hangoutBiz.photos.fromLibrary'), onPress: () => void pick('library') },
      { text: t('hangoutBiz.back'), style: 'cancel' },
    ]);
  }

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" hitSlop={12}>
          <Text style={styles.backText}>{t('hangoutBiz.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('hangoutBiz.photos.headline')}</Text>
        <Text style={styles.muted}>{t('hangoutBiz.photos.body')}</Text>

        {state === 'loading' ? <ActivityIndicator color={Colors.Ink} /> : null}
        {state === 'unavailable' ? <Text style={styles.muted} testID="photos-unavailable">{t('hangoutBiz.notSetUp')}</Text> : null}
        {state === 'error' ? (
          <TouchableOpacity onPress={() => { setState('loading'); void load(); }} accessibilityRole="button" testID="photos-error">
            <Text accessibilityRole="alert" style={styles.muted}>{t('hangoutBiz.loadFailed')} {t('hangoutBiz.retry')}</Text>
          </TouchableOpacity>
        ) : null}

        {state === 'ready' ? (
          <>
            {photos.length === 0 ? <Text style={styles.muted} testID="photos-empty">{t('hangoutBiz.photos.empty')}</Text> : (
              <View style={styles.grid}>
                {photos.map((p) => (
                  <View key={p.id} style={styles.tile} testID={`photo-${p.id}`}>
                    {p.url ? <Image source={{ uri: p.url }} style={styles.image} accessibilityLabel={p.altText ?? undefined} /> : <View style={[styles.image, styles.imageBlank]} />}
                    <TouchableOpacity onPress={() => confirmRemove(p)} accessibilityRole="button" accessibilityLabel={t('hangoutBiz.photos.remove')} style={styles.remove}>
                      <Text style={styles.removeText}>{t('hangoutBiz.photos.remove')}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            {atLimit ? <Text style={styles.muted}>{t('hangoutBiz.photos.limit')}</Text> : null}
            <TouchableOpacity
              style={[styles.cta, (busy || atLimit) && styles.ctaOff]}
              disabled={busy || atLimit}
              onPress={addPhoto}
              accessibilityRole="button"
              testID="photos-add"
            >
              <Text style={styles.ctaText}>{busy ? t('hangoutBiz.photos.uploading') : t('hangoutBiz.photos.add')}</Text>
            </TouchableOpacity>
          </>
        ) : null}
        {message ? <Text accessibilityRole="alert" style={styles.note} testID="photos-message">{message}</Text> : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  scroll: { padding: 22, gap: 14 },
  backText: { fontSize: 17, fontWeight: '600', color: Colors.Ink },
  title: { fontSize: 26, fontWeight: '900', color: Colors.Ink },
  muted: { fontSize: 15, lineHeight: 21, color: Colors.Muted },
  note: { fontSize: 14, lineHeight: 20, color: Colors.Ink, backgroundColor: Colors.Bone, borderRadius: 10, padding: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '48%', gap: 6 },
  image: { width: '100%', aspectRatio: 4 / 3, borderRadius: 10, backgroundColor: Colors.Bone },
  imageBlank: { borderWidth: 1, borderColor: Colors.Line },
  remove: { paddingVertical: 4 },
  removeText: { fontSize: 13, fontWeight: '600', color: Colors.Muted },
  cta: { backgroundColor: Colors.Ink, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  ctaOff: { opacity: 0.4 },
  ctaText: { color: Colors.Chalk, fontSize: 16, fontWeight: '700' },
});
