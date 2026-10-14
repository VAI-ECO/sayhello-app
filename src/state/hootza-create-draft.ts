/**
 * In-memory draft for the two-step Hootza create flow.
 * Preserved when "Couldn't post" offers retry.
 */

import type { CreateHootzaInput, PostAgainTemplate, VenueType } from '../api/hootzas';

export interface HootzaCreateDraft {
  title: string;
  venueType: VenueType | null;
  locationName: string;
  locationLat: number | null;
  locationLng: number | null;
  /** Host-set minutes after the scheduled end; empty means none (§28.9). */
  endGraceMinutes: number | null;
  startTimeIso: string | null;
  scheduledEndTimeIso: string | null;
  description: string;
  coverChargeAmountCents: number | null;
  coverChargeDescription: string;
  hostModeEnabled: boolean;
  /** Optional advisory, off by default (§28.18). */
  adultsOnly: boolean;
  /** Host-activated chat, off by default (§28.19). */
  chatEnabled: boolean;
  /** Host-set, no canon default or bounds (RULES §28.12, MONEY Part 6). */
  intervalMinutes: number | null;
  windowLengthMinutes: number | null;
  postAgainSourceId: string | null;
}

const defaultDraft = (): HootzaCreateDraft => ({
  title: '',
  venueType: null,
  locationName: '',
  locationLat: null,
  locationLng: null,
  endGraceMinutes: null,
  startTimeIso: null,
  scheduledEndTimeIso: null,
  description: '',
  coverChargeAmountCents: null,
  coverChargeDescription: '',
  hostModeEnabled: false,
  adultsOnly: false,
  chatEnabled: false,
  intervalMinutes: null,
  windowLengthMinutes: null,
  postAgainSourceId: null,
});

let draft: HootzaCreateDraft = defaultDraft();
// Bumped when the draft is replaced wholesale (posted, reset, post again), so
// a create screen still in the stack knows its fields are no longer the draft.
let draftVersion = 0;

export function getHootzaCreateDraft(): HootzaCreateDraft {
  return draft;
}

export function getHootzaCreateDraftVersion(): number {
  return draftVersion;
}

export function resetHootzaCreateDraft(): void {
  draft = defaultDraft();
  draftVersion++;
}

export function updateHootzaCreateDraft(partial: Partial<HootzaCreateDraft>): void {
  draft = { ...draft, ...partial };
}

export function applyPostAgainTemplate(sourceId: string, template: PostAgainTemplate): void {
  draftVersion++;
  draft = {
    ...defaultDraft(),
    postAgainSourceId: sourceId,
    title: template.title,
    venueType: template.venueType,
    locationName: template.locationName ?? '',
    locationLat: template.locationLat,
    locationLng: template.locationLng,
    description: template.description ?? '',
    coverChargeAmountCents: template.coverChargeAmount,
    coverChargeDescription: template.coverChargeDescription ?? '',
    startTimeIso: null,
    scheduledEndTimeIso: null,
  };
}

export function isPositiveWholeMinutes(value: number | null): value is number {
  return value != null && Number.isSafeInteger(value) && value > 0;
}

export function draftToCreateInput(d: HootzaCreateDraft): CreateHootzaInput | null {
  if (!d.title.trim() || !d.venueType || !d.startTimeIso) {
    return null;
  }

  const input: CreateHootzaInput = {
    title: d.title.trim(),
    venueType: d.venueType,
    startTime: d.startTimeIso,
  };
  if (d.scheduledEndTimeIso) {
    input.scheduledEndTime = d.scheduledEndTimeIso;
    if (d.endGraceMinutes != null) input.endGraceMinutes = d.endGraceMinutes;
  }

  if (d.description.trim()) input.description = d.description.trim();
  if (d.locationName.trim()) input.locationName = d.locationName.trim();
  if (d.locationLat != null && d.locationLng != null) { input.locationLat = d.locationLat; input.locationLng = d.locationLng; }
  if (d.coverChargeAmountCents != null && d.coverChargeAmountCents > 0) {
    input.coverChargeAmount = d.coverChargeAmountCents;
    if (d.coverChargeDescription.trim()) {
      input.coverChargeDescription = d.coverChargeDescription.trim();
    }
  }
  if (d.adultsOnly) input.adultsOnly = true;
  if (d.chatEnabled) input.chatEnabled = true;
  if (d.hostModeEnabled) {
    if (!isPositiveWholeMinutes(d.intervalMinutes) || !isPositiveWholeMinutes(d.windowLengthMinutes)) {
      return null;
    }
    input.hostMode = {
      intervalMinutes: d.intervalMinutes,
      windowLengthMinutes: d.windowLengthMinutes,
    };
  }

  return input;
}
