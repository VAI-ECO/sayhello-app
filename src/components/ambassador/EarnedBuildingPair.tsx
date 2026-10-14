/**
 * EARNED and BUILDING, always together, side by side (CLAUDE.md "Ambassador panels"; ROLE-4 §6
 * says the same for Creators). Earned reads solid (DeepFern, solid border); Building reads
 * provisional (Amber, dashed border, a "Provisional" tag, faint figure). Every figure is an
 * MA-05 slot (RULES §31): "—" until the server sends one, and no TOTAL is ever shown — a total
 * would say money is sitting somewhere it can be taken from (A5 tablet note).
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { t } from '../../i18n';
import { Colors } from '../../theme/tokens';
import type { Earnings } from '../../api/ambassador';

/** Counts only (null = not loaded yet). The role-neutral tiles both roles use. */
export function EarnedBuildingTiles({
  earnedCount,
  buildingCount,
  onOpen,
  earnedSubKey = 'ambassador.earnedBuilding.earnedSub',
}: {
  earnedCount: number | null;
  buildingCount: number | null;
  onOpen?: () => void;
  /** Earned means different things per role: the Ambassador also visited; the Creator's is the business paid. */
  earnedSubKey?: string;
}) {
  const body = (
    <View style={styles.pair} testID="earned-building-pair">
      <View style={[styles.tile, styles.earnedTile]} testID="earned-card">
        <Text style={styles.earnedLabel}>{t('ambassador.earnedBuilding.earnedLabel')}</Text>
        <Text style={styles.value}>{t('ambassador.earnedBuilding.total')}</Text>
        <Text style={styles.sub}>
          {earnedCount !== null ? t(earnedSubKey, { count: earnedCount }) : t('ambassador.earnedBuilding.earnedNone')}
        </Text>
      </View>
      <View style={[styles.tile, styles.buildingTile]} testID="building-card">
        <View style={styles.buildingHead}>
          <Text style={styles.buildingLabel}>{t('ambassador.earnedBuilding.buildingLabel')}</Text>
          <Text style={styles.provisional}>{t('ambassador.earnedBuilding.provisional')}</Text>
        </View>
        <Text style={[styles.value, styles.valueBuilding]}>{t('ambassador.earnedBuilding.total')}</Text>
        <Text style={styles.sub}>
          {buildingCount !== null ? t('ambassador.earnedBuilding.buildingSub', { count: buildingCount }) : t('ambassador.earnedBuilding.buildingNone')}
        </Text>
      </View>
    </View>
  );
  return onOpen ? (
    <TouchableOpacity onPress={onOpen} accessibilityRole="button" accessibilityLabel={t('ambassador.overview.payoutsCta')} testID="earned-open">
      {body}
    </TouchableOpacity>
  ) : (
    body
  );
}

export function EarnedBuildingPair({ earnings, onOpen }: { earnings: Earnings | null; onOpen?: () => void }) {
  return (
    <EarnedBuildingTiles
      earnedCount={earnings ? earnings.earned.length : null}
      buildingCount={earnings ? earnings.building.length : null}
      onOpen={onOpen}
    />
  );
}

const styles = StyleSheet.create({
  pair: { flexDirection: 'row', gap: 12 },
  tile: { flex: 1, borderRadius: 16, padding: 16, gap: 6 },
  earnedTile: { borderWidth: 1.5, borderColor: Colors.DeepFern, backgroundColor: Colors.Chalk },
  buildingTile: { borderWidth: 1.5, borderColor: Colors.Amber, borderStyle: 'dashed', backgroundColor: Colors.Bone },
  earnedLabel: { fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase', fontWeight: '800', color: Colors.DeepFern },
  buildingHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6 },
  buildingLabel: { fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase', fontWeight: '800', color: Colors.Amber },
  provisional: {
    fontSize: 10.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: Colors.Muted,
    borderWidth: 1,
    borderColor: Colors.Line,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  value: { fontSize: 30, fontWeight: '700', color: Colors.Ink, letterSpacing: -0.9 },
  valueBuilding: { color: Colors.Faint },
  sub: { fontSize: 13.5, lineHeight: 19, color: Colors.Muted },
});
