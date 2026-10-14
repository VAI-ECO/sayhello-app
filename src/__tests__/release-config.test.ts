const { resolveApiUrl } = require('../../scripts/release-config.cjs');

describe('release API configuration', () => {
  it('allows the local backend for development', () => {
    expect(resolveApiUrl({})).toBe('http://localhost:3000');
  });
  it.each(['http://example.com', 'https://localhost:3000', 'https://127.0.0.1', 'https://192.168.1.2', 'https://10.0.0.2', 'https://[::1]', 'https://user:secret@example.com', 'not a URL'])('rejects unsafe production endpoint %s', (API_URL) => {
    expect(() => resolveApiUrl({ APP_ENV: 'production', API_URL })).toThrow();
  });
  it('rejects the default local endpoint for a production build profile', () => {
    expect(() => resolveApiUrl({ EAS_BUILD_PROFILE: 'production' })).toThrow();
  });
  it('accepts an explicitly configured HTTPS release endpoint', () => {
    expect(resolveApiUrl({ APP_ENV: 'production', API_URL: 'https://api.example.com/' })).toBe('https://api.example.com');
  });
});
