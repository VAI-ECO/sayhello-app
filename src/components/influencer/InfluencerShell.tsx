/**
 * INFLUENCER (Creator) SHELL — CANON-RL-04 at P 375 · T 834 · D 1440 on the shared RoleShell.
 * The rail is the delivered one (Overview · My Links · Ambassadors · Earnings · Toolkit · Account);
 * every entry is a built screen.
 */

import type { ReactNode } from 'react';
import { RoleShell, type RailItem } from '../role/RoleShell';

export type InfluencerRailKey = 'overview' | 'links' | 'ambassadors' | 'earnings' | 'toolkit' | 'account';

const RAIL: RailItem[] = [
  { key: 'overview', label: 'influencer.rail.overview', href: '/influencer' },
  { key: 'links', label: 'influencer.rail.links', href: '/influencer/my-links' },
  { key: 'ambassadors', label: 'influencer.rail.ambassadors', href: '/influencer/ambassadors' },
  { key: 'earnings', label: 'influencer.rail.earnings', href: '/influencer/earnings' },
  { key: 'toolkit', label: 'influencer.rail.toolkit', href: '/influencer/toolkit' },
  { key: 'account', label: 'influencer.rail.account', href: '/influencer/account' },
];

interface ShellProps {
  active?: InfluencerRailKey;
  title: string;
  subtitle?: string;
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  onBack?: () => void;
  testID?: string;
}

export function InfluencerShell(props: ShellProps) {
  return <RoleShell roleLabel="influencer.rail.role" rail={RAIL} railId="influencer" {...props} />;
}
