/**
 * HELLOS API
 *
 * Connections list + encounter endpoints + connection notes.
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

export interface ConnectionNote {
  id: string;
  hello_id: string;
  user_id: string;
  note_text: string;
  content_language: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get the current user's hellos (connections). Hides closed.
 */
export async function getHellos(): Promise<{ data?: HellosResponse; error?: { message: string } }> {
  return api.get<HellosResponse>('/hellos');
}

export async function getConnectionNotes(helloId: string) {
  return api.get<{ notes: ConnectionNote[] }>(`/hellos/${helloId}/notes`);
}

export async function saveConnectionNote(helloId: string, noteText: string) {
  return api.post<{ note: ConnectionNote }>(`/hellos/${helloId}/notes`, { noteText });
}

export async function deleteConnectionNote(helloId: string) {
  return api.delete<{ message: string }>(`/hellos/${helloId}/notes`);
}
