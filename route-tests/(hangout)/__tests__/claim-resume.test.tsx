/**
 * CLAIM A HELLO HANGOUT — signed-out link is remembered in memory and finished once after sign-in (ledger 83).
 *
 * ⚠️ RNTL v14 — render / userEvent are ASYNC and are awaited.
 */
import { render, screen, userEvent } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../../src/api/client';
import { claimHelloHangout } from '../../../src/api/ambassador-s3';
import { ThemeProvider } from '../../../src/theme';
import { t } from '../../../src/i18n';
import { claimResumeRoute, hasPendingClaim, takePendingClaim } from '../../../src/lib/pending-claim';
import ClaimHangoutScreen from '../../../app/(hangout)/claim';

jest.mock('expo-router', () => ({ useRouter: jest.fn(), useLocalSearchParams: jest.fn() }));
jest.mock('../../../src/api/client', () => ({ api: { hasSession: jest.fn() } }));
jest.mock('../../../src/api/ambassador-s3', () => ({ claimHelloHangout: jest.fn() }));

const TOKEN = 'abcdefghijklmnopqrstuvwx'; // one-time link token shape: 16+ url-safe characters
const hasSession = api.hasSession as jest.Mock;
const claimApi = claimHelloHangout as jest.Mock;
const params = useLocalSearchParams as jest.Mock;

const renderScreen = () => render(<ThemeProvider><ClaimHangoutScreen /></ThemeProvider>);

beforeEach(() => {
  jest.clearAllMocks();
  takePendingClaim();
  (useRouter as jest.Mock).mockReturnValue({ push: jest.fn(), replace: jest.fn(), back: jest.fn() });
  params.mockReturnValue({});
});

describe('claim screen, signed out', () => {
  it('asks the owner to sign in, calls no API, and keeps the link in memory only', async () => {
    hasSession.mockReturnValue(false);
    const user = userEvent.setup();
    await renderScreen();
    await user.type(screen.getByPlaceholderText(t('ambassadorS3.claim.placeholder')), TOKEN);
    await user.press(screen.getByRole('button', { name: t('ambassadorS3.claim.submit') }));
    expect(await screen.findByText(t('ambassadorS3.claim.signedOut'))).toBeOnTheScreen();
    expect(claimApi).not.toHaveBeenCalled();
    expect(hasPendingClaim()).toBe(true);
    expect(claimResumeRoute()).toEqual({ pathname: '/(hangout)/claim', params: { token: TOKEN, resume: '1' } });
    expect(hasPendingClaim()).toBe(false); // handed over once, then forgotten
  });
});

describe('claim screen, back from sign-in (resume=1)', () => {
  it('finishes the claim once without another tap', async () => {
    hasSession.mockReturnValue(true);
    params.mockReturnValue({ token: TOKEN, resume: '1' });
    claimApi.mockResolvedValue({ data: { helloHangout: { name: 'Cafe One' } } });
    await renderScreen();
    expect(await screen.findByText(t('ambassadorS3.claim.done', { name: 'Cafe One' }))).toBeOnTheScreen();
    expect(claimApi).toHaveBeenCalledTimes(1);
    expect(claimApi).toHaveBeenCalledWith(TOKEN);
  });

  it('says so plainly when the link has already been used, and does not retry', async () => {
    hasSession.mockReturnValue(true);
    params.mockReturnValue({ token: TOKEN, resume: '1' });
    claimApi.mockResolvedValue({ error: { code: 'already_claimed', status: 409, message: 'x' } });
    await renderScreen();
    expect(await screen.findByText(t('ambassadorS3.claim.alreadyClaimed'))).toBeOnTheScreen();
    expect(claimApi).toHaveBeenCalledTimes(1);
  });

  it('does not claim on its own when the link is merely prefilled (no resume flag)', async () => {
    hasSession.mockReturnValue(true);
    params.mockReturnValue({ token: TOKEN });
    await renderScreen();
    expect(screen.getByPlaceholderText(t('ambassadorS3.claim.placeholder'))).toHaveDisplayValue(TOKEN);
    expect(claimApi).not.toHaveBeenCalled();
  });
});
