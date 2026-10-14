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
import { useDiscoveryReporter } from '../../src/lib/use-discovery-reporter';
import { useNudgeHandoff } from '../../src/lib/use-nudge-handoff';
import { useTheme, Colors } from '../../src/theme';
import { t } from '../../src/i18n';
import { useWindowDimensions } from 'react-native';
import { useColumnStyle } from '../../src/components/ScreenContainer';

export default function TabsLayout() {
  // W8-A (built OFF): coarse-cell heartbeat while Open to Hellos is on and the app is open; Waverly's push lands on Home.
  useDiscoveryReporter();
  useNudgeHandoff();
  const { identityColor } = useTheme();
  // T/D: the tab bar sits in the same centred column as the screens (700 / 900), not edge to edge.
  const column = useColumnStyle();
  // D 1440 frames draw the five destinations as a 260 px left rail (SH-01 desktop chat frame), not a bottom bar.
  const rail = useWindowDimensions().width >= 1024;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: identityColor,
        tabBarInactiveTintColor: Colors.Ink,
        tabBarPosition: rail ? 'left' : 'bottom',
        tabBarStyle: rail
          ? { backgroundColor: Colors.Chalk, width: 260, borderRightWidth: 1, borderRightColor: Colors.Line }
          : { backgroundColor: Colors.Chalk, ...column },
      }}
    >
      <Tabs.Screen
        name="home"
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
          title: t('tabs.prizes'),
          tabBarLabel: t('tabs.prizes'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.you'),
          tabBarLabel: t('tabs.you'),
        }}
      />
      {/* Profile detail routes are reachable, but are not additional main tabs. */}
      <Tabs.Screen name="profile/blocked" options={{ href: null }} />
      <Tabs.Screen name="profile/icebreakers" options={{ href: null }} />
      <Tabs.Screen name="profile/notifications" options={{ href: null }} />
      <Tabs.Screen name="profile/host-mode" options={{ href: null }} />
      <Tabs.Screen name="profile/edit" options={{ href: null }} />
      <Tabs.Screen name="profile/delete-account" options={{ href: null }} />
      <Tabs.Screen name="profile/legal" options={{ href: null }} />
      <Tabs.Screen name="profile/romance" options={{ href: null }} />
      <Tabs.Screen name="profile/strikes" options={{ href: null }} />
      <Tabs.Screen name="profile/contact" options={{ href: null }} />
      <Tabs.Screen name="profile/add-role" options={{ href: null }} />
    </Tabs>
  );
}
