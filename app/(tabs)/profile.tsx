/**
 * SETTINGS SCREEN
 *
 * User's profile and settings.
 * Grouped by user intent: "The app", "What you share", "People", "The small print"
 *
 * Every row is live (stream S1): Notifications (server-saved), Host Mode, Icebreakers, Blocked
 * (server count), the legal pages (explicit "pending legal approval" until approved), Edit profile,
 * Sign out (revokes the session on the server, then clears the device) and Delete my account.
 */

import { useColumnStyle } from '../../src/components/ScreenContainer';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Colors, ColorNames } from '../../src/theme/tokens';
import { useTheme } from '../../src/theme';
import { StatusBarSpacer } from '../../src/components/StatusBarSpacer';
import { t } from '../../src/i18n';
import { api } from '../../src/api/client';
import { getAdminMe } from '../../src/api/admin';
import { getBlocks, getMyStrikes, getNotificationPreferences, NOTIFICATION_KEYS } from '../../src/api/account';

interface UserProfile {
  id: string;
  displayName?: string;
  phoneNumber: string;
  dateOfBirth?: string;
  drawingNumber?: string;
  profilePhotoUrl?: string | null;
}

export default function SettingsScreen() {
  const column = useColumnStyle();
  // D 1440 (RL-01-SN-56): "Four groups across one row at desktop width" - groups wrap four across the content area.
  const desktop = useWindowDimensions().width >= 1024;
  const sectionStyle = desktop ? [styles.section, styles.sectionDesktop] : styles.section;
  const router = useRouter();
  const { identityColor } = useTheme();
  const [icebreakersCount, setIcebreakersCount] = useState(0);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Row values come from the server; null = could not be read (shown without a value, never faked).
  const [blockedCount, setBlockedCount] = useState<number | null>(null);
  const [notificationsSummary, setNotificationsSummary] = useState<string | null>(null);
  const [strikeCount, setStrikeCount] = useState<number | null>(null);

  // Hello Admin is a staff surface: the row exists only when the SERVER says this account holds a
  // section. It is presentation — every Hello Admin route enforces its own permission (§23.10).
  const [hasHelloAdmin, setHasHelloAdmin] = useState(false);

  const colorName = ColorNames[identityColor];

  // Load user data
  useEffect(() => {
    (async () => {
      await loadProfile();
      await loadIcebreakersCount();
      void loadRowValues();
      try {
        const admin = await getAdminMe();
        if (admin?.data && admin.data.sections.length > 0) setHasHelloAdmin(true);
      } catch {
        // Not staff, or the check could not be made: no row.
      }
    })();
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

  async function loadIcebreakersCount() {
    const result = await api.icebreakers.getMyAnswers();
    if (result.data && Array.isArray((result.data as { answers?: unknown[] }).answers)) {
      setIcebreakersCount((result.data as { answers: unknown[] }).answers.length);
    } else if (Array.isArray(result.data)) {
      setIcebreakersCount(result.data.length);
    } else {
      setIcebreakersCount(0);
    }
  }

  async function loadRowValues() {
    const [blocks, prefs, strikes] = await Promise.all([getBlocks(), getNotificationPreferences(), getMyStrikes()]);
    setStrikeCount(strikes.data && Number.isInteger(strikes.data.active) ? strikes.data.active : null);
    setBlockedCount(blocks.data && Array.isArray(blocks.data.blocks) ? blocks.data.blocks.length : null);
    if (prefs.data?.preferences) {
      const values = NOTIFICATION_KEYS.map(key => prefs.data!.preferences[key]);
      setNotificationsSummary(
        values.every(Boolean) ? t('account.notifications.summaryAllOn')
        : values.some(Boolean) ? t('account.notifications.summarySomeOn')
        : t('account.notifications.summaryAllOff'),
      );
    }
  }

  const handleSignOut = async () => {
    // The device is signed out either way; the server revokes this session's token when reachable.
    await api.auth.signOut();
    router.replace('/(auth)/sign-in-phone');
  };

  const open = (path: string) => router.push(path as never);

  const handleIcebreakers = () => {
    router.push('/profile/icebreakers');
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBarSpacer height={44} />
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
        <StatusBarSpacer height={44} />
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
      <StatusBarSpacer height={44} />

      <ScrollView style={styles.content} contentContainerStyle={desktop ? styles.gridDesktop : column}>
        {/* Header */}
        <View style={desktop ? [styles.header, { width: '100%' }] : styles.header}>
          {user.profilePhotoUrl ? (
            <Image source={{ uri: user.profilePhotoUrl }} style={{ width: 64, height: 64, borderRadius: 32, marginBottom: 10 }} accessibilityIgnoresInvertColors testID="settings-photo" />
          ) : null}
          <Text style={styles.headerName}>{user.displayName || 'User'}</Text>
          <Text style={styles.headerPhone}>
            {user.phoneNumber} · {colorName}
          </Text>
        </View>

        <View style={sectionStyle}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => open('/profile/edit')}
            accessibilityRole="button"
            testID="settings-edit-profile"
          >
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>{t('account.edit.row')}</Text>
              <Text style={styles.rowChevron}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Your account: the person's own strike count, plainly (RULES §35.16) */}
        <View style={sectionStyle}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => open('/profile/strikes')}
            accessibilityRole="button"
            testID="settings-strikes"
          >
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>{t('s2c.strikes.row')}</Text>
              <View style={styles.rowValue}>
                <Text style={styles.rowValueText} testID="strikes-row-value">{strikeCount === null ? '' : String(strikeCount)}</Text>
                <Text style={styles.rowChevron}>›</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Section: The app */}
        <View style={sectionStyle}>
          <Text style={styles.sectionHeader}>{t('settings.sectionTheApp')}</Text>

          <TouchableOpacity
            style={styles.row}
            onPress={() => open('/profile/notifications')}
            accessibilityRole="button"
            testID="settings-notifications"
          >
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>
                {t('settings.notifications.label')}
              </Text>
              <View style={styles.rowValue}>
                <Text style={styles.rowValueText}>
                  {notificationsSummary ?? ''}
                </Text>
                <Text style={styles.rowChevron}>›</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.row}
            onPress={() => open('/profile/host-mode')}
            accessibilityRole="button"
            testID="settings-host-mode"
          >
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>
                {t('settings.hostMode.label')}
              </Text>
              <View style={styles.rowValue}>
                <Text style={styles.rowValueText}>
                  
                </Text>
                <Text style={styles.rowChevron}>›</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* The welcome is re-openable forever (RULES §26.6) */}
        <View style={sectionStyle}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push('/(onboarding)/welcome')}
            accessibilityRole="button"
            testID="settings-welcome"
          >
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>{t('account.welcomeRow')}</Text>
              <Text style={styles.rowChevron}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Section: What you share */}
        <View style={sectionStyle}>
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

        {/* Gender and pronouns (public pronouns, private gender) and Romance (RULES §13) */}
        <View style={sectionStyle}>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/(onboarding)/gender?edit=1' as never)} accessibilityRole="button" testID="settings-gender">
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>{t('s2c.gender.editRow')}</Text>
              <Text style={styles.rowChevron}>›</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => open('/profile/romance')} accessibilityRole="button" testID="settings-romance">
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>{t('s2c.romance.row')}</Text>
              <Text style={styles.rowChevron}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Section: Hello Hangouts — VERTICAL-BUILD-06 entry points (not drawn in the
            profile frames; the directory's own nav is web-only). */}
        <View style={sectionStyle}>
          <Text style={styles.sectionHeader}>{t('settings.sectionHelloHangouts')}</Text>
          <TouchableOpacity style={styles.row} onPress={() => open('/profile/add-role')} accessibilityRole="button" testID="settings-add-role">
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>{t('s2c.addRole.row')}</Text>
              <Text style={styles.rowChevron}>›</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push('/(hangout)/directory')}
            accessibilityRole="button"
            testID="settings-find-hello-hangout"
          >
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>{t('settings.findHelloHangout')}</Text>
              <Text style={styles.rowChevron}>›</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push('/(hangout)/dashboard')}
            accessibilityRole="button"
            testID="settings-your-hello-hangout"
          >
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>{t('settings.yourHelloHangout')}</Text>
              <Text style={styles.rowChevron}>›</Text>
            </View>
          </TouchableOpacity>
          {/* ROLE-5: the Organization role is added to this account (§26.4); entry not drawn in the profile frames. */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push('/(organization)/org')}
            accessibilityRole="button"
            testID="settings-groups"
          >
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>{t('settings.yourGroups')}</Text>
              <Text style={styles.rowChevron}>›</Text>
            </View>
          </TouchableOpacity>
          {/* VERTICAL-BUILD-07: the Ambassador role is added to this account (ROLE-3 §1); the
              screen decides — from the server — between the application and the Overview. */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push('/ambassador')}
            accessibilityRole="button"
            testID="settings-ambassador"
          >
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>{t('settings.ambassador')}</Text>
              <Text style={styles.rowChevron}>›</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push('/influencer')}
            accessibilityRole="button"
            testID="settings-creator"
          >
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>{t('settings.creator')}</Text>
              <Text style={styles.rowChevron}>›</Text>
            </View>
          </TouchableOpacity>
          {hasHelloAdmin ? (
            <TouchableOpacity
              style={styles.row}
              onPress={() => router.push('/admin')}
              accessibilityRole="button"
              testID="settings-hello-admin"
            >
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>{t('settings.helloAdmin')}</Text>
                <Text style={styles.rowChevron}>›</Text>
              </View>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Section: People */}
        <View style={sectionStyle}>
          <Text style={styles.sectionHeader}>{t('settings.sectionPeople')}</Text>

          <TouchableOpacity
            style={styles.row}
            onPress={() => open('/profile/blocked')}
            accessibilityRole="button"
            testID="settings-blocked"
          >
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>
                {t('settings.blocked.label')}
              </Text>
              <View style={styles.rowValue}>
                <Text style={styles.rowValueText}>
                  {blockedCount === null ? '' : t('settings.blocked.value', { count: blockedCount })}
                </Text>
                <Text style={styles.rowChevron}>›</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Section: The small print */}
        <View style={sectionStyle}>
          <Text style={styles.sectionHeader}>{t('settings.sectionSmallPrint')}</Text>

          <TouchableOpacity
            style={styles.row}
            onPress={() => open('/profile/legal?slug=terms')}
            accessibilityRole="button"
            testID="settings-terms"
          >
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>
                {t('settings.terms')}
              </Text>
              <Text style={styles.rowChevron}>›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.row}
            onPress={() => open('/profile/legal?slug=privacy')}
            accessibilityRole="button"
            testID="settings-privacy"
          >
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>
                {t('settings.privacy')}
              </Text>
              <Text style={styles.rowChevron}>›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.row}
            onPress={() => open('/profile/legal?slug=drawing_rules')}
            accessibilityRole="button"
            testID="settings-drawing-rules"
          >
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>
                {t('settings.drawingRules')}
              </Text>
              <Text style={styles.rowChevron}>›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push('/(encounter)/safety?from=settings' as never)}
            accessibilityRole="button"
            testID="settings-safety"
          >
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>{t('s2c.safety.row')}</Text>
              <Text style={styles.rowChevron}>›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.row}
            onPress={() => open('/profile/contact')}
            accessibilityRole="button"
            testID="settings-contact"
          >
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>{t('s2c.contact.row')}</Text>
              <Text style={styles.rowChevron}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Sign out - LIVE */}
        <View style={sectionStyle}>
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

        {/* Delete account - LIVE (confirmation screen; POST /users/me/delete) */}
        <View style={sectionStyle}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => open('/profile/delete-account')}
            accessibilityRole="button"
            testID="settings-delete-account"
          >
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, styles.deleteLabel]}>
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
  sectionDesktop: {
    width: '23.5%',
  },
  gridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 16,
    paddingHorizontal: 24,
    paddingBottom: 32,
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
