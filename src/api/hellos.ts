/**
 * HELLOS API
 *
 * Hello pins endpoints
 */

import { api } from './client';

export interface HelloPin {
  id: string;
  user1Id: string;
  user1FullName?: string;
  user2Id: string;
  user2FullName?: string;
  locationLat: number;
  locationLng: number;
  locationName: string | null;
  hangoutId: string | null;
  metAt: string;
  revealScheduledAt: string;
  revealedAt: string | null;
  hasSelfie: boolean;
  helloCode: string;
  createdAt: string;
}

export interface HellosResponse {
  hellos: HelloPin[];
}

/**
 * Get user's hellos (pins)
 */
export async function getHellos(): Promise<{ data?: HellosResponse; error?: { message: string } }> {
  return api.get<HellosResponse>('/hellos');
}
