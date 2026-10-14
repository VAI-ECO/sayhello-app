/**
 * HELLO ADMIN API (wave 2) — reports, payouts, system, legal text, coupons, drawings status, Hello Hangout
 * operations, categories, staff lookup. Responses arrive camelCased. The app only asks; every route enforces
 * its own enumerated permission on the server (§23.10). Nothing here computes a figure or a state.
 */

import { api } from './client';

// ── Reports (§35) ────────────────────────────────────────────────────────────
export type ReportSurface = 'hello' | 'chat' | 'hootza_comment' | 'hootza_chat' | 'hangout_post';
export interface ReportRowW2 {
  id: string;
  surface: ReportSurface;
  reason: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  createdAt: string;
  dueAt: string;
  overdue: boolean;
  reportedUser: { id: string; displayName: string | null } | null;
}
export const getReports = (status: 'open' | 'closed') =>
  api.get<{ actWithinHours: number; reports: ReportRowW2[] }>(`/admin/reports?status=${status}`);

export interface ChatLine { id: string; from: 'reported' | 'other'; body: string; createdAt: string }
export interface ReportDetail {
  report: {
    id: string; surface: ReportSurface; reason: string; details: string | null; status: string; createdAt: string;
    resolutionNotes: string | null; reportedUser: { id: string; displayName: string | null } | null;
  };
  evidence: {
    kind: ReportSurface; available?: boolean; text?: string; title?: string; isRemoved?: boolean;
    contextWindow?: number; before?: ChatLine[]; reported?: ChatLine; after?: ChatLine[];
  };
  strikes: { active: number; total: number; threshold: number; expiryMonths: number } | null;
  openAccountMatter: boolean;
  actions: { id: string; action: string; reason: string; createdAt: string }[];
}
export const getReport = (id: string) => api.get<ReportDetail>(`/admin/reports/${encodeURIComponent(id)}`);
export type ReportAction = 'dismiss' | 'strike' | 'remove_content' | 'eject' | 'resolve';
export const actOnReport = (id: string, action: ReportAction, reason: string) =>
  api.post<{ status: string; activeStrikes?: number; threshold?: number; accountMatterOpened?: boolean }>(
    `/admin/reports/${encodeURIComponent(id)}/action`, { action, reason });

export interface AccountMatter { id: string; userId: string; displayName: string | null; activeStrikesAtOpen: number; openedAt: string }
export const getAccountMatters = () => api.get<{ matters: AccountMatter[] }>('/admin/reports/account-matters/open');
export const decideAccountMatter = (id: string, decision: 'no_action' | 'ejected', reason: string) =>
  api.post<{ decision: string }>(`/admin/reports/account-matters/${encodeURIComponent(id)}/decide`, { decision, reason });

export interface SelfieRemoval { id: string; helloId: string; requestedByNote: string; reason: string; storageDeletedAt: string | null; createdAt: string }
export const getSelfieRemovals = () => api.get<{ removals: SelfieRemoval[] }>('/admin/reports/selfie-removals/log');
export const removeSelfie = (helloId: string, requestNote: string, reason: string) =>
  api.post<{ removalId: string; storageDeleted: boolean }>('/admin/reports/selfie-removals', { helloId, requestNote, reason });

// ── Payouts (§14.12-14.18) ───────────────────────────────────────────────────
export type ProviderState = 'awaiting_decision' | 'approved_not_sent' | 'sent_to_provider' | 'paid_confirmed' | 'failed' | 'rejected';
export interface PayoutOverview {
  provider: string; providerConnected: boolean; settlementHoldDays: number | null; fulfilmentWindowDays: number | null;
  figuresCleared: boolean; minimumCents: number | null;
}
export interface PayoutRequestRow {
  id: string; ambassadorName: string | null; amountCents: number; requestedAt: string; providerState: ProviderState;
  rejectedReason: string | null; failureReason: string | null;
}
export const getPayoutOverview = () => api.get<PayoutOverview>('/admin/payouts/overview');
export const getPayoutRequests = (status: 'open' | 'closed') => api.get<{ requests: PayoutRequestRow[] }>(`/admin/payouts?status=${status}`);
export const decidePayout = (id: string, verb: 'approve' | 'reject', reason: string) =>
  api.post<{ providerState: ProviderState }>(`/admin/payouts/${encodeURIComponent(id)}/${verb}`, { reason });
export interface OptOutRow {
  id: string; ambassadorName: string | null; originatedCount: number; servicingCount: number;
  payoutPerHangoutPerYearCents: number; payoutYears: number; optedOutAt: string; holdExpiresAt: string;
  state: 'in_hold' | 'hold_ended' | 'confirmed' | 'reinstated';
}
export const getOptOuts = () => api.get<{ optOuts: OptOutRow[] }>('/admin/payouts/opt-outs');

// ── System ───────────────────────────────────────────────────────────────────
export interface SystemOverview {
  checkedAt: string; schedulerEnabled: boolean;
  /** W8-A proximity discovery: the producer mode and COUNTS only (no cell, member or location). Absent on an older API. */
  discovery?: {
    mode: string; active: boolean; heartbeatsLive: number | null; heartbeatsStored: number | null; hellosCreated24h: number | null;
    jobs: { name: string; enabled: boolean; lastSuccessAt: string | null; ageMinutes: number | null; stale: boolean }[];
    settingKey: string;
  };
  jobs: {
    name: string; schedule: string; lastSuccessAt: string | null; ageMinutes: number | null; staleAfterMinutes: number; stale: boolean; enabled?: boolean;
    /** Lane 04 (migration 281): paused at runtime by an admin. Absent on an older API. */
    paused?: boolean; pause?: { reason: string; pausedAt: string } | null;
  }[];
  /** False when the database has not had migration 281, so pausing is not offered. Absent on an older API. */
  pausesAvailable?: boolean;
  recentJobErrors: { id: string; jobName: string; error: string | null; finishedAt: string }[];
  providers: { payments: { provider: string; configured: boolean }; payouts: { provider: string; configured: boolean } };
  switches: { key: string; value: string; valueType: string; description: string; updatedAt: string }[];
}
export const getSystem = () => api.get<SystemOverview>('/admin/system/overview');
export const pauseJob = (name: string, reason: string) => api.post<{ paused: boolean }>(`/admin/system/jobs/${encodeURIComponent(name)}/pause`, { reason });
export const resumeJob = (name: string, reason: string) => api.post<{ paused: boolean }>(`/admin/system/jobs/${encodeURIComponent(name)}/resume`, { reason });

// ── Monitoring (RULES §16.25-16.31) ──────────────────────────────────────────
export type AmbassadorFlag = 'healthy' | 'slipping' | 'at_risk' | 'abandoned';
export interface FlagDays { slipping: number; atRisk: number; abandoned: number }
export interface RosterRow { id: string; fullName: string | null; originatedCount: number | null; servicingCount: number | null; daysSinceLastVisit: number | null; flag: AmbassadorFlag }
export const getMonitoringRoster = () => api.get<{ roster: RosterRow[]; flagDays: FlagDays }>('/admin/monitoring/ambassadors');
export type TriageCategory = 'dying' | 'neglected' | 'qr_hidden' | 'healthy';
export interface TriageRow {
  id: string; source: 'hello_hangout' | 'legacy'; businessName: string; servicingAmbassador: { id: string; fullName: string } | null;
  category: TriageCategory; daysSinceVisit: number | null; hasRecentScans: boolean;
}
export const getMonitoringTriage = () => api.get<{ triage: TriageRow[]; flagDays: FlagDays; hiddenQrDays: number }>('/admin/monitoring/triage');

// ── Legal text ───────────────────────────────────────────────────────────────
export interface LegalDoc { slug: 'terms' | 'privacy' | 'drawing_rules'; title: string; body: string | null; version: string | null; approvedAt: string | null; updatedAt: string }
export const getLegalDocs = () => api.get<{ documents: LegalDoc[] }>('/admin/legal');
export const saveLegal = (slug: string, body: string, version: string, reason: string) =>
  api.put<{ saved: boolean }>(`/admin/legal/${slug}`, { body, version, reason });
export const approveLegal = (slug: string, reason: string) => api.post<{ approved: boolean }>(`/admin/legal/${slug}/approve`, { reason });

// ── Coupons (MONEY Part 5) ───────────────────────────────────────────────────
export interface Coupon {
  id: string; name: string; code?: string | null; usesRedeemed?: number; usesReserved?: number;
  valueType: 'fixed_cents' | 'percent'; value: number; scope: 'everybody' | 'group' | 'named';
  scopeLabel: string | null; startsAt: string; endsAt: string; maxTotalUses: number | null; maxUsesPerPerson: number | null;
  status: 'active' | 'retired'; retiredReason: string | null;
}
export interface NewCoupon {
  name: string; code?: string; valueType: 'fixed_cents' | 'percent'; value: number; scope: 'everybody' | 'group' | 'named';
  scopeLabel?: string; scopeUserId?: string; scopeHelloHangoutId?: string; startsAt: string; endsAt: string;
  maxTotalUses?: number; maxUsesPerPerson?: number; reason: string;
}
export const getCoupons = () => api.get<{ coupons: Coupon[]; countsAvailable?: boolean }>('/admin/coupons');
export const createCoupon = (c: NewCoupon) => api.post<{ coupon: Coupon }>('/admin/coupons', c);
export const retireCoupon = (id: string, reason: string) => api.post<{ retired: boolean }>(`/admin/coupons/${encodeURIComponent(id)}/retire`, { reason });

// ── Drawings (status only) ───────────────────────────────────────────────────
export interface DrawingsStatus {
  state: 'planned'; firstDrawingDate: null; winnerEngine: 'not_built';
  drawings: { id: string; drawingName: string; drawingDate: string; isFinalized: boolean; totalEntries: number; totalParticipants: number }[];
  settings: { key: string; value: string; description: string }[];
}
export const getDrawings = () => api.get<DrawingsStatus>('/admin/drawings');

// ── Hello Hangout operations (hardship, duplicates, queue escalations) ───────
const HB = '/admin/hangout-business';
export interface HardshipRow {
  id: string; helloHangoutId: string; note: string | null; status: string; createdAt: string;
  helloHangouts: { name: string; address: string | null; tier: string | null; priceCents: number | null; status: string } | null;
}
export const getHardship = () => api.get<{ requests: HardshipRow[] }>(`${HB}/hardship?status=pending`);
export const decideHardship = (id: string, body: { decision: 'approved'; approvedPriceCents: number; reason: string } | { decision: 'declined'; reason: string }) =>
  api.post<{ decided: string }>(`${HB}/hardship/${encodeURIComponent(id)}/decide`, body);
export interface DuplicateRow { id: string; name: string; address: string | null; status: string; createdAt: string; locationDuplicateOf: string | null }
export const getDuplicates = () => api.get<{ duplicates: DuplicateRow[] }>(`${HB}/location-duplicates`);
export interface EscalationRow {
  id: string; helloHangoutId: string; reason: string; radiusMilesApplied: number | null; rounds: number | null; createdAt: string;
  helloHangouts: { name: string; address: string | null } | null;
}
export const getEscalations = () => api.get<{ escalations: EscalationRow[] }>(`${HB}/queue-escalations?status=open`);
export const resolveEscalation = (id: string, resolution: string) => api.post<{ resolved: boolean }>(`${HB}/queue-escalations/${encodeURIComponent(id)}/resolve`, { resolution });
export const expandEscalation = (id: string, radiusMiles: number, reason: string) =>
  api.post<{ expanded: boolean }>(`${HB}/queue-escalations/${encodeURIComponent(id)}/expand`, { radiusMiles, reason });

// ── Business categories ──────────────────────────────────────────────────────
export interface CategoryRow { id: string; parentId: string | null; name: string; sortOrder: number; retiredAt: string | null }
export const getCategories = () => api.get<{ categories: CategoryRow[] }>(`${HB}/categories`);
export const createCategory = (name: string, parentId: string | null) => api.post<{ category: { id: string } }>(`${HB}/categories`, { name, parentId });
export const renameCategory = (id: string, name: string) => api.patch<{ ok: boolean }>(`${HB}/categories/${encodeURIComponent(id)}`, { name });
export const setCategoryRetired = (id: string, retire: boolean) => api.post<{ retired: boolean }>(`${HB}/categories/${encodeURIComponent(id)}/${retire ? 'retire' : 'restore'}`, {});
export const importCategories = (csv: string) => api.post<{ created: number }>(`${HB}/categories/import`, { csv });

// ── Staff ────────────────────────────────────────────────────────────────────
export interface MemberHit { id: string; displayName: string | null; role: string; isAmbassador: boolean; isHangoutOwner: boolean; isAdmin: boolean }
export const lookupMembers = (q: string) => api.get<{ members: MemberHit[] }>(`/admin/members?q=${encodeURIComponent(q)}`);
export interface StaffRow { userId: string; displayName: string | null; roles: { roleId: string; name: string; assignedAt: string }[] }
export const getStaff = () => api.get<{ staff: StaffRow[] }>('/admin/members/staff');
export const getRoleChoices = () => api.get<{ roles: { id: string; name: string; description: string | null }[] }>('/admin/members/roles');
export const assignRole = (userId: string, roleId: string) => api.post<{ assigned: boolean }>('/admin/roles/assign', { userId, roleId });
export const revokeRole = (userId: string, roleId: string) => api.delete<{ revoked?: boolean }>(`/admin/roles/assign?userId=${encodeURIComponent(userId)}&roleId=${encodeURIComponent(roleId)}`);

// ── Bonus campaigns ──────────────────────────────────────────────────────────
export type BonusTrigger = 'creator_channel_signup' | 'milestone_hangouts' | 'retention_streak' | 'referral_volume';
export interface BonusCampaign {
  id: string; title: string; description: string; triggerType: BonusTrigger; triggerThreshold: number;
  bonusAmountCents: number; budgetCapCents: number; spentCents: number; status: 'active' | 'paused' | 'ended';
}
export const getCampaigns = () => api.get<{ campaigns: BonusCampaign[] }>('/admin/bonus/campaigns');
export const createCampaign = (c: { title: string; description: string; triggerType: BonusTrigger; triggerThreshold: number; bonusAmountCents: number; budgetCapCents: number; reason: string }) =>
  api.post<{ campaign: BonusCampaign }>('/admin/bonus/campaigns', c);
export const setCampaignStatus = (id: string, status: 'active' | 'paused' | 'ended', reason: string) =>
  api.patch<{ campaign: BonusCampaign }>(`/admin/bonus/campaigns/${encodeURIComponent(id)}`, { status, reason });

// ── Two-factor (TOTP) — mandatory for staff (§23.6), enforced by the server on every other admin route ──
export interface TwoFactorStatus {
  configured: boolean; enrolled: boolean; confirmed: boolean; enforced: boolean;
  /** This session has entered a code. */
  sessionVerified: boolean;
  recoveryCodesRemaining: number;
  /** Seconds left on a wrong-code lock; 0 when not locked. */
  lockedSeconds: number;
}
export const getTwoFactorStatus = () => api.get<TwoFactorStatus>('/admin/2fa/status');
export const enrollTwoFactor = () => api.post<{ secret: string; otpauthUri: string }>('/admin/2fa/enroll', {});
/** The recovery codes come back ONCE, here; the server never returns them again. */
export const confirmTwoFactor = (code: string) => api.post<{ enrolled: boolean; recoveryCodes: string[] }>('/admin/2fa/confirm', { code });
export const verifyTwoFactor = (code: string) => api.post<{ valid: boolean; locked?: boolean }>('/admin/2fa/verify', { code });
export const recoverTwoFactor = (code: string) => api.post<{ valid: boolean; locked?: boolean; recoveryCodesRemaining?: number }>('/admin/2fa/recover', { code });
export const resetTwoFactor = () => api.post<{ reset: boolean }>('/admin/2fa/reset', {});

// ── Flagged text and the keyword list (RULES §24.15) ─────────────────────────
export type FlaggedType = 'hootza_comment' | 'hangout_post' | 'icebreaker_answer' | 'connection_note' | 'hootza_title' | 'hootza_description';
/** Never carries the author or who reported it (§35.22). */
export interface FlaggedItem {
  id: string; contentType: FlaggedType; contentId: string; flaggedText: string; matchedKeywords: string[] | null;
  autoFlagged: boolean; userReported: boolean; createdAt: string;
}
export const getFlaggedQueue = () => api.get<{ queue: FlaggedItem[] }>('/admin/moderation/queue');
export const decideFlagged = (id: string, action: 'approved' | 'removed' | 'warning_issued', adminNotes: string) =>
  api.post<{ message: string }>(`/admin/moderation/queue/${encodeURIComponent(id)}/review`, { action, adminNotes });
export interface KeywordRow { id: string; keyword: string; category: string | null; isActive: boolean; createdAt: string }
export const getKeywords = () => api.get<{ keywords: KeywordRow[] }>('/admin/moderation/keywords');
export const addKeyword = (keyword: string, category?: string) => api.post<{ keyword: KeywordRow }>('/admin/moderation/keywords', category ? { keyword, category } : { keyword });
export const setKeywordActive = (id: string, isActive: boolean) => api.patch<{ message: string }>(`/admin/moderation/keywords/${encodeURIComponent(id)}`, { isActive });
export const deleteKeyword = (id: string) => api.delete<{ message: string }>(`/admin/moderation/keywords/${encodeURIComponent(id)}`);

// ── Lost-connection phrases (RULES 12.2) ─────────────────────────────────────
export interface LostPhraseRow { id: string; phrase: string; active: boolean; createdAt: string; updatedAt: string; retiredAt: string | null }
export const getLostPhrases = () => api.get<{ phrases: LostPhraseRow[] }>('/admin/lost-phrases');
export const addLostPhrase = (phrase: string, reason: string) => api.post<{ phrase: LostPhraseRow }>('/admin/lost-phrases', { phrase, reason });
export const updateLostPhrase = (id: string, body: { phrase?: string; active?: boolean }, reason: string) =>
  api.patch<{ phrase: LostPhraseRow }>(`/admin/lost-phrases/${id}`, { ...body, reason });
