/**
 * PROFILE TAB
 *
 * User's profile and settings.
 * Links to Icebreakers (editable forever per RULES 13.10).
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/theme';
import { t } from '../../src/i18n';

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.statusBar} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('tabs.you')}</Text>
      </View>

      <View style={styles.content}>
        {/* Icebreakers link */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/profile/icebreakers')}
          accessibilityRole="button"
          testID="profile-icebreakers-link"
        >
          <Text style={styles.menuItemLabel}>{t('icebreakers.title')}</Text>
          <Text style={styles.menuItemArrow}>→</Text>
        </TouchableOpacity>

        {/* Placeholder for future menu items */}
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            More profile options coming soon
          </Text>
        </View>
      </View>
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
  header: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Hairline,
  },
  headerTitle: {
    fontFamily: 'Assistant',
    fontSize: 24,
    fontWeight: '700',
    color: Colors.Ink,
    letterSpacing: -0.02,
  },
  content: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Hairline,
  },
  menuItemLabel: {
    fontFamily: 'Assistant',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.Ink,
  },
  menuItemArrow: {
    fontSize: 18,
    color: Colors.Muted,
  },
  placeholder: {
    padding: 22,
    paddingTop: 40,
  },
  placeholderText: {
    fontFamily: 'Assistant',
    fontSize: 14,
    color: Colors.Faint,
    textAlign: 'center',
  },
});
