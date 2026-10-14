/**
 * HELLO ADMIN SHELL — the staff work surface on the shared RoleShell (P 375 · T 834 · D 1440 rail).
 *
 * The rail lists only sections whose SCREEN is built AND whose permission the server says this account
 * holds. That is presentation only — every screen's own API call is enforced on the server (§23.10 "a
 * hidden button is not a permission"). Sections the account holds but that are not built appear on
 * Home, in words, never as a dead link.
 *
 * SUPER ADMIN is not a section and not a permission (§23.15): nothing here special-cases it.
 */

import { useEffect, useState, type ReactNode } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { t } from '../../i18n';
import { Colors } from '../../theme/tokens';
import { RoleShell, Card, type RailItem } from '../role/RoleShell';
import { getAdminMe, type AdminMe } from '../../api/admin';

export type AdminRailKey =
  | 'home' | 'audit' | 'roles' | 'settings' | 'applications'
  | 'staff' | 'campaigns' | 'reports' | 'payouts' | 'operations' | 'categories' | 'system' | 'legal' | 'lostPhrases' | 'coupons' | 'drawings' | 'store' | 'fulfilment' | 'referrals' | 'overrides' | 'venues' | 'see' | 'flagged' | 'keywords' | 'monitoring';

interface BuiltScreen {
  key: Exclude<AdminRailKey, 'home'>;
  label: string;
  href: RailItem['href'];
  /** The enumerated permission (§23.3) the screen's own API route requires. */
  needs: string;
  /** Home card copy keys; absent = the wave-1 `admin.home.section.<key>` / `sectionBody.<key>`. */
  home?: { title: string; body: string };
}

const w3 = (key: string) => ({ title: `adminW3.home.${key}.title`, body: `adminW3.home.${key}.body` });
const w2 = (key: string) => ({ title: `adminW2.home.${key}.title`, body: `adminW2.home.${key}.body` });

/** Every Hello Admin screen that exists, with the permission its API route enforces. */
export const BUILT_SCREENS: BuiltScreen[] = [
  { key: 'settings', label: 'admin.rail.settings', href: '/admin/settings', needs: 'settings.view' },
  { key: 'audit', label: 'admin.rail.audit', href: '/admin/audit', needs: 'audit.view' },
  { key: 'roles', label: 'admin.rail.roles', href: '/admin/roles', needs: 'roles.create' },
  // No delivered frame and no §23.3 permission of its own: gated by roles.grant (recorded, reversible).
  { key: 'applications', label: 'admin.rail.applications', href: '/admin/applications', needs: 'roles.grant' },
  { key: 'staff', label: 'adminW2.rail.staff', href: '/admin/staff', needs: 'roles.grant', home: w2('staff') },
  // Wave 2 (stage 09). Each needs the permission its API route enforces.
  { key: 'reports', label: 'adminW2.rail.reports', href: '/admin/reports', needs: 'reports.review', home: w2('reports') },
  // Lane 04: the keyword pass's queue and its word list (§24.15). Each needs the permission its API route enforces.
  { key: 'flagged', label: 'adminW2.rail.flagged', href: '/admin/flagged', needs: 'reports.review', home: w2('flagged') },
  { key: 'keywords', label: 'adminW2.rail.keywords', href: '/admin/keywords', needs: 'reports.keywords', home: w2('keywords') },
  // §16.25-16.31: Ambassador roster and triage matrix. Read-only, gated like System (audit.view), as its API routes are.
  { key: 'monitoring', label: 'adminW2.rail.monitoring', href: '/admin/monitoring', needs: 'audit.view', home: w2('monitoring') },
  { key: 'payouts', label: 'adminW2.rail.payouts', href: '/admin/payouts', needs: 'payouts.export', home: w2('payouts') },
  { key: 'campaigns', label: 'adminW2.rail.campaigns', href: '/admin/campaigns', needs: 'payouts.export', home: w2('campaigns') },
  { key: 'operations', label: 'adminW2.rail.operations', href: '/admin/operations', needs: 'overrides.view', home: w2('operations') },
  { key: 'coupons', label: 'adminW2.rail.coupons', href: '/admin/coupons', needs: 'overrides.view', home: w2('coupons') },
  { key: 'categories', label: 'adminW2.rail.categories', href: '/admin/categories', needs: 'settings.view', home: w2('categories') },
  { key: 'legal', label: 'adminW2.rail.legal', href: '/admin/legal', needs: 'settings.view', home: w2('legal') },
  { key: 'lostPhrases', label: 'adminW2.rail.lostPhrases', href: '/admin/lost-phrases', needs: 'settings.view', home: w2('lostPhrases') },
  { key: 'system', label: 'adminW2.rail.system', href: '/admin/system', needs: 'audit.view', home: w2('system') },
  { key: 'drawings', label: 'adminW2.rail.drawings', href: '/admin/drawings', needs: 'drawings.view', home: w2('drawings') },
  // Wave 3 (stage 10 admin): catalog and fulfilment ride the settings permission (§23.3 names no store permission).
  { key: 'store', label: 'adminW3.rail.store', href: '/admin/store', needs: 'settings.view', home: w3('store') },
  { key: 'fulfilment', label: 'adminW3.rail.fulfilment', href: '/admin/fulfilment', needs: 'settings.view', home: w3('fulfilment') },
  { key: 'referrals', label: 'adminW3.rail.referrals', href: '/admin/referrals', needs: 'overrides.view', home: w3('referrals') },
  { key: 'overrides', label: 'adminW3.rail.overrides', href: '/admin/overrides', needs: 'overrides.view', home: w3('overrides') },
  { key: 'venues', label: 'adminW3.rail.venues', href: '/admin/venue-links', needs: 'overrides.view', home: w3('venues') },
  // Wave 6: MN-01-SN-18 see layer. Read-only, gated like System (audit.view); each measure also needs its source's permission.
  { key: 'see', label: 'adminSee.rail', href: '/admin/see-layer', needs: 'audit.view', home: { title: 'adminSee.home.title', body: 'adminSee.home.body' } },
];

/** The §23.3 section a screen belongs to (the part of its permission before the dot). */
export const sectionOfScreen = (s: BuiltScreen) => s.needs.split('.')[0];

export function screensFor(me: AdminMe | null): BuiltScreen[] {
  if (!me) return [];
  return BUILT_SCREENS.filter((s) => me.permissions.includes(s.needs));
}

export function useAdminMe() {
  const [me, setMe] = useState<AdminMe | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  useEffect(() => {
    let alive = true;
    (async () => {
      let res: Awaited<ReturnType<typeof getAdminMe>> | undefined;
      try {
        res = await getAdminMe();
      } catch {
        res = undefined;
      }
      if (!alive) return;
      if (res?.data) {
        setMe(res.data);
        setState('ready');
      } else {
        setState('error');
      }
    })();
    return () => { alive = false; };
  }, []);
  return { me, state };
}

/**
 * §23.6: the server refuses every staff route on a session that has not entered a two-factor code. The shell
 * mirrors that in words so a staff member is never left on a screen full of failed loads: it shows a card that
 * opens the two-factor screen. Presentation only; the server is the gate. A SUPER ADMIN account holds no
 * granted section (§23.15) and is still staff, so `isSuperAdmin` counts.
 */
export function needsTwoFactor(me: AdminMe | null): 'enrol' | 'verify' | null {
  if (!me || !me.twoFactorEnforced || me.twoFactorVerified !== false) return null;
  if (me.sections.length === 0 && !me.isSuperAdmin) return null;
  return me.twoFactorEnabled ? 'verify' : 'enrol';
}

export function TwoFactorGate({ step }: { step: 'enrol' | 'verify' }) {
  const router = useRouter();
  return (
    <Card testID="admin-two-factor-gate">
      <Text style={gateStyles.title}>{t('adminW2.twoFactor.gateTitle')}</Text>
      <Text style={gateStyles.body}>{t(step === 'enrol' ? 'adminW2.twoFactor.gateBodyEnrol' : 'adminW2.twoFactor.gateBodyVerify')}</Text>
      <TouchableOpacity onPress={() => router.push('/admin/two-factor')} accessibilityRole="button" accessibilityLabel={t('adminW2.twoFactor.gateOpen')} style={gateStyles.button} testID="admin-two-factor-gate-open">
        <Text style={gateStyles.buttonText}>{t('adminW2.twoFactor.gateOpen')}</Text>
      </TouchableOpacity>
    </Card>
  );
}

interface ShellProps {
  active?: AdminRailKey;
  title: string;
  subtitle?: string;
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  onBack?: () => void;
  testID?: string;
  /** The two-factor screen itself (and Home, which carries its own card) must stay reachable. */
  allowUnverified?: boolean;
}

export function AdminShell({ allowUnverified, children, ...props }: ShellProps) {
  const { me } = useAdminMe();
  const rail: RailItem[] = [
    { key: 'home', label: 'admin.rail.home', href: '/admin' },
    ...screensFor(me).map((s) => ({ key: s.key, label: s.label, href: s.href })),
  ];
  const gate = allowUnverified ? null : needsTwoFactor(me);
  return (
    <RoleShell roleLabel="admin.rail.role" rail={rail} railId="admin" {...props}>
      {gate ? <TwoFactorGate step={gate} /> : children}
    </RoleShell>
  );
}

const gateStyles = StyleSheet.create({
  title: { fontSize: 16.5, fontWeight: '700', color: Colors.Ink },
  body: { fontSize: 15.5, lineHeight: 23, color: Colors.Muted },
  button: { backgroundColor: Colors.Ink, borderRadius: 29, minHeight: 54, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, marginTop: 8 },
  buttonText: { color: Colors.Chalk, fontSize: 17, fontWeight: '700' },
});
