import { setLostPhrase, takeLostPhrase } from '../lost-phrase';

describe('lost phrase', () => {
  it('is held for one read and then gone', () => {
    setLostPhrase('h1', 'Connection went out of range.');
    expect(takeLostPhrase('h1')).toBe('Connection went out of range.');
    expect(takeLostPhrase('h1')).toBeNull();
  });
  it('ignores empty and null', () => {
    setLostPhrase('h2', '  ');
    setLostPhrase('h2', null);
    expect(takeLostPhrase('h2')).toBeNull();
    expect(takeLostPhrase(null)).toBeNull();
  });
});
