/**
 * ACCOUNT, SETTINGS AND SAFETY API (stream S1, stage 02)
 *
 * Every call is a real server route; nothing here fabricates a success. Request bodies are
 * camelCase (the client snake-cases them), responses come back camelCase.
 */

import { api } from './client';

type Reply<T> = Promise<{ data?: T; error?: { message: string; code?: string } }>;

export interface PublicConfig {
  minimumAge: number;
}
export const getPublicConfig = (): Reply<PublicConfig> => api.get<PublicConfig>('/public/config');

export type LegalSlug = 'terms' | 'privacy' | 'drawing_rules';
export interface LegalDocument {
  slug: LegalSlug;
  title: string | null;
  status: 'pending_legal_approval' | 'approved';
  body: string | null;
  version: string | null;
}
export const getLegalDocument = (slug: LegalSlug): Reply<LegalDocument> =>
  api.get<LegalDocument>(`/public/legal/${slug}`);

export const NOTIFICATION_KEYS = [
  'helloNudges',
  'helloReveals',
  'chatMessages',
  'hootzaUpdates',
  'placesActivity',
] as const;
export type NotificationKey = (typeof NOTIFICATION_KEYS)[number];
export type NotificationPreferences = Record<NotificationKey, boolean>;

/** Romantic nudges only (§13.35): opt-in, governs only what THIS person receives, never shown to anybody. */
export type RomanticPreference = { romanticNudgesOnly: boolean };
export const getRomanticPreference = (): Reply<{ preferences: RomanticPreference }> =>
  api.get('/users/me/notification-preferences');
export const saveRomanticPreference = (romanticNudgesOnly: boolean): Reply<{ preferences: RomanticPreference }> =>
  api.put('/users/me/notification-preferences', { romanticNudgesOnly });

/** The signed-in person's own strike count (RULES §35.16): count, term and the newest one's date and room. */
export interface MyStrikes {
  active: number;
  threshold: number;
  expiryMonths: number;
  latest: { surface: 'chat' | 'hootza_comment'; issuedAt: string } | null;
}
export const getMyStrikes = (): Reply<MyStrikes> => api.get<MyStrikes>('/safety/strikes');

export const getNotificationPreferences = (): Reply<{ preferences: NotificationPreferences }> =>
  api.get('/users/me/notification-preferences');
export const saveNotificationPreferences = (
  changes: Partial<NotificationPreferences>,
): Reply<{ preferences: NotificationPreferences }> => api.put('/users/me/notification-preferences', changes);

export interface HostModeEntry {
  hootzaId: string;
  title: string;
  accepted: boolean;
}
export const getMyHostMode = (): Reply<{ hootzas: HostModeEntry[] }> => api.get('/users/me/host-mode');
export const setHostModeParticipation = (hootzaId: string, accepted: boolean): Reply<unknown> =>
  api.post(`/hootzas/${hootzaId}/host-mode-participation`, { accepted });

export interface BlockedPerson {
  id: string;
  name: string;
  blockedAt: string;
}
export const getBlocks = (): Reply<{ blocks: BlockedPerson[] }> => api.get('/safety/blocks');
export const unblock = (userId: string): Reply<unknown> => api.delete(`/safety/block/${userId}`);

export const deleteMyAccount = (): Reply<{ deleted: boolean }> => api.post('/users/me/delete', { confirm: true });

/** §35.19 — the six reasons. Order is the order shown. */
export const REPORT_REASONS = ['harassment', 'hate_speech', 'spam', 'threat', 'sexual_content', 'other'] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];
export type ReportTarget = 'hello' | 'chat' | 'hootza_comment' | 'hootza_chat' | 'hangout_post';

export interface ReportInput {
  reportType: ReportTarget;
  /** hello / chat: the hello id. hootza_comment / hangout_post: the comment / post id. */
  conversationId: string;
  reason: ReportReason;
  details?: string;
  reportedUserId?: string;
  /** chat: the one message reported (§35.18). */
  messageId?: string;
}
export const sendReport = (input: ReportInput): Reply<{ report: { id: string; status: string } }> =>
  api.post('/safety/report', { ...input, userAcknowledgedSharing: true });
