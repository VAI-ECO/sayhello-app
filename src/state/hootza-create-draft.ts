/**
 * In-memory draft for the two-step Hootza create flow.
 * Preserved when "Couldn't post" offers retry.
 */

import type { CreateHootzaInput, PostAgainTemplate, VenueType } from '../api/hootzas';

export interface HootzaCreateDraft {
  title: string;
  venueType: VenueType | null;
  locationName: string;
  startTimeIso: string | null;
  scheduledEndTimeIso: string | null;
  description: string;
  coverChargeAmountCents: number | null;
  coverChargeDescription: string;
  hostModeEnabled: boolean;
  intervalMinutes: number;
  windowLengthMinutes: number;
  postAgainSourceId: string | null;
}

const defaultDraft = (): HootzaCreateDraft => ({
  title: '',
  venueType: null,
  locationName: '',
  startTimeIso: null,
  scheduledEndTimeIso: null,
  description: '',
  coverChargeAmountCents: null,
  coverChargeDescription: '',
  hostModeEnabled: false,
  intervalMinutes: 45,
  windowLengthMinutes: 10,
  postAgainSourceId: null,
});

let draft: HootzaCreateDraft = defaultDraft();

export function getHootzaCreateDraft(): HootzaCreateDraft {
  return draft;
}

export function resetHootzaCreateDraft(): void {
  draft = defaultDraft();
}

export function updateHootzaCreateDraft(partial: Partial<HootzaCreateDraft>): void {
  draft = { ...draft, ...partial };
}

export function applyPostAgainTemplate(sourceId: string, template: PostAgainTemplate): void {
  draft = {
    ...defaultDraft(),
    postAgainSourceId: sourceId,
    title: template.title,
    venueType: template.venueType,
    locationName: template.locationName ?? '',
    description: template.description ?? '',
    coverChargeAmountCents: template.coverChargeAmount,
    coverChargeDescription: template.coverChargeDescription ?? '',
    startTimeIso: null,
    scheduledEndTimeIso: null,
  };
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
  }

  if (d.description.trim()) input.description = d.description.trim();
  if (d.locationName.trim()) input.locationName = d.locationName.trim();
  if (d.coverChargeAmountCents != null && d.coverChargeAmountCents > 0) {
    input.coverChargeAmount = d.coverChargeAmountCents;
    if (d.coverChargeDescription.trim()) {
      input.coverChargeDescription = d.coverChargeDescription.trim();
    }
  }
  if (d.hostModeEnabled) {
    input.hostMode = {
      intervalMinutes: d.intervalMinutes,
      windowLengthMinutes: d.windowLengthMinutes,
    };
  }

  return input;
}
