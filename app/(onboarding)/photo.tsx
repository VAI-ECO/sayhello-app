/**
 * ONBOARDING SCREEN 5: PHOTO
 *
 * ⚠️ Skippable, never blocked
 */

import { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer, Button } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors } from '../../src/theme';
import { api } from '../../src/api/client';

export default function PhotoScreen() {
  const router = useRouter();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed to take a photo');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleChoosePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Photo library access is needed to choose a photo');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleContinue = async () => {
    if (photoUri) {
      setLoading(true);
      // Upload photo to backend (simplified - would need proper file upload)
      const result = await api.user.updateProfile({ photoUri });
      setLoading(false);

      if (result.error) {
        Alert.alert('Error', result.error.message);
        return;
      }
    }

    router.push('/(onboarding)/color');
  };

  const handleSkip = () => {
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
        {photoUri ? (
          <Button
            title={t('onboarding.photo.continue')}
            onPress={handleContinue}
            loading={loading}
          />
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
  },
});
