/**
 * HELLO ADMIN API — /admin/*. Responses arrive camelCased.
 *
 * The app only asks; the server decides. Every route enforces its own permission (§23.10 "a hidden
 * button is not a permission"), so /admin/me is used solely to decide which entries to draw. Nothing
 * here sends a role name as an authority, and nothing computes a figure.
 */

import { api } from './client';

export type AdminSection = 'payouts' | 'reports' | 'settings' | 'audit' | 'drawings' | 'overrides' | 'roles';

export interface AdminMe {
  permissions: string[];
  sections: AdminSection[];
  isSuperAdmin: boolean;
  twoFactorEnabled: boolean;
  /** False until an enrolment/verify flow exists (§23.6 is mandatory; mechanism unruled). */
  twoFactorEnforced: boolean;
}

export function getAdminMe() {
  return api.get<AdminMe>('/admin/me');
}

// ── Audit ────────────────────────────────────────────────────────────────────

export interface AuditEntry {
  id: string;
  performedAt: string;
  action: string;
  event: string | null;
  permission: string | null;
  actor: { id: string; name: string | null };
  targetType: string;
  targetId: string | null;
  reason: string | null;
  metadata: Record<string, unknown> | null;
}

export function getAudit(before?: string | null) {
  const qs = before ? `?before=${encodeURIComponent(before)}` : '';
  return api.get<{ entries: AuditEntry[]; nextCursor: string | null }>(`/admin/audit${qs}`);
}

// ── Roles ────────────────────────────────────────────────────────────────────

export interface AdminPermission {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
}

export interface AdminRole {
  id: string;
  name: string;
  description: string | null;
  people: number;
  rolePermissions?: { permissions: AdminPermission | null }[];
}

export function getRoles() {
  return api.get<{ roles: AdminRole[] }>('/admin/roles');
}

export function getPermissions() {
  return api.get<{ permissions: AdminPermission[] }>('/admin/roles/permissions');
}

export function createRole(body: { name: string; description: string; canCreateRoles: boolean; permissionIds: string[] }) {
  return api.post<{ role: AdminRole }>('/admin/roles', body);
}

// ── Settings ─────────────────────────────────────────────────────────────────

export interface AdminSetting {
  key: string;
  value: string;
  valueType: 'integer' | 'decimal' | 'boolean' | 'text' | 'json';
  category: string;
  description: string;
  validationRules: { min?: number; max?: number } | null;
  updatedAt: string;
  updatedByName: string | null;
  /** An owner-set key with no value yet (MONEY gives no figure): shown as "not set" until its first audited change. */
  notSet?: boolean;
}

export function getSettings() {
  return api.get<{ settings: AdminSetting[]; unset?: { key: string; category: string; description: string; min: number }[] }>('/admin/settings');
}

export function updateSetting(key: string, value: string, reason: string) {
  return api.patch<{ setting: AdminSetting }>(`/admin/settings/${encodeURIComponent(key)}`, { value, reason });
}

// ── Applications (Ambassador / Creator) ──────────────────────────────────────

export type ApplicationKind = 'ambassador' | 'influencer';

export interface ApplicationRow {
  id: string;
  userId: string;
  fullName: string;
  /** Ambassador applications */
  workArea?: string;
  startingPlaces?: string;
  referredByCode?: string | null;
  /** Creator applications */
  channel?: string;
  phone: string;
  status: 'submitted' | 'approved' | 'declined' | 'withdrawn';
  createdAt: string;
}

export function getApplications(kind: ApplicationKind) {
  return api.get<{ kind: ApplicationKind; applications: ApplicationRow[] }>(`/admin/applications?kind=${kind}`);
}

export function decideApplication(kind: ApplicationKind, id: string, verb: 'approve' | 'decline', note?: string) {
  return api.post<Record<string, unknown>>(`/admin/applications/${kind}/${encodeURIComponent(id)}/${verb}`, note ? { note } : {});
}
