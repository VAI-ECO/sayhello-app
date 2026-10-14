/** In-memory draft for the four-step organization signup (ROLE-5 SN-03..06). Never persisted. */
import type { OrgKind, OrgVenue } from '../api/organizations';

export interface OrgDraft { name: string; kind: OrgKind | null; meetingPlace: string; venueType: OrgVenue | null; code: string }
const empty = (): OrgDraft => ({ name: '', kind: null, meetingPlace: '', venueType: null, code: '' });
let draft = empty();
export const getOrgDraft = (): OrgDraft => draft;
export const patchOrgDraft = (p: Partial<OrgDraft>) => { draft = { ...draft, ...p }; };
export const resetOrgDraft = () => { draft = empty(); };
