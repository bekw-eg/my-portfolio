import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import Icon from '../ui/Icon.jsx';
import BrandLogo from '../ui/BrandLogo.jsx';

const NAV_ITEMS = [
  { key: 'home', path: '/' },
  { key: 'about', path: '/about' },
  { key: 'projects', path: '/projects' },
  { key: 'skills', path: '/skills' },
  { key: 'experience', path: '/experience' },
  { key: 'education', path: '/education' },
  { key: 'certificates', path: '/certificates' },
  { key: 'blog', path: '/blog' },
  { key: 'contact', path: '/contact' },
];

const LANGS = [
  { code: 'kz', label: 'KZ' },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
];

const ACTIVE_LABELS = {
  kz: 'Белсенді',
  ru: 'Активно',
  en: 'Active',
};

function getNavLinkClassName({ isActive }) {
  return `site-navbar__link ${isActive ? 'is-active' : ''}`;
}

function getMobileNavLinkClassName({ isActive }) {
  return `site-navbar__mobile-link ${isActive ? 'is-active' : ''}`;
}

export default function Navbar() {
  const { theme, toggleTheme, lang, changeLang, t, user, isSuperAdmin, isBuilder, logout } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);
  const langMenuRef = useRef(null);

  const displayName = user?.profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || '';
  const activeLangLabel = LANGS.find((item) => item.code === lang)?.label || 'KZ';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setLangMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }

      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setLangMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        setUserMenuOpen(false);
        setLangMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = mobileOpen ? 'hidden' : previousOverflow || '';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1100) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    setUserMenuOpen(false);
    navigate('/');
  };

  const handleLanguageChange = (code) => {
    changeLang(code);
    setLangMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileOpen((current) => !current);
    setUserMenuOpen(false);
    setLangMenuOpen(false);
  };

  return (
    <>
      <nav className={`navbar ${scrolled || mobileOpen ? 'scrolled' : ''}`}>
        <div className="container-app site-navbar__inner">
          <Link to="/" className="site-navbar__brand" aria-label="Bekw.dev home">
            <BrandLogo
              size={38}
              alt="Bekw logo"
              className="site-navbar__brand-mark"
              style={{
                filter: 'drop-shadow(0 6px 18px rgba(10, 102, 255, 0.22))',
              }}
            />
            <span className="site-navbar__brand-copy">
              <span className="site-navbar__brand-title">
                Bekw<span className="site-navbar__brand-dot">.</span>dev
              </span>
            </span>
          </Link>

          <div className="site-navbar__links" aria-label="Primary">
            {NAV_ITEMS.map(({ key, path }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                className={getNavLinkClassName}
              >
                {t(`nav.${key}`)}
              </NavLink>
            ))}
          </div>

          <div className="site-navbar__actions">
            <div ref={langMenuRef} className="site-navbar__dropdown">
              <button
                type="button"
                className="site-navbar__ghost-button"
                onClick={() => {
                  setLangMenuOpen((current) => !current);
                  setUserMenuOpen(false);
                }}
                aria-expanded={langMenuOpen}
                aria-label="Change language"
              >
                <Icon name="globe" size={15} />
                <span>{activeLangLabel}</span>
                <span className="site-navbar__caret">{langMenuOpen ? '^' : 'v'}</span>
              </button>

              {langMenuOpen && (
                <div className="site-navbar__dropdown-menu site-navbar__dropdown-menu--compact">
                  {LANGS.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      className={`site-navbar__dropdown-item ${lang === item.code ? 'is-active' : ''}`}
                      onClick={() => handleLanguageChange(item.code)}
                    >
                      <span>{item.label}</span>
                      {lang === item.code && <span>{ACTIVE_LABELS[lang] || ACTIVE_LABELS.en}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className="site-navbar__icon-button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Icon name="sun" size={17} /> : <Icon name="moon" size={17} />}
            </button>

            {user ? (
              <div ref={userMenuRef} className="site-navbar__dropdown">
                <button
                  type="button"
                  className="site-navbar__profile-button"
                  onClick={() => {
                    setUserMenuOpen((current) => !current);
                    setLangMenuOpen(false);
                  }}
                  aria-expanded={userMenuOpen}
                >
                  <span className="site-navbar__profile-icon">
                    <Icon name="user" size={15} color="white" />
                  </span>
                  <span className="site-navbar__profile-name">{displayName}</span>
                  <span className="site-navbar__caret">{userMenuOpen ? '^' : 'v'}</span>
                </button>

                {userMenuOpen && (
                  <div className="site-navbar__dropdown-menu">
                    <div className="site-navbar__menu-meta">
                      <div className="site-navbar__menu-name">{user?.profile?.full_name || displayName}</div>
                      <div className="site-navbar__menu-email">{user?.email}</div>
                    </div>

                    {isSuperAdmin && (
                      <Link
                        to="/admin"
                        className="site-navbar__menu-link"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Icon name="dashboard" size={16} />
                        {t('nav.dashboard')}
                      </Link>
                    )}

                    {isBuilder && (
                      <Link
                        to="/dashboard"
                        className="site-navbar__menu-link"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Icon name="dashboard" size={16} />
                        {t('nav.builder_dashboard')}
                      </Link>
                    )}

                    <button
                      type="button"
                      className="site-navbar__menu-link site-navbar__menu-link--danger"
                      onClick={handleLogout}
                    >
                      <Icon name="logout" size={16} />
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="site-navbar__auth-link">
                {t('nav.login')}
              </Link>
            )}

            <button
              type="button"
              className="site-navbar__menu-toggle"
              onClick={toggleMobileMenu}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            >
              {mobileOpen ? <Icon name="close" size={18} /> : <Icon name="menu" size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <>
          <button
            type="button"
            className="site-navbar__backdrop"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation backdrop"
          />

          <div className="site-navbar__mobile">
            <div className="site-navbar__mobile-nav">
              {NAV_ITEMS.map(({ key, path }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === '/'}
                  className={getMobileNavLinkClassName}
                  onClick={() => setMobileOpen(false)}
                >
                  <span>{t(`nav.${key}`)}</span>
                  <Icon name="arrowRight" size={16} />
                </NavLink>
              ))}
            </div>

            <div className="site-navbar__mobile-tools">
              <div className="site-navbar__mobile-lang">
                {LANGS.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    className={`site-navbar__mobile-chip ${lang === item.code ? 'is-active' : ''}`}
                    onClick={() => handleLanguageChange(item.code)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {user ? (
                <div className="site-navbar__mobile-account">
                  <div className="site-navbar__mobile-account-copy">
                    <div className="site-navbar__mobile-account-name">
                      {user?.profile?.full_name || displayName}
                    </div>
                    <div className="site-navbar__mobile-account-email">{user?.email}</div>
                  </div>

                  <div className="site-navbar__mobile-account-actions">
                    {isSuperAdmin && (
                      <Link
                        to="/admin"
                        className="site-navbar__mobile-action"
                        onClick={() => setMobileOpen(false)}
                      >
                        {t('nav.dashboard')}
                      </Link>
                    )}

                    {isBuilder && (
                      <Link
                        to="/dashboard"
                        className="site-navbar__mobile-action"
                        onClick={() => setMobileOpen(false)}
                      >
                        {t('nav.builder_dashboard')}
                      </Link>
                    )}

                    <button
                      type="button"
                      className="site-navbar__mobile-action site-navbar__mobile-action--danger"
                      onClick={handleLogout}
                    >
                      {t('nav.logout')}
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="site-navbar__mobile-login"
                  onClick={() => setMobileOpen(false)}
                >
                  {t('nav.login')}
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
