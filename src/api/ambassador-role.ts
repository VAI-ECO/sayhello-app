/** Ambassador role settings — opt-out (API 088). The server decides the counts and holds the position. */
import { api } from './client';

export type OptOutPreview =
  | { alreadyOptedOut: true; optOutDate: string; holdExpiresAt: string; confirmed: boolean; reinstated: boolean }
  | {
      alreadyOptedOut: false; originatedCount: number; servicingCount: number; buildingCount: number; confirmationRequired: string; holdHours: number;
      figuresWithheld: boolean; payoutPerHangoutPerYear?: number; payoutYears?: number; totalPayoutCents?: number;
    };
export const getOptOutPreview = () => api.get<OptOutPreview>('/ambassador/opt-out/preview');
export const optOut = (typedConfirmation: string) => api.post<{ optOutInitiated: boolean; holdExpiresAt: string; message: string }>('/ambassador/opt-out', { typedConfirmation });
export const reinstate = () => api.post<{ reinstated: boolean }>('/ambassador/opt-out/reinstate', {});
