import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  Eye,
  FolderOpen,
  LayoutDashboard,
  Mail,
  Palette,
  Settings,
  Sparkles,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import LanguageSwitcher from '../components/ui/LanguageSwitcher.jsx';
import { dashboardBuilderCopy } from '../i18n/dashboardBuilderCopy.js';
import api from '../services/api.js';
import { useApp } from '../context/AppContext.jsx';

const STATUS_COLORS = {
  new: { background: 'rgba(37,99,235,0.12)', color: '#2563eb' },
  read: { background: 'rgba(245,158,11,0.12)', color: '#d97706' },
  replied: { background: 'rgba(16,185,129,0.12)', color: '#059669' },
  archived: { background: 'rgba(100,116,139,0.12)', color: '#475569' },
};

const LOCALES = {
  kz: 'kk-KZ',
  ru: 'ru-RU',
  en: 'en-US',
};

const getLocalizedField = (item, field, lang, fallback = '') => {
  const order = lang === 'ru' ? ['ru', 'kz', 'en'] : lang === 'en' ? ['en', 'kz', 'ru'] : ['kz', 'ru', 'en'];
  const value = order
    .map((suffix) => item?.[`${field}_${suffix}`])
    .find((entry) => typeof entry === 'string' && entry.trim());

  return value ? value.trim() : fallback;
};

const formatDate = (value, lang, fallback) => {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat(LOCALES[lang] || LOCALES.kz, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export default function DashboardBuilderPage() {
  const { user, lang } = useApp();
  const copy = dashboardBuilderCopy[lang] || dashboardBuilderCopy.kz;
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState({
    projects: 0,
    skills: 0,
    experience: 0,
    education: 0,
    certificates: 0,
    blog: 0,
    contacts: 0,
  });
  const [blogPosts, setBlogPosts] = useState([]);
  const [contacts, setContacts] = useState([]);

  const loadDashboard = async () => {
    const responses = await Promise.all([
      api.get('/me/settings'),
      api.get('/me/profile'),
      api.get('/me/projects'),
      api.get('/me/skills'),
      api.get('/me/experience'),
      api.get('/me/education'),
      api.get('/me/certificates'),
      api.get('/me/blog'),
      api.get('/me/contacts?limit=5'),
    ]);

    const [
      settingsRes,
      profileRes,
      projectsRes,
      skillsRes,
      experienceRes,
      educationRes,
      certificatesRes,
      blogRes,
      contactsRes,
    ] = responses;

    setSettings(settingsRes.data.data);
    setProfile(profileRes.data.data);
    setBlogPosts(blogRes.data.data || []);
    setContacts(contactsRes.data.data || []);
    setSummary({
      projects: projectsRes.data.data?.length || 0,
      skills: skillsRes.data.data?.length || 0,
      experience: experienceRes.data.data?.length || 0,
      education: educationRes.data.data?.length || 0,
      certificates: certificatesRes.data.data?.length || 0,
      blog: blogRes.data.data?.length || 0,
      contacts: contactsRes.data.total || contactsRes.data.data?.length || 0,
    });
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await loadDashboard();
      } catch (error) {
        if (mounted) {
          toast.error(error.response?.data?.message || copy.notifications.loadError);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [copy.notifications.loadError]);

  const publicHandle = settings?.portfolio_slug || user?.username;
  const publicPath = publicHandle ? `/u/${publicHandle}` : '/u';
  const publicUrl = `${window.location.origin}${publicPath}`;
  const onboardingProgress = Number(settings?.onboarding_step || 1);
  const completion = Math.round((onboardingProgress / 9) * 100);
  const totalSteps = 9;
  const themeLabel = settings?.primary_color === 'custom'
    ? settings?.primary_color_hex || copy.themeNames.custom
    : copy.themeNames[settings?.primary_color] || settings?.primary_color || copy.themeNames.blue;
  const themeSwatch = settings?.primary_color_hex || 'var(--color-primary)';
  const publishStateLabel = settings?.is_published ? copy.hero.published : copy.hero.draft;

  const moduleMap = useMemo(() => ([
    {
      label: copy.modules.identity,
      value: profile?.full_name ? copy.modules.identityReady : copy.modules.identityNeed,
      note: profile?.profession || copy.modules.identityNote,
      icon: User,
    },
    {
      label: copy.modules.projects,
      value: copy.modules.projectsValue(summary.projects),
      note: summary.projects ? copy.modules.projectsReady : copy.modules.projectsEmpty,
      icon: FolderOpen,
    },
    {
      label: copy.modules.writing,
      value: copy.modules.writingValue(summary.blog),
      note: summary.blog ? copy.modules.writingReady : copy.modules.writingEmpty,
      icon: Sparkles,
    },
    {
      label: copy.modules.inbox,
      value: copy.modules.inboxValue(summary.contacts),
      note: summary.contacts ? copy.modules.inboxReady : copy.modules.inboxEmpty,
      icon: Mail,
    },
    {
      label: copy.modules.theme,
      value: themeLabel,
      note: copy.modules.themeNote,
      icon: Palette,
    },
    {
      label: copy.modules.publishing,
      value: publishStateLabel,
      note: settings?.is_published ? copy.modules.publishingReady : copy.modules.publishingEmpty,
      icon: CheckCircle,
    },
  ]), [copy, profile, publishStateLabel, settings?.is_published, summary, themeLabel]);

  const readinessChecks = useMemo(() => ([
    {
      label: copy.readiness.authored,
      done: Boolean(profile?.full_name && profile?.profession && profile?.intro_kz),
      note: copy.readiness.authoredNote,
    },
    {
      label: copy.readiness.story,
      done: summary.projects > 0,
      note: copy.readiness.storyNote,
    },
    {
      label: copy.readiness.support,
      done: summary.skills > 0 && summary.experience > 0,
      note: copy.readiness.supportNote,
    },
    {
      label: copy.readiness.publish,
      done: Boolean(settings?.is_published),
      note: copy.readiness.publishNote,
    },
  ]), [copy, profile, settings?.is_published, summary]);

  const headlineStats = useMemo(() => ([
    {
      label: copy.stats.coverage,
      value: `${completion}%`,
      note: copy.stats.coverageNote(onboardingProgress, totalSteps),
    },
    {
      label: copy.stats.body,
      value: `${summary.projects + summary.blog}`,
      note: copy.stats.bodyNote,
    },
    {
      label: copy.stats.proof,
      value: `${summary.skills + summary.experience + summary.education}`,
      note: copy.stats.proofNote,
    },
    {
      label: copy.stats.mode,
      value: publishStateLabel,
      note: settings?.is_published ? copy.stats.modeLive : copy.stats.modeDraft,
    },
  ]), [completion, copy, onboardingProgress, publishStateLabel, settings?.is_published, summary]);

  const nextIncomplete = readinessChecks.find((item) => !item.done);

  const updateContactStatus = async (id, status) => {
    try {
      const response = await api.put(`/me/contacts/${id}/status`, { status });
      setContacts((current) => current.map((item) => (
        item.id === id ? response.data.data : item
      )));
      toast.success(copy.notifications.contactUpdated);
    } catch (error) {
      toast.error(error.response?.data?.message || copy.notifications.contactUpdateError);
    }
  };

  if (loading) {
    return (
      <div className="studio-shell">
        <div
          className="container-app studio-frame"
          style={{ minHeight: '60vh', justifyContent: 'center', alignItems: 'center' }}
        >
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="studio-shell">
      <div className="container-app studio-frame">
        <section className="dashboard-builder__hero">
          <div className="studio-card studio-card--paper">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div className="studio-eyebrow">{copy.hero.eyebrow}</div>
              <LanguageSwitcher compact label={copy.hero.languageLabel} />
            </div>

            <h1 className="studio-display" style={{ marginTop: 12 }}>
              {profile?.full_name || user?.username} {copy.hero.titleLead} <em>{copy.hero.titleEmphasis}</em> {copy.hero.titleTail}
            </h1>
            <p className="studio-lede">{copy.hero.description}</p>

            <div className="studio-chip-row">
              <span className="studio-chip">
                <User size={14} />
                {user?.role}
              </span>
              <span className="studio-chip">
                <CheckCircle size={14} />
                {publishStateLabel}
              </span>
              <span className="studio-chip">
                <Palette size={14} />
                {themeLabel}
              </span>
            </div>

            <div className="studio-action-row">
              <Link className="btn btn-primary" to={publicPath} style={{ textDecoration: 'none' }}>
                <Eye size={16} />
                {copy.hero.preview}
              </Link>
              <Link className="btn btn-secondary" to="/dashboard/onboarding" style={{ textDecoration: 'none' }}>
                <LayoutDashboard size={16} />
                {copy.hero.onboarding}
              </Link>
            </div>
          </div>

          <div className="dashboard-builder__side">
            <div className="studio-card studio-card--ink">
              <div className="studio-eyebrow">{copy.side.publicRoute}</div>
              <div className="dashboard-builder__url">{publicUrl}</div>
              <div className="studio-divider" />

              <div className="studio-meta-grid" style={{ marginTop: 0 }}>
                <div className="studio-meta">
                  <div className="studio-meta__label">{copy.side.completion}</div>
                  <div className="studio-meta__value">{completion}%</div>
                </div>
                <div className="studio-meta">
                  <div className="studio-meta__label">{copy.side.handle}</div>
                  <div className="studio-meta__value">/{publicHandle}</div>
                </div>
              </div>

              <div className="studio-progress" style={{ marginTop: 18 }}>
                <div className="studio-progress__fill" style={{ width: `${completion}%` }} />
              </div>
            </div>

            <div className="studio-card">
              <div className="studio-eyebrow">{copy.side.nextMove}</div>
              <h2 style={{ marginTop: 10, fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.04em' }}>
                {nextIncomplete ? nextIncomplete.label : copy.side.nextFallbackTitle}
              </h2>
              <p style={{ marginTop: 10, color: 'var(--color-text-2)', lineHeight: 1.8 }}>
                {nextIncomplete ? nextIncomplete.note : copy.side.nextFallbackNote}
              </p>
              <div className="studio-action-row">
                <Link className="btn btn-ghost" to="/dashboard/onboarding" style={{ textDecoration: 'none' }}>
                  <Settings size={16} />
                  {copy.side.openFlow}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-builder__metric-grid">
          {headlineStats.map((item) => (
            <div key={item.label} className="dashboard-builder__metric">
              <div className="dashboard-builder__metric-label">{item.label}</div>
              <div className="dashboard-builder__metric-value">{item.value}</div>
              <div className="dashboard-builder__metric-note">{item.note}</div>
            </div>
          ))}
        </section>

        <section className="dashboard-builder__columns">
          <div className="studio-card">
            <div className="studio-eyebrow">{copy.modules.eyebrow}</div>
            <h2 style={{ marginTop: 10, fontSize: '1.55rem', fontWeight: 800, letterSpacing: '-0.04em' }}>
              {copy.modules.title}
            </h2>
            <p style={{ marginTop: 10, color: 'var(--color-text-2)', lineHeight: 1.8 }}>
              {copy.modules.description}
            </p>

            <div className="dashboard-builder__module-grid">
              {moduleMap.map(({ label, value, note, icon: ModuleIcon }) => (
                <div key={label} className="dashboard-builder__module">
                  <div className="dashboard-builder__module-icon">
                    <ModuleIcon size={18} />
                  </div>
                  <div>
                    <div className="dashboard-builder__module-label">{label}</div>
                    <div className="dashboard-builder__module-value">{value}</div>
                    <div className="dashboard-builder__module-note">{note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-builder__aside">
            <div className="studio-card">
              <div className="studio-eyebrow">{copy.readiness.eyebrow}</div>
              <h2 style={{ marginTop: 10, fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.04em' }}>
                {copy.readiness.title}
              </h2>

              <div className="dashboard-builder__checklist">
                {readinessChecks.map((item) => (
                  <div key={item.label} className={`dashboard-builder__check${item.done ? ' is-done' : ''}`}>
                    <div className="dashboard-builder__check-mark">
                      <CheckCircle size={16} />
                    </div>
                    <div>
                      <div className="dashboard-builder__check-title">{item.label}</div>
                      <div className="dashboard-builder__check-note">{item.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="studio-card studio-card--paper">
              <div className="studio-eyebrow">{copy.studio.eyebrow}</div>
              <div className="studio-note-list">
                <div className="studio-note-list__item">
                  <div className="studio-note-list__title">{copy.studio.composition}</div>
                  <div className="studio-note-list__body">{copy.studio.compositionNote}</div>
                </div>
                <div className="studio-note-list__item">
                  <div className="studio-note-list__title">{copy.studio.tone}</div>
                  <div className="studio-note-list__body">{copy.studio.toneNote}</div>
                </div>
                <div className="studio-note-list__item">
                  <div className="studio-note-list__title">{copy.studio.theme}</div>
                  <div className="studio-note-list__body" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="dashboard-builder__swatch" style={{ background: themeSwatch }} />
                    {copy.studio.themeNote}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-builder__feed">
          <div className="studio-card">
            <div className="studio-eyebrow">{copy.feed.writingEyebrow}</div>
            <h2 style={{ marginTop: 10, fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.04em' }}>
              {copy.feed.writingTitle}
            </h2>

            <div className="dashboard-builder__list">
              {blogPosts.slice(0, 4).length ? blogPosts.slice(0, 4).map((post) => (
                <div key={post.id} className="dashboard-builder__entry">
                  <div className="dashboard-builder__entry-head">
                    <div className="dashboard-builder__entry-title">
                      {getLocalizedField(post, 'title', lang, copy.feed.untitled)}
                    </div>
                    <span className={`badge ${post.is_published ? 'badge-success' : 'badge-neutral'}`}>
                      {post.is_published ? copy.hero.published : copy.hero.draft}
                    </span>
                  </div>

                  <div className="dashboard-builder__entry-meta">
                    <span>{copy.feed.slug}: {post.slug}</span>
                    <span>{copy.feed.date}: {formatDate(post.published_at, lang, copy.noDate)}</span>
                    <span>{copy.feed.views}: {post.views || 0}</span>
                  </div>
                </div>
              )) : (
                <div className="dashboard-builder__empty">{copy.feed.emptyWriting}</div>
              )}
            </div>
          </div>

          <div className="studio-card">
            <div className="studio-eyebrow">{copy.feed.inboxEyebrow}</div>
            <h2 style={{ marginTop: 10, fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.04em' }}>
              {copy.feed.inboxTitle}
            </h2>

            <div className="dashboard-builder__list">
              {contacts.length ? contacts.map((message) => {
                const colors = STATUS_COLORS[message.status] || STATUS_COLORS.new;
                const statusLabel = copy.statuses[message.status] || copy.statuses.new;

                return (
                  <div key={message.id} className="dashboard-builder__entry">
                    <div className="dashboard-builder__entry-head">
                      <div>
                        <div className="dashboard-builder__entry-title">{message.name}</div>
                        <div style={{ marginTop: 4, color: 'var(--color-text-3)', fontSize: '0.86rem' }}>
                          {message.email}
                        </div>
                      </div>
                      <span className="badge" style={{ background: colors.background, color: colors.color }}>
                        {statusLabel}
                      </span>
                    </div>

                    <div className="dashboard-builder__entry-copy">
                      {message.subject || copy.feed.noSubject}
                    </div>
                    <div style={{ marginTop: 6, color: 'var(--color-text-3)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                      {message.message}
                    </div>

                    <div className="dashboard-builder__message-actions">
                      {['read', 'replied', 'archived'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => updateContactStatus(message.id, status)}
                        >
                          {copy.statuses[status]}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              }) : (
                <div className="dashboard-builder__empty">{copy.feed.emptyInbox}</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
