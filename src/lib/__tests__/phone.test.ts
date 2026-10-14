import {
  LAUNCH_LANGUAGES,
  isValidStoredPhone,
  languageById,
  marketForLanguage,
  marketForLocale,
  parseE164,
  toE164,
} from '../phone';

/** One valid stored E.164 per unique calling code in the launch table. */
const STORED_BY_CODE: Record<string, string> = {
  '1': '+15551234567',
  '86': '+8613812345678',
  '91': '+919876543210',
  '52': '+525512345678',
  '33': '+33612345678',
  '966': '+966512345678',
  '880': '+8801712345678',
  '55': '+5511987654321',
  '7': '+79123456789',
  '92': '+923001234567',
  '62': '+6281234567890',
  '49': '+4915123456789',
  '81': '+819012345678',
  '234': '+2348012345678',
  '20': '+201012345678',
  '84': '+84912345678',
  '90': '+905321234567',
  '255': '+255712345678',
  '63': '+639171234567',
  '852': '+85251234567',
  '98': '+989121234567',
  '82': '+821012345678',
  '66': '+66812345678',
  '39': '+393123456789',
};

/** National entry that normalizes for that language (with trunk 0 where required). */
const NATIONAL_BY_ID: Record<string, string> = {
  en: '5551234567',
  zh: '13812345678',
  hi: '9876543210',
  es: '5512345678',
  fr: '0612345678',
  ar: '0512345678',
  bn: '01712345678',
  pt: '11987654321',
  ru: '9123456789',
  ur: '03001234567',
  id: '081234567890',
  de: '015123456789',
  ja: '09012345678',
  pcm: '08012345678',
  'ar-eg': '01012345678',
  mr: '9876543210',
  vi: '0912345678',
  te: '9876543210',
  ha: '08012345678',
  tr: '05321234567',
  pa: '03001234567',
  sw: '0712345678',
  fil: '09171234567',
  ta: '9876543210',
  yue: '51234567',
  fa: '09121234567',
  ko: '01012345678',
  th: '0812345678',
  gu: '9876543210',
  it: '3123456789',
};

describe('launch languages — all 30', () => {
  it('lists exactly 30 languages', () => {
    expect(LAUNCH_LANGUAGES).toHaveLength(30);
  });

  it('has unique language ids', () => {
    const ids = LAUNCH_LANGUAGES.map((l) => l.id);
    expect(new Set(ids).size).toBe(30);
  });

  it.each(LAUNCH_LANGUAGES.map((l) => [l.id, l.language, l.callingCode]))(
    '%s (%s) resolves market +%s and accepts stored + national entry',
    (id, _language, callingCode) => {
      const lang = languageById(id);
      expect(lang).not.toBeNull();
      expect(lang!.callingCode).toBe(callingCode);

      const market = marketForLanguage(id);
      expect(market.callingCode).toBe(callingCode);
      expect(market.entryPrefix).toBe(`+${callingCode}`);

      const stored = STORED_BY_CODE[callingCode];
      expect(stored).toBeDefined();
      expect(parseE164(stored)).toBe(stored);
      expect(isValidStoredPhone(stored)).toBe(true);

      const national = NATIONAL_BY_ID[id];
      expect(national).toBeDefined();
      expect(toE164(national, id)).toBe(stored);
      expect(toE164(national, `${id}-XX`)).toBe(stored);
    }
  );
});

describe('phone — locale routing', () => {
  it('routes Cantonese / zh-HK to Hong Kong, Mandarin to China', () => {
    expect(marketForLocale('zh-HK').callingCode).toBe('852');
    expect(marketForLocale('yue-HK').callingCode).toBe('852');
    expect(marketForLocale('zh-CN').callingCode).toBe('86');
  });

  it('routes Egyptian Arabic to Egypt, MSA to Saudi', () => {
    expect(marketForLocale('ar-EG').callingCode).toBe('20');
    expect(marketForLocale('ar-SA').callingCode).toBe('966');
    expect(marketForLocale('ar').callingCode).toBe('966');
  });

  it('falls back to English / United States', () => {
    expect(marketForLocale('xx-YY').callingCode).toBe('1');
  });

  it('lets a pasted E.164 override the locale market', () => {
    expect(toE164('+66812345678', 'en-US')).toBe('+66812345678');
  });

  it('accepts a generic E.164 for dialling codes outside the launch table (RULES §26.9: not a whitelist)', () => {
    expect(parseE164('+441234567890')).toBe('+441234567890'); // United Kingdom
    expect(parseE164('+351912345678')).toBe('+351912345678'); // Portugal
    expect(parseE164('+61412345678')).toBe('+61412345678'); // Australia
    expect(isValidStoredPhone('+441234567890')).toBe(true);
    expect(toE164('+441234567890', 'en-US')).toBe('+441234567890');
  });

  it('rejects malformed generic shapes without claiming anything beyond syntax (RULES §26.9)', () => {
    expect(parseE164('441234567890')).toBeNull(); // missing the leading +
    expect(parseE164('+44123')).toBeNull(); // under the 8-digit minimum
    expect(parseE164('+44123456789012345')).toBeNull(); // over the 15-digit maximum
    expect(parseE164('+04412345678')).toBeNull(); // zero-leading international prefix
    expect(parseE164('+44 123 abc')).toBeNull(); // no digits at all
  });

  it('keeps the ambiguous no-plus fallback conservative: listed codes only, generic needs the +', () => {
    expect(toE164('51234567', 'en-US')).toBeNull(); // not a valid US national; 51 is not listed
    expect(toE164('66812345678', 'en-US')).toBe('+66812345678'); // listed-code paste without +
    expect(toE164('441234567890', 'en-US')).toBeNull(); // unlisted without + stays ambiguous → rejected
    expect(toE164('+351912345678', 'en-US')).toBe('+351912345678'); // unlisted needs the +, then generic
  });

  it('accepts an 8-digit Hong Kong number that a flat 10-digit minimum would reject', () => {
    expect(toE164('51234567', 'yue')).toBe('+85251234567');
    expect(toE164('51234567', 'en-US')).toBeNull();
  });
});
