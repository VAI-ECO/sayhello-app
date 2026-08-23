/**
 * HELLOS API
 *
 * Connections list + encounter endpoints.
 * Response shape is reveal-gated — pending rows are Waverly-only.
 */

import { api } from './client';

export interface ConnectionHello {
  id: string;
  status?: string;
  hello_code?: string | null;
  from?: string;
  [key: string]: unknown;
}

export interface HellosResponse {
  hellos: ConnectionHello[];
}

/**
 * Get the current user's hellos (connections). Hides closed.
 */
export async function getHellos(): Promise<{ data?: HellosResponse; error?: { message: string } }> {
  return api.get<HellosResponse>('/hellos');
}
