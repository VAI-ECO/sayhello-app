/**
 * SETTINGS SCREEN
 *
 * User's profile and settings.
 * Grouped by user intent: "The app", "What you share", "People", "The small print"
 *
 * DEAD DESTINATIONS (disabled, coming later):
 * - Notifications, Host Mode, Blocked, Terms, Privacy, Drawing rules, Delete account
 *
 * LIVE DESTINATIONS:
 * - Icebreakers (wired with real count)
 * - Sign out (clears token, navigates to sign-in)
 */

import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Colors, ColorNames } from '../../src/theme/tokens';
import { useTheme } from '../../src/theme';
import { t } from '../../src/i18n';
import { getMockIcebreakerAnswers } from '../../src/data/mockIcebreakersData';
import { api } from '../../src/api/client';

interface UserProfile {
  id: string;
  displayName?: string;
  phoneNumber: string;
  dateOfBirth?: string;
  drawingNumber?: string;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { identityColor } = useTheme();
  const [icebreakersCount, setIcebreakersCount] = useState(0);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const colorName = ColorNames[identityColor];

  // Load user data
  useEffect(() => {
    loadProfile();
    loadIcebreakersCount();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setError(null);

    const response = await api.user.getProfile();

    if (response.error) {
      setError(response.error.message);
      setLoading(false);
      return;
    }

    if (response.data) {
      setUser(response.data as UserProfile);
    }

    setLoading(false);
  }

  function loadIcebreakersCount() {
    const answers = getMockIcebreakerAnswers();
    setIcebreakersCount(answers.length);
  }

  const handleSignOut = async () => {
    await api.auth.signOut();
    router.replace('/(auth)/sign-in-phone');
  };

  const handleIcebreakers = () => {
    router.push('/profile/icebreakers');
  };

  // Disabled row handler (no-op)
  const handleDisabledRow = () => {
    // Intentionally empty - disabled rows do nothing
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.statusBar} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.Ink} testID="loading-indicator" />
        </View>
      </View>
    );
  }

  // Error state
  if (error || !user) {
    return (
      <View style={styles.container}>
        <View style={styles.statusBar} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Can't load profile</Text>
          <Text style={styles.errorMessage}>{error || 'Failed to load user data'}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadProfile}
            accessibilityRole="button"
            accessibilityLabel="Try again"
            testID="retry-button"
          >
            <Text style={styles.retryButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statusBar} />

      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerName}>{user.displayName || 'User'}</Text>
          <Text style={styles.headerPhone}>
            {user.phoneNumber} · {colorName}
          </Text>
        </View>

        {/* Section: The app */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t('settings.sectionTheApp')}</Text>

          {/* Notifications - DISABLED */}
          <TouchableOpacity
            style={[styles.row, styles.rowDisabled]}
            onPress={handleDisabledRow}
            disabled
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
            testID="settings-notifications"
          >
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, styles.rowLabelDisabled]}>
                {t('settings.notifications.label')}
              </Text>
              <View style={styles.rowValue}>
                <Text style={[styles.rowValueText, styles.rowValueTextDisabled]}>
                  {t('settings.notifications.value')}
                </Text>
                <Text style={[styles.rowChevron, styles.rowChevronDisabled]}>›</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Host Mode - DISABLED */}
          <TouchableOpacity
            style={[styles.row, styles.rowDisabled]}
            onPress={handleDisabledRow}
            disabled
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
            testID="settings-host-mode"
          >
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, styles.rowLabelDisabled]}>
                {t('settings.hostMode.label')}
              </Text>
              <View style={styles.rowValue}>
                <Text style={[styles.rowValueText, styles.rowValueTextDisabled]}>
                  {t('settings.hostMode.value')}
                </Text>
                <Text style={[styles.rowChevron, styles.rowChevronDisabled]}>›</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Section: What you share */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t('settings.sectionWhatYouShare')}</Text>

          {/* Icebreakers - LIVE */}
          <TouchableOpacity
            style={styles.row}
            onPress={handleIcebreakers}
            accessibilityRole="button"
            accessibilityState={{ disabled: false }}
            testID="settings-icebreakers"
          >
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>
                {t('settings.icebreakers.label')}
              </Text>
              <View style={styles.rowValue}>
                <Text style={styles.rowValueText} testID="icebreakers-count-value">
                  {t('settings.icebreakers.value', { count: icebreakersCount })}
                </Text>
                <Text style={styles.rowChevron}>›</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Section: People */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t('settings.sectionPeople')}</Text>

          {/* Blocked - DISABLED */}
          <TouchableOpacity
            style={[styles.row, styles.rowDisabled]}
            onPress={handleDisabledRow}
            disabled
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
            testID="settings-blocked"
          >
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, styles.rowLabelDisabled]}>
                {t('settings.blocked.label')}
              </Text>
              <View style={styles.rowValue}>
                <Text style={[styles.rowValueText, styles.rowValueTextDisabled]}>
                  {t('settings.blocked.value', { count: 2 })}
                </Text>
                <Text style={[styles.rowChevron, styles.rowChevronDisabled]}>›</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Section: The small print */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t('settings.sectionSmallPrint')}</Text>

          {/* Terms - DISABLED */}
          <TouchableOpacity
            style={[styles.row, styles.rowDisabled]}
            onPress={handleDisabledRow}
            disabled
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
            testID="settings-terms"
          >
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, styles.rowLabelDisabled]}>
                {t('settings.terms')}
              </Text>
              <Text style={[styles.rowChevron, styles.rowChevronDisabled]}>›</Text>
            </View>
          </TouchableOpacity>

          {/* Privacy - DISABLED */}
          <TouchableOpacity
            style={[styles.row, styles.rowDisabled]}
            onPress={handleDisabledRow}
            disabled
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
            testID="settings-privacy"
          >
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, styles.rowLabelDisabled]}>
                {t('settings.privacy')}
              </Text>
              <Text style={[styles.rowChevron, styles.rowChevronDisabled]}>›</Text>
            </View>
          </TouchableOpacity>

          {/* Drawing rules - DISABLED */}
          <TouchableOpacity
            style={[styles.row, styles.rowDisabled]}
            onPress={handleDisabledRow}
            disabled
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
            testID="settings-drawing-rules"
          >
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, styles.rowLabelDisabled]}>
                {t('settings.drawingRules')}
              </Text>
              <Text style={[styles.rowChevron, styles.rowChevronDisabled]}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Sign out - LIVE */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.row}
            onPress={handleSignOut}
            accessibilityRole="button"
            accessibilityState={{ disabled: false }}
            testID="settings-sign-out"
          >
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, styles.signOutLabel]}>
                {t('settings.signOut')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Delete account - DISABLED */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.row, styles.rowDisabled]}
            onPress={handleDisabledRow}
            disabled
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
            testID="settings-delete-account"
          >
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, styles.deleteLabel, styles.rowLabelDisabled]}>
                {t('settings.deleteAccount')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Chalk,
  },
  statusBar: {
    height: 44,
  },
  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Error
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.Ink,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 15,
    lineHeight: 23,
    color: Colors.Muted,
    textAlign: 'center',
  },
  retryButton: {
    borderWidth: 1,
    borderColor: Colors.Ink,
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.Ink,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingVertical: 22,
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Hairline,
    gap: 4,
  },
  headerName: {
    fontFamily: 'Assistant',
    fontSize: 24,
    fontWeight: '700',
    color: Colors.Ink,
    letterSpacing: -0.02,
  },
  headerPhone: {
    fontFamily: 'Assistant',
    fontSize: 16,
    color: Colors.Muted,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    fontFamily: 'Assistant',
    fontSize: 13,
    fontWeight: '600',
    color: Colors.Muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 22,
    paddingBottom: 8,
  },
  row: {
    backgroundColor: Colors.Chalk,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Hairline,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 22,
  },
  rowLabel: {
    fontFamily: 'Assistant',
    fontSize: 16,
    fontWeight: '400',
    color: Colors.Ink,
  },
  rowLabelDisabled: {
    color: Colors.Muted,
  },
  rowValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowValueText: {
    fontFamily: 'Assistant',
    fontSize: 16,
    color: Colors.Muted,
  },
  rowValueTextDisabled: {
    color: Colors.Faint,
  },
  rowChevron: {
    fontSize: 20,
    color: Colors.Muted,
  },
  rowChevronDisabled: {
    color: Colors.Faint,
  },
  signOutLabel: {
    fontWeight: '600',
  },
  deleteLabel: {
    color: Colors.SignalRed,
  },
});
