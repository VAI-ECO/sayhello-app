/**
 * ONBOARDING SCREEN 5: PHOTO
 *
 * ⚠️ Skippable, never blocked
 */

import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Button } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme';
import { usePhotoUpload } from '../../src/lib/use-photo-upload';

export default function PhotoScreen() {
  const router = useRouter();
  const { photo, uploading: loading, error, blocked, take, choose, upload, openSettings } = usePhotoUpload();
  const photoUri = photo?.uri ?? null;
  const handleTakePhoto = take;
  const handleChoosePhoto = choose;

  // Moves on only after the server stored the bytes. A failure (including an interrupted upload)
  // stays here with the photo kept, so Continue retries the same upload.
  const handleContinue = async () => {
    if (await upload()) router.push('/(onboarding)/color');
  };

  const handleSkip = () => {
    if (loading) return;
    router.push('/(onboarding)/color');
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <View>
          <Text style={styles.title}>{t('onboarding.photo.title')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.photo.subtitle')}</Text>

          {photoUri ? (
            <TouchableOpacity style={styles.photoContainer} onPress={handleChoosePhoto}>
              <Image source={{ uri: photoUri }} style={styles.photo} />
            </TouchableOpacity>
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>👤</Text>
            </View>
          )}

          <View style={styles.buttons}>
            <Button title={t('onboarding.photo.takePhoto')} onPress={handleTakePhoto} />
            <Button title={t('onboarding.photo.choosePhoto')} onPress={handleChoosePhoto} variant="secondary" />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        {blocked ? (
          <View>
            <Text accessibilityRole="alert" style={styles.errorText} testID="photo-permission-blocked">
              {t(blocked === 'camera' ? 'account.photo.cameraBlocked' : 'account.photo.libraryBlocked')}
            </Text>
            <Button title={t('account.openSettings')} onPress={openSettings} variant="secondary" />
          </View>
        ) : null}
        {error ? (
          <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text>
        ) : null}
        {photoUri ? (
          <>
            <Button
              title={t('onboarding.photo.continue')}
              onPress={handleContinue}
              loading={loading}
            />
            {/* After a failed upload, skipping stays one tap away (photo is optional). */}
            {error && !loading ? (
              <Button title={t('onboarding.photo.skip')} onPress={handleSkip} variant="secondary" />
            ) : null}
          </>
        ) : (
          <Button
            title={t('onboarding.photo.skip')}
            onPress={handleSkip}
            variant="secondary"
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.Ink,
    marginBottom: 8,
    letterSpacing: -0.7,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.Ink,
    opacity: 0.7,
    marginBottom: 32,
    letterSpacing: -0.3,
  },
  photoContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    alignSelf: 'center',
    marginBottom: 32,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 32,
  },
  photoPlaceholderText: {
    fontSize: 80,
  },
  buttons: {
    gap: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: Colors.SignalRed,
    textAlign: 'center',
  },
});
