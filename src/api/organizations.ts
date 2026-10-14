/**
 * ORGANIZATIONS API — ROLE-5. Backend: /api/organizations (api src/routes/organizations.ts).
 * Follower identities never reach the app: only counts.
 */
import { api } from './client';

export type OrgKind = 'running_club' | 'book_group' | 'faith_group' | 'hobby_group' | 'sports_team' | 'other';
export type OrgVenue = 'public_place' | 'private_residence';

export interface OrgQuota { monthYear: string; freePosts: number; used: number; remaining: number }
export interface OrgEvent {
  id: string; title: string; startTime: string; scheduledEndTime: string | null; venueType: OrgVenue;
  coverChargeAmount: number | null; coverChargeDescription: string | null; goingCount: number;
  status?: 'live' | 'ended' | 'cancelled'; postedToFeed?: boolean; checkInCount?: number;
  adultsOnly?: boolean; chatEnabled?: boolean;
}
export interface OrgPage {
  organization: {
    id: string; name: string; kind: OrgKind; status: 'active' | 'closed'; venueType: OrgVenue;
    meetingPlace: string | null; meetingPlaceWithheld: boolean; code: string | null;
  };
  followerCount: number; isFollowing: boolean;
  viewer: { canManage: boolean; canManageLeads: boolean; isSuperAdmin: boolean };
  events: OrgEvent[];
  /** Finished Hootzas, newest first; a count of who came, never who. */
  pastEvents?: Array<{ id: string; title: string; startTime: string; scheduledEndTime: string | null; endedAt: string | null; venueType: OrgVenue; checkedInCount: number }>;
}
export interface OrgDashboard {
  organization: { id: string; name: string; kind: OrgKind; status: 'active' | 'closed'; code: string; venueType: OrgVenue; meetingPlace: string };
  followerCount: number; checkInCount: number; events: { live: number; total: number }; leadCount: number;
  quota: OrgQuota; viewer: { canManageLeads: boolean; isSuperAdmin: boolean };
}
export interface OrgLead { userId: string; name: string | null; leadRole: 'lead' | 'delegate'; addedAt: string; isYou: boolean }
export interface MyOrg { id: string; name: string; kind: OrgKind; status: 'active' | 'closed'; leadRole: 'lead' | 'delegate' }

export interface CreateOrgInput { name: string; kind: OrgKind; meetingPlace: string; venueType: OrgVenue; code: string }
export interface CreateOrgEventInput {
  title: string; description?: string; startTime: string; scheduledEndTime?: string | null;
  venueType?: OrgVenue; locationName?: string; locationLat?: number; locationLng?: number;
  endGraceMinutes?: number | null;
  coverChargeAmount?: number; coverChargeDescription?: string; postToFeed: boolean;
  adultsOnly?: boolean; chatEnabled?: boolean;
  hostMode?: { intervalMinutes: number; windowLengthMinutes: number };
}

export const checkOrgCode = (code: string) => api.post<{ available: boolean; reason?: string; suggestion?: string }>('/api/organizations/check-code', { code });
export const createOrganization = (input: CreateOrgInput) =>
  api.post<{ organization: { id: string; name: string; status: string }; quota: OrgQuota }>('/api/organizations', input);
export const getMyOrganizations = () => api.get<{ organizations: MyOrg[] }>('/api/organizations/mine');
export const getOrganization = (id: string) => api.get<OrgPage>(`/api/organizations/${id}`);
export const updateOrganization = (id: string, patch: Partial<Pick<CreateOrgInput, 'name' | 'kind' | 'meetingPlace' | 'venueType'>>) =>
  api.patch<{ ok: true }>(`/api/organizations/${id}`, patch);
export const followOrganization = (id: string) => api.post<{ isFollowing: boolean; followerCount: number }>(`/api/organizations/${id}/follow`);
export const unfollowOrganization = (id: string) => api.delete<{ isFollowing: boolean; followerCount: number }>(`/api/organizations/${id}/follow`);
export const getOrgDashboard = (id: string) => api.get<OrgDashboard>(`/api/organizations/${id}/dashboard`);
export const getOrgLeads = (id: string) => api.get<{ leads: OrgLead[]; viewer: { canManageLeads: boolean } }>(`/api/organizations/${id}/leads`);
export const addOrgLead = (id: string, phone: string) => api.post<{ ok: true }>(`/api/organizations/${id}/leads`, { phone });
export const removeOrgLead = (id: string, userId: string) => api.delete<{ ok: true }>(`/api/organizations/${id}/leads/${userId}`);
export const getOrgEvents = (id: string) => api.get<{ events: OrgEvent[]; canManage: boolean; organizationStatus?: 'active' | 'closed' }>(`/api/organizations/${id}/events`);
export const createOrgEvent = (id: string, input: CreateOrgEventInput) =>
  api.post<{ hootza: { id: string }; quota: OrgQuota }>(`/api/organizations/${id}/events`, input);
export const updateOrgEventFlags = (id: string, hootzaId: string, patch: { adultsOnly?: boolean; chatEnabled?: boolean }) =>
  api.patch<{ adultsOnly: boolean; chatEnabled: boolean }>(`/api/organizations/${id}/events/${hootzaId}`, patch);
export const postOrgEventToFeed = (id: string, hootzaId: string) =>
  api.post<{ postedToFeed: boolean; quota: OrgQuota }>(`/api/organizations/${id}/events/${hootzaId}/post-to-feed`);
export const closeOrganization = (id: string, pageChoice: 'take_down' | 'leave_up') =>
  api.post<{ closed: boolean; pageRemoved: boolean }>(`/api/organizations/${id}/close`, { pageChoice });
