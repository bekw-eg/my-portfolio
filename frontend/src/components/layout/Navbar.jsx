import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import Icon from '../ui/Icon.jsx';
import BrandLogo from '../ui/BrandLogo.jsx';

const NAVBAR_INTERACTIONS_ENABLED = true;

const NAV_ITEMS = [
  { key: 'home',         path: '/',             icon: 'dashboard' },
  { key: 'about',        path: '/about',         icon: 'user' },
  { key: 'projects',     path: '/projects',      icon: 'dashboard' },
  { key: 'skills',       path: '/skills',        icon: 'dashboard' },
  { key: 'experience',   path: '/experience',    icon: 'dashboard' },
  { key: 'education',    path: '/education',     icon: 'dashboard' },
  { key: 'certificates', path: '/certificates',  icon: 'dashboard' },
  { key: 'blog',         path: '/blog',          icon: 'dashboard' },
  { key: 'contact',      path: '/contact',       icon: 'mail' },
];

const LANGS = [
  { code: 'kz', label: 'ҚАЗ' },
  { code: 'ru', label: 'РУС' },
  { code: 'en', label: 'ENG' },
];

export default function Navbar() {
  const { theme, toggleTheme, lang, changeLang, t, user, isSuperAdmin, isBuilder, logout } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const langMenuRef = useRef(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) setLangMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const blockNavbarAction = (event) => {
    if (!NAVBAR_INTERACTIONS_ENABLED) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const getInteractiveProps = (handler) => {
    if (!NAVBAR_INTERACTIONS_ENABLED) {
      return {
        onClick: blockNavbarAction,
        'aria-disabled': true,
        tabIndex: -1,
      };
    }

    return { onClick: handler };
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container-app h-full flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
            {...getInteractiveProps()}
          >
            <BrandLogo
              size={36}
              alt="Bekw logo"
              className="group-hover:scale-110"
              style={{
                filter: 'drop-shadow(0 6px 18px rgba(10,102,255,0.28))',
                transition: 'transform 0.2s ease, filter 0.2s ease',
              }}
            />
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
              Bekw<span style={{ color: 'var(--color-primary)' }}>.</span>dev
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map(({ key, path }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                {...getInteractiveProps()}
                style={({ isActive }) => ({
                  padding: '0.45rem 0.85rem',
                  borderRadius: 8,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-2)',
                  background: isActive ? 'rgba(37,99,235,0.08)' : 'transparent',
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                })}
                className="hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950"
              >
                {t(`nav.${key}`)}
              </NavLink>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <div ref={langMenuRef} style={{ position: 'relative' }}>
              <button
                {...getInteractiveProps(() => setLangMenuOpen(o => !o))}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '0.45rem 0.75rem', borderRadius: 8,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text-2)',
                  fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Icon name="globe" size={14} />
                {LANGS.find(l => l.code === lang)?.label}
                <span style={{ marginLeft: 2, opacity: 0.9 }}>▾</span>
              </button>
              {langMenuOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  borderRadius: 12, padding: 6, minWidth: 100, zIndex: 200,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                }}>
                  {LANGS.map(l => (
                    <button
                      key={l.code}
                      {...getInteractiveProps(() => { changeLang(l.code); setLangMenuOpen(false); })}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '0.5rem 0.75rem', borderRadius: 8,
                        fontSize: '0.85rem', fontWeight: lang === l.code ? 700 : 500,
                        color: lang === l.code ? 'var(--color-primary)' : 'var(--color-text-2)',
                        background: lang === l.code ? 'rgba(37,99,235,0.08)' : 'transparent',
                        border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button
              {...getInteractiveProps(toggleTheme)}
              style={{
                width: 38, height: 38, borderRadius: 10,
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              className="hover:border-primary-400 hover:text-primary-500"
            >
              {theme === 'dark' ? <Icon name="sun" size={16} /> : <Icon name="moon" size={16} />}
            </button>

            {/* User menu */}
            {user ? (
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  {...getInteractiveProps(() => setUserMenuOpen(o => !o))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '0.45rem 0.9rem', borderRadius: 10,
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                    color: 'white', border: 'none', cursor: 'pointer',
                    fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s',
                    boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
                  }}
                >
                  <Icon name="user" size={16} color="white" />
                  {user.profile?.full_name?.split(' ')[0] || user.email.split('@')[0]}
                  <span style={{ opacity: 0.9, fontSize: 12 }}>▾</span>
                </button>
                {userMenuOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    borderRadius: 12, padding: 6, minWidth: 160, zIndex: 200,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  }}>
                    {isSuperAdmin && (
                      <Link
                        to="/admin"
                        {...getInteractiveProps(() => setUserMenuOpen(false))}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '0.6rem 0.85rem', borderRadius: 8,
                          fontSize: '0.875rem', fontWeight: 500,
                          color: 'var(--color-text-2)', textDecoration: 'none',
                          transition: 'all 0.15s',
                        }}
                        className="hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950"
                      >
                        <Icon name="dashboard" size={16} />
                        {t('nav.dashboard')}
                      </Link>
                    )}
                    {isBuilder && (
                      <Link
                        to="/dashboard"
                        {...getInteractiveProps(() => setUserMenuOpen(false))}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '0.6rem 0.85rem', borderRadius: 8,
                          fontSize: '0.875rem', fontWeight: 500,
                          color: 'var(--color-text-2)', textDecoration: 'none',
                          transition: 'all 0.15s',
                        }}
                        className="hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950"
                      >
                        <Icon name="dashboard" size={16} />
                        Жеке басқару
                      </Link>
                    )}
                    <button
                      {...getInteractiveProps(handleLogout)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        width: '100%', textAlign: 'left',
                        padding: '0.6rem 0.85rem', borderRadius: 8,
                        fontSize: '0.875rem', fontWeight: 500,
                        color: '#ef4444', background: 'transparent',
                        border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      <Icon name="logout" size={16} />
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="btn btn-primary btn-sm"
                {...getInteractiveProps()}
              >
                {t('nav.login')}
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              {...getInteractiveProps(() => setMobileOpen(o => !o))}
              className="lg:hidden"
              style={{
                width: 38, height: 38, borderRadius: 10,
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {mobileOpen ? <Icon name="close" size={18} /> : <Icon name="menu" size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top: 'var(--nav-height)', left: 0, right: 0, bottom: 0,
          background: 'var(--color-bg)', zIndex: 99,
          padding: '1.5rem', overflowY: 'auto',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV_ITEMS.map(({ key, path, icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                {...getInteractiveProps(() => setMobileOpen(false))}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '0.875rem 1rem', borderRadius: 12,
                  fontSize: '1rem', fontWeight: 500, textDecoration: 'none',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
                  background: isActive ? 'rgba(37,99,235,0.08)' : 'transparent',
                })}
              >
                <Icon name={icon} size={18} />
                {t(`nav.${key}`)}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
