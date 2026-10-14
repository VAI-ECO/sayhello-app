import { Colors, PickableColors, type IdentityColor } from './tokens';

/** Untrusted profile data must never turn semantic colors into identity colors. */
export function identityColorFromProfile(profile: unknown): IdentityColor {
  const value = profile && typeof profile === 'object' && 'identityColor' in profile
    ? profile.identityColor
    : undefined;
  return typeof value === 'string' && PickableColors.includes(value as IdentityColor)
    ? value as IdentityColor
    : Colors.Purple;
}
