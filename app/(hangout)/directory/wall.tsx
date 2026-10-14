/**
 * THE SELFIE WALL — CANON-RL-02-SN-10 (Hello Hangout page — Hello wall).
 * GET /directory/hangouts/:id/wall: revealed hellos at this Hello Hangout that
 * kept a selfie, with the two first names on the photograph (§10.19, §10.40).
 *
 * ⚠️ The D frame draws an owner "Hide" / "Unhide" control. It is NOT built:
 * RULES §10.11 ("Business cannot remove one"), ROLE-2 §4 and the RL-02 manifest
 * ("never a control on the operator's surface") forbid it. Recorded as a design
 * conflict. The frame's sort chips (Newest / First Hellos / With a note) and notes
 * are not built: there is no "first Hello" flag or note field.
 */

import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, useWindowDimensions } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { t } from '../../../src/i18n';
import { Colors } from '../../../src/theme';
import { getDirectoryWall, type WallTile } from '../../../src/api/directory';

export default function HelloWallScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [name, setName] = useState('');
  const [tiles, setTiles] = useState<WallTile[] | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'unlinked' | 'gone' | 'error'>('loading');

  const load = useCallback(async () => {
    if (!id) { setState('gone'); return; }
    const res = await getDirectoryWall(id);
    if (res.error) { setState(res.error.status === 404 ? 'gone' : 'error'); return; }
    setName(res.data?.name ?? '');
    if (!res.data?.wall) { setState('unlinked'); return; }
    setTiles(res.data.wall.tiles);
    setState('ready');
  }, [id]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const columns = width >= 1024 ? 4 : width >= 600 ? 3 : 2;

  return (
    <View style={styles.container}>
      <View style={styles.statusBar} />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={t('hangout.listing.backLabel')} hitSlop={12}>
          <Text style={styles.back}>{t('hangout.listing.back')}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {name ? <Text style={styles.kicker}>{name}</Text> : null}
        <Text style={styles.title}>{t('hangout.listing.wallTitle')}</Text>
        {state === 'loading' ? <ActivityIndicator color={Colors.Ink} /> : null}
        {state === 'gone' ? <Text style={styles.muted} testID="wall-unavailable">{t('hangout.listing.unavailable')}</Text> : null}
        {state === 'unlinked' ? <Text style={styles.muted} testID="wall-unlinked">{t('hangout.listing.wallUnavailable')}</Text> : null}
        {state === 'error' ? (
          <TouchableOpacity onPress={() => { setState('loading'); void load(); }} accessibilityRole="button">
            <Text accessibilityRole="alert" style={styles.muted}>{t('hangout.listing.loadFailed')} {t('hangout.dashboard.retry')}</Text>
          </TouchableOpacity>
        ) : null}
        {state === 'ready' && tiles ? (
          tiles.length === 0 ? (
            <Text style={styles.muted} testID="wall-empty">{t('hangout.listing.wallEmpty')}</Text>
          ) : (
            <View style={styles.grid}>
              {tiles.map((tile) => (
                <View key={tile.helloId} style={[styles.tile, { width: `${Math.floor(100 / columns) - 2}%` }]} testID={`wall-tile-${tile.helloId}`}>
                  {tile.selfieUrl ? <Image source={{ uri: tile.selfieUrl }} style={styles.image} accessibilityIgnoresInvertColors /> : <View style={styles.image} />}
                  <Text style={styles.names} numberOfLines={1}>{tile.names.join(' & ')}</Text>
                </View>
              ))}
            </View>
          )
        ) : null}
        <Text style={styles.muted}>{t('hangout.listing.selfiesStay')}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.Chalk },
  statusBar: { height: 44 },
  topBar: { paddingHorizontal: 16, paddingBottom: 8 },
  back: { fontSize: 24, color: Colors.Ink },
  scroll: { paddingHorizontal: 16, paddingBottom: 40, gap: 12, maxWidth: 1280, width: '100%', alignSelf: 'center' },
  kicker: { fontSize: 15, color: '#56534D' },
  title: { fontSize: 32, fontWeight: '900', color: '#0A0A0A', letterSpacing: -1.2 },
  muted: { fontSize: 15, lineHeight: 22, color: Colors.Muted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { borderWidth: 1, borderColor: '#DAD6CF', borderRadius: 8, overflow: 'hidden' },
  image: { width: '100%', aspectRatio: 1, backgroundColor: '#E7E3DC' },
  names: { fontSize: 12, color: '#7A756C', padding: 10 },
});
