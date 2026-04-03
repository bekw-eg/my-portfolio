import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle,
  ChevronDown,
  Filter,
  FolderOpen,
  Globe,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogOut,
  Mail,
  Moon,
  Sun,
  User,
  Zap,
} from 'heroicons';
import { useApp } from '../../context/AppContext.jsx';
import { getAdminText } from '../../i18n/adminCopy.js';
import BrandLogo from '../ui/BrandLogo.jsx';

const ADMIN_NAV = [
  {
    path: '/admin',
    label: 'dashboard.overview',
    icon: LayoutDashboard,
    exact: true,
    hint: 'Performance and publishing',
    description: 'Portfolio performance, publication queue, and incoming activity.',
  },
  {
    path: '/admin/projects',
    label: 'dashboard.projects',
    icon: FolderOpen,
    hint: 'Work showcase inventory',
    description: 'Manage portfolio items, visibility, and featured work.',
  },
  {
    path: '/admin/experience',
    label: 'dashboard.experience',
    icon: Briefcase,
    hint: 'Career timeline',
    description: 'Maintain the work history and milestones shown on the public portfolio.',
  },
  {
    path: '/admin/education',
    label: 'dashboard.education',
    icon: GraduationCap,
    hint: 'Academic record',
    description: 'Shape the education section with current study and completed programs.',
  },
  {
    path: '/admin/blog',
    label: 'dashboard.blog',
    icon: BookOpen,
    hint: 'Editorial workflow',
    description: 'Draft, publish, and review long-form content.',
  },
  {
    path: '/admin/certificates',
    label: 'dashboard.certificates',
    icon: Award,
    hint: 'Proof and credentials',
    description: 'Keep certifications organized and ready for publication.',
  },
  {
    path: '/admin/skills',
    label: 'dashboard.skills',
    icon: Zap,
    hint: 'Capability catalog',
    description: 'Curate the skills matrix and featured expertise.',
  },
  {
    path: '/admin/contacts',
    label: 'dashboard.contacts',
    icon: Mail,
    hint: 'Inbound requests',
    description: 'Review messages, triage new leads, and respond quickly.',
  },
  {
    path: '/admin/profile',
    label: 'dashboard.profile',
    icon: User,
    hint: 'Public identity',
    description: 'Update profile content, availability, and contact details.',
  },
];

const LANGS = [
  { code: 'kz', label: 'KZ' },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
];

function AdminNavItem({ path, label, icon: Icon, hint, exact, onNavigate, t, tx }) {
  return (
    <NavLink
      to={path}
      end={exact}
      onClick={onNavigate}
      className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
    >
      <span className="admin-nav-item__icon">
        <Icon size={17} />
      </span>
      <span className="admin-nav-item__content">
        <span className="admin-nav-item__label">{t(label)}</span>
        <span className="admin-nav-item__hint">{tx(hint)}</span>
      </span>
    </NavLink>
  );
}

export default function AdminLayout() {
  const { t, user, logout, theme, toggleTheme, lang, changeLang } = useApp();
  const tx = getAdminText(lang);
  const navigate = useNavigate();
  const location = useLocation();
  const [langOpen, setLangOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setLangOpen(false);
    setSidebarOpen(false);
  }, [location.pathname]);

  const activePage = ADMIN_NAV.find((item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  }) || ADMIN_NAV[0];

  const initials = (user?.profile?.full_name || user?.email || 'A')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
    .slice(0, 2);

  const roleLabel = user?.role === 'superadmin' ? tx('Super admin') : tx('Portfolio admin');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="admin-shell">
      <div
        className={`admin-overlay ${sidebarOpen ? 'is-open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="admin-sidebar__top">
          <Link to="/" className="admin-brand">
            <BrandLogo size={34} alt="Bekw logo" />
            <span className="admin-brand__copy">
              <span className="admin-brand__title">Bekw.dev</span>
              <span className="admin-brand__subtitle">{tx('Portfolio CMS')}</span>
            </span>
          </Link>

          <button
            type="button"
            className="admin-icon-button admin-sidebar__close"
            onClick={() => setSidebarOpen(false)}
            aria-label={tx('Close navigation')}
          >
            <span style={{ fontSize: '1.15rem', lineHeight: 1 }}>×</span>
          </button>
        </div>

        <div className="admin-sidebar__workspace">
          <div className="admin-sidebar__workspace-mark">
            <CheckCircle size={18} />
          </div>
          <div>
            <p className="admin-sidebar__workspace-title">{tx('Content operations')}</p>
            <p className="admin-sidebar__workspace-copy">
              {tx('A focused workspace for managing portfolio content, leads, and profile data.')}
            </p>
          </div>
        </div>

        <div className="admin-sidebar__section">
          <p className="admin-sidebar__label">{tx('Workspace')}</p>
          {ADMIN_NAV.map((item) => (
            <AdminNavItem
              key={item.path}
              {...item}
              t={t}
              tx={tx}
              onNavigate={() => setSidebarOpen(false)}
            />
          ))}
        </div>

        <div className="admin-sidebar__section admin-sidebar__section--secondary">
          <p className="admin-sidebar__label">{tx('Shortcuts')}</p>
          <Link to="/" className="admin-nav-item" onClick={() => setSidebarOpen(false)}>
            <span className="admin-nav-item__icon">
              <Home size={17} />
            </span>
            <span className="admin-nav-item__content">
              <span className="admin-nav-item__label">{tx('Public site')}</span>
              <span className="admin-nav-item__hint">{tx('Review the published portfolio')}</span>
            </span>
          </Link>
        </div>

        <div className="admin-sidebar__footer">
          <div className="admin-user-card">
            <div className="admin-user-card__avatar">{initials}</div>
            <div className="admin-user-card__meta">
              <p className="admin-user-card__name">{user?.profile?.full_name || user?.email}</p>
              <p className="admin-user-card__role">{roleLabel}</p>
            </div>
          </div>

          <button type="button" className="admin-logout" onClick={handleLogout}>
            <LogOut size={16} />
            {tx('Sign out')}
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar__left">
            <button
              type="button"
              className="admin-icon-button admin-topbar__menu"
              onClick={() => setSidebarOpen(true)}
              aria-label={tx('Open navigation')}
            >
              <Filter size={18} />
            </button>

            <div className="admin-topbar__context">
              <span className="admin-topbar__eyebrow">{tx('Admin workspace')}</span>
              <div className="admin-topbar__heading">
                <span className="admin-topbar__title">{t(activePage.label)}</span>
                <span className="admin-topbar__description">{tx(activePage.description)}</span>
              </div>
            </div>
          </div>

          <div className="admin-topbar__actions">
            <Link to="/" className="admin-ghost-link">
              {tx('Open portfolio')}
              <ArrowUpRight size={14} />
            </Link>

            <div className="admin-dropdown">
              <button
                type="button"
                className="admin-ghost-link"
                onClick={() => setLangOpen((open) => !open)}
                aria-label={tx('Change language')}
              >
                <Globe size={14} />
                {LANGS.find((item) => item.code === lang)?.label}
                <ChevronDown size={14} />
              </button>

              {langOpen && (
                <div className="admin-dropdown__menu">
                  {LANGS.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      className={`admin-dropdown__option ${lang === item.code ? 'is-active' : ''}`}
                      onClick={() => {
                        changeLang(item.code);
                        setLangOpen(false);
                      }}
                    >
                      <span>{item.label}</span>
                      {lang === item.code && <span>{tx('Active')}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className="admin-icon-button"
              onClick={toggleTheme}
              aria-label={tx('Toggle theme')}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <div className="admin-account-chip">
              <div className="admin-account-chip__avatar">{initials}</div>
              <div className="admin-account-chip__meta">
                <span className="admin-account-chip__name">{roleLabel}</span>
                <span className="admin-account-chip__role">{user?.email}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
