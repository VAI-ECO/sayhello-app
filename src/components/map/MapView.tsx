/**
 * The map renderer seam. Screens draw `MapView`; it chooses what actually paints the ground.
 *
 *  - `grid`         the delivered grid canvas (MapCanvas): always available, pins projected from real coordinates.
 *  - `native_tiles` a real basemap. It is used only when BOTH the server says a basemap is configured
 *                   (GET /map/provider → basemap.configured) AND a native renderer has been registered. No native map
 *                   library is in the app today (APP-STORE-BUILD-PLAN Phase D: owner picks Mapbox or Apple Maps), so
 *                   nothing registers one and the grid renders. Registering is one call, with the same props as MapCanvas:
 *                   `registerNativeMapRenderer(MyNativeMap)` — screens do not change.
 *
 * No provider key ever reaches this file; tile keys stay with the native renderer's own config.
 */
import type { ComponentType } from 'react';
import { MapCanvas, type MapCanvasProps } from './MapCanvas';

export type MapRendererKind = 'grid' | 'native_tiles';

let nativeRenderer: ComponentType<MapCanvasProps> | null = null;

export function registerNativeMapRenderer(component: ComponentType<MapCanvasProps> | null): void {
  nativeRenderer = component;
}

export function chooseMapRenderer(basemapConfigured: boolean): MapRendererKind {
  return basemapConfigured && nativeRenderer ? 'native_tiles' : 'grid';
}

export function MapView({ basemapConfigured = false, ...props }: MapCanvasProps & { basemapConfigured?: boolean }) {
  const Native = nativeRenderer;
  if (chooseMapRenderer(basemapConfigured) === 'native_tiles' && Native) return <Native {...props} />;
  return <MapCanvas {...props} />;
}
