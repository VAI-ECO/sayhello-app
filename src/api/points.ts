/**
 * POINTS API
 *
 * Balance IS drawing entries — one pool.
 */

import { api } from './client';

export interface PointsBalance {
  balance: number;
  drawingEntries: number;
}

export interface LedgerEntry {
  id: string;
  entryType?: string;
  pointsAmount?: number;
  createdAt?: string;
  entry_type?: string;
  points_amount?: number;
  description?: string | null;
  created_at?: string;
  [key: string]: unknown;
}

export async function getPointsBalance(): Promise<{
  data?: PointsBalance;
  error?: { message: string };
}> {
  return api.get<PointsBalance>('/points/balance');
}

export async function getPointsLedger(): Promise<{
  data?: { entries: LedgerEntry[] };
  error?: { message: string };
}> {
  return api.get<{ entries: LedgerEntry[] }>('/points/ledger');
}

/**
 * Connections · points earned (CANON-RL-01-SN-51): one line per hello award in
 * this viewer's own ledger. Name, colour and place only after reveal.
 */
export interface ConnectionPointsEntry {
  id: string;
  kind: 'accept' | 'selfie' | 'continue';
  points: number;
  createdAt: string;
  helloId: string | null;
  revealed: boolean;
  displayName: string | null;
  identityColor: string | null;
  locationName: string | null;
  chatOpen: boolean;
}

export async function getConnectionsPoints() {
  return api.get<{ entries: ConnectionPointsEntry[] }>('/points/connections');
}
