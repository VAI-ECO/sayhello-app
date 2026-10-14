import { currentPushToken, forgetPushToken, registerPushToken, removePushTokenForSignOut } from '../push-registration';

const mockPut = jest.fn();
const mockDelete = jest.fn();
let mockSession = true;
jest.mock('../../api/client', () => ({
  api: { hasSession: () => mockSession, put: (...a: unknown[]) => mockPut(...a), delete: (...a: unknown[]) => mockDelete(...a) },
}));
jest.mock('expo-constants', () => ({ __esModule: true, default: { expoConfig: { extra: { eas: { projectId: 'proj' } } } } }));
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: async () => ({ status: 'granted' }),
  getExpoPushTokenAsync: async () => ({ data: 'ExponentPushToken[abc]' }),
}));

beforeEach(() => { mockPut.mockReset(); mockDelete.mockReset(); mockSession = true; forgetPushToken(); });

describe('push token lifecycle', () => {
  it('registers on sign-in and removes the token on sign-out', async () => {
    mockPut.mockResolvedValue({ data: {} });
    mockDelete.mockResolvedValue({ data: {} });
    expect(await registerPushToken()).toEqual({ registered: true, token: 'ExponentPushToken[abc]' });
    expect(mockPut).toHaveBeenCalledWith('/users/me/push-devices', expect.objectContaining({ token: 'ExponentPushToken[abc]' }));
    await removePushTokenForSignOut();
    expect(mockDelete).toHaveBeenCalledWith('/users/me/push-devices?token=ExponentPushToken%5Babc%5D');
    expect(currentPushToken()).toBeNull();
  });
  it('does nothing without a mockSession and does not call delete without a token', async () => {
    mockSession = false;
    expect(await registerPushToken()).toEqual({ registered: false, reason: 'no_session' });
    await removePushTokenForSignOut();
    expect(mockDelete).not.toHaveBeenCalled();
  });
});
