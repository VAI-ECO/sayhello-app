/**
 * The Hello Map canvas: the delivered grid ground with real pins projected
 * from their coordinates (src/lib/map-geo.ts).
 *
 * Shape carries meaning (ROLE-1 §6, "Map and Pins" pin legend SN-34):
 * a person is the only teardrop, solid; a Hello Hangout is a flat-bottomed
 * square outlined in Fern, Founding with the Amber badge on the pin. A pin
 * this viewer is in carries their identity colour; other pins are drawn
 * neutral (the server does not assign them a colour).
 *
 * No street tiles: there is no map provider in the app (reported gap).
 */

import { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder, type LayoutChangeEvent } from 'react-native';
import { t } from '../../i18n';
import { Colors } from '../../theme';
import type { Bbox, MapHangout, MapPin, ViewportCluster, ViewportItem } from '../../api/map';
import { bboxAfterDrag, panBbox, project, zoomBbox } from '../../lib/map-geo';

/** Display framing for the zoom and pan buttons: each tap halves/doubles the view or moves it half a screen. */
const ZOOM_IN = 0.5;
const ZOOM_OUT = 2;
const PAN_STEP = 0.5;

const PIN = 28;
const SQUARE = 24;
const CLUSTER = 36;
const RING = 26;

const KIND_LABEL_KEY: Record<ViewportItem['kind'], string> = {
  hello: 'map.browsing.pinLabel',
  hangout: 'map.browsing.hangoutLabel',
  hootza: 'map.browsing.hootzaLabel',
  org_event: 'map.browsing.hootzaLabel',
  holla: 'map.browsing.hollaLabel',
  discount: 'map.browsing.discountLabel',
};

/** Legend SN-34 / RULES §33: a person is the only teardrop (solid); every place, event and thing is outlined. */
function ItemMarker({ item, x, y, selected, onPress }: { item: ViewportItem; x: number; y: number; selected: boolean; onPress: () => void }) {
  const label = t(item.kind === 'hello' && item.mine ? 'map.browsing.yourPinLabel' : KIND_LABEL_KEY[item.kind], { name: item.title ?? '' });
  const common = { onPress, accessibilityRole: 'button' as const, accessibilityLabel: label, testID: `${item.kind}-${item.id}` };
  if (item.kind === 'hello') {
    return (
      <TouchableOpacity {...common} style={[styles.pin, { left: x - PIN / 2, top: y - PIN, backgroundColor: item.color ?? Colors.Muted }, selected && styles.pinSelected]} />
    );
  }
  if (item.kind === 'hangout') {
    return (
      <TouchableOpacity {...common} style={[styles.square, { left: x - SQUARE / 2, top: y - SQUARE }]}>
        {item.founding ? <View style={styles.founding} /> : null}
      </TouchableOpacity>
    );
  }
  if (item.kind === 'hootza' || item.kind === 'org_event') {
    return <TouchableOpacity {...common} style={[styles.ring, { left: x - RING / 2, top: y - RING / 2 }]} />;
  }
  if (item.kind === 'holla') {
    return (
      <TouchableOpacity {...common} style={[styles.pennant, { left: x - 2, top: y - 26 }]}>
        <View style={styles.pennantFlag} />
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity {...common} style={[styles.tag, { left: x - 16, top: y - 22 }]}>
      <View style={styles.tagEyelet} />
    </TouchableOpacity>
  );
}

export interface MapCanvasProps {
  bbox: Bbox | null;
  pins: MapPin[];
  hangouts: MapHangout[];
  selectedPinId?: string | null;
  onPinPress?: (pin: MapPin) => void;
  onHangoutPress?: (hangout: MapHangout) => void;
  /** Stage 04: every pin type from GET /map/viewport. Used instead of `pins`/`hangouts` when given. */
  items?: ViewportItem[];
  clusters?: ViewportCluster[];
  onItemPress?: (item: ViewportItem) => void;
  onClusterPress?: (cluster: ViewportCluster) => void;
  /** Honest note when no basemap provider is configured (the grid is the renderer). */
  basemapNote?: string | null;
  /** Pan and zoom: when given, the canvas can be dragged and zoomed and reports the viewport it now shows. */
  onViewportChange?: (bbox: Bbox) => void;
}

export function MapCanvas({
  bbox,
  pins,
  hangouts,
  selectedPinId,
  onPinPress,
  onHangoutPress,
  items,
  clusters,
  onItemPress,
  onClusterPress,
  basemapNote,
  onViewportChange,
}: MapCanvasProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [drag, setDrag] = useState({ dx: 0, dy: 0 });
  const onLayout = (e: LayoutChangeEvent) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height });
  const ready = bbox && size.width > 0 && size.height > 0;

  // Latest values for the responder, which is created once.
  const live = useRef({ bbox, size, onViewportChange });
  live.current = { bbox, size, onViewportChange };
  const responder = useMemo(() => PanResponder.create({
    // A tap on a pin stays a tap: only a real drag claims the gesture.
    onMoveShouldSetPanResponder: (_e, g) => Boolean(live.current.onViewportChange) && (Math.abs(g.dx) > 6 || Math.abs(g.dy) > 6),
    onPanResponderMove: (_e, g) => setDrag({ dx: g.dx, dy: g.dy }),
    onPanResponderRelease: (_e, g) => {
      setDrag({ dx: 0, dy: 0 });
      const { bbox: box, size: sz, onViewportChange: cb } = live.current;
      if (box && cb && sz.width > 0) cb(bboxAfterDrag(box, g.dx, g.dy, sz.width, sz.height));
    },
    onPanResponderTerminate: () => setDrag({ dx: 0, dy: 0 }),
  }), []);

  const move = (fn: (b: Bbox) => Bbox) => { if (bbox && onViewportChange) onViewportChange(fn(bbox)); };

  return (
    <View style={StyleSheet.absoluteFill} onLayout={onLayout} testID="map-canvas">
      <View style={styles.grid} />
      {basemapNote ? <Text style={styles.note} testID="basemap-note">{basemapNote}</Text> : null}
      {onViewportChange && bbox ? (
        <View style={styles.controls} pointerEvents="box-none">
          <TouchableOpacity style={styles.ctl} onPress={() => move((b) => zoomBbox(b, ZOOM_IN))} accessibilityRole="button" accessibilityLabel={t('mapNav.zoomIn')} testID="map-zoom-in">
            <Text style={styles.ctlText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctl} onPress={() => move((b) => zoomBbox(b, ZOOM_OUT))} accessibilityRole="button" accessibilityLabel={t('mapNav.zoomOut')} testID="map-zoom-out">
            <Text style={styles.ctlText}>−</Text>
          </TouchableOpacity>
          {([['north', 0, 1, '↑'], ['south', 0, -1, '↓'], ['west', -1, 0, '←'], ['east', 1, 0, '→']] as const).map(([name, fx, fy, glyph]) => (
            <TouchableOpacity key={name} style={styles.ctl} onPress={() => move((b) => panBbox(b, fx * PAN_STEP, fy * PAN_STEP))} accessibilityRole="button" accessibilityLabel={t(`mapNav.${name}`)} testID={`map-pan-${name}`}>
              <Text style={styles.ctlText}>{glyph}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
      {/* The responder lives on this layer, not the root, so the root keeps its layout handler. */}
      <View style={[StyleSheet.absoluteFill, { transform: [{ translateX: drag.dx }, { translateY: drag.dy }] }]} testID="map-pan-layer" {...responder.panHandlers}>
      {ready && items
        ? items.map((it) => {
          const at = project(it.lat, it.lng, bbox, size.width, size.height);
          if (!at) return null;
          return <ItemMarker key={`${it.kind}-${it.id}`} item={it} x={at.x} y={at.y} selected={selectedPinId === it.id} onPress={() => onItemPress?.(it)} />;
        })
        : null}
      {ready && clusters
        ? clusters.map((c, i) => {
          const at = project(c.lat, c.lng, bbox, size.width, size.height);
          if (!at) return null;
          return (
            <TouchableOpacity
              key={`c-${i}-${c.lat}-${c.lng}`}
              style={[styles.cluster, { left: at.x - CLUSTER / 2, top: at.y - CLUSTER / 2 }]}
              onPress={() => onClusterPress?.(c)}
              accessibilityRole="button"
              accessibilityLabel={t('map.browsing.clusterLabel', { count: c.count })}
              testID={`cluster-${i}`}
            >
              <Text style={styles.clusterText}>{c.count}</Text>
            </TouchableOpacity>
          );
        })
        : null}
      {ready && !items
        ? hangouts.map((h) => {
          const at = project(h.lat, h.lng, bbox, size.width, size.height);
          if (!at) return null;
          return (
            <TouchableOpacity
              key={`h-${h.id}`}
              style={[styles.square, { left: at.x - SQUARE / 2, top: at.y - SQUARE }]}
              onPress={() => onHangoutPress?.(h)}
              accessibilityRole="button"
              accessibilityLabel={t('map.browsing.hangoutLabel', { name: h.name })}
              testID={`hangout-${h.id}`}
            >
              {h.founding ? <View style={styles.founding} /> : null}
            </TouchableOpacity>
          );
        })
        : null}
      {ready && !items
        ? pins.map((p) => {
          const at = project(p.locationLat, p.locationLng, bbox, size.width, size.height);
          if (!at) return null;
          return (
            <TouchableOpacity
              key={`p-${p.id}`}
              style={[
                styles.pin,
                { left: at.x - PIN / 2, top: at.y - PIN, backgroundColor: p.color ?? Colors.Muted },
                selectedPinId === p.id && styles.pinSelected,
              ]}
              onPress={() => onPinPress?.(p)}
              accessibilityRole="button"
              accessibilityLabel={t(p.mine ? 'map.browsing.yourPinLabel' : 'map.browsing.pinLabel')}
              testID={`pin-${p.id}`}
            />
          );
        })
        : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: { position: 'absolute', right: 12, bottom: 40, gap: 6, alignItems: 'center', zIndex: 2 },
  ctl: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.Chalk, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#1F1E1C', shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  ctlText: { fontSize: 20, color: Colors.Ink, fontWeight: '600' },
  note: { position: 'absolute', left: 12, bottom: 8, fontSize: 11, color: Colors.Muted },
  cluster: {
    position: 'absolute', width: CLUSTER, height: CLUSTER, borderRadius: CLUSTER / 2, backgroundColor: Colors.Ink,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.Chalk,
  },
  clusterText: { color: Colors.Chalk, fontSize: 13, fontWeight: '700' },
  ring: { position: 'absolute', width: RING, height: RING, borderRadius: RING / 2, borderWidth: 3, borderColor: Colors.Ink, backgroundColor: Colors.Chalk },
  pennant: { position: 'absolute', width: 22, height: 26, borderLeftWidth: 3, borderLeftColor: Colors.Plum },
  pennantFlag: { position: 'absolute', top: 0, left: 0, width: 18, height: 12, borderWidth: 2.5, borderColor: Colors.Plum, backgroundColor: Colors.Chalk, borderTopRightRadius: 6, borderBottomRightRadius: 6 },
  tag: { position: 'absolute', width: 32, height: 22, borderWidth: 3, borderColor: Colors.Terracotta, backgroundColor: Colors.Chalk, borderTopLeftRadius: 4, borderTopRightRadius: 12, borderBottomRightRadius: 12, borderBottomLeftRadius: 4 },
  tagEyelet: { position: 'absolute', top: 4, right: 3, width: 6, height: 6, borderRadius: 3, borderWidth: 2, borderColor: Colors.Terracotta },
  grid: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#EFEDEA',
  },
  pin: {
    position: 'absolute',
    width: PIN,
    height: PIN,
    borderTopLeftRadius: PIN / 2,
    borderTopRightRadius: PIN / 2,
    borderBottomRightRadius: PIN / 2,
    borderBottomLeftRadius: 0,
    transform: [{ rotate: '-45deg' }],
    shadowColor: '#1F1E1C',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
  },
  pinSelected: { borderWidth: 3, borderColor: Colors.Chalk },
  square: {
    position: 'absolute',
    width: SQUARE,
    height: SQUARE,
    borderWidth: 2.5,
    borderColor: Colors.Fern,
    backgroundColor: Colors.Chalk,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  founding: {
    position: 'absolute',
    top: -7,
    right: -7,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.Amber,
    borderWidth: 2,
    borderColor: Colors.Chalk,
  },
});
