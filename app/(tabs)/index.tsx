/**
 * WHAT'S HAPPENING SCREEN
 *
 * Home screen with four states:
 * 1. THE FEED — default. Tonight's Hootzas, discounts, Hollas, nearby Hello Hangouts
 * 2. A QUIET DAY — empty state. Must not read as failure.
 * 3. THE HELLO TAKEOVER — a live encounter supersedes home
 * 4. HOOTZA DETAIL — single Hootza opened (not implemented in this version)
 *
 * ⚠️ ONLY a Hello supersedes home. Not a Discount, not a Holla, not a Hootza starting soon.
 * ⚠️ "Hello Hangout" is NEVER shortened to "Hangout" (RULES 7.17)
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { Waverly } from '../../src/components';
import { t } from '../../src/i18n';
import { Colors, useTheme } from '../../src/theme';
import { darkenColor } from '../../src/theme/contrast';
import { mockFeedItems, mockQuietDayItems, type FeedItem } from '../../src/data/mockFeedData';

type ViewState = 'feed' | 'quiet' | 'helloTakeover';
type FilterType = 'all' | 'hootzas' | 'discounts' | 'hollas';

export default function WhatsHappeningScreen() {
  const { identityColor } = useTheme();
  const [viewState, setViewState] = useState<ViewState>('feed');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isOpenToHellos, setIsOpenToHellos] = useState(true);

  // For demo purposes, use mock data
  const feedItems = viewState === 'quiet' ? mockQuietDayItems : mockFeedItems;

  // For Hello takeover, use OTHER person's identity color (darkened ground)
  // In production, this would come from encounter data
  const otherPersonColor = identityColor; // Placeholder: use user's own color
  const groundColor = darkenColor(otherPersonColor);

  // Filter items based on active filter
  const filteredItems = activeFilter === 'all'
    ? feedItems
    : feedItems.filter(item => {
        if (activeFilter === 'hootzas') return item.type === 'hootza';
        if (activeFilter === 'discounts') return item.type === 'discount';
        if (activeFilter === 'hollas') return item.type === 'holla';
        return true;
      });

  // Hello Takeover state
  if (viewState === 'helloTakeover') {
    return (
      <View style={[styles.container, { backgroundColor: groundColor }]}>
        <View style={styles.statusBar} />

        <View style={styles.takeoverContent}>
          {/* Center content */}
          <View style={styles.takeoverCenter}>
            <Waverly size={190} color={Colors.Chalk} wave />

            <View style={styles.takeoverTitleContainer}>
              <Text style={styles.takeoverTitle}>
                {t('whatsHappening.helloTakeover.title')}{' '}
                <Text style={styles.takeoverDreaming}>Say Hello</Text>.
              </Text>
              <Text style={styles.takeoverSubtitle}>{t('whatsHappening.helloTakeover.subtitle')}</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.takeoverActions}>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => setViewState('feed')}
              accessibilityRole="button"
              accessibilityLabel={t('whatsHappening.helloTakeover.accept')}
            >
              <Text style={[styles.acceptButtonText, { color: groundColor }]}>{t('whatsHappening.helloTakeover.accept')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.declineButton}
              onPress={() => setViewState('feed')}
              accessibilityRole="button"
              accessibilityLabel={t('whatsHappening.helloTakeover.decline')}
            >
              <Text style={styles.declineButtonText}>{t('whatsHappening.helloTakeover.decline')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Default feed/quiet day view
  return (
    <View style={styles.container}>
      <View style={styles.statusBar} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Waverly size={28} color={Colors.Ink} />
          <Text style={styles.headerTitle}>Say Hello</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsText}>340</Text>
          </View>
          <View style={[styles.avatar, { backgroundColor: Colors.HelloBlue }]} />
        </View>
      </View>

      {/* Hello toggle */}
      <View style={styles.helloToggleContainer}>
        <View style={styles.helloToggleLeft}>
          <View style={styles.helloIndicator}>
            <View style={[styles.helloDot, { backgroundColor: Colors.Fern }]} />
            <Animated.View style={[styles.helloRing, { borderColor: Colors.Fern }]} />
          </View>
          <Text style={styles.helloToggleText}>{t('whatsHappening.header.openToHellos')}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.toggle,
            { backgroundColor: isOpenToHellos ? Colors.Fern : Colors.Line }
          ]}
          onPress={() => setIsOpenToHellos(!isOpenToHellos)}
          accessibilityRole="switch"
          accessibilityState={{ checked: isOpenToHellos }}
          accessibilityLabel={t('whatsHappening.header.openToHellos')}
        >
          <View style={[
            styles.toggleKnob,
            isOpenToHellos && styles.toggleKnobActive
          ]} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
        showsHorizontalScrollIndicator={false}
      >
        {(['all', 'hootzas', 'discounts', 'hollas'] as FilterType[]).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              activeFilter === filter && styles.filterChipActive
            ]}
            onPress={() => setActiveFilter(filter)}
            accessibilityRole="button"
            accessibilityState={{ selected: activeFilter === filter }}
          >
            <Text style={[
              styles.filterChipText,
              activeFilter === filter && styles.filterChipTextActive
            ]}>
              {t(`whatsHappening.filters.${filter}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Feed content */}
      <ScrollView style={styles.feed} contentContainerStyle={styles.feedContent}>
        {viewState === 'quiet' ? (
          <View style={styles.quietDayContainer}>
            <View style={styles.quietDayCard}>
              <Text style={styles.quietDayTitle}>{t('whatsHappening.quietDay.title')}</Text>
              <Text style={styles.quietDaySubtitle}>{t('whatsHappening.quietDay.subtitle')}</Text>
            </View>

            {/* Distant items */}
            <View style={styles.feedList}>
              {filteredItems.map((item) => (
                <FeedItemRow key={item.id} item={item} />
              ))}
            </View>

            {/* Post CTA */}
            <View style={styles.postCtaCard}>
              <Text style={styles.postCtaTitle}>{t('whatsHappening.quietDay.postCta.title')}</Text>
              <Text style={styles.postCtaBody}>{t('whatsHappening.quietDay.postCta.body')}</Text>
              <TouchableOpacity
                style={styles.postCtaButton}
                accessibilityRole="button"
                accessibilityLabel={t('whatsHappening.quietDay.postCta.button')}
              >
                <Text style={styles.postCtaButtonText}>{t('whatsHappening.quietDay.postCta.button')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* Featured card (first Hootza that's tonight) */}
            {filteredItems.find(item => item.isTonight) && (
              <FeedItemCard item={filteredItems.find(item => item.isTonight)!} />
            )}

            {/* Feed list */}
            <View style={styles.feedList}>
              {filteredItems.filter(item => !item.isTonight).map((item) => (
                <FeedItemRow key={item.id} item={item} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

// Featured card component (with image)
function FeedItemCard({ item }: { item: FeedItem }) {
  return (
    <View style={styles.feedCard}>
      <View style={styles.feedCardImage}>
        {item.isTonight && (
          <View style={styles.tonightBadge}>
            <Text style={styles.tonightBadgeText}>{t('whatsHappening.feedItem.tonight')}</Text>
          </View>
        )}
      </View>
      <View style={styles.feedCardContent}>
        <Text style={styles.feedCardMeta}>
          {item.type === 'hootza' && t('whatsHappening.feedItem.hootza')}
          {item.time && ` · ${item.time}`}
        </Text>
        <Text style={styles.feedCardTitle}>{item.title}</Text>
        <View style={styles.feedCardFooter}>
          <Text style={styles.feedCardFooterText}>
            {item.locationName} · {item.distance}
            {item.attendeeCount && ` · ${item.attendeeCount} ${t('whatsHappening.feedItem.going')}`}
          </Text>
          <Text style={styles.feedCardJoin}>{t('whatsHappening.feedItem.join')}</Text>
        </View>
      </View>
    </View>
  );
}

// Feed row component (compact)
function FeedItemRow({ item }: { item: FeedItem }) {
  const getMetaText = () => {
    if (item.type === 'hootza') {
      const parts = [t('whatsHappening.feedItem.hootza')];
      if (item.date) parts.push(item.date);
      if (item.time) parts.push(item.time);
      if (item.distance && !item.date) parts.push(item.distance);
      return parts.join(' · ');
    }
    if (item.type === 'discount') {
      return `${t('whatsHappening.feedItem.discount')} · ${t('whatsHappening.feedItem.ends')} ${item.expiryDate}`;
    }
    if (item.type === 'holla') {
      return t('whatsHappening.feedItem.holla');
    }
    return '';
  };

  const getMetaColor = () => {
    if (item.type === 'discount') return Colors.Magenta;
    return Colors.Faint;
  };

  return (
    <View style={styles.feedRow}>
      <View style={styles.feedRowImage} />
      <View style={styles.feedRowContent}>
        <Text style={[styles.feedRowMeta, { color: getMetaColor() }]}>{getMetaText()}</Text>
        <Text style={styles.feedRowTitle}>{item.title}</Text>
        <Text style={styles.feedRowFooter}>
          {item.locationName}
          {item.postedAt && ` · ${item.postedAt}`}
          {item.distance && !item.date && ` · ${item.distance}`}
          {item.attendeeCount && ` · ${item.attendeeCount} ${t('whatsHappening.feedItem.going')}`}
        </Text>
      </View>
      {item.type === 'discount' && <View style={[styles.discountMarker, { backgroundColor: Colors.Amber }]} />}
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 2,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  headerTitle: {
    fontFamily: 'Dreaming',
    fontSize: 26,
    lineHeight: 26,
    color: Colors.Ink,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pointsBadge: {
    backgroundColor: Colors.Bone,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
  },
  pointsText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.Ink,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },

  // Hello toggle
  helloToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  helloToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  helloIndicator: {
    width: 9,
    height: 9,
    position: 'relative',
  },
  helloDot: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  helloRing: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 2,
  },
  helloToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.Ink,
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    padding: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.Chalk,
  },
  toggleKnobActive: {
    marginLeft: 'auto',
  },

  // Filters
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexGrow: 0,
  },
  filtersContent: {
    gap: 7,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.Line,
  },
  filterChipActive: {
    backgroundColor: Colors.Ink,
    borderColor: Colors.Ink,
  },
  filterChipText: {
    fontSize: 13,
    color: Colors.Ink,
  },
  filterChipTextActive: {
    color: Colors.Chalk,
    fontWeight: '600',
  },

  // Feed
  feed: {
    flex: 1,
  },
  feedContent: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 20,
  },

  // Featured card
  feedCard: {
    borderWidth: 1,
    borderColor: Colors.Line,
    borderRadius: 16,
    overflow: 'hidden',
  },
  feedCardImage: {
    height: 112,
    backgroundColor: Colors.Hairline,
    position: 'relative',
  },
  tonightBadge: {
    position: 'absolute',
    top: 10,
    left: 12,
    backgroundColor: Colors.Ink,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 4,
  },
  tonightBadgeText: {
    fontSize: 11,
    letterSpacing: 0.1,
    textTransform: 'uppercase',
    color: Colors.Chalk,
    fontWeight: '600',
  },
  feedCardContent: {
    padding: 14,
    gap: 5,
  },
  feedCardMeta: {
    fontSize: 11,
    letterSpacing: 0.1,
    textTransform: 'uppercase',
    color: Colors.Faint,
    fontWeight: '600',
  },
  feedCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.Ink,
  },
  feedCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feedCardFooterText: {
    fontSize: 14,
    color: Colors.Muted,
  },
  feedCardJoin: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.Magenta,
  },

  // Feed rows
  feedList: {
    backgroundColor: Colors.Hairline,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.Hairline,
  },
  feedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.Chalk,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Hairline,
  },
  feedRowImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: Colors.Hairline,
  },
  feedRowContent: {
    flex: 1,
    gap: 2,
  },
  feedRowMeta: {
    fontSize: 11,
    letterSpacing: 0.1,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  feedRowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.Ink,
  },
  feedRowFooter: {
    fontSize: 13,
    color: Colors.Muted,
  },
  discountMarker: {
    width: 13,
    height: 13,
    borderRadius: 3,
  },

  // Quiet day
  quietDayContainer: {
    gap: 16,
  },
  quietDayCard: {
    backgroundColor: Colors.Bone,
    borderRadius: 16,
    padding: 20,
    gap: 8,
  },
  quietDayTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.Ink,
    letterSpacing: -0.2,
  },
  quietDaySubtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: Colors.Muted,
  },

  // Post CTA
  postCtaCard: {
    borderWidth: 1,
    borderColor: Colors.Line,
    borderRadius: 16,
    padding: 18,
    gap: 10,
  },
  postCtaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.Ink,
  },
  postCtaBody: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.Muted,
  },
  postCtaButton: {
    borderWidth: 1,
    borderColor: Colors.Ink,
    borderRadius: 22,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postCtaButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.Ink,
  },

  // Hello takeover
  takeoverContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 34,
    justifyContent: 'space-between',
  },
  takeoverCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
  },
  takeoverTitleContainer: {
    alignItems: 'center',
  },
  takeoverTitle: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    color: Colors.Chalk,
    letterSpacing: -0.9,
    textAlign: 'center',
  },
  takeoverDreaming: {
    fontFamily: 'Dreaming',
    fontSize: 45, // 1.42em of 32px
    lineHeight: 27, // 0.85 of 32px
    fontWeight: '400',
  },
  takeoverSubtitle: {
    fontSize: 16,
    lineHeight: 25,
    color: Colors.Chalk,
    textAlign: 'center',
    marginTop: 4,
  },
  takeoverActions: {
    gap: 10,
  },
  acceptButton: {
    backgroundColor: Colors.Chalk,
    borderRadius: 28,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  declineButton: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.Chalk,
  },
});
