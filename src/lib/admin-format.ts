/** Time as the delivered Audit rows write it: "14:02 today", "yesterday", "2 days ago", then a date. */

import { t } from '../i18n';
import type { AuditEntry } from '../api/admin';

/** The drawn "what" of an Audit row, from the event the server recorded. */
export function summaryFor(e: AuditEntry): string {
  const m = e.metadata ?? {};
  const s = (v: unknown) => (typeof v === 'string' || typeof v === 'number' ? String(v) : '—');
  switch (e.event) {
    case 'update_setting':
      return t('admin.audit.summary.update_setting', { key: s(m.key), old: s(m.oldValue), new: s(m.newValue) });
    case 'assign_role':
      return t('admin.audit.summary.assign_role', { role: s(m.roleName) });
    case 'create_role':
      return t('admin.audit.summary.create_role', { name: s(m.name) });
    case 'approve_ambassador_application':
    case 'approve_influencer_application':
    case 'decline_ambassador_application':
    case 'decline_influencer_application':
    case 'revoke_role':
      return t(`admin.audit.summary.${e.event}`);
    case 'view_report_evidence':
    case 'report_strike':
    case 'report_remove_content':
    case 'report_eject':
    case 'report_resolve':
    case 'report_dismiss':
    case 'account_matter_decided':
    case 'remove_selfie':
    case 'approve_payout':
    case 'reject_payout':
    case 'legal_draft_saved':
    case 'legal_approved':
    case 'coupon_created':
    case 'coupon_retired':
    case 'bonus_campaign_created':
    case 'bonus_campaign_status':
      return t(`adminW2.audit.${e.event}`);
    default:
      return t('admin.audit.summary.fallback', { action: e.event ?? e.action });
  }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export function whenLabel(iso: string | null | undefined, now: Date = new Date()): string {
  if (!iso) return '—';
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return '—';
  const days = Math.round((startOfDay(now) - startOfDay(at)) / 86_400_000);
  if (days <= 0) {
    const hh = String(at.getHours()).padStart(2, '0');
    const mm = String(at.getMinutes()).padStart(2, '0');
    return `${hh}:${mm} ${t('admin.common.today')}`;
  }
  if (days === 1) return t('admin.common.yesterday');
  if (days < 7) return t('admin.common.daysAgo', { count: days });
  return `${at.getDate()} ${MONTHS[at.getMonth()]}`;
}
