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
import { RoleShell, type RailItem } from '../role/RoleShell';
import { getAdminMe, type AdminMe } from '../../api/admin';

export type AdminRailKey =
  | 'home' | 'audit' | 'roles' | 'settings' | 'applications'
  | 'staff' | 'campaigns' | 'reports' | 'payouts' | 'operations' | 'categories' | 'system' | 'legal' | 'lostPhrases' | 'coupons' | 'drawings' | 'store' | 'fulfilment' | 'referrals' | 'overrides' | 'venues' | 'see';

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

interface ShellProps {
  active?: AdminRailKey;
  title: string;
  subtitle?: string;
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  onBack?: () => void;
  testID?: string;
}

export function AdminShell(props: ShellProps) {
  const { me } = useAdminMe();
  const rail: RailItem[] = [
    { key: 'home', label: 'admin.rail.home', href: '/admin' },
    ...screensFor(me).map((s) => ({ key: s.key, label: s.label, href: s.href })),
  ];
  return <RoleShell roleLabel="admin.rail.role" rail={rail} railId="admin" {...props} />;
}
