import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../i18n/translations.js';
import { translationOverrides } from '../i18n/translationOverrides.js';
import api from '../services/api.js';

const AppContext = createContext(null);
const htmlLangMap = { kz: 'kk', ru: 'ru', en: 'en' };

const getNestedValue = (source, lang, path) => {
  const keys = path.split('.');
  let value = source?.[lang];

  for (const key of keys) {
    value = value?.[key];
  }

  return value;
};

const applyPrimaryColor = (setting) => {
  const root = document.documentElement;
  const palette = {
    blue:   { primary: '#2563eb', accent: '#0ea5e9', glow: 'rgba(37, 99, 235, 0.15)' },
    purple: { primary: '#7c3aed', accent: '#a78bfa', glow: 'rgba(124, 58, 237, 0.18)' },
    green:  { primary: '#16a34a', accent: '#22c55e', glow: 'rgba(34, 197, 94, 0.18)' },
    red:    { primary: '#dc2626', accent: '#f43f5e', glow: 'rgba(244, 63, 94, 0.18)' },
    orange: { primary: '#ea580c', accent: '#f59e0b', glow: 'rgba(245, 158, 11, 0.18)' },
    teal:   { primary: '#0f766e', accent: '#14b8a6', glow: 'rgba(20, 184, 166, 0.18)' },
  };

  if (!setting) return;
  const key = setting.primary_color;
  if (key === 'custom' && /^#[0-9a-fA-F]{6}$/.test(setting.primary_color_hex || '')) {
    root.style.setProperty('--color-primary', setting.primary_color_hex);
    root.style.setProperty('--color-accent', setting.primary_color_hex);
    root.style.setProperty('--color-glow', 'rgba(37, 99, 235, 0.15)');
    return;
  }
  const p = palette[key];
  if (!p) return;
  root.style.setProperty('--color-primary', p.primary);
  root.style.setProperty('--color-accent', p.accent);
  root.style.setProperty('--color-glow', p.glow);
};

export function AppProvider({ children }) {
  // ── Theme ──────────────────────────────────────────────
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  // ── Language ───────────────────────────────────────────
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'kz');

  const changeLang = (l) => {
    setLang(l);
    localStorage.setItem('lang', l);
  };

  useEffect(() => {
    document.documentElement.lang = htmlLangMap[lang] || 'en';
  }, [lang]);

  const t = (path) => {
    const value =
      getNestedValue(translationOverrides, lang, path) ??
      getNestedValue(translations, lang, path) ??
      getNestedValue(translationOverrides, 'en', path) ??
      getNestedValue(translations, 'en', path);

    return value ?? path;
  };

  // ── Auth ───────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { setAuthLoading(false); return; }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.data);
      if (data.data?.settings) applyPrimaryColor(data.data.settings);
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    setUser(data.data.user);
    if (data.data.user?.settings) applyPrimaryColor(data.data.user.settings);
    return data.data.user;
  };

  const register = async (email, password, fullName, profile) => {
    const { data } = await api.post('/auth/register', { email, password, fullName, ...(profile || {}) });
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    setUser(data.data.user);
    return data.data.user;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try { await api.post('/auth/logout', { refreshToken }); } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const isSuperAdmin = user?.role === 'superadmin';
  const isPortfolioAdmin = user?.role === 'portfolio_admin' || user?.role === 'builder';
  const isBuilder = isPortfolioAdmin;

  return (
    <AppContext.Provider value={{
      theme, toggleTheme,
      lang, changeLang, t,
      user, authLoading, isSuperAdmin, isPortfolioAdmin, isBuilder,
      applyPrimaryColor,
      login, register, logout, loadUser,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
