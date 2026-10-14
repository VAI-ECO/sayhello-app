/** Member Hello Hangout referrals (S3 wave 3, API 086) and the admin side. The server decides the points. */
import { api } from './client';

export interface ReferralRow { id: string; placeName: string; address: string | null; status: 'submitted' | 'converted' | 'void'; pointsAwarded: number | null; createdAt: string; decidedAt: string | null }
export const getMyReferrals = () => api.get<{ pointsIfConverted: number; referrals: ReferralRow[] }>('/referrals/hangout');
export const sendReferral = (b: { placeName: string; address?: string; note?: string }) => api.post<{ referral: ReferralRow }>('/referrals/hangout', b);

export interface AdminReferralRow extends ReferralRow { referrerUserId: string; note: string | null; helloHangoutId: string | null; decisionReason: string | null }
export const getAdminReferrals = (status?: 'submitted' | 'converted' | 'void') => api.get<{ referrals: AdminReferralRow[] }>(`/admin/referrals${status ? `?status=${status}` : ''}`);
export const convertReferral = (id: string, helloHangoutId: string, reason: string) => api.post<{ converted: boolean; pointsAwarded: number }>(`/admin/referrals/${encodeURIComponent(id)}/convert`, { helloHangoutId, reason });
export const voidReferral = (id: string, reason: string) => api.post<{ voided: boolean }>(`/admin/referrals/${encodeURIComponent(id)}/void`, { reason });
