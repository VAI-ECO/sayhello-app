import { MAX_SPAN_DEG, MIN_SPAN_DEG, bboxAfterDrag, panBbox, zoomBbox } from '../map-geo';

const box = { minLat: 10, maxLat: 10.04, minLng: 100, maxLng: 100.04 };
const span = (b: typeof box) => ({ lat: b.maxLat - b.minLat, lng: b.maxLng - b.minLng });

describe('zoomBbox', () => {
  it('zooms about the centre', () => {
    const z = zoomBbox(box, 0.5);
    expect(span(z).lat).toBeCloseTo(0.02, 6);
    expect(span(z).lng).toBeCloseTo(0.02, 6);
    expect((z.minLat + z.maxLat) / 2).toBeCloseTo(10.02, 6);
    expect((z.minLng + z.maxLng) / 2).toBeCloseTo(100.02, 6);
  });
  it('never zooms past the display limits', () => {
    let z = box;
    for (let i = 0; i < 20; i++) z = zoomBbox(z, 0.5);
    expect(span(z).lat).toBeCloseTo(MIN_SPAN_DEG, 6);
    for (let i = 0; i < 20; i++) z = zoomBbox(z, 2);
    expect(span(z).lat).toBeCloseTo(MAX_SPAN_DEG, 6);
  });
});

describe('panBbox', () => {
  it('moves by a fraction of the viewport, east and north positive', () => {
    const p = panBbox(box, 0.5, 0.25);
    expect(p.minLng).toBeCloseTo(100.02, 6);
    expect(p.minLat).toBeCloseTo(10.01, 6);
    expect(span(p).lng).toBeCloseTo(0.04, 6);
  });
  it('slides back at the edge of the globe instead of squashing', () => {
    const edge = { minLat: 89.98, maxLat: 90, minLng: 179.98, maxLng: 180 };
    const p = panBbox(edge, 1, 1);
    expect(p.maxLat).toBeCloseTo(90, 6);
    expect(p.maxLng).toBeCloseTo(180, 6);
    expect(span(p).lat).toBeCloseTo(0.02, 6);
  });
});

describe('bboxAfterDrag', () => {
  it('dragging the map right shows what is to the west; dragging down shows the north', () => {
    const d = bboxAfterDrag(box, 100, 50, 200, 100);
    expect(d.minLng).toBeCloseTo(99.98, 6);
    expect(d.minLat).toBeCloseTo(10.02, 6);
  });
  it('leaves the viewport alone before the canvas has a size', () => {
    expect(bboxAfterDrag(box, 40, 40, 0, 0)).toBe(box);
  });
});
