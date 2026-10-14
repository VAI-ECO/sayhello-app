/**
 * ENCOUNTER SCREEN 1e: THE SELFIE PROMPT
 *
 * ⚠️ LEGALLY LOAD-BEARING: The permission prompt MUST state that the first
 * photo is kept and that retakes replace it (RULES 10.34). This disclosure
 * happens BEFORE the camera opens. Without this, 10.29 is a silent capture
 * and is not defensible.
 *
 * ⚠️ Skip IS allowed before the first capture. No photo, no points (10.33).
 *
 * Flow: disclosure (10.34) → live camera, with the 10.48 consent visible at
 * capture → the photo is uploaded immediately, before any confirmation UI
 * (10.29) → the review screen only after the server stored it. A failed upload
 * keeps the captured bytes here for retry and shows nothing as saved (10.35).
 * Live camera only; no picker (10.7 spirit, 10.29). Retakes come back here
 * and overwrite (10.30). Points shown are only what the server reported.
 */

import { View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator, Linking, AppState } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { NavigationContext } from 'expo-router/react-navigation';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { Waverly } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme';
import { StatusBarSpacer, useBottomPad } from '../../src/components/StatusBarSpacer';
import { useContext, useEffect, useRef, useState } from 'react';
import { uploadHelloSelfie } from '../../src/api/hellos';
import { addSessionChangeListener } from '../../src/api/client';
import { useEncounterHello } from '../../src/lib/use-encounter-hello';
import { base64ToBytes, imageMimeFromBytes, toArrayBuffer } from '../../src/lib/photo-bytes';
import { getSelfiePreview, recordAward, setSelfiePreview } from '../../src/state/active-hello';
import { EncounterStage } from '../../src/components/ScreenContainer';

interface Captured {
  uri: string;
  bytes: Uint8Array;
}

export default function SelfiePromptScreen() {
  const router = useRouter();
  const footerPad = useBottomPad(34);
  // §10.38 manual path (opened from the scan screen after failed scans): the upload
  // also records the meeting proof server-side (§10.47, W-045).
  const { proof } = useLocalSearchParams<{ proof?: string }>();
  const manualProof = proof === 'manual' ? 'manual' : undefined;
  const { helloId, hello, gone, loading } = useEncounterHello();
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<'prompt' | 'camera'>('prompt');
  const [facing, setFacing] = useState<CameraType>('front');
  const [captured, setCaptured] = useState<Captured | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const camera = useRef<CameraView | null>(null);
  const busy = useRef(false);
  const capturing = useRef(false);
  const navigation = useContext(NavigationContext);

  // Lifecycle (encounter-review carryover). The screen tracks whether it is focused
  // and whether the app is in the foreground, and which sign-in it started under.
  //  - Blur or background hides the camera at once, except mid-shutter: then it is
  //    hidden the moment takePictureAsync settles, so the captured bytes are kept.
  //  - An upload that finishes while the screen is unfocused or backgrounded does
  //    not navigate; the review opens when this screen is focused and active again.
  //  - A sign-in change drops the captured bytes and any pending review, and a
  //    late result from the old session never navigates (the client also refuses
  //    it with SESSION_CHANGED).
  const focused = useRef(navigation?.isFocused?.() ?? true);
  const active = useRef(AppState.currentState !== 'background' && AppState.currentState !== 'inactive');
  const sessionEpoch = useRef(0);
  const closeAfterShutter = useRef(false);
  const reviewPending = useRef(false);
  const mounted = useRef(true);
  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(() => {
    mounted.current = true;
    const visible = () => focused.current && active.current;
    const hideCamera = () => {
      if (capturing.current) closeAfterShutter.current = true;
      else setMode('prompt');
    };
    const showPendingReview = () => {
      if (reviewPending.current && visible()) {
        reviewPending.current = false;
        routerRef.current.push('/(encounter)/selfie-review');
      }
    };
    const sub = AppState.addEventListener('change', state => {
      active.current = state === 'active';
      if (active.current) showPendingReview();
      else hideCamera();
    });
    const blur = navigation?.addListener('blur', () => { focused.current = false; hideCamera(); });
    const focus = navigation?.addListener('focus', () => { focused.current = true; showPendingReview(); });
    const unsession = addSessionChangeListener(() => {
      sessionEpoch.current += 1;
      reviewPending.current = false;
      closeAfterShutter.current = false;
      if (!mounted.current) return;
      setCaptured(null);
      setError(null);
      setSaving(false);
      setMode('prompt');
    });
    return () => {
      mounted.current = false;
      sub.remove();
      blur?.();
      focus?.();
      unsession();
    };
  }, [navigation]);

  // A first capture already exists (either phone) → skipping is no longer offered (10.33).
  const selfieExists = Boolean(hello?.hasSelfie) || Boolean(helloId && getSelfiePreview(helloId));

  // Ring animations
  const ringAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(ringAnim, {
        toValue: 1,
        duration: 2800,
        useNativeDriver: true,
      })
    ).start();
  }, [ringAnim]);

  useEffect(() => {
    if (gone && !loading) router.back();
  }, [gone, loading, router]);

  const handleTakeSelfie = async () => {
    // The disclosure above has been on screen; only now is the camera asked for.
    setError(null);
    try {
      const result = permission?.granted ? permission : await requestPermission();
      if (result.granted) setMode('camera');
      else setError(t('encounter.selfiePrompt.cameraDenied'));
    } catch {
      setError(t('encounter.selfiePrompt.cameraFailed'));
    }
  };

  async function upload(photo: Captured) {
    if (!helloId || busy.current) return;
    const epoch = sessionEpoch.current;
    busy.current = true;
    setSaving(true);
    setError(null);
    const res = await uploadHelloSelfie(helloId, toArrayBuffer(photo.bytes), 'image/jpeg', manualProof);
    busy.current = false;
    // Another account signed in meanwhile: nothing of this result is used.
    if (epoch !== sessionEpoch.current || !mounted.current) return;
    setSaving(false);
    if (res.error || !res.data) {
      if (res.error?.status === 404 || res.error?.status === 403) { router.back(); return; }
      // The server counts failed scans (§10.38); the manual path is not open for this phone yet. Nothing was stored,
      // so nothing is lost: back to the scan screen, which reloads the Hello and its server-side count.
      if (res.error?.code === 'manual_not_open') {
        setCaptured(null);
        setMode('prompt');
        router.replace('/(encounter)/scan');
        return;
      }
      // Nothing was stored: keep the bytes for a retry, never show "Saved".
      setError(res.error?.message || t('encounter.selfiePrompt.uploadFailed'));
      return;
    }
    setSelfiePreview(helloId, photo.uri);
    if (res.data.firstCapture) recordAward(helloId, 'selfie', res.data.pointsAwarded);
    setCaptured(null);
    setMode('prompt');
    if (focused.current && active.current) router.push('/(encounter)/selfie-review');
    else reviewPending.current = true;
  }

  const handleCapture = async () => {
    // Held from before takePictureAsync until the upload settles: repeated taps
    // while the shutter is still working cannot start a second capture.
    if (capturing.current || busy.current || !camera.current) return;
    capturing.current = true;
    closeAfterShutter.current = false;
    const epoch = sessionEpoch.current;
    setError(null);
    let next: Captured | null = null;
    try {
      // No quality/size set: the normalisation figures are owner-set (MONEY Part 6) and unconfigured.
      // imageType is web-only (native is always JPEG); web returns base64 as a full data URL.
      const photo = await camera.current.takePictureAsync({ base64: true, exif: false, imageType: 'jpg' });
      const bytes = photo?.base64 ? base64ToBytes(photo.base64.replace(/^data:[^,]*,/, '')) : null;
      if (epoch !== sessionEpoch.current || !mounted.current) return;
      if (!photo || !bytes || imageMimeFromBytes(bytes) !== 'image/jpeg') {
        setError(t('encounter.selfiePrompt.unreadable'));
        return;
      }
      next = { uri: photo.uri, bytes };
      setCaptured(next);
    } catch {
      if (mounted.current) setError(t('encounter.selfiePrompt.cameraFailed'));
    } finally {
      capturing.current = false;
      // Left mid-shutter: the camera is hidden now, and the bytes kept above.
      if (closeAfterShutter.current && mounted.current) setMode('prompt');
      closeAfterShutter.current = false;
    }
    if (next) await upload(next);
  };

  const handleSkip = () => {
    // RULES 10.33: Skip is allowed BEFORE first capture
    // No photo, no points
    router.push('/(encounter)/pin-drop');
  };

  if (mode === 'camera') {
    return (
      <View style={styles.cameraScreen}>
        <StatusBarSpacer height={44} />
        <View style={styles.cameraFrame}>
          <CameraView
            ref={camera}
            testID="selfie-camera"
            style={StyleSheet.absoluteFill}
            facing={facing}
            onMountError={() => { setMode('prompt'); setError(t('encounter.selfiePrompt.cameraFailed')); }}
          />
        </View>
        <View style={styles.cameraBottom}>
          {/* §10.48 — visible at capture, before upload */}
          <Text style={styles.cameraConsent}>{t('encounter.selfiePrompt.consent')}</Text>
          {error ? <Text accessibilityRole="alert" style={styles.cameraError}>{error}</Text> : null}
          {saving ? (
            <View style={styles.savingRow}>
              <ActivityIndicator color={Colors.Chalk} />
              <Text style={styles.cameraConsent}>{t('encounter.selfiePrompt.saving')}</Text>
            </View>
          ) : captured ? (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: Colors.Chalk }]}
              onPress={() => void upload(captured)}
              accessibilityRole="button"
            >
              <Text style={[styles.buttonText, { color: Colors.Ink }]}>{t('encounter.common.retry')}</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: Colors.Chalk }]}
                onPress={() => void handleCapture()}
                accessibilityRole="button"
                accessibilityLabel={t('encounter.selfiePrompt.capture')}
              >
                <Text style={[styles.buttonText, { color: Colors.Ink }]}>{t('encounter.selfiePrompt.capture')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFacing(f => (f === 'front' ? 'back' : 'front'))}
                accessibilityRole="button"
                style={styles.linkButton}
              >
                <Text style={styles.cameraConsent}>{t('encounter.selfiePrompt.flip')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  }

  return (
    <EncounterStage style={styles.container}>
      {/* Status bar spacer */}
      <StatusBarSpacer height={44} />

      {/* Center content */}
      <View style={styles.centerContent}>
        {/* Waverly with ring - in Fern, not identity color */}
        <View style={styles.waverlyContainer}>
          <Animated.View
            style={[
              styles.ring,
              {
                opacity: ringAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 0],
                }),
                transform: [
                  {
                    scale: ringAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 2.2],
                    }),
                  },
                ],
              },
            ]}
          />
          <View style={[styles.waverlyCircle, { backgroundColor: Colors.Fern }]}>
            <Waverly size={66} color={Colors.Chalk} wave />
          </View>
        </View>

        {/* Title and subtitle */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{t('encounter.selfiePrompt.title')}</Text>
          <Text style={styles.subtitle}>{t('encounter.selfiePrompt.subtitle')}</Text>
        </View>
      </View>

      {/* Bottom actions */}
      <View style={[styles.bottomContent, { paddingBottom: footerPad }]}>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {permission && !permission.granted && !permission.canAskAgain ? (
          <TouchableOpacity onPress={() => { void Linking.openSettings().catch(() => undefined); }} accessibilityRole="button">
            <Text style={styles.disclosure}>{t('encounter.selfiePrompt.openSettings')}</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: Colors.Ink }]}
          onPress={() => void handleTakeSelfie()}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('encounter.selfiePrompt.button')}
        >
          <Text style={[styles.buttonText, { color: Colors.Chalk }]}>
            {t('encounter.selfiePrompt.button')}
          </Text>
        </TouchableOpacity>

        {/* ⚠️ LEGALLY LOAD-BEARING DISCLOSURE per RULES 10.34 */}
        <Text style={styles.disclosure}>{t('encounter.selfiePrompt.disclosure')}</Text>
        <Text style={styles.disclosure}>{t('encounter.selfiePrompt.firstKept')}</Text>

        {selfieExists ? (
          <TouchableOpacity onPress={() => router.push('/(encounter)/pin-drop')} accessibilityRole="button" style={styles.linkButton}>
            <Text style={styles.linkText}>{t('encounter.selfiePrompt.keepSaved')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleSkip} accessibilityRole="button" style={styles.linkButton}>
            <Text style={styles.linkText}>{t('encounter.selfiePrompt.skip')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </EncounterStage>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Chalk,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 30,
  },
  waverlyContainer: {
    width: 132,
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ring: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 2,
    borderColor: Colors.Fern,
  },
  waverlyCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 31,
    lineHeight: 37,
    fontWeight: '700',
    color: Colors.Ink,
    letterSpacing: -0.9,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 27,
    color: Colors.Muted,
    textAlign: 'center',
  },
  bottomContent: {
    paddingHorizontal: 30,
    paddingBottom: 34,
    gap: 12,
  },
  button: {
    borderRadius: 28,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  disclosure: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.Faint,
    textAlign: 'center',
  },
  error: {
    fontSize: 15,
    lineHeight: 21,
    color: Colors.Ink,
    textAlign: 'center',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.Muted,
  },
  cameraScreen: {
    flex: 1,
    backgroundColor: Colors.Ink,
  },
  cameraFrame: {
    flex: 1,
    marginHorizontal: 22,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#2A2926',
  },
  cameraBottom: {
    paddingHorizontal: 26,
    paddingTop: 16,
    paddingBottom: 30,
    gap: 12,
  },
  cameraConsent: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
  },
  cameraError: {
    fontSize: 15,
    lineHeight: 21,
    color: Colors.Chalk,
    textAlign: 'center',
  },
  savingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    height: 56,
  },
});
