/**
 * HELLOS API
 *
 * Connections list + encounter endpoints + connection notes.
 * Response shape is reveal-gated — pending rows are Waverly-only.
 */

import { api } from './client';

export interface ConnectionHello {
  id: string;
  status?: string;
  helloCode?: string | null;
  hello_code?: string | null;
  from?: string;
  [key: string]: unknown;
}

export interface HellosResponse {
  hellos: ConnectionHello[];
}

export interface ConnectionNote {
  id: string;
  /** APIClient converts response keys to camelCase. */
  noteText?: string;
  hello_id: string;
  user_id: string;
  note_text: string;
  content_language: string;
  created_at: string;
  updated_at: string;
}

/**
 * One hello as THIS viewer may see it (sayhello-api lib/hello-public.ts, viewer-scoped).
 * The API client camelizes keys. Pending is Waverly-only (§10.6); accepted before
 * reveal has no identity or location; the other person's second-wave choice is
 * never present (§10.20) — only this viewer's own and whether both continued.
 */
export interface EncounterHello {
  id: string;
  status: 'pending' | 'accepted' | 'missed' | string;
  from?: string;
  helloCode?: string | null;
  revealScheduledAt?: string | null;
  revealedAt?: string | null;
  qrScanned?: boolean;
  qrExpiresAt?: string | null;
  failedScanCount?: number;
  /** This viewer's own failed scans, counted by the server (migration 260), so a restart cannot reset §10.38's count. */
  failedScans?: number;
  /** Server-computed: this viewer's failed scans reached `failedScanCount`, so the manual selfie path is open. */
  manualProofOpen?: boolean;
  myContinue?: boolean | null;
  bothContinued?: boolean;
  hasSelfie?: boolean;
  selfieUrl?: string | null;
  locationName?: string | null;
  /** This phone's own proof code (§10.18); its QR carries the same value. */
  myProofCode?: string | null;
  chatOpened?: boolean;
  /** The other person - present only once revealed (participant-only, same data as the reveal). */
  person?: { userId: string | null; displayName: string; identityColor: string | null; profilePhotoUrl: string | null };
  /** Own state: this person has opened their reveal (063). Present once revealed. */
  revealSeen?: boolean;
  /** Unread private-chat messages for this viewer (063); present on revealed accepted Hellos. */
  unreadChat?: number;
}

/** A private chat message as this viewer may see it (sayhello-api 056). */
export interface ChatMessage {
  id: string;
  body: string;
  mine: boolean;
  createdAt: string;
}

export interface HelloChat {
  helloId: string;
  canSend: boolean;
  person: { userId: string | null; displayName: string; identityColor: string | null; profilePhotoUrl: string | null };
  messages: ChatMessage[];
}

export async function getHelloChat(helloId: string) {
  return api.get<{ chat: HelloChat }>(`/hellos/${encodeURIComponent(helloId)}/chat`);
}

/**
 * New messages after `afterId` (all of them when null). The server holds the request up to `waitSeconds` when there
 * is nothing new (long-poll); an empty list means nothing arrived. See src/lib/chat-delivery.ts for the fallback.
 */
export async function getChatUpdates(helloId: string, afterId: string | null, waitSeconds: number) {
  const q = `wait=${encodeURIComponent(String(waitSeconds))}${afterId ? `&after=${encodeURIComponent(afterId)}` : ''}`;
  return api.get<{ chat: { messages: ChatMessage[]; canSend: boolean } }>(`/hellos/${encodeURIComponent(helloId)}/chat/messages?${q}`);
}

export async function sendChatMessage(helloId: string, body: string) {
  return api.post<{ message: ChatMessage }>(`/hellos/${encodeURIComponent(helloId)}/chat/messages`, { body });
}

export async function hideChatMessage(helloId: string, messageId: string) {
  return api.post<{ hidden: boolean }>(
    `/hellos/${encodeURIComponent(helloId)}/chat/messages/${encodeURIComponent(messageId)}/hide`,
    {}
  );
}

export async function leaveChat(helloId: string) {
  return api.post<{ left: boolean }>(`/hellos/${encodeURIComponent(helloId)}/chat/leave`, {});
}

/** §35.19 reason categories. */
export const CHAT_REPORT_REASONS = ['harassment', 'hate_speech', 'spam', 'threat', 'sexual_content', 'other'] as const;
export type ChatReportReason = (typeof CHAT_REPORT_REASONS)[number];

export async function reportChatMessage(params: {
  helloId: string;
  messageId: string;
  reason: ChatReportReason;
  details?: string;
}) {
  return api.post<{ report: { id: string } }>('/safety/report', {
    reportType: 'chat',
    conversationId: params.helloId,
    messageId: params.messageId,
    reason: params.reason,
    details: params.details || undefined,
    userAcknowledgedSharing: true,
  });
}

export async function blockPerson(userId: string) {
  return api.post<Record<string, unknown>>('/safety/block', { blockedUserId: userId });
}

export interface HelloReveal {
  id: string;
  status: string;
  person: { displayName: string; identityColor: string | null; profilePhotoUrl: string | null };
  icebreakers: Array<{ question: string; answer: string }>;
  locationName: string | null;
  selfieUrl: string | null;
}

export async function getHello(helloId: string) {
  return api.get<{ hello: EncounterHello }>(`/hellos/${encodeURIComponent(helloId)}`);
}

/** Half-accept returns the pending silence shape; mutual accept adds the caller's award. */
export async function acceptHello(helloId: string) {
  return api.post<{ hello: EncounterHello; pointsAwarded?: number }>(`/hellos/${encodeURIComponent(helloId)}/accept`, {});
}

/** Always the same silence shape (§10.20). */
export async function declineHello(helloId: string) {
  return api.post<{ hello: EncounterHello }>(`/hellos/${encodeURIComponent(helloId)}/decline`, {});
}

/**
 * The code shown on the OTHER phone, read by the live camera or typed (§10.18).
 * The server refuses this phone's own code (`own_code`) and the shared support
 * reference (`support_reference`): two phones must agree.
 */
export async function scanHello(helloId: string, helloCode: string, method: 'qr' | 'code') {
  return api.post<{ hello: EncounterHello; alreadyScanned: boolean }>(
    `/hellos/${encodeURIComponent(helloId)}/scan`,
    { helloCode, method }
  );
}

/**
 * Place this Hello's pin from the phone's own position (RULES §8.3, §10.8). Once only, server-side; best-effort.
 * `placed: false` means the server already holds a pin (or it is too late); it says nothing about the other person.
 */
export async function placeHelloPin(helloId: string, pin: { lat: number; lng: number }) {
  return api.post<{ placed: boolean }>(`/hellos/${encodeURIComponent(helloId)}/pin`, { lat: pin.lat, lng: pin.lng });
}

/** This viewer's own awards on one hello, read from the server ledger. */
export interface HelloPoints {
  accept: number;
  selfie: number;
  continue: number;
}

export async function getHelloPoints(helloId: string) {
  return api.get<{ points: HelloPoints }>(`/hellos/${encodeURIComponent(helloId)}/points`);
}

export async function continueHello(helloId: string, wantsToContinue: boolean) {
  return api.patch<{ hello: EncounterHello; pointsAwarded?: number }>(
    `/hellos/${encodeURIComponent(helloId)}/continue`,
    { wantsToContinue }
  );
}

export async function getHelloReveal(helloId: string) {
  return api.get<{ reveal: HelloReveal; hello: EncounterHello }>(`/hellos/${encodeURIComponent(helloId)}/reveal`);
}

export async function uploadHelloSelfie(helloId: string, bytes: ArrayBuffer, contentType: string, proof?: 'manual') {
  return api.hellos.uploadSelfie(helloId, bytes, contentType, proof) as Promise<{
    data?: { hello: EncounterHello; pointsAwarded?: number; firstCapture?: boolean };
    error?: { message: string; code?: string; status?: number };
  }>;
}

/** The QR payload: a prefix so a stray QR is not mistaken for a hello code. */
export const HELLO_QR_PREFIX = 'SAYHELLO:';

export function helloQrValue(helloCode: string): string {
  return `${HELLO_QR_PREFIX}${helloCode}`;
}

/** The code inside a scanned QR, or null if it is not a Say Hello code. */
export function helloCodeFromQr(data: string): string | null {
  const trimmed = data.trim();
  if (!trimmed.toUpperCase().startsWith(HELLO_QR_PREFIX)) return null;
  const code = trimmed.slice(HELLO_QR_PREFIX.length).trim();
  return code.length > 0 ? code : null;
}

/**
 * Get the current user's hellos (connections). Hides closed.
 */
export async function getHellos(): Promise<{ data?: HellosResponse; error?: { message: string } }> {
  return api.get<HellosResponse>('/hellos');
}

export async function getConnectionNotes(helloId: string) {
  return api.get<{ notes: ConnectionNote[] }>(`/hellos/${helloId}/notes`);
}

export async function saveConnectionNote(helloId: string, noteText: string) {
  return api.post<{ note: ConnectionNote }>(`/hellos/${helloId}/notes`, { noteText });
}

export async function deleteConnectionNote(helloId: string) {
  return api.delete<{ message: string }>(`/hellos/${helloId}/notes`);
}

/** Nudge cap (RULES §11.9-11.10): a boolean only; the figure is never sent or shown. */
export const getNudgeCap = () => api.get<{ atCap: boolean }>('/hellos/nudge-cap');
/** "Keep going today": grants blocks equal to the cap and logs it on the server. */
export const overrideNudgeCap = () => api.post<{ atCap: boolean }>('/hellos/nudge-cap/override', {});
