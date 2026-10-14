/**
 * usePhotoUpload: camera/library permission denial is a visible non-blocking state (RULES §26.5), and a picker that
 * throws is a visible retryable state, never an unhandled rejection.
 *
 * ⚠️ RNTL v14: renderHook and act are ASYNC and must be awaited
 */
import { renderHook, act } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import { usePhotoUpload } from '../use-photo-upload';
import { t } from '../../i18n';

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));
jest.mock('../../api/client', () => ({ api: { user: { uploadProfilePhoto: jest.fn() } } }));
jest.mock('../photo-config', () => ({ getPhotoMaxEdge: jest.fn().mockResolvedValue(null) }));

describe('usePhotoUpload', () => {
  beforeEach(() => jest.clearAllMocks());

  it('marks the camera blocked when permission is refused, without opening it', async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
    const { result } = await renderHook(() => usePhotoUpload());
    await act(async () => { await result.current.take(); });
    expect(result.current.blocked).toBe('camera');
    expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
  });

  it('marks the library blocked when permission is refused', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
    const { result } = await renderHook(() => usePhotoUpload());
    await act(async () => { await result.current.choose(); });
    expect(result.current.blocked).toBe('library');
    expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
  });

  it('shows a retryable error when the camera cannot open, instead of throwing', async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (ImagePicker.launchCameraAsync as jest.Mock).mockRejectedValue(new Error('no camera'));
    const { result } = await renderHook(() => usePhotoUpload());
    await act(async () => { await result.current.take(); });
    expect(result.current.error).toBe(t('account.photo.pickFailed'));
    expect(result.current.blocked).toBeNull();
  });

  it('shows a retryable error when the permission request itself throws', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockRejectedValue(new Error('unavailable'));
    const { result } = await renderHook(() => usePhotoUpload());
    await act(async () => { await result.current.choose(); });
    expect(result.current.error).toBe(t('account.photo.pickFailed'));
  });

  it('a cancelled pick changes nothing', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: true, assets: [] });
    const { result } = await renderHook(() => usePhotoUpload());
    await act(async () => { await result.current.choose(); });
    expect(result.current.photo).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.blocked).toBeNull();
  });
});
