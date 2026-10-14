/**
 * A10 PHOTO OF THE PLACE — CANON-RL-03-SN-03 (step 3 of 3): the storefront, live camera only.
 *
 * "Live camera only, no picker and no upload (§14.5). Nothing here is joint, so discarding is
 * allowed — the opposite of the encounter selfie": Discard and Retake are real. The dark frame
 * is the design's tell that this is a camera, not a form.
 *
 * SAVED AT SIGNING (S3 stage 07; API 081 POST /ambassador/hangouts/:id/storefront): the Hello
 * Hangout does not exist until the price step, so the photo's bytes are held in memory
 * (lib/storefront-shot.ts) and uploaded the moment it is signed. If that upload fails the
 * Ambassador is told on the done screen and can retake it from the venue. The signup does not
 * depend on it: "Continue" always goes on to the price step.
 */

import { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, AppState, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { NavigationContext } from 'expo-router/react-navigation';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme/tokens';
import { base64ToBytes, imageMimeFromBytes } from '../../src/lib/photo-bytes';
import { holdStorefrontShot } from '../../src/lib/storefront-shot';

export default function PhotoPlaceScreen() {
  const router = useRouter();
  const navigation = useContext(NavigationContext);
  const params = useLocalSearchParams<{
    name?: string; address?: string; lat?: string; lng?: string; contactName?: string; contactPhone?: string;
  }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [live, setLive] = useState(false);
  const [shot, setShot] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const camera = useRef<CameraView>(null);
  const capturing = useRef(false);

  const hasDetails = Boolean(params.name && params.address && params.lat && params.lng);

  // The camera stops when the screen is left or the app goes to the background.
  useEffect(() => {
    const stop = () => setLive(false);
    const sub = AppState.addEventListener('change', (state) => { if (state !== 'active') stop(); });
    const blur = navigation?.addListener('blur', stop);
    return () => { sub.remove(); blur?.(); };
  }, [navigation]);

  async function openCamera() {
    setMessage(null);
    try {
      const result = permission?.granted ? permission : await requestPermission();
      if (result.granted) { setBlocked(false); setLive(true); return; }
      setBlocked(result.canAskAgain === false);
      setMessage(t(result.canAskAgain === false ? 'ambassador.photo.cameraBlocked' : 'ambassador.photo.cameraDenied'));
    } catch {
      setMessage(t('ambassador.photo.cameraFailed'));
    }
  }

  async function capture() {
    if (capturing.current || !camera.current) return;
    capturing.current = true;
    try {
      const picture = await camera.current.takePictureAsync({ quality: 0.7, base64: true });
      setShot(picture?.uri ?? null);
      // The bytes wait in memory for the signed Hello Hangout's id (lib/storefront-shot.ts).
      const bytes = picture?.base64 ? base64ToBytes(picture.base64) : null;
      const mime = bytes ? imageMimeFromBytes(bytes) : null;
      holdStorefrontShot(bytes && mime ? { bytes, mime } : null);
      setLive(false);
    } catch {
      setMessage(t('ambassador.photo.cameraFailed'));
    } finally {
      capturing.current = false;
    }
  }

  function next() {
    router.push({
      pathname: '/(ambassador)/counter',
      params: {
        name: params.name ?? '',
        address: params.address ?? '',
        lat: params.lat ?? '',
        lng: params.lng ?? '',
        contactName: params.contactName ?? '',
        contactPhone: params.contactPhone ?? '',
      },
    });
  }

  if (!hasDetails) {
    return (
      <SafeAreaView style={styles.dark} edges={['top', 'bottom']}>
        <View style={styles.pad}>
          <Text style={styles.copy} testID="photo-needs-details">{t('ambassador.photo.needsDetails')}</Text>
          <TouchableOpacity onPress={() => router.replace('/(ambassador)/find-business')} accessibilityRole="button" style={styles.pill} testID="photo-restart">
            <Text style={styles.pillText}>{t('ambassador.findBusiness.title')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.dark} edges={['top', 'bottom']} testID="ambassador-photo">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={t('ambassador.common.backLabel')} testID="ambassador-back">
          <Text style={styles.headerText}>{t('ambassador.common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerNote}>{t('ambassador.photo.step')}</Text>
      </View>

      <View style={styles.frame}>
        {live && permission?.granted ? (
          <CameraView
            ref={camera}
            testID="photo-camera"
            style={StyleSheet.absoluteFill}
            facing="back"
            onMountError={() => { setLive(false); setMessage(t('ambassador.photo.cameraFailed')); }}
          />
        ) : shot ? (
          <Image source={{ uri: shot }} style={StyleSheet.absoluteFill} resizeMode="cover" testID="photo-preview" accessibilityLabel={t('ambassador.photo.title')} />
        ) : null}
        <Text style={styles.frameTitle}>{t('ambassador.photo.title')}</Text>
        <Text style={styles.frameHint}>{t('ambassador.photo.hint')}</Text>
      </View>

      <View style={styles.controls}>
        {shot ? (
          <>
            <TouchableOpacity onPress={() => { setShot(null); holdStorefrontShot(null); }} accessibilityRole="button" testID="photo-discard">
              <Text style={styles.headerText}>{t('ambassador.photo.discard')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setShot(null); holdStorefrontShot(null); void openCamera(); }} accessibilityRole="button" testID="photo-retake">
              <Text style={styles.headerText}>{t('ambassador.photo.retake')}</Text>
            </TouchableOpacity>
          </>
        ) : live ? (
          <TouchableOpacity onPress={() => void capture()} accessibilityRole="button" accessibilityLabel={t('ambassador.photo.capture')} style={styles.shutter} testID="photo-capture" />
        ) : (
          <TouchableOpacity onPress={() => void openCamera()} accessibilityRole="button" style={styles.pill} testID="photo-open-camera">
            <Text style={styles.pillText}>{t('ambassador.photo.capture')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {message ? <Text accessibilityRole="alert" style={styles.copy} testID="photo-message">{message}</Text> : null}
      {blocked ? (
        <TouchableOpacity onPress={() => { void Linking.openSettings().catch(() => undefined); }} accessibilityRole="button" testID="photo-open-settings">
          <Text style={[styles.copy, styles.underline]}>{t('ambassador.common.openSettings')}</Text>
        </TouchableOpacity>
      ) : null}

      <Text style={styles.copy}>{t('ambassador.photo.note')}</Text>
      <Text style={styles.copy} testID="photo-storage-note">{t('ambassador.photo.storageNote')}</Text>

      <View style={styles.pad}>
        <TouchableOpacity onPress={next} accessibilityRole="button" style={styles.pill} testID="photo-continue">
          <Text style={styles.pillText}>{t(shot ? 'ambassador.photo.keep' : 'ambassador.photo.skip')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  dark: { flex: 1, backgroundColor: Colors.Ink },
  pad: { paddingHorizontal: 22, paddingVertical: 12, gap: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 12 },
  headerText: { fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },
  headerNote: { fontSize: 15, color: 'rgba(255,255,255,0.7)' },
  frame: { flex: 1, marginHorizontal: 20, borderRadius: 18, backgroundColor: '#2A2724', overflow: 'hidden', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 22, paddingHorizontal: 20 },
  frameTitle: { fontSize: 18, fontWeight: '600', color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
  frameHint: { fontSize: 15, lineHeight: 22, color: 'rgba(255,255,255,0.8)', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 58, paddingVertical: 20, minHeight: 100 },
  shutter: { width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: Colors.Chalk, backgroundColor: 'rgba(255,255,255,0.18)' },
  copy: { fontSize: 14.5, lineHeight: 21, color: 'rgba(255,255,255,0.7)', textAlign: 'center', paddingHorizontal: 22, paddingBottom: 8 },
  underline: { textDecorationLine: 'underline' },
  pill: { backgroundColor: Colors.Chalk, borderRadius: 29, minHeight: 56, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  pillText: { color: Colors.Ink, fontSize: 17.5, fontWeight: '700' },
});
