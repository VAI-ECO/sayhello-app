/**
 * Small display helpers for the Ambassador screens. Nothing here decides a business rule.
 */

import { t } from '../i18n';
import type { BookState } from '../api/ambassador';

/** A date-only ("YYYY-MM-DD") or ISO timestamp as "12 Nov"; '' when it is not a date. */
export function dayMonth(value: string | null | undefined): string {
  if (!value) return '';
  const d = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function dayMonthYear(value: string | null | undefined): string {
  if (!value) return '';
  const d = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function stateLabel(state: BookState): string {
  switch (state) {
    case 'complete': return t('ambassador.hangouts.stateComplete');
    case 'needs_visit': return t('ambassador.hangouts.stateNeedsVisit');
    case 'overdue': return t('ambassador.hangouts.stateOverdue');
    case 'awaiting_payment': return t('ambassador.hangouts.stateAwaitingPayment');
    case 'no_schedule': return t('ambassador.hangouts.stateNoSchedule');
    case 'lapsed': return t('ambassador.hangouts.stateLapsed');
    case 'cancelled': return t('ambassador.hangouts.stateCancelled');
  }
}

/** Metres for short distances, kilometres beyond 1000 m. */
export function distanceLabel(metres: number): string {
  if (metres >= 1000) return t('ambassador.findBusiness.distanceKmFmt', { km: (metres / 1000).toFixed(1) });
  return t('ambassador.findBusiness.distanceFmt', { m: Math.round(metres) });
}
