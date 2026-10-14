/**
 * Profile photo pick + upload, shared by onboarding (photo.tsx) and Edit profile.
 *
 * - Camera / library permission denied is a visible, non-blocking state with an Open Settings
 *   path (§26.5: denied is never a wall).
 * - Bytes come from the picker, the content type from the bytes themselves, and the upload goes to
 *   POST /users/me/photo. Success is reported only when the server returns the stored photo.
 * - An upload cut off by the app leaving the foreground, or by the connection, keeps the photo and
 *   says "interrupted" so the same upload can be retried. Never a fake success.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../api/client';
import { t } from '../i18n';
import { base64ToBytes, imageMimeFromBytes, toArrayBuffer, type PhotoMime } from './photo-bytes';

export interface PickedPhoto {
  /** Device-local preview only; never sent to the server. */
  uri: string;
  bytes: Uint8Array;
  mime: PhotoMime;
}

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8,
  base64: true,
};

export function usePhotoUpload() {
  const [photo, setPhoto] = useState<PickedPhoto | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<'camera' | 'library' | null>(null);
  const [storedUrl, setStoredUrl] = useState<string | null>(null);
  const busy = useRef(false);
  const leftForeground = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const sub = AppState.addEventListener('change', state => {
      if (busy.current && state !== 'active') leftForeground.current = true;
    });
    return () => {
      mounted.current = false;
      sub.remove();
    };
  }, []);

  const accept = useCallback((result: ImagePicker.ImagePickerResult) => {
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const bytes = asset.base64 ? base64ToBytes(asset.base64) : null;
    if (!bytes || bytes.length === 0) {
      setError(t('onboarding.photo.unreadable'));
      return;
    }
    const mime = imageMimeFromBytes(bytes);
    if (!mime) {
      setError(t('onboarding.photo.unsupported'));
      return;
    }
    setError(null);
    setBlocked(null);
    setStoredUrl(null);
    setPhoto({ uri: asset.uri, bytes, mime });
  }, []);

  const take = useCallback(async () => {
    if (busy.current) return;
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') {
      setBlocked('camera');
      return;
    }
    accept(await ImagePicker.launchCameraAsync(PICKER_OPTIONS));
  }, [accept]);

  const choose = useCallback(async () => {
    if (busy.current) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      setBlocked('library');
      return;
    }
    accept(await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS));
  }, [accept]);

  /** Resolves true only when the server confirmed the stored photo. */
  const upload = useCallback(async (): Promise<boolean> => {
    if (!photo || busy.current) return false;
    busy.current = true;
    leftForeground.current = false;
    setUploading(true);
    setError(null);
    let result: Awaited<ReturnType<typeof api.user.uploadProfilePhoto>> | undefined;
    try {
      result = await api.user.uploadProfilePhoto(toArrayBuffer(photo.bytes), photo.mime);
    } catch {
      result = undefined;
    }
    busy.current = false;
    if (!mounted.current) return false;
    setUploading(false);
    if (result?.data?.profilePhotoUrl) {
      setStoredUrl(result.data.profilePhotoUrl);
      return true;
    }
    const code = result?.error?.code;
    if (!result || leftForeground.current || code === 'NETWORK_ERROR' || code === 'TIMEOUT') {
      setError(t('account.photo.interrupted'));
    } else if (code === 'SESSION_CHANGED') {
      setError(result?.error?.message ?? t('onboarding.photo.uploadFailed'));
    } else {
      setError(result.error?.message || t('onboarding.photo.uploadFailed'));
    }
    return false;
  }, [photo]);

  const openSettings = useCallback(() => {
    void Linking.openSettings().catch(() => undefined);
  }, []);

  return { photo, uploading, error, blocked, storedUrl, take, choose, upload, openSettings };
}
