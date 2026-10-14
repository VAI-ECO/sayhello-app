import { api } from '../client';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

beforeEach(() => { jest.clearAllMocks(); global.fetch = jest.fn(); });

it('sends raw image bytes with authentication and image MIME, not JSON or a local URI', async () => {
  await api.setToken('photo-session');
  const bytes = new Uint8Array([137,80,78,71,13,10,26,10]).buffer;
  (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ profile_photo_url: 'https://example.test/signed-photo' }) });
  const result = await api.user.uploadProfilePhoto(bytes, 'image/png');
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/users/me/photo'), expect.objectContaining({
    method: 'POST', body: bytes,
    headers: { 'Content-Type': 'image/png', Authorization: 'Bearer photo-session' },
  }));
  expect(result.data?.profilePhotoUrl).toBe('https://example.test/signed-photo');
});

it('preserves upload failure as an error that the screen can retry', async () => {
  (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({ error: 'photo_upload_failed', message: 'Could not store your photo. Please try again.' }) });
  const result = await api.user.uploadProfilePhoto(new ArrayBuffer(1), 'image/jpeg');
  expect(result.data).toBeUndefined();
  expect(result.error).toEqual(expect.objectContaining({ code: 'photo_upload_failed', status: 503 }));
});
