/**
 * The What's Happening card for tablet and desktop ("Feed and Prizes All Sizes": Happening · tablet / desktop).
 * Same card at every width, only how many sit beside each other changes: two columns from tablet, three on desktop.
 * The mark follows the legend (RULES §33): a Hootza is a ring, a Holla a pennant, a Discount a tag; all outlined.
 * No distance, ever (§8.12).
 */
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { t } from '../../i18n';
import { Colors } from '../../theme';
import type { UIFeedItem } from '../../lib/feed-model';

/**
 * Columns for a window width. Tablet starts at 700 (as columnMaxWidth). From 1024 the tab navigation is a 260 px left
 * rail, so three cards need the 1440 desktop frame's room: three columns from 1280, two below.
 */
export function feedColumns(width: number): 1 | 2 | 3 {
  if (width >= 1280) return 3;
  if (width >= 700) return 2;
  return 1;
}

const KIND: Record<UIFeedItem['type'], { labelKey: string; color: string }> = {
  hootza: { labelKey: 'whatsHappening.feedItem.hootza', color: Colors.Ink },
  holla: { labelKey: 'whatsHappening.feedItem.holla', color: Colors.Plum },
  discount: { labelKey: 'whatsHappening.feedItem.discount', color: Colors.Terracotta },
};

function clockText(item: UIFeedItem): string {
  if (item.type === 'hootza') return [item.date, item.time].filter(Boolean).join(' ');
  if (item.type === 'discount') return item.expiryDate ? `${t('whatsHappening.feedItem.ends')} ${item.expiryDate}` : '';
  return item.postedAt ?? '';
}

export function FeedGridCard({ item, columns, onPress }: { item: UIFeedItem; columns: 2 | 3; onPress?: () => void }) {
  const kind = KIND[item.type];
  const clock = clockText(item);
  return (
    <TouchableOpacity
      style={[styles.card, { width: columns === 3 ? '31.8%' : '48.8%' }]}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`${t(kind.labelKey)}: ${item.title}`}
      testID={`feed-card-${item.type}-${item.id}`}
    >
      <View style={styles.head}>
        <View
          style={[
            styles.mark,
            { borderColor: kind.color },
            item.type === 'hootza' ? { borderRadius: 11 } : { borderTopLeftRadius: 3, borderBottomLeftRadius: 3, borderTopRightRadius: 10, borderBottomRightRadius: 10 },
          ]}
        />
        <Text style={[styles.kind, { color: kind.color }]}>{t(kind.labelKey)}</Text>
        <View style={{ flex: 1 }} />
        {item.isTonight ? <Text style={styles.tonight}>{t('whatsHappening.feedItem.tonight')}</Text> : null}
        {clock ? <Text style={styles.clock}>{clock}</Text> : null}
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.venue}>
        {item.locationName ?? t(item.privateResidence ? 'feedViews.privateResidence' : 'feedViews.placeTbd')}
        {item.attendeeCount ? ` · ${item.attendeeCount} ${t('whatsHappening.feedItem.going')}` : ''}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.Chalk, borderRadius: 16, paddingVertical: 17, paddingHorizontal: 18, gap: 9, borderWidth: 1, borderColor: Colors.Hairline },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { width: 22, height: 22, borderWidth: 2.5, backgroundColor: Colors.Chalk },
  kind: { fontSize: 13, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  tonight: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: Colors.Chalk, backgroundColor: Colors.Ink, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4, overflow: 'hidden' },
  clock: { fontSize: 13, color: Colors.Faint },
  title: { fontSize: 18, fontWeight: '700', color: Colors.Ink, letterSpacing: -0.3, lineHeight: 23 },
  venue: { fontSize: 15, lineHeight: 22, color: Colors.Muted },
});
