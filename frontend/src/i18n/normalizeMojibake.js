const CP1251_TABLE = {
  0x80: 'Ђ', 0x81: 'Ѓ', 0x82: '‚', 0x83: 'ѓ', 0x84: '„', 0x85: '…', 0x86: '†', 0x87: '‡',
  0x88: '€', 0x89: '‰', 0x8a: 'Љ', 0x8b: '‹', 0x8c: 'Њ', 0x8d: 'Ќ', 0x8e: 'Ћ', 0x8f: 'Џ',
  0x90: 'ђ', 0x91: '‘', 0x92: '’', 0x93: '“', 0x94: '”', 0x95: '•', 0x96: '–', 0x97: '—',
  0x99: '™', 0x9a: 'љ', 0x9b: '›', 0x9c: 'њ', 0x9d: 'ќ', 0x9e: 'ћ', 0x9f: 'џ',
  0xa0: '\u00a0', 0xa1: 'Ў', 0xa2: 'ў', 0xa3: 'Ј', 0xa4: '¤', 0xa5: 'Ґ', 0xa6: '¦', 0xa7: '§',
  0xa8: 'Ё', 0xa9: '©', 0xaa: 'Є', 0xab: '«', 0xac: '¬', 0xad: '\u00ad', 0xae: '®', 0xaf: 'Ї',
  0xb0: '°', 0xb1: '±', 0xb2: 'І', 0xb3: 'і', 0xb4: 'ґ', 0xb5: 'µ', 0xb6: '¶', 0xb7: '·',
  0xb8: 'ё', 0xb9: '№', 0xba: 'є', 0xbb: '»', 0xbc: 'ј', 0xbd: 'Ѕ', 0xbe: 'ѕ', 0xbf: 'ї',
};

for (let byte = 0xc0; byte <= 0xff; byte += 1) {
  CP1251_TABLE[byte] = String.fromCharCode(0x0410 + (byte - 0xc0));
}

const CP1251_REVERSE = new Map();
const utf8Decoder = new TextDecoder('utf-8', { fatal: true });

for (let byte = 0; byte < 0x80; byte += 1) {
  CP1251_REVERSE.set(String.fromCharCode(byte), byte);
}

for (const [byte, char] of Object.entries(CP1251_TABLE)) {
  CP1251_REVERSE.set(char, Number(byte));
}

const MOJIBAKE_PATTERN = /(?:Ð.|Ñ.|Р.|С.|вЂ|В�|Ѓ|Љ|Њ|Ћ|Џ|љ|њ|ћ|џ)/;
const READABLE_PATTERN = /[А-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі]/g;
const cache = new Map();

function scoreReadable(value) {
  return (value.match(READABLE_PATTERN) || []).length;
}

function decodeCp1251Utf8Mojibake(value) {
  if (typeof value !== 'string' || !MOJIBAKE_PATTERN.test(value)) {
    return value;
  }

  if (cache.has(value)) {
    return cache.get(value);
  }

  try {
    const bytes = [];

    for (const char of value) {
      const byte = CP1251_REVERSE.get(char);
      if (byte === undefined) {
        cache.set(value, value);
        return value;
      }
      bytes.push(byte);
    }

    const decoded = utf8Decoder.decode(Uint8Array.from(bytes));
    const normalized = scoreReadable(decoded) > scoreReadable(value) ? decoded : value;
    cache.set(value, normalized);
    return normalized;
  } catch {
    cache.set(value, value);
    return value;
  }
}

export function normalizeMojibakeDeep(value) {
  if (typeof value === 'string') {
    return decodeCp1251Utf8Mojibake(value);
  }

  if (Array.isArray(value)) {
    return value.map(normalizeMojibakeDeep);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, normalizeMojibakeDeep(nestedValue)]),
    );
  }

  return value;
}
