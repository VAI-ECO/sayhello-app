/**
 * A5 PAYOUTS — the same Earned/Building ledger plus the withdrawal history
 * (GET /ambassador/payouts/history). Withdrawals are not open: the payout provider is not
 * connected (§14.12), so the request route refuses and this screen says so plainly.
 */

import { EarningsView } from '../../src/components/ambassador/EarningsView';

export default function PayoutsScreen() {
  return <EarningsView withHistory />;
}
