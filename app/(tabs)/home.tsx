/**
 * WHAT'S HAPPENING SCREEN
 *
 * Home screen with four states:
 * 1. THE FEED — default. Tonight's Hootzas, discounts, Hollas, nearby Hello Hangouts
 * 2. A QUIET DAY — empty state. Must not read as failure.
 * 3. THE HELLO — a live encounter supersedes home: a pending Hello is the nudge card at the top of
 *    the feed with the rest dimmed (Feed and Prizes All Sizes); a Hello counting down replaces the
 *    feed with the stacked countdown (RULES §10.13, §10.14). Both come from the server (GET /hellos).
 * 4. HOOTZA DETAIL — single Hootza opened. The route lives in (hootzas)/[id] (owned by lane04);
 *    this screen pushes the Hootza id, nothing more.
 *
 * ⚠️ ONLY a Hello supersedes home. Not a Discount, not a Holla, not a Hootza starting soon.
 * ⚠️ "Hello Hangout" is NEVER shortened to "Hangout" (RULES 7.17)
 * ⚠️ An error must NOT render as the quiet day. Quiet day is a real state, server failure is different.
 */

import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Linking,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Waverly } from '../../src/components';
import { useColumnStyle } from '../../src/components/ScreenContainer';
import { t } from '../../src/i18n';
import { Colors, useTheme } from '../../src/theme';
import { StatusBarSpacer } from '../../src/components/StatusBarSpacer';
import * as Location from 'expo-location';
import { getFeed } from '../../src/api/feed';
import { getOpenToHellos, setOpenToHellos, type OpenToHellos } from '../../src/api/map';
import { getKnownOpen, setKnownOpen, subscribeOpen } from '../../src/state/open-to-hellos';
import { FEED_VIEWS, toUIFeedItem, type FeedViewKey, type UIFeedItem } from '../../src/lib/feed-model';
import { useLiveHellos } from '../../src/lib/use-live-hellos';
import { usePointsBalance } from '../../src/lib/use-points-balance';
import { blendOverMidnight, routeForHello } from '../../src/lib/encounter';
import { setActiveHelloId } from '../../src/state/active-hello';
import { FeedGridCard, feedColumns } from '../../src/components/feed/FeedGridCard';
import { HelloNudgeCard } from '../../src/components/feed/HelloNudgeCard';
import { CountdownCarousel } from '../../src/components/feed/CountdownCarousel';
import { HelloRevealCard } from '../../src/components/feed/HelloRevealCard';
import { HootzaNoticeBanner } from '../../src/components/feed/HootzaNoticeBanner';
import { LimitedModeBanner } from '../../src/components/consumer/LimitedModeBanner';
import { NudgeCapNotice } from '../../src/components/consumer/NudgeCapNotice';

type ViewState = 'feed' | 'quiet' | 'loading' | 'error' | 'locationNeeded';
type FilterType = 'all' | 'hootzas' | 'discounts' | 'hollas';

export default function WhatsHappeningScreen() {
  const router = useRouter();
  const { identityColor } = useTheme();
  const column = useColumnStyle();
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  // §17.18: Today is the default view; This week, Nearest and Newest are one tap away.
  const [feedView, setFeedView] = useState<FeedViewKey>('today');
  const [locationBlocked, setLocationBlocked] = useState(false);
  // The server's answer, never a local guess (stage 04 item 3). Null until the server has said.
  const [openState, setOpenState] = useState<OpenToHellos | null>(null);
  const [openBusy, setOpenBusy] = useState(false);
  const [openFailed, setOpenFailed] = useState(false);
  const [feedItems, setFeedItems] = useState<UIFeedItem[]>([]);
  // A quiet day still shows what is on a little further out (design: "Home — quiet day").
  const [comingUp, setComingUp] = useState<UIFeedItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Honest tap feedback for a post whose business has no directory page yet (never a silent dead tap).
  const [noPageNotice, setNoPageNotice] = useState<string | null>(null);
  const loadGen = useRef(0);
  // Paging: the view, type filter and position of the page on screen, so "Show more" asks for the same list.
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageQuery = useRef<{ view: FeedViewKey; types?: Array<'hootza' | 'special' | 'holla'>; coords: { lat: number; lng: number } | null }>({ view: 'today', coords: null });

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

  /** Device position, only to ORDER the Nearest view; it is sent to the server and never shown (§8.12). */
  async function devicePosition(ask: boolean): Promise<{ lat: number; lng: number } | null> {
    try {
      let perm = await Location.getForegroundPermissionsAsync();
      if (!perm.granted && ask && perm.canAskAgain) perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        setLocationBlocked(!perm.canAskAgain);
        return null;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      return { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch {
      return null;
    }
  }

  // Fetch feed on mount
  useEffect(() => {
    void loadFeed('today');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Open to Hellos is the server's state (the Map owns the same switch). Follow changes made there.
  useEffect(() => {
    void getOpenToHellos().then((r) => {
      if (!r.error && r.data) { setOpenState(r.data); setKnownOpen(r.data.open); }
    });
    return subscribeOpen((open) => setOpenState((prev) => (prev ? { ...prev, open } : prev)));
  }, []);

  async function toggleOpen() {
    if (!openState || openBusy) return;
    setOpenBusy(true);
    setOpenFailed(false);
    const r = await setOpenToHellos(!openState.open);
    setOpenBusy(false);
    if (r.error || !r.data) { setOpenFailed(true); return; }
    setOpenState(r.data);
    setKnownOpen(r.data.open);
  }

  function openFeedItem(item: UIFeedItem) {
    if (item.type === 'hootza') {
      router.push(`/(hootzas)/${item.id}`);
      return;
    }
    if (item.directoryId) {
      // §17.23 stage-04: carry the tapped post so the directory page surfaces it first
      // (the same contract the map path has always used).
      router.push({ pathname: '/(hangout)/directory/[id]', params: { id: item.directoryId, postId: item.postId } });
      return;
    }
    // A legacy post whose business has no directory page: say so instead of a silent dead tap (§17.24
    // forbids routing it anywhere else).
    setNoPageNotice(t('l03.feedNav.noDirectoryPage', { name: item.locationName ?? item.title }));
  }

  /** The type chips cut on the server before the page is cut (never "filter the first page"). */
  function typesFor(filter: FilterType): Array<'hootza' | 'special' | 'holla'> | undefined {
    if (filter === 'hootzas') return ['hootza'];
    if (filter === 'discounts') return ['special'];
    if (filter === 'hollas') return ['holla'];
    return undefined;
  }

  async function loadFeed(viewKey: FeedViewKey = feedView, opts: { askLocation?: boolean; filter?: FilterType } = {}) {
    const mine = ++loadGen.current;
    const types = typesFor(opts.filter ?? activeFilter);
    setViewState('loading');
    setErrorMessage(null);
    setNoPageNotice(null);
    setComingUp([]);
    setNextCursor(null);

    let coords: { lat: number; lng: number } | null = null;
    if (viewKey === 'nearest') {
      coords = await devicePosition(Boolean(opts.askLocation));
      if (mine !== loadGen.current) return;
      if (!coords) { setFeedItems([]); setViewState('locationNeeded'); return; }
    }
    pageQuery.current = { view: viewKey, types, coords };

    const { data, error } = await getFeed({ view: viewKey, ...(types ? { types } : {}), ...(coords ?? {}), singlePage: true });
    if (mine !== loadGen.current) return;

    if (error) {
      setViewState('error');
      setErrorMessage(error.message);
      return;
    }

    if (data && data.items.length > 0) {
      setFeedItems(data.items.map(toUIFeedItem));
      setNextCursor(data.hasMore ? data.nextCursor ?? null : null);
      setViewState('feed');
      return;
    }

    setFeedItems([]);
    setViewState('quiet');
    // A quiet Today still shows what is coming up this week. A failure here leaves the quiet day as it is.
    if (viewKey === 'today') {
      const week = await getFeed({ view: 'this_week', ...(types ? { types } : {}), singlePage: true });
      if (mine !== loadGen.current) return;
      if (!week.error && week.data) setComingUp(week.data.items.map(toUIFeedItem));
    }
  }

  /** The next page of the same view and filters; items already shown stay. A stale place in the feed restarts it. */
  async function showMore() {
    if (!nextCursor || loadingMore) return;
    const mine = loadGen.current;
    const q = pageQuery.current;
    setLoadingMore(true);
    const { data, error } = await getFeed({ view: q.view, ...(q.types ? { types: q.types } : {}), ...(q.coords ?? {}), singlePage: true, cursor: nextCursor });
    setLoadingMore(false);
    if (mine !== loadGen.current) return;
    if (error || !data) {
      // 409 stale_cursor: the item the page continued from has left the feed. Start again from the top.
      if (error?.status === 409) void loadFeed(q.view);
      return;
    }
    setFeedItems((prev) => {
      const seen = new Set(prev.map((p) => `${p.type}-${p.id}`));
      return [...prev, ...data.items.map(toUIFeedItem).filter((i) => !seen.has(`${i.type}-${i.id}`))];
    });
    setNextCursor(data.hasMore ? data.nextCursor ?? null : null);
  }

  function chooseFilter(next: FilterType) {
    if (next === activeFilter) return;
    setActiveFilter(next);
    void loadFeed(feedView, { filter: next });
  }

  function chooseView(next: FeedViewKey) {
    if (next === feedView && viewState !== 'locationNeeded') return;
    setFeedView(next);
    void loadFeed(next, { askLocation: next === 'nearest' });
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

  const { width: windowWidth } = useWindowDimensions();
  const columns = feedColumns(windowWidth);
  const wide = columns > 1;
  const isOpenToHellos = openState?.open ?? false;
  const matchesFilter = (item: UIFeedItem) =>
    activeFilter === 'all'
    || (activeFilter === 'hootzas' && item.type === 'hootza')
    || (activeFilter === 'discounts' && item.type === 'discount')
    || (activeFilter === 'hollas' && item.type === 'holla');
  const comingUpItems = comingUp.filter(matchesFilter);

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
        <StatusBarSpacer height={44} />
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
        <StatusBarSpacer height={44} />

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
            onPress={() => void loadFeed()}
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
      <StatusBarSpacer height={44} />

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
          onPress={() => void toggleOpen()}
          disabled={!openState || openBusy}
          accessibilityRole="switch"
          accessibilityState={{ checked: isOpenToHellos, disabled: !openState || openBusy }}
          accessibilityLabel={t('whatsHappening.header.openToHellos')}
          testID="home-open-to-hellos-switch"
        >
          <View style={[
            styles.toggleKnob,
            isOpenToHellos && styles.toggleKnobActive
          ]} />
        </TouchableOpacity>
      </View>
      {openFailed ? <Text style={styles.inlineNote} accessibilityRole="alert">{t('feedViews.openFailed')}</Text> : null}
      {noPageNotice ? <Text style={styles.inlineNote} accessibilityRole="alert" testID="feed-no-directory-notice">{noPageNotice}</Text> : null}
      {openState?.open && !openState.discoveryActive ? <Text style={styles.inlineNote} testID="home-open-not-on">{t('feedViews.notSwitchedOn')}</Text> : null}

      {/* Views (§17.18): Today · This week · Nearest · Newest */}
      <ScrollView
        horizontal
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
        showsHorizontalScrollIndicator={false}
        accessibilityLabel={t('feedViews.label')}
      >
        {FEED_VIEWS.map((v) => (
          <TouchableOpacity
            key={v}
            style={[styles.viewTab, feedView === v && styles.viewTabActive]}
            onPress={() => chooseView(v)}
            accessibilityRole="tab"
            accessibilityState={{ selected: feedView === v }}
            testID={`feed-view-${v}`}
          >
            <Text style={[styles.viewTabText, feedView === v && styles.viewTabTextActive]}>{t(`feedViews.${v}`)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
            onPress={() => chooseFilter(filter)}
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
      <ScrollView style={styles.feed} contentContainerStyle={[styles.feedContent, wide ? styles.feedContentWide : column]}>
        <LimitedModeBanner />
        <NudgeCapNotice />
        <HootzaNoticeBanner />
        {viewState === 'locationNeeded' ? (
          <View style={styles.quietDayCard} testID="feed-location-needed">
            <Text style={styles.quietDaySubtitle}>{t(locationBlocked ? 'feedViews.locationBlocked' : 'feedViews.locationNeeded')}</Text>
            <TouchableOpacity
              style={styles.postCtaButton}
              onPress={() => (locationBlocked ? void Linking.openSettings().catch(() => undefined) : void loadFeed('nearest', { askLocation: true }))}
              accessibilityRole="button"
            >
              <Text style={styles.postCtaButtonText}>{t(locationBlocked ? 'feedViews.openSettings' : 'map.browsing.allowLocation')}</Text>
            </TouchableOpacity>
          </View>
        ) : viewState === 'quiet' ? (
          <View style={styles.quietDayContainer}>
            <View style={styles.quietDayCard}>
              <Text style={styles.quietDayTitle}>{t('whatsHappening.quietDay.title')}</Text>
              <Text style={styles.quietDaySubtitle}>{t('whatsHappening.quietDay.subtitle')}</Text>
            </View>

            {/* What is on a little further out (this week), when Today is empty */}
            {comingUpItems.length > 0 && (
              <>
                <Text style={styles.comingUpHeader} testID="coming-up-header">{t('feedViews.comingUp')}</Text>
                {wide ? (
                  <View style={styles.cardGrid}>
                    {comingUpItems.map((item) => (
                      <FeedGridCard key={`${item.type}-${item.id}`} item={item} columns={columns as 2 | 3} onPress={() => openFeedItem(item)} />
                    ))}
                  </View>
                ) : (
                  <View style={styles.feedList}>
                    {comingUpItems.map((item) => (
                      <FeedItemRow key={`${item.type}-${item.id}`} item={item} onPress={() => openFeedItem(item)} />
                    ))}
                  </View>
                )}
              </>
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
          wide ? (
            // Tablet and desktop: the same card, two or three beside each other (Feed and Prizes All Sizes).
            <View style={styles.cardGrid} testID="feed-grid">
              {filteredItems.map((item) => (
                <FeedGridCard key={`${item.type}-${item.id}`} item={item} columns={columns as 2 | 3} onPress={() => openFeedItem(item)} />
              ))}
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
          )
        )}
        {viewState === 'feed' && nextCursor ? (
          <TouchableOpacity style={styles.postCtaButton} onPress={() => void showMore()} disabled={loadingMore} accessibilityRole="button" testID="feed-show-more">
            {loadingMore ? <ActivityIndicator color={Colors.Ink} /> : <Text style={styles.postCtaButtonText}>{t('feedViews.showMore')}</Text>}
          </TouchableOpacity>
        ) : null}
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
            {item.locationName ?? t(item.privateResidence ? 'feedViews.privateResidence' : 'feedViews.placeTbd')}
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
          {item.locationName ?? t(item.privateResidence ? 'feedViews.privateResidence' : 'feedViews.placeTbd')}
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

  feedContentWide: { maxWidth: 1280, width: '100%', alignSelf: 'center' },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' },
  inlineNote: { fontSize: 13, lineHeight: 19, color: Colors.Muted, paddingHorizontal: 20, paddingBottom: 8 },
  viewTab: { paddingHorizontal: 4, minHeight: 44, justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent', marginRight: 14 },
  viewTabActive: { borderBottomColor: Colors.Ink },
  viewTabText: { fontSize: 15, color: Colors.Muted, fontWeight: '500' },
  viewTabTextActive: { color: Colors.Ink, fontWeight: '700' },
  comingUpHeader: { fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: Colors.Faint, fontWeight: '700' },

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
    minHeight: 44,
    justifyContent: 'center',
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
