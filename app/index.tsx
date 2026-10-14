/**
 * ROOT ENTRY
 *
 * "(admin)", "(auth)" and "(tabs)" each own an index screen, so on web the bare "/" URL was
 * ambiguous and could open the admin screen. The root entry is explicit: always go through the
 * auth entry, which restores the saved session and then routes on.
 */

import { Redirect } from 'expo-router';

export default function RootIndex() {
  return <Redirect href="/(auth)" />;
}
