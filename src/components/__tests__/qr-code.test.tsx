import React from 'react';
import { render, screen } from '@testing-library/react-native';
import jsQR from 'jsqr';
import { ScannableCode } from '../qr-code';

// Rasterize the actual native SVG path emitted by the component, then use a
// separate decoder. This checks the output, not just encoder input props.
function decodeRenderedCode(tree: unknown) {
  const nodes: Array<{ props: Record<string, any> }> = [];
  const visit = (node: any) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach(visit);
    if (node.props) nodes.push(node);
    node.children?.forEach(visit);
  };
  visit(tree);
  const svg = nodes.find(node => node.props.testID === 'scannable-code')!.props;
  const path = nodes.find(node => typeof node.props.d === 'string' && node.props.d.startsWith('M'))!.props;
  const { minX, minY, vbWidth, vbHeight } = svg;
  const cell = Number(path.strokeWidth);
  expect(-minX / cell).toBeGreaterThanOrEqual(4);
  expect(-minY / cell).toBeGreaterThanOrEqual(4);
  const width = 400;
  const pixels = new Uint8ClampedArray(width * width * 4).fill(255);
  const segments = [...path.d.matchAll(/M([\d.e+-]+) ([\d.e+-]+) L([\d.e+-]+) ([\d.e+-]+)/g)];
  expect(segments.length).toBeGreaterThan(20);
  for (const segment of segments) {
    const x1 = Number(segment[1]), y = Number(segment[2]), x2 = Number(segment[3]);
    const left = Math.ceil((x1 - minX) / vbWidth * width - 0.5);
    const right = Math.ceil((x2 - minX) / vbWidth * width - 0.5);
    const top = Math.ceil((y - cell / 2 - minY) / vbHeight * width - 0.5);
    const bottom = Math.ceil((y + cell / 2 - minY) / vbHeight * width - 0.5);
    for (let py = top; py < bottom; py++) for (let px = left; px < right; px++) {
      const index = (py * width + px) * 4;
      pixels[index] = pixels[index + 1] = pixels[index + 2] = 0;
    }
  }
  return jsQR(pixels, width, width)?.data;
}

it.each(['ABC123', 'hootza_AbCdEfGhIjKlMnOpQrStUvWxYz012_-9'])('renders a decodable exact token %s with a quiet zone', async value => {
  const { toJSON } = await render(<ScannableCode value={value} size={240} label="Check-in QR" fallback="Code unavailable" />);
  expect(screen.getByRole('image', { name: 'Check-in QR' })).toBeOnTheScreen();
  expect(decodeRenderedCode(toJSON())).toBe(value);
});

it('renders a new symbol when the token changes', async () => {
  const { rerender, toJSON } = await render(<ScannableCode value="FIRST-CODE" size={200} label="Check-in QR" fallback="Code unavailable" />);
  expect(decodeRenderedCode(toJSON())).toBe('FIRST-CODE');
  await rerender(<ScannableCode value="SECOND-CODE" size={160} label="Check-in QR" fallback="Code unavailable" />);
  expect(decodeRenderedCode(toJSON())).toBe('SECOND-CODE');
});

it('contains an encoding failure and recovers when a valid token arrives', async () => {
  const loggedError = jest.spyOn(console, 'error').mockImplementation(() => {});
  try {
    const { rerender, toJSON } = await render(<ScannableCode value={'a'.repeat(10000)} size={240} label="Check-in QR" fallback="Code unavailable" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Code unavailable');
    expect(screen.queryByTestId('scannable-code')).not.toBeOnTheScreen();
    expect(loggedError).toHaveBeenCalled();
    await rerender(<ScannableCode value="RECOVERED" size={240} label="Check-in QR" fallback="Code unavailable" />);
    expect(screen.queryByRole('alert')).not.toBeOnTheScreen();
    expect(decodeRenderedCode(toJSON())).toBe('RECOVERED');
  } finally {
    loggedError.mockRestore();
  }
});
