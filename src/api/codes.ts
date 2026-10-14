/**
 * CODES API — influencer and ambassador codes
 * Backend: /codes
 */

import { api } from './client';

export type CodeUnavailableReason =
  | 'reserved_system'
  | 'reserved_profanity'
  | 'taken_influencer'
  | 'taken_ambassador';

export interface CodeAvailability {
  available: boolean;
  reason?: CodeUnavailableReason;
}

export interface MyCodes {
  ambassador?: { code: string; locked: boolean };
  influencer?: { code: string; locked: boolean; attributions?: number };
}

export function checkCodeAvailability(code: string) {
  return api.post<CodeAvailability>('/codes/check-availability', { code });
}

export function setInfluencerCode(code: string) {
  return api.post<{ code: string }>('/codes/influencer', { code });
}

export function getMyCodes() {
  return api.get<MyCodes>('/codes/me');
}
