/**
 * HELLO ADMIN › TWO-FACTOR (RULES §23.6, lane 04) — the screen and the shell gate, against a mocked API.
 * They prove what the screens ask for and show; the server's refusal of an unverified session is proved in the
 * API's admin-2fa-enforcement test. Not a rendered design comparison.
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

jest.mock('../../../src/api/admin', () => ({
  getAdminMe: jest.fn(),
  getAudit: jest.fn(),
}));

jest.mock('../../../src/api/admin-w2', () => ({
  getTwoFactorStatus: jest.fn(),
  enrollTwoFactor: jest.fn(),
  confirmTwoFactor: jest.fn(),
  verifyTwoFactor: jest.fn(),
  recoverTwoFactor: jest.fn(),
  resetTwoFactor: jest.fn(),
}));

jest.mock('../../../src/api/client', () => ({
  api: { init: jest.fn(), get: jest.fn(), post: jest.fn() },
}));

import * as adminApi from '../../../src/api/admin';
import * as w2 from '../../../src/api/admin-w2';
import AdminHomeScreen from '../../../app/admin/index';
import AdminAuditScreen from '../../../app/admin/audit';
import AdminTwoFactorScreen from '../../../app/admin/two-factor';

const api = adminApi as jest.Mocked<typeof adminApi>;
const tf = w2 as jest.Mocked<typeof w2>;

const me = (over: Record<string, unknown> = {}) =>
  ({ data: { permissions: ['audit.view'], sections: ['audit'], isSuperAdmin: false, twoFactorEnabled: true, twoFactorEnforced: true, twoFactorVerified: false, ...over } }) as never;
const status = (over: Record<string, unknown> = {}) =>
  ({ data: { configured: true, enrolled: true, confirmed: true, enforced: true, sessionVerified: false, recoveryCodesRemaining: 8, lockedSeconds: 0, ...over } }) as never;

async function wrap(ui: React.ReactElement) {
  await render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('Hello Admin two-factor (§23.6)', () => {
  let push: jest.Mock;
  let replace: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockWindowWidth = 375;
    push = jest.fn();
    replace = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push, back: jest.fn(), replace });
    api.getAdminMe.mockResolvedValue(me());
    api.getAudit.mockResolvedValue({ error: { code: '2fa_verification_required' } } as never);
    tf.getTwoFactorStatus.mockResolvedValue(status());
  });

  describe('the shell gate', () => {
    it('an enrolled staff session that has not entered a code sees the gate card instead of the screen, and it opens two-factor', async () => {
      await wrap(<AdminAuditScreen />);
      expect(await screen.findByTestId('admin-two-factor-gate')).toBeOnTheScreen();
      expect(screen.getByText('Enter your two-factor code to open Hello Admin on this device.')).toBeOnTheScreen();
      const user = userEvent.setup();
      await user.press(screen.getByTestId('admin-two-factor-gate-open'));
      expect(push).toHaveBeenCalledWith('/admin/two-factor');
    });

    it('a staff account with no authenticator is told to set one up', async () => {
      api.getAdminMe.mockResolvedValue(me({ twoFactorEnabled: false }));
      await wrap(<AdminAuditScreen />);
      expect(await screen.findByText('Two-factor is mandatory for staff. Set up your authenticator to open Hello Admin.')).toBeOnTheScreen();
    });

    it('a verified session is not gated', async () => {
      api.getAdminMe.mockResolvedValue(me({ twoFactorVerified: true }));
      await wrap(<AdminAuditScreen />);
      await waitFor(() => expect(api.getAudit).toHaveBeenCalled());
      expect(screen.queryByTestId('admin-two-factor-gate')).not.toBeOnTheScreen();
    });

    it('an account that is not staff is never shown the gate', async () => {
      api.getAdminMe.mockResolvedValue(me({ permissions: [], sections: [], twoFactorEnabled: false }));
      await wrap(<AdminHomeScreen />);
      expect(await screen.findByText('This account holds no Hello Admin section.')).toBeOnTheScreen();
      expect(screen.queryByTestId('admin-two-factor-gate')).not.toBeOnTheScreen();
    });

    it('Home offers the SUPER ADMIN account (no granted section) the way to enrol, not "no access"', async () => {
      api.getAdminMe.mockResolvedValue(me({ permissions: [], sections: [], isSuperAdmin: true, twoFactorEnabled: false }));
      await wrap(<AdminHomeScreen />);
      expect(await screen.findByTestId('admin-two-factor-gate')).toBeOnTheScreen();
      expect(screen.queryByText('This account holds no Hello Admin section.')).not.toBeOnTheScreen();
    });

    it('a server that does not report enforcement is not gated (older server)', async () => {
      api.getAdminMe.mockResolvedValue(me({ twoFactorEnforced: false, twoFactorVerified: undefined }));
      await wrap(<AdminHomeScreen />);
      expect(await screen.findByTestId('admin-home-2fa')).toBeOnTheScreen();
      expect(screen.queryByTestId('admin-two-factor-gate')).not.toBeOnTheScreen();
    });
  });

  describe('enrolment', () => {
    beforeEach(() => {
      api.getAdminMe.mockResolvedValue(me({ twoFactorEnabled: false }));
      tf.getTwoFactorStatus.mockResolvedValue(status({ enrolled: false, confirmed: false, recoveryCodesRemaining: 0 }));
    });

    it('shows the key once, then the recovery codes once, and only then opens Hello Admin', async () => {
      tf.enrollTwoFactor.mockResolvedValue({ data: { secret: 'JBSWY3DPEHPK3PXP', otpauthUri: 'otpauth://totp/x' } } as never);
      tf.confirmTwoFactor.mockResolvedValue({ data: { enrolled: true, recoveryCodes: ['AAAAA-BBBBB', 'CCCCC-DDDDD'] } } as never);
      await wrap(<AdminTwoFactorScreen />);
      const user = userEvent.setup();
      await user.press(await screen.findByTestId('admin-2fa-start'));
      expect(await screen.findByTestId('admin-2fa-secret-text')).toHaveTextContent('JBSWY3DPEHPK3PXP');
      await user.type(screen.getByTestId('admin-2fa-code'), '123456');
      tf.getTwoFactorStatus.mockResolvedValue(status({ sessionVerified: true }));
      await user.press(screen.getByTestId('admin-2fa-confirm'));
      expect(tf.confirmTwoFactor).toHaveBeenCalledWith('123456');
      expect(await screen.findByTestId('admin-2fa-recovery-codes')).toBeOnTheScreen();
      expect(screen.getAllByTestId('admin-2fa-recovery-code')).toHaveLength(2);
      expect(replace).not.toHaveBeenCalled();
      await user.press(screen.getByTestId('admin-2fa-recovery-saved'));
      expect(replace).toHaveBeenCalledWith('/admin');
      expect(screen.queryByTestId('admin-2fa-recovery-codes')).not.toBeOnTheScreen();
    });

    it('says plainly when the server has no key, and offers no set-up', async () => {
      tf.getTwoFactorStatus.mockResolvedValue(status({ configured: false, enrolled: false, confirmed: false }));
      await wrap(<AdminTwoFactorScreen />);
      expect(await screen.findByTestId('admin-2fa-not-configured')).toBeOnTheScreen();
      expect(screen.queryByTestId('admin-2fa-start')).not.toBeOnTheScreen();
    });

    it('a wrong confirmation code says so in words', async () => {
      tf.enrollTwoFactor.mockResolvedValue({ data: { secret: 'JBSWY3DPEHPK3PXP', otpauthUri: 'u' } } as never);
      tf.confirmTwoFactor.mockResolvedValue({ error: { code: 'code_incorrect' } } as never);
      await wrap(<AdminTwoFactorScreen />);
      const user = userEvent.setup();
      await user.press(await screen.findByTestId('admin-2fa-start'));
      await user.type(await screen.findByTestId('admin-2fa-code'), '000000');
      await user.press(screen.getByTestId('admin-2fa-confirm'));
      expect(await screen.findByTestId('admin-2fa-message')).toHaveTextContent('That code is not right. Try the current one.');
    });
  });

  describe('opening a session', () => {
    it('a right code opens Hello Admin on this device', async () => {
      tf.verifyTwoFactor.mockResolvedValue({ data: { valid: true } } as never);
      await wrap(<AdminTwoFactorScreen />);
      const user = userEvent.setup();
      await user.type(await screen.findByTestId('admin-2fa-verify-code'), '654321');
      await user.press(screen.getByTestId('admin-2fa-verify-go'));
      expect(tf.verifyTwoFactor).toHaveBeenCalledWith('654321');
      await waitFor(() => expect(replace).toHaveBeenCalledWith('/admin'));
    });

    it('a wrong code stays on the screen with an honest message', async () => {
      tf.verifyTwoFactor.mockResolvedValue({ data: { valid: false, locked: false } } as never);
      await wrap(<AdminTwoFactorScreen />);
      const user = userEvent.setup();
      await user.type(await screen.findByTestId('admin-2fa-verify-code'), '111111');
      await user.press(screen.getByTestId('admin-2fa-verify-go'));
      expect(await screen.findByTestId('admin-2fa-message')).toHaveTextContent('That code is not right. Try the current one.');
      expect(replace).not.toHaveBeenCalled();
    });

    it('a lock is named, and the button waits', async () => {
      tf.getTwoFactorStatus.mockResolvedValue(status({ lockedSeconds: 600 }));
      await wrap(<AdminTwoFactorScreen />);
      expect(await screen.findByTestId('admin-2fa-locked')).toHaveTextContent('Too many wrong codes. Try again in about 10 min.');
      expect(screen.getByTestId('admin-2fa-verify-go')).toBeDisabled();
    });

    it('a lost authenticator: a recovery code verifies the session, then reset is offered', async () => {
      tf.recoverTwoFactor.mockResolvedValue({ data: { valid: true, recoveryCodesRemaining: 7 } } as never);
      await wrap(<AdminTwoFactorScreen />);
      const user = userEvent.setup();
      await user.press(await screen.findByTestId('admin-2fa-toggle-recovery'));
      await user.type(screen.getByTestId('admin-2fa-verify-code'), 'AAAAA-BBBBB');
      tf.getTwoFactorStatus.mockResolvedValue(status({ sessionVerified: true, recoveryCodesRemaining: 7 }));
      await user.press(screen.getByTestId('admin-2fa-verify-go'));
      expect(tf.recoverTwoFactor).toHaveBeenCalledWith('AAAAA-BBBBB');
      expect(tf.verifyTwoFactor).not.toHaveBeenCalled();
      expect(await screen.findByTestId('admin-2fa-reset')).toBeOnTheScreen();
      expect(screen.getByTestId('admin-2fa-recovery-left')).toHaveTextContent('7 recovery codes left');
    });
  });

  describe('replacing an authenticator', () => {
    it('reset takes two presses, then leads back to a fresh set-up', async () => {
      tf.getTwoFactorStatus.mockResolvedValue(status({ sessionVerified: true }));
      tf.resetTwoFactor.mockResolvedValue({ data: { reset: true } } as never);
      await wrap(<AdminTwoFactorScreen />);
      const user = userEvent.setup();
      await user.press(await screen.findByTestId('admin-2fa-reset'));
      expect(tf.resetTwoFactor).not.toHaveBeenCalled();
      tf.getTwoFactorStatus.mockResolvedValue(status({ enrolled: false, confirmed: false, recoveryCodesRemaining: 0 }));
      await user.press(screen.getByTestId('admin-2fa-reset-confirm'));
      expect(tf.resetTwoFactor).toHaveBeenCalledTimes(1);
      expect(await screen.findByTestId('admin-2fa-start')).toBeOnTheScreen();
    });
  });
});
