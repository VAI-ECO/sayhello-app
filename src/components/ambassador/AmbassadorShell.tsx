/**
 * AMBASSADOR SHELL — the role's three delivered sizes (CANON-RL-03: P 375 · T 834 · D 1440) on the
 * shared RoleShell. The rail lists ONLY the destinations that are built; the delivered rail also
 * draws "Codes and stands", "Toolkit" and "Account" (SN-15 / SN-29 / SN-34) — not built, so absent
 * rather than dead links (ledger).
 */

import type { ReactNode } from 'react';
import { RoleShell, Card, Eyebrow, layoutForWidth, useRoleLayout, type RailItem, type RoleLayout } from '../role/RoleShell';

export { Card, Eyebrow, layoutForWidth };
export type AmbassadorLayout = RoleLayout;
export const useAmbassadorLayout = useRoleLayout;

export type RailKey = 'overview' | 'hangouts' | 'visits' | 'payouts' | 'stands' | 'toolkit' | 'account';

const RAIL: RailItem[] = [
  { key: 'overview', label: 'ambassador.rail.overview', href: '/(ambassador)' },
  { key: 'hangouts', label: 'ambassador.rail.hangouts', href: '/(ambassador)/hangouts' },
  { key: 'visits', label: 'ambassador.rail.visits', href: '/(ambassador)/visit-history' },
  { key: 'payouts', label: 'ambassador.rail.payouts', href: '/(ambassador)/earned-building' },
  // S3 wave 3: the three the delivered rail also draws (SN-21 / SN-29 / SN-34) now exist.
  { key: 'stands', label: 'ambRole.rail.stands', href: '/(ambassador)/stands' },
  { key: 'toolkit', label: 'ambRole.rail.toolkit', href: '/(ambassador)/toolkit' },
  { key: 'account', label: 'ambRole.rail.account', href: '/(ambassador)/account' },
];

interface ShellProps {
  active?: RailKey;
  title: string;
  subtitle?: string;
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  onBack?: () => void;
  testID?: string;
}

export function AmbassadorShell(props: ShellProps) {
  return <RoleShell roleLabel="ambassador.rail.role" rail={RAIL} railId="ambassador" {...props} />;
}
