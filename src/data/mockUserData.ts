/**
 * MOCK USER DATA
 *
 * ⚠️ THIS IS MOCK DATA — REPLACE WITH REAL API CALLS
 *
 * Endpoint shape matches the proposed API:
 * - GET /api/v1/users/me → returns user profile
 *
 * Identity color comes from ThemeProvider (real), not from this mock.
 */

export interface UserProfile {
  id: string;
  name: string;
  phone_number: string;
  date_of_birth: string;
  drawing_number: string;
  created_at: string;
}

/**
 * MOCK: User profile
 * Replace with real API call to /api/v1/users/me
 */
const MOCK_USER_PROFILE: UserProfile = {
  id: 'mock-user-001',
  name: 'Alex Chen',
  phone_number: '+1 (555) 123-4567',
  date_of_birth: '1990-01-01',
  drawing_number: 'AB-123456',
  created_at: '2024-01-01T00:00:00Z',
};

/**
 * Get user profile
 * ⚠️ MOCK IMPLEMENTATION - replace with api.user.getProfile()
 */
export function getMockUserProfile(): UserProfile {
  return MOCK_USER_PROFILE;
}
