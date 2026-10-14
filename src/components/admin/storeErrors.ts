import { t } from '../../i18n';
import { errorText } from './AdminParts';
import { s3AdminEn } from '../../i18n/s3-admin-en';

/** The server's answer for a failed store/fulfilment/plan action, in words. */
export function w3ErrorText(code?: string | null): string {
  if (code && code in s3AdminEn.adminW3.errors) return t(`adminW3.errors.${code}`);
  return errorText(code);
}
