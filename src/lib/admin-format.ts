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
    case 'lost_phrase_added':
    case 'lost_phrase_edited':
    case 'lost_phrase_retired':
    case 'lost_phrase_restored':
    case 'coupon_created':
    case 'coupon_retired':
    case 'bonus_campaign_created':
    case 'bonus_campaign_status':
    case 'hardship_approved':
    case 'hardship_declined':
    case 'price_override_set':
    case 'price_override_removed':
    case 'queue_escalation_resolved':
    case 'queue_radius_widened':
    case 'referral_converted':
    case 'referral_void':
    case 'venue_link_set':
    case 'venue_link_cleared':
    case 'two_factor_enrolled':
    case 'two_factor_recovery_code_used':
    case 'two_factor_reset':
    case 'two_factor_operator_reset':
    case 'moderation_queue_reviewed':
    case 'moderation_keyword_added':
    case 'moderation_keyword_changed':
    case 'moderation_keyword_removed':
    case 'report_claimed':
    case 'job_paused':
    case 'job_resumed':
    case 'super_admin_designated':
      return t(`adminW2.audit.${e.event}`);
    default:
      // Events without their own line (store, categories, drawings plans…) read as words, never a raw key.
      return t('admin.audit.summary.fallback', { action: humanize(e.event ?? e.action) });
  }
}

function humanize(key: string | null | undefined): string {
  const words = String(key ?? '').replace(/_/g, ' ').trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : '—';
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export function whenLabel(iso: string | null | undefined, now: Date = new Date()): string {
  if (!iso) return '—';
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return '—';
  const days = Math.round((startOfDay(now) - startOfDay(at)) / 86_400_000);
  const hh = String(at.getHours()).padStart(2, '0');
  const mm = String(at.getMinutes()).padStart(2, '0');
  // A future time (e.g. a report's due time) on a later day is not "today": give its date.
  if (days < 0) return `${hh}:${mm} ${at.getDate()} ${MONTHS[at.getMonth()]}`;
  if (days === 0) return `${hh}:${mm} ${t('admin.common.today')}`;
  if (days === 1) return t('admin.common.yesterday');
  if (days < 7) return t('admin.common.daysAgo', { count: days });
  return `${at.getDate()} ${MONTHS[at.getMonth()]}`;
}
