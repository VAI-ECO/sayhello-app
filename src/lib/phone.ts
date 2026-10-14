/**
 * Phone validation — RULES §26.9
 *
 * Per country, from the dialling code. Not a setting.
 * Language → primary market sets the default prefix on entry.
 * Stored form is always E.164.
 *
 * Source: launch language table (30 languages → primary markets).
 * Italy stored form was not printed in the brief; derived from
 * [+39] 3XX XXX XXXX → +393XXXXXXXXX.
 */

export type LaunchLanguage = {
  /** Stable id used for locale matching (BCP-47 language / regional tag). */
  id: string;
  language: string;
  market: string;
  callingCode: string;
  /** Shown next to the field as [+N]. */
  entryPrefix: string;
  /** National hint inside the field. */
  entryHint: string;
  /** Drop a leading national trunk 0 before storing. */
  dropTrunkZero: boolean;
  /** Digits after the country code in stored E.164. */
  subscriberPattern: RegExp;
  /**
   * Extra locale tags that resolve to this language's market.
   * Longer tags win (zh-HK before zh).
   */
  localeTags: string[];
};

/**
 * All 30 launch languages. Duplicate markets (India, Nigeria, Pakistan)
 * are listed once per language so every row is testable.
 */
export const LAUNCH_LANGUAGES: LaunchLanguage[] = [
  {
    id: 'en',
    language: 'English',
    market: 'United States',
    callingCode: '1',
    entryPrefix: '+1',
    entryHint: '(XXX) XXX-XXXX',
    dropTrunkZero: false,
    subscriberPattern: /^\d{10}$/,
    localeTags: ['en'],
  },
  {
    id: 'zh',
    language: 'Mandarin Chinese',
    market: 'China',
    callingCode: '86',
    entryPrefix: '+86',
    entryHint: '1XX XXXX XXXX',
    dropTrunkZero: false,
    subscriberPattern: /^1\d{10}$/,
    localeTags: ['zh', 'zh-cn', 'zh-hans'],
  },
  {
    id: 'hi',
    language: 'Hindi',
    market: 'India',
    callingCode: '91',
    entryPrefix: '+91',
    entryHint: 'XXXXX XXXXX',
    dropTrunkZero: false,
    subscriberPattern: /^\d{10}$/,
    localeTags: ['hi'],
  },
  {
    id: 'es',
    language: 'Spanish',
    market: 'Mexico',
    callingCode: '52',
    entryPrefix: '+52',
    entryHint: 'XX XXXX XXXX',
    dropTrunkZero: false,
    subscriberPattern: /^\d{10}$/,
    localeTags: ['es'],
  },
  {
    id: 'fr',
    language: 'French',
    market: 'France',
    callingCode: '33',
    entryPrefix: '+33',
    entryHint: '06 XX XX XX XX',
    dropTrunkZero: true,
    subscriberPattern: /^6\d{8}$/,
    localeTags: ['fr'],
  },
  {
    id: 'ar',
    language: 'Modern Standard Arabic',
    market: 'Saudi Arabia',
    callingCode: '966',
    entryPrefix: '+966',
    entryHint: '05X XXX XXXX',
    dropTrunkZero: true,
    subscriberPattern: /^5\d{8}$/,
    localeTags: ['ar', 'ar-sa'],
  },
  {
    id: 'bn',
    language: 'Bengali',
    market: 'Bangladesh',
    callingCode: '880',
    entryPrefix: '+880',
    entryHint: '01XXX-XXXXXX',
    dropTrunkZero: true,
    subscriberPattern: /^1\d{9}$/,
    localeTags: ['bn'],
  },
  {
    id: 'pt',
    language: 'Portuguese',
    market: 'Brazil',
    callingCode: '55',
    entryPrefix: '+55',
    entryHint: '(XX) 9XXXX-XXXX',
    dropTrunkZero: false,
    subscriberPattern: /^\d{2}9\d{8}$/,
    localeTags: ['pt'],
  },
  {
    id: 'ru',
    language: 'Russian',
    market: 'Russia',
    callingCode: '7',
    entryPrefix: '+7',
    entryHint: '9XX XXX-XX-XX',
    dropTrunkZero: false,
    subscriberPattern: /^9\d{9}$/,
    localeTags: ['ru'],
  },
  {
    id: 'ur',
    language: 'Urdu',
    market: 'Pakistan',
    callingCode: '92',
    entryPrefix: '+92',
    entryHint: '03XX XXXXXXX',
    dropTrunkZero: true,
    subscriberPattern: /^3\d{9}$/,
    localeTags: ['ur'],
  },
  {
    id: 'id',
    language: 'Indonesian',
    market: 'Indonesia',
    callingCode: '62',
    entryPrefix: '+62',
    entryHint: '08XX-XXXX-XXXX',
    dropTrunkZero: true,
    subscriberPattern: /^8\d{10}$/,
    localeTags: ['id'],
  },
  {
    id: 'de',
    language: 'German',
    market: 'Germany',
    callingCode: '49',
    entryPrefix: '+49',
    entryHint: '01XX XXXXXXXX',
    dropTrunkZero: true,
    subscriberPattern: /^1\d{10}$/,
    localeTags: ['de'],
  },
  {
    id: 'ja',
    language: 'Japanese',
    market: 'Japan',
    callingCode: '81',
    entryPrefix: '+81',
    entryHint: '090-XXXX-XXXX',
    dropTrunkZero: true,
    subscriberPattern: /^90\d{8}$/,
    localeTags: ['ja'],
  },
  {
    id: 'pcm',
    language: 'Nigerian Pidgin',
    market: 'Nigeria',
    callingCode: '234',
    entryPrefix: '+234',
    entryHint: '080X XXX XXXX',
    dropTrunkZero: true,
    subscriberPattern: /^80\d{8}$/,
    localeTags: ['pcm'],
  },
  {
    id: 'ar-eg',
    language: 'Egyptian Arabic',
    market: 'Egypt',
    callingCode: '20',
    entryPrefix: '+20',
    entryHint: '01X XXXX XXXX',
    dropTrunkZero: true,
    subscriberPattern: /^1\d{9}$/,
    localeTags: ['ar-eg', 'arz'],
  },
  {
    id: 'mr',
    language: 'Marathi',
    market: 'India',
    callingCode: '91',
    entryPrefix: '+91',
    entryHint: 'XXXXX XXXXX',
    dropTrunkZero: false,
    subscriberPattern: /^\d{10}$/,
    localeTags: ['mr'],
  },
  {
    id: 'vi',
    language: 'Vietnamese',
    market: 'Vietnam',
    callingCode: '84',
    entryPrefix: '+84',
    entryHint: '09XX XXX XXX',
    dropTrunkZero: true,
    subscriberPattern: /^9\d{8}$/,
    localeTags: ['vi'],
  },
  {
    id: 'te',
    language: 'Telugu',
    market: 'India',
    callingCode: '91',
    entryPrefix: '+91',
    entryHint: 'XXXXX XXXXX',
    dropTrunkZero: false,
    subscriberPattern: /^\d{10}$/,
    localeTags: ['te'],
  },
  {
    id: 'ha',
    language: 'Hausa',
    market: 'Nigeria',
    callingCode: '234',
    entryPrefix: '+234',
    entryHint: '080X XXX XXXX',
    dropTrunkZero: true,
    subscriberPattern: /^80\d{8}$/,
    localeTags: ['ha'],
  },
  {
    id: 'tr',
    language: 'Turkish',
    market: 'Türkiye',
    callingCode: '90',
    entryPrefix: '+90',
    entryHint: '05XX XXX XX XX',
    dropTrunkZero: true,
    subscriberPattern: /^5\d{9}$/,
    localeTags: ['tr'],
  },
  {
    id: 'pa',
    language: 'Punjabi',
    market: 'Pakistan',
    callingCode: '92',
    entryPrefix: '+92',
    entryHint: '03XX XXXXXXX',
    dropTrunkZero: true,
    subscriberPattern: /^3\d{9}$/,
    localeTags: ['pa'],
  },
  {
    id: 'sw',
    language: 'Swahili',
    market: 'Tanzania',
    callingCode: '255',
    entryPrefix: '+255',
    entryHint: '07XX XXX XXX',
    dropTrunkZero: true,
    subscriberPattern: /^7\d{8}$/,
    localeTags: ['sw'],
  },
  {
    id: 'fil',
    language: 'Filipino/Tagalog',
    market: 'Philippines',
    callingCode: '63',
    entryPrefix: '+63',
    entryHint: '09XX XXX XXXX',
    dropTrunkZero: true,
    subscriberPattern: /^9\d{9}$/,
    localeTags: ['fil', 'tl'],
  },
  {
    id: 'ta',
    language: 'Tamil',
    market: 'India',
    callingCode: '91',
    entryPrefix: '+91',
    entryHint: 'XXXXX XXXXX',
    dropTrunkZero: false,
    subscriberPattern: /^\d{10}$/,
    localeTags: ['ta'],
  },
  {
    id: 'yue',
    language: 'Cantonese',
    market: 'Hong Kong',
    callingCode: '852',
    entryPrefix: '+852',
    entryHint: 'XXXX XXXX',
    dropTrunkZero: false,
    subscriberPattern: /^\d{8}$/,
    localeTags: ['yue', 'zh-hk', 'zh-hant-hk'],
  },
  {
    id: 'fa',
    language: 'Persian/Farsi',
    market: 'Iran',
    callingCode: '98',
    entryPrefix: '+98',
    entryHint: '09XX XXX XXXX',
    dropTrunkZero: true,
    subscriberPattern: /^9\d{9}$/,
    localeTags: ['fa'],
  },
  {
    id: 'ko',
    language: 'Korean',
    market: 'South Korea',
    callingCode: '82',
    entryPrefix: '+82',
    entryHint: '010-XXXX-XXXX',
    dropTrunkZero: true,
    subscriberPattern: /^10\d{8}$/,
    localeTags: ['ko'],
  },
  {
    id: 'th',
    language: 'Thai',
    market: 'Thailand',
    callingCode: '66',
    entryPrefix: '+66',
    entryHint: '08X XXX XXXX',
    dropTrunkZero: true,
    subscriberPattern: /^8\d{8}$/,
    localeTags: ['th'],
  },
  {
    id: 'gu',
    language: 'Gujarati',
    market: 'India',
    callingCode: '91',
    entryPrefix: '+91',
    entryHint: 'XXXXX XXXXX',
    dropTrunkZero: false,
    subscriberPattern: /^\d{10}$/,
    localeTags: ['gu'],
  },
  {
    id: 'it',
    language: 'Italian',
    market: 'Italy',
    callingCode: '39',
    entryPrefix: '+39',
    entryHint: '3XX XXX XXXX',
    dropTrunkZero: false,
    subscriberPattern: /^3\d{9}$/,
    localeTags: ['it'],
  },
];

export type PhoneMarket = {
  callingCode: string;
  dropTrunkZero: boolean;
  subscriberPattern: RegExp;
  entryHint: string;
  entryPrefix: string;
  localeTags: string[];
};

/** Unique dialling-code markets derived from the 30-language table. */
export const PHONE_MARKETS: PhoneMarket[] = (() => {
  const byCode = new Map<string, PhoneMarket>();
  for (const lang of LAUNCH_LANGUAGES) {
    const existing = byCode.get(lang.callingCode);
    if (existing) {
      for (const tag of lang.localeTags) {
        if (!existing.localeTags.includes(tag)) existing.localeTags.push(tag);
      }
      continue;
    }
    byCode.set(lang.callingCode, {
      callingCode: lang.callingCode,
      dropTrunkZero: lang.dropTrunkZero,
      subscriberPattern: lang.subscriberPattern,
      entryHint: lang.entryHint,
      entryPrefix: lang.entryPrefix,
      localeTags: [...lang.localeTags],
    });
  }
  return [...byCode.values()];
})();

const MARKETS_BY_CODE_LENGTH = [...PHONE_MARKETS].sort(
  (a, b) => b.callingCode.length - a.callingCode.length
);

const LOCALE_TAGS = LAUNCH_LANGUAGES.flatMap((lang) =>
  lang.localeTags.map((tag) => ({ tag, lang }))
).sort((a, b) => b.tag.length - a.tag.length);

const FALLBACK = LAUNCH_LANGUAGES[0];

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

function languageToMarket(lang: LaunchLanguage): PhoneMarket {
  return {
    callingCode: lang.callingCode,
    dropTrunkZero: lang.dropTrunkZero,
    subscriberPattern: lang.subscriberPattern,
    entryHint: lang.entryHint,
    entryPrefix: lang.entryPrefix,
    localeTags: lang.localeTags,
  };
}

export function languageById(id: string): LaunchLanguage | null {
  const normalized = id.toLowerCase().replace(/_/g, '-');
  return LAUNCH_LANGUAGES.find((lang) => lang.id === normalized) ?? null;
}

export function marketForLanguage(id: string): PhoneMarket {
  const lang = languageById(id);
  return languageToMarket(lang ?? FALLBACK);
}

export function marketForLocale(locale: string): PhoneMarket {
  const normalized = locale.toLowerCase().replace(/_/g, '-');
  for (const { tag, lang } of LOCALE_TAGS) {
    if (normalized === tag || normalized.startsWith(`${tag}-`)) {
      return languageToMarket(lang);
    }
  }
  return languageToMarket(FALLBACK);
}

export function matchCallingCode(e164Digits: string): PhoneMarket | null {
  for (const market of MARKETS_BY_CODE_LENGTH) {
    if (e164Digits.startsWith(market.callingCode)) {
      return market;
    }
  }
  return null;
}

export function parseE164(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed.startsWith('+')) return null;
  const e164Digits = digitsOnly(trimmed);
  if (e164Digits.length < 8 || e164Digits.length > 15) return null;
  // No international dialling code begins with 0 (E.164): a leading 0 is a trunk or
  // double-zero prefix that does not belong in the stored form.
  if (e164Digits.startsWith('0')) return null;
  const market = matchCallingCode(e164Digits);
  if (market) {
    const subscriber = e164Digits.slice(market.callingCode.length);
    if (!market.subscriberPattern.test(subscriber)) return null;
    return `+${market.callingCode}${subscriber}`;
  }
  // Unlisted dialling codes parse GENERICALLY and are ACCEPTED (RULES §26.9, final ruling):
  // the 24-market table is display formatting only, never a whitelist. The generic check is
  // shape-only (digits, 8–15 length bounds, no zero-leading code) and claims nothing about
  // ownership, assignment or reachability of the number.
  return `+${e164Digits}`;
}

export function isValidStoredPhone(value: string): boolean {
  return parseE164(value) !== null;
}

function nationalToE164(market: PhoneMarket, national: string): string | null {
  let subscriber = digitsOnly(national);
  if (market.dropTrunkZero && subscriber.startsWith('0')) {
    subscriber = subscriber.slice(1);
  }
  if (!market.subscriberPattern.test(subscriber)) return null;
  return `+${market.callingCode}${subscriber}`;
}

/**
 * Accept national digits for the locale's market, or a full E.164 starting with +.
 * Also accepts a pasted country code without the leading + when that code is a launch
 * market: without the + there is no way to tell a dialling code from someone's national
 * digits, so an UNLISTED code is never guessed from bare digits — for anywhere outside
 * the table the + is required (it marks international intent, §26.9).
 */
export function toE164(input: string, locale = 'en-US'): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('+')) return parseE164(trimmed);

  const market = marketForLocale(locale);
  const fromNational = nationalToE164(market, trimmed);
  if (fromNational) return fromNational;

  const bareDigits = digitsOnly(trimmed);
  if (!matchCallingCode(bareDigits)) return null;
  return parseE164(`+${bareDigits}`);
}

export function deviceLocale(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale || 'en-US';
  } catch {
    return 'en-US';
  }
}

/**
 * Market choice is MANUAL (RULES §26.9, SN-94): the person picks from the list, never inferred from the
 * SIM or the device locale. Starting point is the first launch market (the United States), shown plainly.
 */
export type MarketChoice = { callingCode: string; name: string; market: PhoneMarket };

export const MARKET_CHOICES: MarketChoice[] = (() => {
  const seen = new Set<string>();
  const out: MarketChoice[] = [];
  for (const lang of LAUNCH_LANGUAGES) {
    if (seen.has(lang.callingCode)) continue;
    seen.add(lang.callingCode);
    out.push({ callingCode: lang.callingCode, name: lang.market, market: languageToMarket(lang) });
  }
  return out;
})();

export const DEFAULT_MARKET_CODE = LAUNCH_LANGUAGES[0].callingCode;

export function marketByCallingCode(code: string): MarketChoice {
  return MARKET_CHOICES.find((m) => m.callingCode === code) ?? MARKET_CHOICES[0];
}

/** National digits in the chosen market, or a full E.164 starting with +. Never consults the locale. */
export function toE164InMarket(input: string, callingCode: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('+')) return parseE164(trimmed);
  return nationalToE164(marketByCallingCode(callingCode).market, trimmed);
}
