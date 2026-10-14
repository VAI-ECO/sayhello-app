import { needsReencode, toUploadablePhoto } from '../photo-normalize';

const mockSave = jest.fn();
const mockResize = jest.fn();
jest.mock('expo-image-manipulator', () => ({
  SaveFormat: { JPEG: 'jpeg' },
  ImageManipulator: {
    manipulate: () => ({ resize: mockResize, renderAsync: async () => ({ saveAsync: mockSave }) }),
  },
}));

function b64(bytes: number[]) {
  return Buffer.from(bytes).toString('base64');
}
const JPEG = [0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const HEIC = [0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63, 0, 0];

describe('toUploadablePhoto', () => {
  beforeEach(() => { mockSave.mockReset(); mockResize.mockReset(); });

  it('resizes an in-limit JPEG down to the settings max edge when it is set', async () => {
    mockSave.mockResolvedValue({ base64: b64(JPEG) });
    const out = await toUploadablePhoto({ uri: 'file://a.jpg', base64: b64(JPEG), width: 1800, height: 1200 }, 1024);
    expect(out?.mime).toBe('image/jpeg');
    expect(mockResize).toHaveBeenCalledWith({ width: 1024 });
  });

  it('passes a JPEG already inside the settings max edge through untouched', async () => {
    const out = await toUploadablePhoto({ uri: 'file://a.jpg', base64: b64(JPEG), width: 800, height: 600 }, 1024);
    expect(out?.mime).toBe('image/jpeg');
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('uses the built-in cap when the setting is null', async () => {
    const out = await toUploadablePhoto({ uri: 'file://a.jpg', base64: b64(JPEG), width: 1800, height: 1200 }, null);
    expect(out?.mime).toBe('image/jpeg');
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('passes a normal JPEG through untouched', async () => {
    const out = await toUploadablePhoto({ uri: 'file://a.jpg', base64: b64(JPEG) });
    expect(out?.mime).toBe('image/jpeg');
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('re-encodes HEIC as JPEG', async () => {
    mockSave.mockResolvedValue({ base64: b64(JPEG) });
    const out = await toUploadablePhoto({ uri: 'file://a.heic', base64: b64(HEIC), width: 4000, height: 3000 });
    expect(out?.mime).toBe('image/jpeg');
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ format: 'jpeg', base64: true }));
    expect(mockResize).toHaveBeenCalledWith({ width: 2048 });
  });

  it('returns null when conversion fails or yields a non-JPEG', async () => {
    mockSave.mockRejectedValue(new Error('x'));
    expect(await toUploadablePhoto({ uri: 'file://a.heic', base64: b64(HEIC) })).toBeNull();
    mockSave.mockResolvedValue({ base64: b64(HEIC) });
    expect(await toUploadablePhoto({ uri: 'file://a.heic', base64: b64(HEIC) })).toBeNull();
  });

  it('flags oversized JPEG for re-encode', () => {
    expect(needsReencode('image/jpeg', 7 * 1024 * 1024)).toBe(true);
    expect(needsReencode('image/png', 1000)).toBe(false);
  });
});
