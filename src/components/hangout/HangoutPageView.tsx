/**
 * The Hello Hangout page body — CANON-RL-02-SN-09 (Hangout Directory.dc.html:
 * P 375 7e, T 834 7f, D 5c). One component for the public page and the owner's
 * preview ("Your listing · Preview · this is the public page", 8l), so the preview
 * is the public page, not an approximation of it.
 *
 * Layout: one column below 1024 px (P / T frames); at 1024 and up the D frame's
 * two columns — the page on the left, the "GOING THERE?" panel on the right.
 *
 * Not drawn here, recorded in the ledger: the place photo (no business-photo
 * field or upload exists), a distance (§8.12; existing Hello Hangout tests assert
 * none is shown), a price level ("$" — not a canon field), and "Save this Hello
 * Hangout" (no backing store).
 */

import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Share, Platform, useWindowDimensions, Image } from 'react-native';
import { Waverly } from '..';
import { t } from '../../i18n';
import { Colors } from '../../theme';
import { DAYS, type HangoutPage, type PagePost } from '../../api/directory';
import { clock, openState } from '../../lib/hangout-hours';
import { FoundingBadge } from './FoundingBadge';

const PINK = '#E848D0'; // the directory's action colour (Hangout Directory.dc.html)
const TODAY_BG = '#FDF2FA';
const TODAY_BORDER = '#F3C9E8';
const OPEN_GREEN = '#2F7A3E';
const DESCRIPTION_FOLD = 180;

function shortDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function monthYear(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function directionsUrl(page: HangoutPage): string {
  const q = encodeURIComponent(`${page.name}, ${page.address}`);
  return Platform.OS === 'ios'
    ? `http://maps.apple.com/?ll=${page.lat},${page.lng}&q=${q}`
    : `https://www.google.com/maps/search/?api=1&query=${page.lat},${page.lng}`;
}

export function HangoutPageView({
  page,
  onOpenWall,
  onReportPost,
  now = new Date(),
}: {
  page: HangoutPage;
  onOpenWall?: () => void;
  /** Shown only when given (the signed-in app, not the owner preview or the public web page). */
  onReportPost?: (post: PagePost) => void;
  now?: Date;
}) {
  const { width } = useWindowDimensions();
  const wide = width >= 1024;
  const [expanded, setExpanded] = useState(false);
  const open = openState(page.hours, now);
  const pagePosts = page.posts;
  const pinOk = !(page.lat === 0 && page.lng === 0);

  const statusLine = [
    page.address,
    open ? (open.open ? (open.closesAt ? t('hangout.directory.openUntil', { time: clock(open.closesAt) }) : t('hangout.directory.openNowLabel')) : t('hangout.directory.closedNow')) : null,
  ].filter(Boolean).join(' · ');

  const description = page.description ?? '';
  const folded = description.length > DESCRIPTION_FOLD && !expanded;

  const actions = (
    <View style={[styles.actions, wide && styles.actionsColumn]}>
      {pinOk ? (
        <TouchableOpacity
          style={[styles.primaryAction, wide && styles.fullWidth]}
          onPress={() => { void Linking.openURL(directionsUrl(page)).catch(() => undefined); }}
          accessibilityRole="button"
          testID="page-directions"
        >
          <Text style={styles.primaryActionText}>{t(wide ? 'hangout.listing.getDirections' : 'hangout.listing.directions')}</Text>
        </TouchableOpacity>
      ) : null}
      {page.phone ? (
        <TouchableOpacity
          style={[styles.secondaryAction, wide && styles.fullWidth]}
          onPress={() => { void Linking.openURL(`tel:${page.phone.replace(/[^+0-9]/g, '')}`).catch(() => undefined); }}
          accessibilityRole="button"
          testID="page-call"
        >
          <Text style={styles.secondaryActionText}>{t('hangout.listing.call')}</Text>
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity
        style={[styles.secondaryAction, wide && styles.fullWidth]}
        onPress={() => { void Share.share({ message: `${page.name} · ${page.address}` }).catch(() => undefined); }}
        accessibilityRole="button"
        testID="page-share"
      >
        <Text style={styles.secondaryActionText}>{t('hangout.listing.share')}</Text>
      </TouchableOpacity>
    </View>
  );

  const hoursBlock = Object.keys(page.hours ?? {}).length > 0 ? (
    <View style={styles.block} testID="page-hours">
      <Text style={styles.blockLabel}>{t('hangout.listing.hours')}</Text>
      {DAYS.map((day) => {
        const h = page.hours[day];
        if (!h) return null;
        return (
          <View key={day} style={styles.hoursRow}>
            <Text style={styles.hoursDay}>{t(`hangout.hours.days.${day}`)}</Text>
            <Text style={styles.hoursValue}>
              {h.closed || !h.open || !h.close ? t('hangout.listing.closed') : `${clock(h.open)} – ${clock(h.close)}`}
            </Text>
          </View>
        );
      })}
    </View>
  ) : null;

  const side = (
    <View style={[styles.sidePanel, !wide && styles.sideInline]}>
      {wide ? <Text style={styles.goingThere}>{t('hangout.listing.goingThere')}</Text> : null}
      {wide ? actions : null}
      {hoursBlock}
      {page.phone ? <Text style={styles.meta}><Text style={styles.metaStrong}>{t('hangout.listing.phone')}</Text> · {page.phone}</Text> : null}
      {page.memberSince ? (
        <Text style={styles.meta} testID="page-since"><Text style={styles.metaStrong}>{t('hangout.listing.since')}</Text> · {monthYear(page.memberSince)}</Text>
      ) : null}
    </View>
  );

  const main = (
    <View style={styles.main}>
      <View style={styles.headerRow}>
        {page.founding ? <FoundingBadge size={wide ? 60 : 48} /> : null}
        <View style={styles.headerText}>
          <Text style={[styles.name, wide && styles.nameWide]} accessibilityRole="header">{page.name}</Text>
          <Text style={styles.statusLine}>
            {statusLine}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onOpenWall}
          disabled={!onOpenWall}
          accessibilityRole="button"
          accessibilityLabel={t('hangout.listing.wallLine')}
          style={styles.waverlySlot}
          testID="page-waverly"
        >
          <Waverly size={wide ? 96 : 72} color={Colors.HelloBlue} />
          {/* §19.1: Waverly plus the number at one or more; Waverly alone at zero. */}
          {page.hellos != null && page.hellos > 0 ? <Text style={styles.hellosNumber}>{page.hellos.toLocaleString()}</Text> : null}
        </TouchableOpacity>
      </View>

      {page.todayDiscount ? (
        <View style={styles.today} testID="page-today">
          <Text style={styles.todayText}><Text style={styles.todayStrong}>{t('hangout.directory.today')}</Text> {page.todayDiscount}</Text>
        </View>
      ) : null}

      {!wide ? actions : null}

      <Text style={styles.contactLine}>
        {[page.address, page.phone].filter(Boolean).join(' · ')}
        {page.website ? ' · ' : ''}
        {page.website ? (
          <Text style={styles.link} onPress={() => { void Linking.openURL(page.website).catch(() => undefined); }} testID="page-website">
            {page.website.replace(/^https?:\/\//i, '')}
          </Text>
        ) : null}
      </Text>

      {page.amenities.length > 0 ? (
        <View style={styles.chips}>
          {page.amenities.map((a) => <Text key={a} style={styles.chip}>{a}</Text>)}
        </View>
      ) : null}

      {description ? (
        <Text style={styles.description} testID="page-description">
          {folded ? `${description.slice(0, DESCRIPTION_FOLD).trimEnd()}… ` : `${description} `}
          {description.length > DESCRIPTION_FOLD ? (
            <Text style={styles.more} onPress={() => setExpanded((e) => !e)} accessibilityRole="button">
              {t(expanded ? 'hangout.listing.less' : 'hangout.listing.more')}
            </Text>
          ) : null}
        </Text>
      ) : !page.published ? (
        <Text style={styles.meta} testID="page-details-soon">{t('hangout.listing.detailsSoon', { name: page.name })}</Text>
      ) : null}

      {pagePosts.length > 0 ? (
        <View style={styles.block} testID="page-posts">
          <Text style={styles.blockLabel}>{t('hangout.listing.onNow')}</Text>
          {pagePosts.map((p) => <PostCard key={p.id} post={p} linked={p.postType === 'holla' && p.linkedSpecialId ? pagePosts.find((x) => x.id === p.linkedSpecialId && x.postType === 'special') ?? null : null} onReport={onReportPost} />)}
        </View>
      ) : null}

      {!wide ? side : null}

      <View style={styles.wall} testID="page-wall">
        <Text style={[styles.wallTitle, wide && styles.wallTitleWide]}>{t('hangout.listing.wallTitle')}</Text>
        {page.wall === null ? (
          <Text style={styles.meta}>{t('hangout.listing.wallUnavailable')}</Text>
        ) : page.wall.length === 0 ? (
          <Text style={styles.meta}>{t('hangout.listing.wallEmpty')}</Text>
        ) : (
          <>
            <Text style={styles.meta}>{t('hangout.listing.selfiesLine', { n: page.selfies ?? page.wall.length })}</Text>
            <View style={styles.tiles}>
              {page.wall.slice(0, wide ? 8 : 4).map((tile) => (
                <View key={tile.helloId} style={[styles.tile, wide && styles.tileWide]}>
                  {tile.selfieUrl ? <Image source={{ uri: tile.selfieUrl }} style={styles.tileImage} accessibilityIgnoresInvertColors /> : <View style={styles.tileImage} />}
                  <Text style={styles.tileNames} numberOfLines={1}>{tile.names.join(' & ')}</Text>
                </View>
              ))}
            </View>
            {onOpenWall ? (
              <TouchableOpacity onPress={onOpenWall} accessibilityRole="button" testID="page-see-all">
                <Text style={styles.seeAll}>{t('hangout.listing.seeAll', { n: page.selfies ?? page.wall.length })}</Text>
              </TouchableOpacity>
            ) : null}
          </>
        )}
        <Text style={styles.meta}>{t('hangout.listing.selfiesStay')}</Text>
      </View>
    </View>
  );

  return wide ? (
    <View style={styles.wideRow}>
      {main}
      {side}
    </View>
  ) : main;
}

function PostCard({ post, linked, onReport }: { post: PagePost; linked?: PagePost | null; onReport?: (post: PagePost) => void }) {
  const holla = post.postType === 'holla';
  return (
    <View style={[styles.post, holla && styles.postHolla]} testID={`page-post-${post.id}`}>
      <Text style={[styles.postKind, holla && styles.postKindHolla]}>{t(holla ? 'hangout.listing.holla' : 'hangout.listing.discount')}</Text>
      <Text style={styles.postTitle}>{post.title}</Text>
      {post.description ? <Text style={styles.meta}>{post.description}</Text> : null}
      {!holla && post.dealEndDate ? <Text style={styles.meta}>{t('hangout.listing.endsOrShelf', { date: shortDate(post.dealEndDate) })}</Text> : null}
      {linked ? <Text style={styles.meta} testID={`page-post-linked-${post.id}`}>{t('hangout.listing.discount')} · {linked.title}</Text> : null}
      {onReport ? (
        <TouchableOpacity onPress={() => onReport(post)} accessibilityRole="button" testID={`page-post-report-${post.id}`}>
          <Text style={styles.meta}>{t('account.report.title')}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wideRow: { flexDirection: 'row', gap: 40, alignItems: 'flex-start' },
  main: { flex: 1, gap: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  headerText: { flex: 1, gap: 3 },
  name: { fontSize: 26, lineHeight: 28, fontWeight: '900', color: '#0A0A0A', letterSpacing: -0.8 },
  nameWide: { fontSize: 46, lineHeight: 46, letterSpacing: -1.8 },
  statusLine: { fontSize: 14, color: '#56534D' },
  waverlySlot: { width: 106, alignItems: 'center' },
  hellosNumber: { fontSize: 22, fontWeight: '800', color: Colors.Ink },
  today: { backgroundColor: TODAY_BG, borderWidth: 1, borderColor: TODAY_BORDER, borderRadius: 5, paddingVertical: 12, paddingHorizontal: 14 },
  todayText: { fontSize: 15, lineHeight: 21, color: '#0A0A0A' },
  todayStrong: { fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 8 },
  actionsColumn: { flexDirection: 'column' },
  fullWidth: { flex: 0, alignSelf: 'stretch' },
  primaryAction: { flex: 1, minHeight: 48, borderRadius: 5, backgroundColor: PINK, alignItems: 'center', justifyContent: 'center' },
  primaryActionText: { fontSize: 15, fontWeight: '800', color: '#0A0A0A' },
  secondaryAction: { flex: 1, minHeight: 48, borderRadius: 5, borderWidth: 1, borderColor: '#DAD6CF', alignItems: 'center', justifyContent: 'center' },
  secondaryActionText: { fontSize: 15, fontWeight: '700', color: '#0A0A0A' },
  contactLine: { fontSize: 15, lineHeight: 22, color: '#46443F' },
  link: { textDecorationLine: 'underline' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { fontSize: 14, color: '#0A0A0A', borderWidth: 1, borderColor: '#DAD6CF', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  description: { fontSize: 15, lineHeight: 22, color: '#46443F' },
  more: { fontWeight: '800', color: '#0A0A0A' },
  block: { gap: 8, borderTopWidth: 1, borderTopColor: '#EAE7E2', paddingTop: 14 },
  blockLabel: { fontSize: 11, letterSpacing: 1.8, textTransform: 'uppercase', color: '#7A756C', fontWeight: '800' },
  hoursRow: { flexDirection: 'row', justifyContent: 'space-between' },
  hoursDay: { fontSize: 14, fontWeight: '700', color: '#0A0A0A' },
  hoursValue: { fontSize: 14, color: '#56534D' },
  sidePanel: { width: 320, borderWidth: 1, borderColor: '#DAD6CF', borderRadius: 8, padding: 22, gap: 14 },
  sideInline: { width: 'auto', borderWidth: 0, padding: 0 },
  goingThere: { fontSize: 20, fontWeight: '900', color: '#0A0A0A', letterSpacing: -0.4 },
  meta: { fontSize: 14, lineHeight: 20, color: '#56534D' },
  metaStrong: { fontWeight: '700', color: '#0A0A0A' },
  post: { borderWidth: 1, borderColor: Colors.Line, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 15, gap: 3 },
  postHolla: { borderColor: Colors.Plum },
  postKind: { fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', fontWeight: '700', color: Colors.Faint },
  postKindHolla: { color: Colors.Plum },
  postTitle: { fontSize: 16, fontWeight: '600', color: Colors.Ink, lineHeight: 22 },
  wall: { gap: 10, borderTopWidth: 1, borderTopColor: '#EAE7E2', paddingTop: 20 },
  wallTitle: { fontSize: 24, fontWeight: '900', color: '#0A0A0A', letterSpacing: -0.7 },
  wallTitleWide: { fontSize: 32 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '47%', borderWidth: 1, borderColor: '#DAD6CF', borderRadius: 8, overflow: 'hidden' },
  tileWide: { width: '23%' },
  tileImage: { width: '100%', aspectRatio: 1, backgroundColor: '#E7E3DC' },
  tileNames: { fontSize: 12, color: '#7A756C', padding: 10 },
  seeAll: { fontSize: 15, fontWeight: '700', color: '#0A0A0A', textDecorationLine: 'underline' },
});
