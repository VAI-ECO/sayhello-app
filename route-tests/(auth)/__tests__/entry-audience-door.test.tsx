/**
 * The saved-session entry (cold start / restore): a creator link tapped while signed in has no OTP
 * to ride on, so its code can never attribute — the entry drops the code and opens only the door.
 * A door stored at the OTP boundary (app restarted before navigation) lands here, exactly once.
 *
 * ⚠️ RNTL v14 — All fireEvent/render/userEvent calls are ASYNC and MUST be awaited
 */
import { render, waitFor, cleanup } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { api } from '../../../src/api/client';
import { ThemeProvider } from '../../../src/theme';
import AuthScreen from '../../../app/(auth)/entry';
import { peekAudienceContinuation } from '../../../src/state/pending-audience-continuation';

jest.mock('expo-router', () => ({ useRouter: jest.fn() }));
jest.mock('../../../src/api/client', () => ({
  api: {
    init: jest.fn(),
    hasSession: jest.fn(),
    user: { getProfile: jest.fn() },
  },
}));
// The splash has real timers; collapse its minimum stay so the test does not wait on it.
jest.mock('../../../src/components/consumer/SplashSequence', () => ({
  SplashSequence: () => null,
  SPLASH_SEQUENCE_MS: -600,
}));

const store: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (k: string) => store[k] ?? null),
    setItem: jest.fn(async (k: string, v: string) => { store[k] = v; }),
    removeItem: jest.fn(async (k: string) => { delete store[k]; }),
  },
}));

const mockRouter = { replace: jest.fn() };

async function renderEntry() {
  const view = render(<ThemeProvider><AuthScreen /></ThemeProvider>);
  return view;
}

describe('Auth entry — creator audience door', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cleanup();
    for (const k of Object.keys(store)) delete store[k];
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (api.init as jest.Mock).mockResolvedValue(undefined);
    (api.hasSession as jest.Mock).mockReturnValue(true);
  });

  it('signed-in account that tapped a business link: code dropped, door opened, nothing attributed', async () => {
    store['sayhello.creator-code.v1'] = JSON.stringify({ code: 'JoesJobs', to: 'business', at: Date.now() });
    (api.user.getProfile as jest.Mock).mockResolvedValue({ data: { id: 'u', ageVerified: true } });
    await renderEntry();
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/(hangout)/signup'));
    await waitFor(() => expect(store['sayhello.creator-code.v1']).toBeUndefined());
    expect(peekAudienceContinuation()).toBeNull(); // consumed with the navigation
  });

  it('restart after the OTP but before navigation: the stored ambassador door lands once', async () => {
    store['sayhello.audience-continuation.v1'] = JSON.stringify({ audience: 'ambassador', at: Date.now() });
    (api.user.getProfile as jest.Mock).mockResolvedValue({ data: { id: 'u', ageVerified: true } });
    await renderEntry();
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/ambassador'));
    await waitFor(() => expect(store['sayhello.audience-continuation.v1']).toBeUndefined());
  });

  it('member link tapped while signed in is just Home, with no leftover state', async () => {
    store['sayhello.creator-code.v1'] = JSON.stringify({ code: 'JoesJobs', to: 'member', at: Date.now() });
    (api.user.getProfile as jest.Mock).mockResolvedValue({ data: { id: 'u', ageVerified: true } });
    await renderEntry();
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/home'));
    await waitFor(() => expect(store['sayhello.creator-code.v1']).toBeUndefined());
  });

  it('no link and no continuation: plain Home, no invented door', async () => {
    (api.user.getProfile as jest.Mock).mockResolvedValue({ data: { id: 'u', ageVerified: true } });
    await renderEntry();
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/home'));
  });

  it('birthday step still owed: goes there first and keeps the door for after onboarding', async () => {
    store['sayhello.audience-continuation.v1'] = JSON.stringify({ audience: 'business', at: Date.now() });
    (api.user.getProfile as jest.Mock).mockResolvedValue({ data: { id: 'u', ageVerified: false } });
    await renderEntry();
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/(onboarding)/name'));
    expect(store['sayhello.audience-continuation.v1']).toBeDefined();
  });

  it('a repeated entry after the door was consumed does not loop back to it', async () => {
    store['sayhello.audience-continuation.v1'] = JSON.stringify({ audience: 'ambassador', at: Date.now() });
    (api.user.getProfile as jest.Mock).mockResolvedValue({ data: { id: 'u', ageVerified: true } });
    const first = await renderEntry();
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/ambassador'));
    first.unmount();
    mockRouter.replace.mockClear();
    await renderEntry();
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/home'));
    expect(mockRouter.replace).not.toHaveBeenCalledWith('/ambassador');
  });
});
