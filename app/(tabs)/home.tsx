/**
 * WHAT'S HAPPENING SCREEN
 *
 * Home screen with four states:
 * 1. THE FEED — default. Tonight's Hootzas, discounts, Hollas, nearby Hello Hangouts
 * 2. A QUIET DAY — empty state. Must not read as failure.
 * 3. THE HELLO — a live encounter supersedes home: a pending Hello is the nudge card at the top of
 *    the feed with the rest dimmed (Feed and Prizes All Sizes); a Hello counting down replaces the
 *    feed with the stacked countdown (RULES §10.13, §10.14). Both come from the server (GET /hellos).
 * 4. HOOTZA DETAIL — single Hootza opened (not implemented in this version)
 *
 * ⚠️ ONLY a Hello supersedes home. Not a Discount, not a Holla, not a Hootza starting soon.
 * ⚠️ "Hello Hangout" is NEVER shortened to "Hangout" (RULES 7.17)
 * ⚠️ An error must NOT render as the quiet day. Quiet day is a real state, server failure is different.
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Waverly } from '../../src/components';
import { useColumnStyle } from '../../src/components/ScreenContainer';
import { t } from '../../src/i18n';
import { Colors, useTheme } from '../../src/theme';
import { getFeed, type FeedItem as ApiFeedItem } from '../../src/api/feed';
import { useLiveHellos } from '../../src/lib/use-live-hellos';
import { usePointsBalance } from '../../src/lib/use-points-balance';
import { blendOverMidnight, routeForHello } from '../../src/lib/encounter';
import { setActiveHelloId } from '../../src/state/active-hello';
import { HelloNudgeCard } from '../../src/components/feed/HelloNudgeCard';
import { CountdownCarousel } from '../../src/components/feed/CountdownCarousel';
import { HelloRevealCard } from '../../src/components/feed/HelloRevealCard';
import { HootzaNoticeBanner } from '../../src/components/feed/HootzaNoticeBanner';
import { LimitedModeBanner } from '../../src/components/consumer/LimitedModeBanner';
import { NudgeCapNotice } from '../../src/components/consumer/NudgeCapNotice';

type ViewState = 'feed' | 'quiet' | 'loading' | 'error';
type FilterType = 'all' | 'hootzas' | 'discounts' | 'hollas';

// UI feed item (transformed from API or mock)
interface UIFeedItem {
  id: string;
  type: 'hootza' | 'discount' | 'holla';
  title: string;
  locationName: string;
  time?: string;
  date?: string;
  expiryDate?: string;
  postedAt?: string;
  attendeeCount?: number;
  isTonight?: boolean;
  /** RULES §17.23 — a Discount or Holla opens its Hello Hangout's directory page. */
  directoryId?: string | null;
}

export default function WhatsHappeningScreen() {
  const router = useRouter();
  const { identityColor } = useTheme();
  const column = useColumnStyle();
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isOpenToHellos, setIsOpenToHellos] = useState(true);
  const [feedItems, setFeedItems] = useState<UIFeedItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Identity is withheld until mutual accept (§10.6), so the nudge card and the countdown ground
  // use this phone's own colour, as the encounter screens do.
  const live = useLiveHellos();
  // The badge is the real balance; "—" until the server has said (never a stand-in figure).
  const pointsBalance = usePointsBalance();
  const pointsLabel = pointsBalance === null ? '—' : String(pointsBalance);

  function openHello(helloId: string) {
    const hello = live.countdowns.find((c) => c.hello.id === helloId)?.hello ?? live.nudges.find((h) => h.id === helloId);
    setActiveHelloId(helloId);
    router.push(hello ? routeForHello(hello) : '/(encounter)/nudge');
  }

  // Fetch feed on mount
  useEffect(() => {
    loadFeed();
  }, []);

  function openFeedItem(item: UIFeedItem) {
    if (item.type === 'hootza') {
      router.push(`/(hootzas)/${item.id}`);
    } else if (item.directoryId) {
      router.push({ pathname: '/(hangout)/directory/[id]', params: { id: item.directoryId } });
    }
  }

  async function loadFeed() {
    setViewState('loading');
    setErrorMessage(null);

    const { data, error } = await getFeed({ view: 'today' });

    if (error) {
      setViewState('error');
      setErrorMessage(error.message);
      return;
    }

    if (data && data.items.length > 0) {
      const transformed = data.items.map(transformFeedItem);
      setFeedItems(transformed);
      setViewState('feed');
    } else {
      setFeedItems([]);
      setViewState('quiet');
    }
  }

  function transformFeedItem(item: ApiFeedItem): UIFeedItem {
    if (item.type === 'hootza') {
      const startTime = new Date(item.startTime);
      const isTonight = isEventTonight(startTime);

      return {
        id: item.id,
        type: 'hootza',
        title: item.title,
        locationName: item.locationName || 'Location TBD',
        time: formatTime(startTime),
        date: formatDate(startTime),
        attendeeCount: item.attendeeCount ?? item.rsvpCount,
        isTonight,
      };
    } else {
      // Post item (special or holla)
      return {
        id: item.id,
        type: item.type === 'special' ? 'discount' : 'holla',
        title: item.title,
        locationName: item.hangout.businessName,
        expiryDate: item.dealEndDate ? formatExpiryDate(new Date(item.dealEndDate)) : undefined,
        postedAt: formatPostedAt(new Date(item.createdAt)),
        directoryId: item.hangout.directoryId ?? null,
      };
    }
  }

  function isEventTonight(date: Date): boolean {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isEvening = date.getHours() >= 17; // 5pm or later
    return isToday && isEvening;
  }

  function formatTime(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes > 0 ? `:${minutes.toString().padStart(2, '0')}` : '';
    return `${displayHours}${displayMinutes}${ampm}`;
  }

  function formatDate(date: Date): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  }

  function formatExpiryDate(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  }

  function formatPostedAt(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    }
  }

  // Filter items based on active filter
  const filteredItems = activeFilter === 'all'
    ? feedItems
    : feedItems.filter(item => {
        if (activeFilter === 'hootzas') return item.type === 'hootza';
        if (activeFilter === 'discounts') return item.type === 'discount';
        if (activeFilter === 'hollas') return item.type === 'holla';
        return true;
      });

  // A Hello counting down replaces What's Happening as the default view while it is live (§10.13);
  // several stack (§10.14).
  if (live.countdowns.length > 0) {
    return (
      <CountdownCarousel
        countdowns={live.countdowns}
        ground={blendOverMidnight(identityColor)}
        onOpen={openHello}
        onAskServer={live.reload}
      />
    );
  }

  // Loading state
  if (viewState === 'loading') {
    return (
      <View style={styles.container}>
        <View style={styles.statusBar} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.Ink} testID="loading-indicator" />
        </View>
      </View>
    );
  }

  // Error state (MUST NOT render as quiet day)
  if (viewState === 'error') {
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
              <Text style={styles.pointsText} testID="points-balance">{pointsLabel}</Text>
            </View>
            <View style={[styles.avatar, { backgroundColor: Colors.HelloBlue }]} />
          </View>
        </View>

        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Can't load What's Happening</Text>
          <Text style={styles.errorMessage}>{errorMessage || 'Something went wrong'}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadFeed}
            accessibilityRole="button"
            accessibilityLabel="Try again"
          >
            <Text style={styles.retryButtonText}>Try again</Text>
          </TouchableOpacity>
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
            <Text style={styles.pointsText} testID="points-balance">{pointsLabel}</Text>
          </View>
          <View style={[styles.avatar, { backgroundColor: Colors.HelloBlue }]} />
        </View>
      </View>

      {/* A pending Hello is the only thing that takes the top of the feed; the rest dims (never hides). */}
      {live.nudges.map((h) => (
        <HelloNudgeCard key={h.id} color={identityColor} onYes={() => openHello(h.id)} />
      ))}
      {/* Revealed, not opened yet: ONE card however many landed together (§10.15). */}
      {live.reveals.length > 0 ? (
        <HelloRevealCard
          color={identityColor}
          count={live.reveals.length}
          onOpen={() => {
            const first = live.reveals[0];
            setActiveHelloId(first.id);
            router.push(routeForHello(first));
          }}
        />
      ) : null}
      <View style={{ flex: 1, opacity: live.nudges.length > 0 || live.reveals.length > 0 ? 0.55 : 1 }} testID="feed-body">
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
              filter === 'discounts' && styles.filterChipDiscountsText,
              activeFilter === filter && styles.filterChipTextActive,
              activeFilter === 'discounts' && filter === 'discounts' && styles.filterChipDiscountsTextActive
            ]}>
              {t(`whatsHappening.filters.${filter}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Feed content */}
      <ScrollView style={styles.feed} contentContainerStyle={[styles.feedContent, column]}>
        <LimitedModeBanner />
        <NudgeCapNotice />
        <HootzaNoticeBanner />
        {viewState === 'quiet' ? (
          <View style={styles.quietDayContainer}>
            <View style={styles.quietDayCard}>
              <Text style={styles.quietDayTitle}>{t('whatsHappening.quietDay.title')}</Text>
              <Text style={styles.quietDaySubtitle}>{t('whatsHappening.quietDay.subtitle')}</Text>
            </View>

            {/* Distant items */}
            {filteredItems.length > 0 && (
              <View style={styles.feedList}>
                {filteredItems.map((item) => (
                  <FeedItemRow key={item.id} item={item} />
                ))}
              </View>
            )}

            {/* Post CTA */}
            <View style={styles.postCtaCard}>
              <Text style={styles.postCtaTitle}>{t('whatsHappening.quietDay.postCta.title')}</Text>
              <Text style={styles.postCtaBody}>{t('whatsHappening.quietDay.postCta.body')}</Text>
              <TouchableOpacity
                style={styles.postCtaButton}
                onPress={() => router.push('/(hootzas)/create')}
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
              <FeedItemCard
                item={filteredItems.find(item => item.isTonight)!}
                onPress={() => openFeedItem(filteredItems.find(item => item.isTonight)!)}
              />
            )}

            {/* Feed list */}
            <View style={styles.feedList}>
              {filteredItems.filter(item => !item.isTonight).map((item) => (
                <FeedItemRow key={item.id} item={item} onPress={() => openFeedItem(item)} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
      </View>
    </View>
  );
}

// Featured card component (with image)
function FeedItemCard({ item, onPress }: { item: UIFeedItem; onPress?: () => void }) {
  return (
    <TouchableOpacity
      style={styles.feedCard}
      onPress={onPress}
      disabled={!onPress}
      testID={item.type === 'hootza' ? `feed-hootza-${item.id}` : undefined}
    >
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
            {item.locationName}
            {item.attendeeCount ? ` · ${item.attendeeCount} ${t('whatsHappening.feedItem.going')}` : null}
          </Text>
          <Text style={styles.feedCardJoin}>{t('whatsHappening.feedItem.join')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Feed row component (compact)
function FeedItemRow({ item, onPress }: { item: UIFeedItem; onPress?: () => void }) {
  const getMetaText = () => {
    if (item.type === 'hootza') {
      const parts = [t('whatsHappening.feedItem.hootza')];
      if (item.date) parts.push(item.date);
      if (item.time) parts.push(item.time);
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
    <TouchableOpacity
      style={styles.feedRow}
      onPress={onPress}
      disabled={!onPress}
      testID={item.type === 'hootza' ? `feed-hootza-${item.id}` : undefined}
    >
      <View style={styles.feedRowImage} />
      <View style={styles.feedRowContent}>
        <Text style={[styles.feedRowMeta, { color: getMetaColor() }]}>{getMetaText()}</Text>
        <Text style={styles.feedRowTitle}>{item.title}</Text>
        <Text style={styles.feedRowFooter}>
          {item.locationName}
          {item.postedAt && ` · ${item.postedAt}`}
          {item.attendeeCount ? ` · ${item.attendeeCount} ${t('whatsHappening.feedItem.going')}` : null}
        </Text>
      </View>
      {item.type === 'discount' && <View style={[styles.discountMarker, { backgroundColor: Colors.Amber }]} />}
    </TouchableOpacity>
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
  filterChipDiscountsText: {
    fontFamily: 'Dreaming',
    fontSize: 20,
    lineHeight: 22,
  },
  filterChipDiscountsTextActive: {
    fontWeight: '400',
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
