/**
 * Onboarding completion ("You're in"): the creator link's audience door is offered here, after the
 * shared age/profile/onboarding steps, beside the pre-account role choice. Either button consumes
 * the continuation so it can never resurface later.
 *
 * ⚠️ RNTL v14 — All fireEvent/render/userEvent calls are ASYNC and MUST be awaited
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { ThemeProvider } from '../../../src/theme';
import DoneScreen from '../../../app/(onboarding)/done';
import {
  clearAudienceContinuation,
  peekAudienceContinuation,
  rememberAudienceContinuation,
} from '../../../src/state/pending-audience-continuation';
import { setPendingRole, takePendingRole } from '../../../src/state/pending-role';

jest.mock('expo-router', () => ({ useRouter: jest.fn() }));

const store: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (k: string) => store[k] ?? null),
    setItem: jest.fn(async (k: string, v: string) => { store[k] = v; }),
    removeItem: jest.fn(async (k: string) => { delete store[k]; }),
  },
}));

const mockRouter = { push: jest.fn(), replace: jest.fn() };

async function renderDone() {
  await render(<ThemeProvider><DoneScreen /></ThemeProvider>);
}

describe('Onboarding done — creator audience door', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    takePendingRole();
    clearAudienceContinuation();
    for (const k of Object.keys(store)) delete store[k];
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('business door is offered after onboarding and opens the existing Hello Hangout signup', async () => {
    rememberAudienceContinuation('business');
    await renderDone();
    const cta = await screen.findByTestId('done-audience');
    await fireEvent.press(cta);
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/home'));
    expect(mockRouter.push).toHaveBeenCalledWith('/(hangout)/signup');
    expect(peekAudienceContinuation()).toBeNull(); // consumed
  });

  it('ambassador door opens the existing Ambassador entry', async () => {
    rememberAudienceContinuation('ambassador');
    await renderDone();
    const cta = await screen.findByTestId('done-audience');
    await fireEvent.press(cta);
    await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith('/ambassador'));
    expect(peekAudienceContinuation()).toBeNull();
  });

  it('survives a restart mid-onboarding (loaded from storage, memory empty)', async () => {
    // Process death loses memory; the storage mirror written at the OTP boundary stays.
    store['sayhello.audience-continuation.v1'] = JSON.stringify({ audience: 'business', at: Date.now() });
    await renderDone();
    await screen.findByTestId('done-audience');
  });

  it('declining with the main CTA clears the continuation and goes to the map', async () => {
    rememberAudienceContinuation('ambassador');
    await renderDone();
    await screen.findByTestId('done-audience');
    await fireEvent.press(screen.getByTestId('done-cta'));
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/map'));
    expect(peekAudienceContinuation()).toBeNull();
  });

  it('no link audience: no door button, plain done screen', async () => {
    await renderDone();
    await waitFor(() => expect(screen.getByTestId('done-cta')).toBeTruthy());
    expect(screen.queryByTestId('done-audience')).toBeNull();
  });

  it('a pre-account role choice and a link audience can both be offered', async () => {
    setPendingRole('hangout');
    rememberAudienceContinuation('ambassador');
    await renderDone();
    expect(await screen.findByTestId('done-role')).toBeTruthy();
    expect(await screen.findByTestId('done-audience')).toBeTruthy();
    takePendingRole();
  });
});
