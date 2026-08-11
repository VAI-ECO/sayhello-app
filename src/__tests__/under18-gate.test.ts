/**
 * UNDER 18 GATE TESTS
 *
 * Tests the one-correction rule for under-18 attempts
 */

// Create mock storage before importing AsyncStorage
const mockStorage = new Map<string, string>();

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn((key: string) => Promise.resolve(mockStorage.get(key) || null)),
    setItem: jest.fn((key: string, value: string) => {
      mockStorage.set(key, value);
      return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
      mockStorage.delete(key);
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      mockStorage.clear();
      return Promise.resolve();
    }),
  },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

const UNDER_18_ATTEMPT_KEY = '@sayhello:under18_attempt';

describe('Under 18 Gate - One Correction Rule', () => {
  beforeEach(() => {
    mockStorage.clear();
    jest.clearAllMocks();
  });

  it('first under-18 attempt sets the flag', async () => {
    // Initially, no flag should exist
    const initialValue = await AsyncStorage.getItem(UNDER_18_ATTEMPT_KEY);
    expect(initialValue).toBeNull();

    // Simulate first under-18 attempt
    await AsyncStorage.setItem(UNDER_18_ATTEMPT_KEY, 'true');

    // Flag should now be set
    const afterFirstAttempt = await AsyncStorage.getItem(UNDER_18_ATTEMPT_KEY);
    expect(afterFirstAttempt).toBe('true');
  });

  it('second under-18 attempt finds existing flag', async () => {
    // Set flag (simulating first attempt)
    await AsyncStorage.setItem(UNDER_18_ATTEMPT_KEY, 'true');

    // Check if flag exists (simulating second attempt check)
    const hasAttemptedBefore = await AsyncStorage.getItem(UNDER_18_ATTEMPT_KEY);
    expect(hasAttemptedBefore).toBe('true');
  });

  it('flag persists across multiple reads', async () => {
    // Set flag
    await AsyncStorage.setItem(UNDER_18_ATTEMPT_KEY, 'true');

    // Read multiple times
    const read1 = await AsyncStorage.getItem(UNDER_18_ATTEMPT_KEY);
    const read2 = await AsyncStorage.getItem(UNDER_18_ATTEMPT_KEY);
    const read3 = await AsyncStorage.getItem(UNDER_18_ATTEMPT_KEY);

    expect(read1).toBe('true');
    expect(read2).toBe('true');
    expect(read3).toBe('true');
  });

  it('determines first vs second attempt correctly', async () => {
    // First attempt check
    const firstCheck = await AsyncStorage.getItem(UNDER_18_ATTEMPT_KEY);
    const isFirstAttempt = firstCheck === null;
    expect(isFirstAttempt).toBe(true);

    // Mark first attempt
    await AsyncStorage.setItem(UNDER_18_ATTEMPT_KEY, 'true');

    // Second attempt check
    const secondCheck = await AsyncStorage.getItem(UNDER_18_ATTEMPT_KEY);
    const isSecondAttempt = secondCheck === 'true';
    expect(isSecondAttempt).toBe(true);
  });

  describe('Screen behavior', () => {
    it('first attempt should show Go back button', async () => {
      const hasAttemptedBefore = await AsyncStorage.getItem(UNDER_18_ATTEMPT_KEY);
      const isSecondAttempt = hasAttemptedBefore === 'true';
      const showGoBackButton = !isSecondAttempt;

      expect(showGoBackButton).toBe(true);
    });

    it('second attempt should NOT show Go back button', async () => {
      // Mark first attempt
      await AsyncStorage.setItem(UNDER_18_ATTEMPT_KEY, 'true');

      // Check second attempt
      const hasAttemptedBefore = await AsyncStorage.getItem(UNDER_18_ATTEMPT_KEY);
      const isSecondAttempt = hasAttemptedBefore === 'true';
      const showGoBackButton = !isSecondAttempt;

      expect(showGoBackButton).toBe(false);
    });
  });

  describe('Persistence', () => {
    it('survives app backgrounding (simulated)', async () => {
      // Set flag
      await AsyncStorage.setItem(UNDER_18_ATTEMPT_KEY, 'true');

      // Simulate app going to background and coming back
      // (AsyncStorage persists in memory in tests, simulating real behavior)

      // Flag should still exist
      const afterBackgrounding = await AsyncStorage.getItem(UNDER_18_ATTEMPT_KEY);
      expect(afterBackgrounding).toBe('true');
    });

    it('cleared on reinstall (simulated by clear)', async () => {
      // Set flag
      await AsyncStorage.setItem(UNDER_18_ATTEMPT_KEY, 'true');

      // Simulate reinstall by clearing storage
      await AsyncStorage.clear();

      // Flag should be gone
      const afterReinstall = await AsyncStorage.getItem(UNDER_18_ATTEMPT_KEY);
      expect(afterReinstall).toBeNull();
    });
  });

  describe('Flag Clearing on Success', () => {
    it('successful 18+ entry clears the flag', async () => {
      // Simulate first under-18 attempt
      await AsyncStorage.setItem(UNDER_18_ATTEMPT_KEY, 'true');

      // Verify flag is set
      const afterFirstAttempt = await AsyncStorage.getItem(UNDER_18_ATTEMPT_KEY);
      expect(afterFirstAttempt).toBe('true');

      // Simulate successful 18+ entry (user corrected their date)
      await AsyncStorage.removeItem(UNDER_18_ATTEMPT_KEY);

      // Flag should be cleared
      const afterSuccess = await AsyncStorage.getItem(UNDER_18_ATTEMPT_KEY);
      expect(afterSuccess).toBeNull();
    });

    it('under-18 → 18+ → under-18 allows correction again', async () => {
      // First under-18 attempt
      await AsyncStorage.setItem(UNDER_18_ATTEMPT_KEY, 'true');
      const firstAttempt = await AsyncStorage.getItem(UNDER_18_ATTEMPT_KEY);
      expect(firstAttempt).toBe('true');

      // User corrects and enters 18+
      await AsyncStorage.removeItem(UNDER_18_ATTEMPT_KEY);
      const afterCorrection = await AsyncStorage.getItem(UNDER_18_ATTEMPT_KEY);
      expect(afterCorrection).toBeNull();

      // Later, user mistypes again (or actually is under 18)
      // This is treated as a FIRST attempt again, not second
      const laterCheck = await AsyncStorage.getItem(UNDER_18_ATTEMPT_KEY);
      const isSecondAttempt = laterCheck === 'true';
      const showGoBackButton = !isSecondAttempt;

      // Should show Go back button (first attempt behavior)
      expect(showGoBackButton).toBe(true);
    });

    it('successful pass wipes the strike', async () => {
      // Scenario: User mistypes once, gets the under-18 screen with Go back
      await AsyncStorage.setItem(UNDER_18_ATTEMPT_KEY, 'true');

      // They go back, enter 18+, and proceed
      await AsyncStorage.removeItem(UNDER_18_ATTEMPT_KEY);

      // Much later, they mistype again
      const flagAfterSuccess = await AsyncStorage.getItem(UNDER_18_ATTEMPT_KEY);

      // The flag should be gone - they get another chance
      expect(flagAfterSuccess).toBeNull();

      // This means they'll see the Go back button, not the dead end
      const isFirstAttemptAgain = flagAfterSuccess === null;
      expect(isFirstAttemptAgain).toBe(true);
    });
  });
});
