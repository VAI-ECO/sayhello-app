/**
 * ROLE SHELL — the work-surface frame the delivered role screens share (CANON-RL-03 Ambassador,
 * CANON-RL-04 Creator): P 375 · T 834 · D 1440.
 *
 *  - phone (< 700):     full-width scroll, back link.
 *  - tablet (700–1023): the same column centred at 700 wide (T frames: max-width 700, 40 gutters).
 *  - desktop (≥ 1024):  the D frame — a 260 px rail ("Say Hello" wordmark · role name) beside the content.
 *
 * A rail lists ONLY destinations that are built. A drawn rail entry whose screen does not exist
 * would be a dead link, so it is left out and recorded in the ledger instead.
 */

import type { ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import { t } from '../../i18n';
import { Colors } from '../../theme/tokens';

export type RoleLayout = 'phone' | 'tablet' | 'desktop';

export function layoutForWidth(width: number): RoleLayout {
  if (width >= 1024) return 'desktop';
  if (width >= 700) return 'tablet';
  return 'phone';
}

export function useRoleLayout(): RoleLayout {
  const { width } = useWindowDimensions();
  return layoutForWidth(width);
}

export interface RailItem {
  key: string;
  /** An i18n key. */
  label: string;
  href: Href;
}

interface ShellProps {
  /** i18n key of the role name shown under the wordmark. */
  roleLabel: string;
  rail: RailItem[];
  /** testID prefix for rail entries, e.g. "ambassador" → ambassador-rail-overview. */
  railId: string;
  /** Which rail entry is current; omit for flow screens that sit outside the rail. */
  active?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Where the phone/tablet "back" goes; defaults to router.back(). */
  onBack?: () => void;
  testID?: string;
}

export function RoleShell({ roleLabel, rail, railId, active, title, subtitle, children, refreshing, onRefresh, onBack, testID }: ShellProps) {
  const router = useRouter();
  const layout = useRoleLayout();
  const desktop = layout === 'desktop';
  const gutter = desktop ? 60 : layout === 'tablet' ? 40 : 22;
  const maxWidth = desktop ? 900 : layout === 'tablet' ? 700 : undefined;

  const body = (
    <ScrollView
      contentContainerStyle={[styles.scroll, { paddingHorizontal: gutter }]}
      refreshControl={onRefresh ? <RefreshControl refreshing={Boolean(refreshing)} onRefresh={onRefresh} /> : undefined}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.column, maxWidth ? { maxWidth, width: '100%' } : null]}>
        {!desktop ? (
          <TouchableOpacity
            onPress={onBack ?? (() => router.back())}
            accessibilityRole="button"
            accessibilityLabel={t('ambassador.common.backLabel')}
            style={styles.back}
            testID={`${railId}-back`}
          >
            <Text style={styles.backText}>{t('ambassador.common.back')}</Text>
          </TouchableOpacity>
        ) : null}
        <Text style={[styles.title, desktop && styles.titleDesktop]} accessibilityRole="header">{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, desktop && styles.subtitleDesktop]}>{subtitle}</Text> : null}
        {children}
      </View>
    </ScrollView>
  );

  if (!desktop) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']} testID={testID}>
        {body}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']} testID={testID}>
      <View style={styles.desktopRow}>
        <View style={styles.rail} testID={`${railId}-rail`} accessibilityRole="menu">
          <View style={styles.railBrand}>
            <Text style={styles.railWordmark}>Say Hello</Text>
            <Text style={styles.railRole}>{t(roleLabel)}</Text>
          </View>
          {rail.map((item) => {
            const current = item.key === active;
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => router.push(item.href)}
                style={[styles.railItem, current && styles.railItemActive]}
                accessibilityRole="menuitem"
                accessibilityState={{ selected: current }}
                testID={`${railId}-rail-${item.key}`}
              >
                <View style={[styles.railDot, current && styles.railDotActive]} />
                <Text style={[styles.railLabel, current && styles.railLabelActive]}>{t(item.label)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.desktopContent}>{body}</View>
      </View>
    </SafeAreaView>
  );
}

/** A quiet section label — the delivered small-caps eyebrow. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

/** The delivered bordered card. */
export function Card({ children, tone, testID }: { children: ReactNode; tone?: 'error'; testID?: string }) {
  return (
    <View style={[styles.card, tone === 'error' && styles.cardError]} testID={testID}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.Chalk },
  scroll: { paddingTop: 26, paddingBottom: 44, alignItems: 'center' },
  column: { width: '100%', gap: 14 },
  back: { paddingVertical: 4, alignSelf: 'flex-start' },
  backText: { fontSize: 16, fontWeight: '600', color: Colors.Muted },
  title: { fontSize: 29, lineHeight: 33, fontWeight: '700', letterSpacing: -0.8, color: Colors.Ink },
  titleDesktop: { fontSize: 40, lineHeight: 45 },
  subtitle: { fontSize: 16, lineHeight: 25, color: Colors.Muted },
  subtitleDesktop: { fontSize: 18 },
  desktopRow: { flex: 1, flexDirection: 'row' },
  desktopContent: { flex: 1, minWidth: 0 },
  rail: {
    width: 260,
    borderRightWidth: 1,
    borderRightColor: Colors.Line,
    backgroundColor: Colors.Chalk,
    paddingVertical: 26,
    paddingHorizontal: 18,
    gap: 5,
  },
  railBrand: { paddingHorizontal: 10, paddingBottom: 22, gap: 5 },
  railWordmark: { fontFamily: 'Dreaming', fontSize: 30, lineHeight: 26, color: Colors.Ink },
  railRole: { fontSize: 14, color: Colors.Muted },
  railItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, minHeight: 48 },
  railItemActive: { backgroundColor: '#F2EFEB' },
  railDot: { width: 24, height: 24, borderRadius: 7, backgroundColor: '#CFCAC3' },
  railDotActive: { backgroundColor: Colors.Ink },
  railLabel: { fontSize: 16, fontWeight: '600', color: Colors.Muted },
  railLabelActive: { fontWeight: '700', color: Colors.Ink },
  eyebrow: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: Colors.Muted,
  },
  card: {
    borderWidth: 1,
    borderColor: Colors.Line,
    borderRadius: 16,
    padding: 19,
    gap: 6,
  },
  cardError: { borderColor: Colors.SignalRed, borderWidth: 1.5, backgroundColor: '#FFFBFA' },
});
