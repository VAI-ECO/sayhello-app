/**
 * EDIT PROFILE (Settings header → Edit profile): name and photo.
 * Name: PATCH /users/me. Photo: the same real upload as onboarding (POST /users/me/photo) with
 * camera/library permission-denied and interrupted-upload states. The saved photo shows only after
 * the server returns it. Identity colour is not edited here.
 */
import { useEffect, useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../../src/api/client';
import { Colors } from '../../../src/theme';
import { t } from '../../../src/i18n';
import { SubScreen, subStyles } from '../../../src/components/account/SubScreen';
import { useLoader } from '../../../src/lib/use-loader';
import { usePhotoUpload } from '../../../src/lib/use-photo-upload';

interface Me { displayName?: string | null; profilePhotoUrl?: string | null }

export default function EditProfileScreen() {
  const router = useRouter();
  const loader = useLoader<Me>(() => api.user.getProfile() as Promise<{ data?: Me; error?: { message: string } }>);
  const photoUpload = usePhotoUpload();
  const [name, setName] = useState('');
  const [seeded, setSeeded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loader.data && !seeded) {
      setName(loader.data.displayName ?? '');
      setSeeded(true);
    }
  }, [loader.data, seeded]);

  const shownPhoto = photoUpload.photo?.uri ?? photoUpload.storedUrl ?? loader.data?.profilePhotoUrl ?? null;
  const photoPending = photoUpload.photo !== null && photoUpload.storedUrl === null;

  async function save() {
    if (saving) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t('account.edit.nameRequired'));
      return;
    }
    setSaving(true);
    setError(null);
    // The photo goes first: if it fails we stay here with everything kept, nothing half-saved.
    if (photoPending && !(await photoUpload.upload())) {
      setSaving(false);
      return;
    }
    if (trimmed !== (loader.data?.displayName ?? '')) {
      const res = await api.user.updateProfile({ displayName: trimmed });
      if (res.error) {
        setSaving(false);
        setError(res.error.message || t('account.edit.saveFailed'));
        return;
      }
    }
    setSaving(false);
    router.back();
  }

  return (
    <SubScreen
      title={t('account.edit.title')}
      state={loader.state}
      onRetry={loader.retry}
      footer={
        <TouchableOpacity
          style={[subStyles.primary, (saving || photoUpload.uploading) && subStyles.disabled]}
          onPress={() => void save()}
          disabled={saving || photoUpload.uploading}
          accessibilityRole="button"
          testID="edit-save"
        >
          <Text style={subStyles.primaryText}>{saving || photoUpload.uploading ? t('account.saving') : t('account.save')}</Text>
        </TouchableOpacity>
      }
    >
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        {shownPhoto ? (
          <Image source={{ uri: shownPhoto }} style={{ width: 120, height: 120, borderRadius: 60 }} accessibilityIgnoresInvertColors />
        ) : (
          <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.Bone, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 40 }}>👤</Text>
          </View>
        )}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <TouchableOpacity style={[subStyles.secondary, { paddingHorizontal: 18 }]} onPress={() => void photoUpload.take()} accessibilityRole="button" testID="edit-take-photo">
            <Text style={subStyles.secondaryText}>{t('account.edit.takePhoto')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[subStyles.secondary, { paddingHorizontal: 18 }]} onPress={() => void photoUpload.choose()} accessibilityRole="button" testID="edit-choose-photo">
            <Text style={subStyles.secondaryText}>{t('account.edit.choosePhoto')}</Text>
          </TouchableOpacity>
        </View>
        {photoUpload.blocked ? (
          <View style={{ alignItems: 'center' }}>
            <Text style={subStyles.error} accessibilityRole="alert" testID="edit-photo-blocked">
              {t(photoUpload.blocked === 'camera' ? 'account.photo.cameraBlocked' : 'account.photo.libraryBlocked')}
            </Text>
            <TouchableOpacity onPress={photoUpload.openSettings} accessibilityRole="button">
              <Text style={subStyles.rowLabel}>{t('account.openSettings')}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        {photoUpload.error ? <Text style={subStyles.error} accessibilityRole="alert">{photoUpload.error}</Text> : null}
      </View>

      <Text style={subStyles.rowHint}>{t('account.edit.nameLabel')}</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={t('account.edit.namePlaceholder')}
        placeholderTextColor={Colors.Faint}
        maxLength={50}
        style={{ backgroundColor: Colors.Bone, borderRadius: 12, padding: 14, fontSize: 16, color: Colors.Ink, marginTop: 6 }}
        accessibilityLabel={t('account.edit.nameLabel')}
        testID="edit-name"
      />
      {error ? <Text style={subStyles.error} accessibilityRole="alert">{error}</Text> : null}
    </SubScreen>
  );
}
