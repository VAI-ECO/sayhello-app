/**
 * Hootza request failures → plain copy.
 *
 * Refusal codes come from sayhello-api src/routes/hootzas.ts (cd1591b). Most
 * refusals carry a code and no message, which the API client turns into
 * "An error occurred". Known codes get plain copy; transport messages
 * (timeout, network) and any message the server did write are kept.
 */

import { t } from '../i18n';

type HootzaRequestError = { code?: string; message?: string } | undefined;

/** The event is already ended or cancelled; the screen should reload its state. */
export function isHootzaNotLiveError(error: HootzaRequestError): boolean {
  return error?.code === 'hootza_not_live';
}

export function hootzaErrorMessage(error: HootzaRequestError, fallback: string): string {
  switch (error?.code) {
    case 'hootza_not_live':
      return t('hootzas.errors.notLive');
    case 'not_host':
      return t('hootzas.errors.notHost');
    case 'hootza_not_found':
      return t('hootzas.errors.notFound');
    case 'invalid_qr_code':
      return t('hootzas.errors.invalidCode');
    case 'server_error':
      return fallback;
  }
  const message = error?.message;
  if (!message || message === 'An error occurred') {
    return error?.code === 'validation_error' ? t('hootzas.errors.invalidInput') : fallback;
  }
  return message;
}
