/**
 * ROOT ENTRY
 *
 * "/" belongs to this file alone (no group owns an index that resolves to "/"). It always goes
 * through the auth entry (/entry), which restores the saved session and then routes on.
 * URL scheme: /entry, /home (tabs), /admin/*, /ambassador/*, /influencer/*, /store/*, /org/*.
 */

import { Redirect } from 'expo-router';

export default function RootIndex() {
  return <Redirect href="/(auth)/entry" />;
}
