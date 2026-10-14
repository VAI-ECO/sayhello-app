/**
 * The role someone picked on "Other paths" before they had an account (RULES §26.4: roles are added to
 * one account that starts as a person). Held in memory only; after onboarding the "You're in" screen
 * offers the matching set-up so the choice is not lost. Cleared as soon as it is used or dismissed.
 */
export type RoleKey = 'hangout' | 'ambassador' | 'creator' | 'organization';

export const ROLE_ROUTES: Record<RoleKey, string> = {
  hangout: '/(hangout)/signup',
  ambassador: '/ambassador',
  creator: '/influencer',
  organization: '/(organization)/org',
};

let pending: RoleKey | null = null;
export const setPendingRole = (role: RoleKey | null) => { pending = role; };
export const getPendingRole = (): RoleKey | null => pending;
export const takePendingRole = (): RoleKey | null => { const r = pending; pending = null; return r; };
