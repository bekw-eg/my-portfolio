const RESERVED_HANDLES = new Set([
  'admin',
  'api',
  'auth',
  'blog',
  'contact',
  'dashboard',
  'login',
  'portfolio',
  'projects',
  'register',
  'settings',
  'signup',
  'u',
  'uploads',
]);

const COLOR_PRESETS = new Set(['blue', 'purple', 'green', 'red', 'orange', 'teal', 'custom']);

export const normalizeHandle = (value) => {
  const raw = String(value || '').trim().toLowerCase();

  if (!raw) {
    return '';
  }

  return raw
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/[-_]{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
};

export const isReservedHandle = (value) => RESERVED_HANDLES.has(String(value || '').trim().toLowerCase());

export const isTrue = (value) => value === true || value === 'true' || value === 1 || value === '1';

export const sanitizeThemeSettings = ({ primaryColor, primaryColorHex }) => {
  if (!primaryColor) {
    return null;
  }

  const normalizedColor = String(primaryColor).trim().toLowerCase();

  if (!COLOR_PRESETS.has(normalizedColor)) {
    throw new Error('Негізгі түс дұрыс емес');
  }

  if (normalizedColor !== 'custom') {
    return {
      primaryColor: normalizedColor,
      primaryColorHex: null,
    };
  }

  const normalizedHex = String(primaryColorHex || '').trim();

  if (!/^#[0-9a-fA-F]{6}$/.test(normalizedHex)) {
    throw new Error('Custom түсі #RRGGBB форматында болуы керек');
  }

  return {
    primaryColor: normalizedColor,
    primaryColorHex: normalizedHex,
  };
};
