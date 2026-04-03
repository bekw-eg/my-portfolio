import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  BarChart2,
  BookOpen,
  Eye,
  FolderOpen,
  Mail,
  TrendingUp,
} from 'heroicons';
import { useApp } from '../../context/AppContext.jsx';
import { getAdminText } from '../../i18n/adminCopy.js';
import api from '../../services/api.js';
import {
  AdminMetricCard,
  AdminPageHeader,
  AdminPanel,
  AdminStatusBadge,
} from '../../components/admin/AdminUI.jsx';

function RankingPanel({ panel, description, items, to, icon: Icon }) {
  return (
    <AdminPanel
      title={panel.text}
      description={description}
      action={
        <Link to={to} className="admin-ghost-link">
          {panel.openLabel}
          <ArrowUpRight size={14} />
        </Link>
      }
    >
      {items?.length ? (
        <div className="admin-summary-list">
          {items.map((item, index) => (
            <div key={item.id || `${panel.text}-${index}`} className="admin-summary-row">
              <div style={{ display: 'flex', gap: '0.85rem', minWidth: 0 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: index === 0 ? 'var(--admin-accent-soft)' : 'var(--admin-panel-alt)',
                    color: index === 0 ? 'var(--admin-accent)' : 'var(--admin-text-faint)',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </div>
                <div className="admin-row-title" style={{ minWidth: 0 }}>
                  <div className="admin-row-title__main">{item.title_en}</div>
                  <div className="admin-row-title__sub">
                    <Icon size={13} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />
                    {panel.itemLabel}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <AdminStatusBadge tone="blue">{item.views} {panel.viewsLabel}</AdminStatusBadge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-empty-state" style={{ padding: '2rem 0 0.5rem' }}>
          <div className="admin-empty-state__title">{panel.emptyTitle}</div>
          <p className="admin-empty-state__description">
            {panel.emptyDescription}
          </p>
        </div>
      )}
    </AdminPanel>
  );
}

export default function DashboardPage() {
  const { t, lang } = useApp();
  const tx = getAdminText(lang);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics')
      .then((response) => setAnalytics(response.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const views = Number.parseInt(analytics?.views || 0, 10);
  const projectsTotal = analytics?.projects?.total || 0;
  const projectsFeatured = analytics?.projects?.featured || 0;
  const postsTotal = analytics?.posts?.total || 0;
  const postsPublished = analytics?.posts?.published || 0;
  const messagesTotal = analytics?.contacts?.total || 0;
  const messagesNew = analytics?.contacts?.new || 0;

  const focusItems = [
    {
      label: tx('New inquiries'),
      value: `${messagesNew}`,
      description: messagesNew > 0
        ? tx('There are unread inbound requests waiting for triage.')
        : tx('Inbox is clear. No unanswered new inquiries right now.'),
      tone: messagesNew > 0 ? 'red' : 'neutral',
    },
    {
      label: tx('Draft posts'),
      value: `${Math.max(postsTotal - postsPublished, 0)}`,
      description: tx('Keep editorial work moving by publishing or pruning unfinished drafts.'),
      tone: postsTotal > postsPublished ? 'amber' : 'green',
    },
    {
      label: tx('Featured projects'),
      value: `${projectsFeatured}/${projectsTotal || 0}`,
      description: tx('Featured work drives the first impression on the public portfolio.'),
      tone: projectsFeatured > 0 ? 'blue' : 'neutral',
    },
  ];

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <AdminPageHeader
        eyebrow={tx('Control center')}
        title={t('dashboard.title')}
        description={tx('A compact overview of portfolio performance, editorial flow, and inbound activity.')}
        meta={[
          `${views.toLocaleString()} ${tx('views in the last 30 days')}`,
          `${messagesTotal} ${tx('contact records')}`,
          `${projectsTotal} ${tx('total projects')}`,
        ]}
      />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
          <div className="spinner" />
        </div>
      ) : (
        <>
          <div className="admin-metric-grid">
            <AdminMetricCard
              icon={Eye}
              label={t('dashboard.total_views')}
              value={views.toLocaleString()}
              detail={tx('Traffic for the current 30-day window.')}
              tone="blue"
            />
            <AdminMetricCard
              icon={FolderOpen}
              label={t('dashboard.total_projects')}
              value={projectsTotal}
              detail={`${projectsFeatured} ${tx('featured and visible on the public portfolio.')}`}
              tone="green"
            />
            <AdminMetricCard
              icon={BookOpen}
              label={t('dashboard.total_posts')}
              value={postsTotal}
              detail={`${postsPublished} ${tx('currently published.')}`}
              tone="amber"
            />
            <AdminMetricCard
              icon={Mail}
              label={t('dashboard.new_messages')}
              value={messagesNew}
              detail={`${messagesTotal} ${tx('total messages in the inbox.')}`}
              tone="red"
            />
          </div>

          <div className="admin-split-layout">
            <AdminPanel
              title={tx('Operational snapshot')}
              description={tx('Use this area as the morning pass across publishing, curation, and lead handling.')}
            >
              <div className="admin-note" style={{ marginBottom: '1rem' }}>
                <div className="admin-note__title">{tx('What matters right now')}</div>
                <p className="admin-note__text">
                  {tx('Keep the homepage sharp, keep the blog current, and respond to new messages before they go stale.')}
                </p>
              </div>

              <div className="admin-summary-list" style={{ marginBottom: '1.25rem' }}>
                <div className="admin-summary-row">
                  <div>
                    <div className="admin-summary-row__label">{tx('Publishing health')}</div>
                    <div className="admin-summary-row__value">{postsPublished} {tx('live posts')}</div>
                  </div>
                  <AdminStatusBadge tone={postsPublished > 0 ? 'green' : 'neutral'}>
                    {postsTotal - postsPublished > 0 ? `${postsTotal - postsPublished} ${tx('Drafts').toLowerCase()}` : tx('Up to date')}
                  </AdminStatusBadge>
                </div>

                <div className="admin-summary-row">
                  <div>
                    <div className="admin-summary-row__label">{tx('Portfolio curation')}</div>
                    <div className="admin-summary-row__value">{projectsFeatured} {tx('featured projects count')}</div>
                  </div>
                  <AdminStatusBadge tone={projectsFeatured > 0 ? 'blue' : 'neutral'}>
                    {projectsTotal > 0 ? `${projectsTotal - projectsFeatured} ${tx('standard entries')}` : tx('No projects yet')}
                  </AdminStatusBadge>
                </div>

                <div className="admin-summary-row">
                  <div>
                    <div className="admin-summary-row__label">{tx('Lead response queue')}</div>
                    <div className="admin-summary-row__value">{messagesNew} {tx('unread messages')}</div>
                  </div>
                  <AdminStatusBadge tone={messagesNew > 0 ? 'red' : 'green'}>
                    {messagesNew > 0 ? tx('Needs review') : tx('Inbox clear')}
                  </AdminStatusBadge>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                <Link to="/admin/projects" className="btn btn-primary">
                  <FolderOpen size={15} />
                  {tx('Review projects')}
                </Link>
                <Link to="/admin/blog" className="btn btn-secondary">
                  <BookOpen size={15} />
                  {tx('Open editorial queue')}
                </Link>
                <Link to="/admin/contacts" className="btn btn-secondary">
                  <Mail size={15} />
                  {tx('Check inbox')}
                </Link>
              </div>
            </AdminPanel>

            <AdminPanel
              title={tx('Focus list')}
              description={tx('Counts that usually deserve action before you close the admin tab.')}
            >
              <div className="admin-summary-list">
                {focusItems.map((item) => (
                  <div key={item.label} className="admin-summary-row">
                    <div style={{ minWidth: 0 }}>
                      <div className="admin-summary-row__value">{item.label}</div>
                      <div className="admin-summary-row__label" style={{ marginTop: 4 }}>
                        {item.description}
                      </div>
                    </div>
                    <AdminStatusBadge tone={item.tone}>{item.value}</AdminStatusBadge>
                  </div>
                ))}
              </div>
            </AdminPanel>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            <RankingPanel
              panel={{
                text: tx('Top projects'),
                openLabel: tx('Open'),
                itemLabel: tx('Top performing content'),
                viewsLabel: tx('views'),
                emptyTitle: tx('Nothing to rank yet'),
                emptyDescription: tx('Traffic insights will appear here as soon as visitors start interacting with content.'),
              }}
              description={tx('Most visited portfolio entries in the current reporting window.')}
              items={analytics?.topProjects}
              to="/admin/projects"
              icon={TrendingUp}
            />
            <RankingPanel
              panel={{
                text: tx('Top blog posts'),
                openLabel: tx('Open'),
                itemLabel: tx('Top performing content'),
                viewsLabel: tx('views'),
                emptyTitle: tx('Nothing to rank yet'),
                emptyDescription: tx('Traffic insights will appear here as soon as visitors start interacting with content.'),
              }}
              description={tx('Articles currently bringing the most attention.')}
              items={analytics?.topPosts}
              to="/admin/blog"
              icon={BarChart2}
            />
          </div>
        </>
      )}
    </div>
  );
}
