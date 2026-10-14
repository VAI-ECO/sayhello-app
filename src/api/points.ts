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
