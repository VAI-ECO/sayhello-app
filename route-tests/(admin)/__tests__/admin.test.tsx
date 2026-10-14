/**
 * HELLO ADMIN SCREENS (VERTICAL-BUILD-10) — Home, Audit (CANON-00-SN-12), Roles (NEW-ADM-01), Settings
 * (MN-01-SN-13) and Applications. Source-level tests against a mocked API: they prove what the screens
 * ask for, what they show and what they refuse to do. They are not a rendered design comparison and
 * they do not prove the server's authorization (that is in the API's admin-core-routes test).
 *
 * RNTL v14: render / fireEvent / userEvent are async and awaited.
 */

import React from 'react';
import { render, screen, waitFor, userEvent, within } from '@testing-library/react-native';
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
  getRoles: jest.fn(),
  getPermissions: jest.fn(),
  createRole: jest.fn(),
  getSettings: jest.fn(),
  updateSetting: jest.fn(),
  getApplications: jest.fn(),
  decideApplication: jest.fn(),
}));

jest.mock('../../../src/api/client', () => ({
  api: { init: jest.fn(), get: jest.fn(), post: jest.fn() },
}));

import * as adminApi from '../../../src/api/admin';
import AdminHomeScreen from '../../../app/(admin)/index';
import AdminAuditScreen from '../../../app/(admin)/audit';
import AdminRolesScreen from '../../../app/(admin)/roles';
import AdminSettingsScreen from '../../../app/(admin)/settings';
import AdminApplicationsScreen from '../../../app/(admin)/applications';

const api = adminApi as jest.Mocked<typeof adminApi>;

const me = (permissions: string[], over: Record<string, unknown> = {}) => {
  const sections = ['payouts', 'reports', 'settings', 'audit', 'drawings', 'overrides', 'roles'].filter((s) =>
    permissions.some((p) => p.endsWith(`.${s}`) || p.startsWith(`${s}.`))
  );
  return { data: { permissions, sections, isSuperAdmin: false, twoFactorEnabled: false, twoFactorEnforced: false, ...over } } as never;
};

async function wrap(ui: React.ReactElement) {
  await render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('Hello Admin screens', () => {
  let push: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockWindowWidth = 375;
    push = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push, back: jest.fn(), replace: jest.fn() });
    api.getAdminMe.mockResolvedValue(me(['audit.view']));
  });

  describe('Home', () => {
    it('says so when the account holds no section — and draws nothing to open', async () => {
      api.getAdminMe.mockResolvedValue(me([]));
      await wrap(<AdminHomeScreen />);
      expect(await screen.findByText('This account holds no Hello Admin section.')).toBeOnTheScreen();
      expect(screen.queryByTestId('admin-open-audit')).not.toBeOnTheScreen();
    });

    it('opens only the built screens whose permission the server says it holds', async () => {
      api.getAdminMe.mockResolvedValue(me(['audit.view', 'settings.view']));
      await wrap(<AdminHomeScreen />);
      const user = userEvent.setup();
      await user.press(await screen.findByRole('button', { name: 'Audit' }));
      expect(push).toHaveBeenCalledWith('/(admin)/audit');
      expect(screen.getByRole('button', { name: 'Settings' })).toBeOnTheScreen();
      expect(screen.queryByRole('button', { name: 'Roles' })).not.toBeOnTheScreen();
      expect(screen.queryByRole('button', { name: 'Applications' })).not.toBeOnTheScreen();
    });

    it('every §23.3 section now has a screen, so nothing is listed as held-but-not-built; each opens only with the permission its route enforces', async () => {
      // Reports, Payouts, Drawings and Overrides were unbuilt before wave 2; they are built now.
      api.getAdminMe.mockResolvedValue(me(['audit.view', 'payouts.release', 'reports.review']));
      await wrap(<AdminHomeScreen />);
      expect(await screen.findByTestId('admin-open-reports')).toBeOnTheScreen();
      expect(screen.queryByTestId('admin-home-not-built')).not.toBeOnTheScreen();
      // Payouts opens on payouts.export (what its API route enforces), not on payouts.release.
      expect(screen.queryByTestId('admin-open-payouts')).not.toBeOnTheScreen();
    });

    it('does not claim two-factor is on: it says it is mandatory and not enforced yet', async () => {
      await wrap(<AdminHomeScreen />);
      expect(await screen.findByText('Two-factor sign-in is mandatory for staff. It is not enforced yet.')).toBeOnTheScreen();
      expect(screen.queryByText(/2FA on/i)).not.toBeOnTheScreen();
    });

    it('SUPER ADMIN is an account, not a section: with no granted permission there is nothing to open', async () => {
      api.getAdminMe.mockResolvedValue(me([], { isSuperAdmin: true }));
      await wrap(<AdminHomeScreen />);
      expect(await screen.findByText('This account holds no Hello Admin section.')).toBeOnTheScreen();
    });

    it('shows a retryable failure, not an empty home, when the server cannot be read', async () => {
      api.getAdminMe.mockResolvedValue({ error: { message: 'x' } } as never);
      await wrap(<AdminHomeScreen />);
      expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't load this.");
    });

    it('draws the rail on desktop (≥1024) with Home and the built sections only', async () => {
      mockWindowWidth = 1440;
      api.getAdminMe.mockResolvedValue(me(['audit.view', 'roles.create']));
      await wrap(<AdminHomeScreen />);
      expect(await screen.findByTestId('admin-rail-audit')).toBeOnTheScreen();
      expect(screen.getByTestId('admin-rail-roles')).toBeOnTheScreen();
      expect(screen.getByTestId('admin-rail-home')).toBeOnTheScreen();
      expect(screen.queryByTestId('admin-rail-settings')).not.toBeOnTheScreen();
    });
  });

  describe('Audit', () => {
    const entry = (over: Record<string, unknown> = {}) => ({
      id: 'e1', performedAt: new Date().toISOString(), action: 'update_setting', event: 'update_setting', permission: 'settings.edit',
      actor: { id: 'u1', name: 'Brian M.' }, targetType: 'admin_setting', targetId: null, reason: 'Beta feedback',
      metadata: { key: 'nudge_daily_cap_per_user', oldValue: '3', newValue: '10' }, ...over,
    });

    it('draws the permission, who, when and what — and the reason — read-only', async () => {
      api.getAudit.mockResolvedValue({ data: { entries: [entry()], nextCursor: null } } as never);
      await wrap(<AdminAuditScreen />);
      const row = await screen.findByTestId('admin-audit-row-e1');
      expect(within(row).getByText('settings.edit')).toBeOnTheScreen();
      expect(within(row).getByText(/Brian M\. · \d\d:\d\d today · nudge_daily_cap_per_user 3 → 10/)).toBeOnTheScreen();
      expect(within(row).getByText('Why: Beta feedback')).toBeOnTheScreen();
      // Append-only: nothing on this screen edits or removes a row.
      expect(screen.queryByRole('button', { name: /delete|remove|edit|undo/i })).not.toBeOnTheScreen();
      expect(screen.queryByTestId('admin-audit-older')).not.toBeOnTheScreen();
    });

    it('writes the event for an application decision and a role grant in plain words', async () => {
      api.getAudit.mockResolvedValue({ data: { entries: [
        entry({ id: 'a', action: 'update', event: 'approve_ambassador_application', permission: 'roles.grant', reason: null, metadata: {} }),
        entry({ id: 'b', action: 'assign_role', event: 'assign_role', permission: 'roles.grant', reason: null, metadata: { roleName: 'moderation' } }),
        entry({ id: 'c', action: 'update', event: null, permission: null, reason: null, metadata: null }),
      ], nextCursor: null } } as never);
      await wrap(<AdminAuditScreen />);
      expect(await screen.findByText(/Approved an Ambassador application/)).toBeOnTheScreen();
      expect(screen.getByText(/Gave the role moderation to a person/)).toBeOnTheScreen();
      // A row with no recorded permission falls back to its action, never a blank.
      expect(within(screen.getByTestId('admin-audit-row-c')).getByText('update')).toBeOnTheScreen();
    });

    it('has no cap: "Older entries" follows the cursor until the server says there are none', async () => {
      api.getAudit
        .mockResolvedValueOnce({ data: { entries: [entry({ id: 'n1' })], nextCursor: 'CURSOR-1' } } as never)
        .mockResolvedValueOnce({ data: { entries: [entry({ id: 'o1' })], nextCursor: null } } as never);
      await wrap(<AdminAuditScreen />);
      const user = userEvent.setup();
      await user.press(await screen.findByRole('button', { name: 'Older entries' }));
      expect(await screen.findByTestId('admin-audit-row-o1')).toBeOnTheScreen();
      expect(api.getAudit).toHaveBeenLastCalledWith('CURSOR-1');
      expect(screen.getByTestId('admin-audit-row-n1')).toBeOnTheScreen();
      expect(screen.queryByRole('button', { name: 'Older entries' })).not.toBeOnTheScreen();
    });

    it('says the section is not held on a 403 and offers a retry, never an empty log', async () => {
      api.getAudit.mockResolvedValue({ error: { message: 'no', code: 'forbidden' } } as never);
      await wrap(<AdminAuditScreen />);
      expect(await screen.findByText("This account doesn't hold that section.")).toBeOnTheScreen();
      expect(screen.getByRole('button', { name: 'Try again' })).toBeOnTheScreen();
      expect(screen.queryByText('Nothing has been recorded yet.')).not.toBeOnTheScreen();
    });

    it('a real empty log says so plainly', async () => {
      api.getAudit.mockResolvedValue({ data: { entries: [], nextCursor: null } } as never);
      await wrap(<AdminAuditScreen />);
      expect(await screen.findByText('Nothing has been recorded yet.')).toBeOnTheScreen();
    });
  });

  describe('Roles', () => {
    const role = (id: string, name: string, people: number, grants: string[]) => ({
      id, name, description: `${name} desc`, people,
      rolePermissions: grants.map((g) => ({ permissions: { id: `p-${g}`, name: g } })),
    });
    const perms = ['roles.create', 'roles.grant', 'settings.view', 'payouts.release'].map((n) => ({ id: `p-${n}`, name: n }));

    beforeEach(() => {
      api.getAdminMe.mockResolvedValue(me(['roles.create', 'roles.grant', 'settings.view']));
      api.getPermissions.mockResolvedValue({ data: { permissions: perms } } as never);
    });

    it('lists job-name roles with their grants and how many people hold them', async () => {
      api.getRoles.mockResolvedValue({ data: { roles: [role('r1', 'moderation', 3, ['reports.review', 'reports.resolve']), role('r2', 'support', 1, [])] } } as never);
      await wrap(<AdminRolesScreen />);
      const r1 = await screen.findByTestId('admin-role-r1');
      expect(within(r1).getByText('moderation')).toBeOnTheScreen();
      expect(within(r1).getByText('3 people')).toBeOnTheScreen();
      expect(within(r1).getByText('reports.resolve · reports.review')).toBeOnTheScreen();
      const r2 = screen.getByTestId('admin-role-r2');
      expect(within(r2).getByText('1 person')).toBeOnTheScreen();
      expect(within(r2).getByText('No grants yet')).toBeOnTheScreen();
    });

    it('offers only the permissions this account holds, and posts exactly the ones picked', async () => {
      api.getRoles.mockResolvedValue({ data: { roles: [] } } as never);
      api.createRole.mockResolvedValue({ data: { role: role('r9', 'viewers', 0, []) } } as never);
      await wrap(<AdminRolesScreen />);
      const user = userEvent.setup();
      await user.press(await screen.findByRole('button', { name: 'New role' }));
      // Held: roles.create, roles.grant, settings.view. Not held: payouts.release.
      expect(await screen.findByRole('checkbox', { name: 'settings.view' })).toBeOnTheScreen();
      expect(screen.queryByRole('checkbox', { name: 'payouts.release' })).not.toBeOnTheScreen();
      expect(screen.getByText('You can only grant what you hold.')).toBeOnTheScreen();

      const create = screen.getByRole('button', { name: 'Create role' });
      expect(create).toBeDisabled();
      await user.type(screen.getByLabelText('Name — lowercase letters and underscores'), 'Viewers');
      await user.type(screen.getByLabelText('What it is for'), 'Can look at settings');
      await user.press(screen.getByRole('checkbox', { name: 'settings.view' }));
      expect(screen.getByRole('checkbox', { name: 'settings.view' })).toBeChecked();
      await user.press(screen.getByRole('button', { name: 'Create role' }));
      expect(api.createRole).toHaveBeenCalledWith({ name: 'viewers', description: 'Can look at settings', canCreateRoles: false, permissionIds: ['p-settings.view'] });
      expect(await screen.findByText('Role created.')).toBeOnTheScreen();
    });

    it('shows the server\'s refusal to grant what the creator does not hold', async () => {
      api.getRoles.mockResolvedValue({ data: { roles: [] } } as never);
      api.createRole.mockResolvedValue({ error: { message: 'x', code: 'cannot_grant_unowned_permissions' } } as never);
      await wrap(<AdminRolesScreen />);
      const user = userEvent.setup();
      await user.press(await screen.findByRole('button', { name: 'New role' }));
      await user.type(await screen.findByLabelText('Name — lowercase letters and underscores'), 'x');
      await user.type(screen.getByLabelText('What it is for'), 'y');
      await user.press(screen.getByRole('button', { name: 'Create role' }));
      expect(await screen.findByRole('alert')).toHaveTextContent('You can only grant what you hold.');
    });

    it('does not list SUPER ADMIN as a role and is honest that giving a role to a person is not here', async () => {
      api.getRoles.mockResolvedValue({ data: { roles: [role('r1', 'support', 2, [])] } } as never);
      await wrap(<AdminRolesScreen />);
      await screen.findByTestId('admin-role-r1');
      expect(screen.queryByText(/super.?admin/i)).not.toBeOnTheScreen();
      expect(screen.getByText('Giving a role to a person is not on this screen yet.')).toBeOnTheScreen();
    });
  });

  describe('Settings', () => {
    const setting = (over: Record<string, unknown> = {}) => ({
      key: 'points_monthly_reset_value', value: '2', valueType: 'integer', category: 'content', description: 'Reset value (never zero)',
      validationRules: { min: 1 }, updatedAt: new Date().toISOString(), updatedByName: 'Brian M.', ...over,
    });

    it('shows every key with what it governs, its value and who last changed it', async () => {
      api.getAdminMe.mockResolvedValue(me(['settings.view', 'settings.edit']));
      api.getSettings.mockResolvedValue({ data: { settings: [setting(), setting({ key: 'minimum_age', value: '18', description: 'Minimum age', updatedByName: null })] } } as never);
      await wrap(<AdminSettingsScreen />);
      const row = await screen.findByTestId('admin-setting-points_monthly_reset_value');
      expect(within(row).getByText('Reset value (never zero)')).toBeOnTheScreen();
      expect(screen.getByTestId('admin-setting-value-points_monthly_reset_value')).toHaveTextContent('2');
      expect(within(row).getByText(/Last changed by Brian M\. · \d\d:\d\d today/)).toBeOnTheScreen();
      expect(within(screen.getByTestId('admin-setting-minimum_age')).getByText('Not changed since it was set up')).toBeOnTheScreen();
      // Keys come from the server; there is no way to invent one here.
      expect(screen.queryByText(/add a key/i)).not.toBeOnTheScreen();
    });

    it('an account with settings.view only can look and cannot change', async () => {
      api.getAdminMe.mockResolvedValue(me(['settings.view']));
      api.getSettings.mockResolvedValue({ data: { settings: [setting()] } } as never);
      await wrap(<AdminSettingsScreen />);
      await screen.findByTestId('admin-setting-points_monthly_reset_value');
      expect(await screen.findByTestId('admin-settings-view-only')).toBeOnTheScreen();
      expect(screen.queryByRole('button', { name: /^Change/ })).not.toBeOnTheScreen();
    });

    it('a change needs a reason before anything is sent, then sends value and reason', async () => {
      api.getAdminMe.mockResolvedValue(me(['settings.view', 'settings.edit']));
      api.getSettings.mockResolvedValue({ data: { settings: [setting()] } } as never);
      api.updateSetting.mockResolvedValue({ data: { setting: setting({ value: '3' }) } } as never);
      await wrap(<AdminSettingsScreen />);
      const user = userEvent.setup();
      await user.press(await screen.findByRole('button', { name: 'Change points_monthly_reset_value' }));
      await user.clear(screen.getByLabelText('New value'));
      await user.type(screen.getByLabelText('New value'), '3');
      await user.press(screen.getByRole('button', { name: 'Save change' }));
      expect(await screen.findByRole('alert')).toHaveTextContent('A reason is required.');
      expect(api.updateSetting).not.toHaveBeenCalled();

      await user.type(screen.getByLabelText('Why'), 'Raise the automatic entry');
      await user.press(screen.getByRole('button', { name: 'Save change' }));
      expect(api.updateSetting).toHaveBeenCalledWith('points_monthly_reset_value', '3', 'Raise the automatic entry');
      expect(await screen.findByText('Saved.')).toBeOnTheScreen();
    });

    it('shows the server\'s one-way and combined-rule refusals as they are', async () => {
      api.getAdminMe.mockResolvedValue(me(['settings.view', 'settings.edit']));
      api.getSettings.mockResolvedValue({ data: { settings: [setting()] } } as never);
      api.updateSetting.mockResolvedValueOnce({ error: { message: 'x', code: 'upward_only' } } as never);
      await wrap(<AdminSettingsScreen />);
      const user = userEvent.setup();
      await user.press(await screen.findByRole('button', { name: 'Change points_monthly_reset_value' }));
      await user.type(screen.getByLabelText('Why'), 'test');
      await user.press(screen.getByRole('button', { name: 'Save change' }));
      expect(await screen.findByText('This one can only go up.')).toBeOnTheScreen();
      api.updateSetting.mockResolvedValueOnce({ error: { message: 'x', code: 'coupon_below_commission' } } as never);
      await user.press(screen.getByRole('button', { name: 'Save change' }));
      expect(await screen.findByText('That would leave a coupon below the commission owed.')).toBeOnTheScreen();
    });

    it('a failed read is a retryable error, not an empty table', async () => {
      api.getAdminMe.mockResolvedValue(me(['settings.view']));
      api.getSettings.mockResolvedValue({ error: { message: 'x', code: 'forbidden' } } as never);
      await wrap(<AdminSettingsScreen />);
      expect(await screen.findByText("This account doesn't hold that section.")).toBeOnTheScreen();
      expect(screen.queryByText('No settings are live on this server.')).not.toBeOnTheScreen();
    });
  });

  describe('Applications', () => {
    const amb = { id: 'a1', userId: 'u1', fullName: 'Ray Ortiz', workArea: 'Capitol Hill', startingPlaces: 'A, B, C', referredByCode: 'niab', phone: '206 555 0148', status: 'submitted', createdAt: new Date().toISOString() };
    const cre = { id: 'c1', userId: 'u2', fullName: 'Cam Lee', channel: '@camlee on Instagram', phone: '206 555 0110', status: 'submitted', createdAt: new Date().toISOString() };

    beforeEach(() => {
      api.getAdminMe.mockResolvedValue(me(['roles.grant']));
      api.getApplications.mockImplementation(async (kind: string) => ({ data: { kind, applications: kind === 'ambassador' ? [amb] : [cre] } }) as never);
    });

    it('shows what the applicant submitted and nothing beyond it', async () => {
      await wrap(<AdminApplicationsScreen />);
      const card = await screen.findByTestId('admin-application-a1');
      expect(within(card).getByText('Ray Ortiz')).toBeOnTheScreen();
      expect(within(card).getByText('Capitol Hill')).toBeOnTheScreen();
      expect(within(card).getByText('A, B, C')).toBeOnTheScreen();
      expect(within(card).getByText('Came through code niab')).toBeOnTheScreen();
      expect(screen.queryByText(/birth|dob|chat|hello code/i)).not.toBeOnTheScreen();
    });

    it('approving sends the note with the decision and then reloads the queue', async () => {
      api.decideApplication.mockResolvedValue({ data: { approved: true } } as never);
      await wrap(<AdminApplicationsScreen />);
      const user = userEvent.setup();
      await screen.findByTestId('admin-application-a1');
      await user.type(screen.getByLabelText('Note (optional)'), 'good fit');
      api.getApplications.mockResolvedValue({ data: { kind: 'ambassador', applications: [] } } as never);
      await user.press(screen.getByRole('button', { name: 'Approve' }));
      expect(api.decideApplication).toHaveBeenCalledWith('ambassador', 'a1', 'approve', 'good fit');
      expect(await screen.findByText('Approved.')).toBeOnTheScreen();
      expect(await screen.findByText('No open applications.')).toBeOnTheScreen();
    });

    it('declining sends decline, with no note when none was typed', async () => {
      api.decideApplication.mockResolvedValue({ data: { declined: true } } as never);
      await wrap(<AdminApplicationsScreen />);
      const user = userEvent.setup();
      await user.press(await screen.findByRole('button', { name: 'Decline' }));
      expect(api.decideApplication).toHaveBeenCalledWith('ambassador', 'a1', 'decline', undefined);
    });

    it('says when someone else decided first, and when the account already holds a staff role', async () => {
      api.decideApplication.mockResolvedValueOnce({ error: { message: 'x', code: 'already_decided' } } as never);
      await wrap(<AdminApplicationsScreen />);
      const user = userEvent.setup();
      await user.press(await screen.findByRole('button', { name: 'Approve' }));
      expect(await screen.findByText('Someone already decided this one.')).toBeOnTheScreen();
      api.decideApplication.mockResolvedValueOnce({ error: { message: 'x', code: 'not_grantable' } } as never);
      await user.press(await screen.findByRole('button', { name: 'Approve' }));
      expect(await screen.findByText('That account already holds a staff role.')).toBeOnTheScreen();
    });

    it('the Creator tab loads Creator applications and shows their channel', async () => {
      await wrap(<AdminApplicationsScreen />);
      const user = userEvent.setup();
      await screen.findByTestId('admin-application-a1');
      await user.press(screen.getByRole('tab', { name: 'Creator' }));
      const card = await screen.findByTestId('admin-application-c1');
      expect(within(card).getByText('@camlee on Instagram')).toBeOnTheScreen();
      expect(api.getApplications).toHaveBeenLastCalledWith('influencer');
      expect(screen.queryByTestId('admin-application-a1')).not.toBeOnTheScreen();
    });

    it('says applications are not set up before the database has them', async () => {
      api.getApplications.mockResolvedValue({ error: { message: 'x', code: 'applications_unavailable' } } as never);
      await wrap(<AdminApplicationsScreen />);
      expect(await screen.findByText('Applications are not set up on this server yet.')).toBeOnTheScreen();
    });
  });

  it('never uses the banned words in staff copy', async () => {
    api.getAdminMe.mockResolvedValue(me(['audit.view', 'roles.grant']));
    await wrap(<AdminHomeScreen />);
    await screen.findByRole('button', { name: 'Audit' });
    await waitFor(() => expect(JSON.stringify(screen.toJSON())).not.toMatch(/\b(survey|hookup|rating)\b/i));
  });
});
