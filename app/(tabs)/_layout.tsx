/**
 * TABS LAYOUT
 *
 * Five tabs:
 * - What's Happening (DEFAULT VIEW, not Home)
 * - Map
 * - Hellos
 * - Points
 * - Profile
 *
 * ⚠️ What's Happening IS the default. No separate Home tab.
 * ⚠️ Countdown REPLACES What's Happening when live (routing hook, not built yet)
 */

import { Tabs } from 'expo-router';
import { useTheme, Colors } from '../../src/theme';
import { t } from '../../src/i18n';

export default function TabsLayout() {
  const { identityColor } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: identityColor,
        tabBarInactiveTintColor: Colors.Ink,
        tabBarStyle: {
          backgroundColor: Colors.Chalk,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.whatsHappening'),
          tabBarLabel: t('tabs.whatsHappening'),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: t('tabs.map'),
          tabBarLabel: t('tabs.map'),
        }}
      />
      <Tabs.Screen
        name="hellos"
        options={{
          title: t('tabs.hellos'),
          tabBarLabel: t('tabs.hellos'),
        }}
      />
      <Tabs.Screen
        name="points"
        options={{
          title: t('tabs.points'),
          tabBarLabel: t('tabs.points'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarLabel: t('tabs.profile'),
        }}
      />
    </Tabs>
  );
}
