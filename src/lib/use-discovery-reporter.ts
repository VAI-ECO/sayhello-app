import { useEffect } from 'react';
import { startDiscoveryReporting } from './discovery-reporter';

/** Mount once in the signed-in area. Inert unless the server reports discovery active and Open to Hellos is on. */
export function useDiscoveryReporter(): void {
  useEffect(() => startDiscoveryReporting(), []);
}
