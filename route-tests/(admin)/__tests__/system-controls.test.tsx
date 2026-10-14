/**
 * HELLO ADMIN › SYSTEM — pausing and resuming one scheduled job (lane 04, migration 281), against a mocked API.
 * Proves what the screen asks for and shows; the server's permission, reason and audit rules are proved in the
 * API's admin-system-controls test.
 *
 * RNTL v14: render / fireEvent / userEvent are async and awaited.
 */

import React from 'react';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { ThemeProvider } from '../../../src/theme';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useFocusEffect: (cb: () => void) => {
    const React = require('react');
    React.useEffect(() => {
      cb();
    }, []);
  },
}));

let mockWindowWidth = 375;
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: mockWindowWidth, height: 900, scale: 1, fontScale: 1 }),
}));

jest.mock('../../../src/api/admin', () => ({ getAdminMe: jest.fn(), updateSetting: jest.fn() }));
jest.mock('../../../src/api/admin-w2', () => ({ getSystem: jest.fn(), pauseJob: jest.fn(), resumeJob: jest.fn() }));
jest.mock('../../../src/api/client', () => ({ api: { init: jest.fn(), get: jest.fn(), post: jest.fn() } }));

import * as adminApi from '../../../src/api/admin';
import * as w2 from '../../../src/api/admin-w2';
import AdminSystemScreen from '../../../app/admin/system';

const api = adminApi as jest.Mocked<typeof adminApi>;
const m = w2 as jest.Mocked<typeof w2>;

const me = (permissions: string[]) => ({
  data: { permissions, sections: ['audit'], isSuperAdmin: false, twoFactorEnabled: true, twoFactorEnforced: true, twoFactorVerified: true },
}) as never;

const job = (name: string, over: Record<string, unknown> = {}) => ({
  name, schedule: '* * * * *', lastSuccessAt: null, ageMinutes: null, staleAfterMinutes: 5, stale: false, enabled: true, paused: false, pause: null, ...over,
});
const system = (jobs: unknown[], over: Record<string, unknown> = {}) => ({
  data: {
    checkedAt: new Date().toISOString(), schedulerEnabled: true, jobs, recentJobErrors: [],
    providers: { payments: { provider: 'stub', configured: false }, payouts: { provider: 'trolley', configured: false } },
    switches: [], pausesAvailable: true, ...over,
  },
}) as never;

async function wrap() {
  await render(<ThemeProvider><AdminSystemScreen /></ThemeProvider>);
}

describe('Hello Admin system: pausing a job', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWindowWidth = 375;
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn(), back: jest.fn(), replace: jest.fn() });
    api.getAdminMe.mockResolvedValue(me(['audit.view', 'settings.edit']));
    m.getSystem.mockResolvedValue(system([job('reveal-hellos')]));
  });

  it('pausing asks for a reason, sends it once, and reloads', async () => {
    m.pauseJob.mockResolvedValue({ data: { paused: true } } as never);
    await wrap();
    const user = userEvent.setup();
    await user.press(await screen.findByTestId('admin-job-pause-reveal-hellos-open'));
    await user.press(screen.getByTestId('admin-job-pause-reveal-hellos-confirm'));
    expect(m.pauseJob).not.toHaveBeenCalled(); // no reason, nothing sent
    await user.type(screen.getByTestId('admin-job-pause-reveal-hellos-reason'), 'bad data in the queue');
    m.getSystem.mockResolvedValue(system([job('reveal-hellos', { paused: true, pause: { reason: 'bad data in the queue', pausedAt: new Date().toISOString() } })]));
    await user.press(screen.getByTestId('admin-job-pause-reveal-hellos-confirm'));
    await waitFor(() => expect(m.pauseJob).toHaveBeenCalledWith('reveal-hellos', 'bad data in the queue'));
    expect(m.pauseJob).toHaveBeenCalledTimes(1);
    expect(await screen.findByTestId('admin-job-paused-reveal-hellos')).toHaveTextContent(/bad data in the queue/);
    expect(screen.getByText('Paused by an admin')).toBeOnTheScreen();
  });

  it('a paused job offers resume, with a reason', async () => {
    m.getSystem.mockResolvedValue(system([job('reveal-hellos', { paused: true, pause: { reason: 'incident', pausedAt: new Date().toISOString() } })]));
    m.resumeJob.mockResolvedValue({ data: { paused: false } } as never);
    await wrap();
    const user = userEvent.setup();
    await user.press(await screen.findByTestId('admin-job-resume-reveal-hellos-open'));
    await user.type(screen.getByTestId('admin-job-resume-reveal-hellos-reason'), 'fixed');
    await user.press(screen.getByTestId('admin-job-resume-reveal-hellos-confirm'));
    await waitFor(() => expect(m.resumeJob).toHaveBeenCalledWith('reveal-hellos', 'fixed'));
    expect(m.pauseJob).not.toHaveBeenCalled();
  });

  it('a server refusal is said in words, not as a silent no-op', async () => {
    m.pauseJob.mockResolvedValue({ error: { code: 'already_paused' } } as never);
    await wrap();
    const user = userEvent.setup();
    await user.press(await screen.findByTestId('admin-job-pause-reveal-hellos-open'));
    await user.type(screen.getByTestId('admin-job-pause-reveal-hellos-reason'), 'x');
    await user.press(screen.getByTestId('admin-job-pause-reveal-hellos-confirm'));
    expect(await screen.findByTestId('admin-job-pause-reveal-hellos-error')).toBeOnTheScreen();
  });

  it('an account without settings.edit sees the state but no pause control', async () => {
    api.getAdminMe.mockResolvedValue(me(['audit.view']));
    await wrap();
    expect(await screen.findByTestId('admin-job-reveal-hellos')).toBeOnTheScreen();
    expect(screen.queryByTestId('admin-job-pause-reveal-hellos-open')).not.toBeOnTheScreen();
  });

  it('says so, and offers no control, when the database has not had the update', async () => {
    m.getSystem.mockResolvedValue(system([job('reveal-hellos')], { pausesAvailable: false }));
    await wrap();
    expect(await screen.findByTestId('admin-pauses-unavailable')).toBeOnTheScreen();
    expect(screen.queryByTestId('admin-job-pause-reveal-hellos-open')).not.toBeOnTheScreen();
  });

  it('a job switched off by its environment flag is not offered a pause', async () => {
    m.getSystem.mockResolvedValue(system([job('reveal-hellos', { enabled: false })]));
    await wrap();
    expect(await screen.findByText('Switched off')).toBeOnTheScreen();
    expect(screen.queryByTestId('admin-job-pause-reveal-hellos-open')).not.toBeOnTheScreen();
  });
});
