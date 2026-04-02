import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Edit2,
  ExternalLink,
  Eye,
  EyeOff,
  FolderOpen,
  Github,
  Plus,
  Search,
  Star,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../../context/AppContext.jsx';
import { getAdminText } from '../../i18n/adminCopy.js';
import api from '../../services/api.js';
import { formatDate } from '../../utils/format.js';
import {
  AdminEmptyState,
  AdminFilterTabs,
  AdminModal,
  AdminPageHeader,
  AdminSearchField,
  AdminStatusBadge,
  AdminToolbar,
  AdminToolbarGroup,
} from '../../components/admin/AdminUI.jsx';

function getLocalizedAdminField(item, field, lang, fallback = '') {
  const order = lang === 'ru' ? ['ru', 'kz', 'en'] : lang === 'en' ? ['en', 'ru', 'kz'] : ['kz', 'ru', 'en'];

  for (const suffix of order) {
    const value = item?.[`${field}_${suffix}`];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return fallback;
}

function ProjectForm({ project, onSave, onClose }) {
  const { t, lang } = useApp();
  const tx = useMemo(() => getAdminText(lang), [lang]);
  const [form, setForm] = useState({
    title_en: '',
    title_ru: '',
    title_kz: '',
    description_en: '',
    description_ru: '',
    description_kz: '',
    content_en: '',
    content_ru: '',
    content_kz: '',
    tech_stack: '',
    category: '',
    status: 'completed',
    demo_url: '',
    github_url: '',
    is_featured: false,
    is_published: true,
    sort_order: 0,
    ...(project ? {
      title_en: project.title_en || '',
      title_ru: project.title_ru || '',
      title_kz: project.title_kz || '',
      description_en: project.description_en || '',
      description_ru: project.description_ru || '',
      description_kz: project.description_kz || '',
      content_en: project.content_en || '',
      content_ru: project.content_ru || '',
      content_kz: project.content_kz || '',
      tech_stack: (project.tech_stack || []).join(', '),
      category: project.category || '',
      status: project.status || 'completed',
      demo_url: project.demo_url || '',
      github_url: project.github_url || '',
      is_featured: project.is_featured || false,
      is_published: project.is_published !== false,
      sort_order: project.sort_order || 0,
    } : {}),
  });
  const [loading, setLoading] = useState(false);

  const formId = project ? `project-form-${project.id}` : 'project-form-new';

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title_en.trim()) {
      toast.error(tx('English project title is required'));
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key === 'tech_stack') {
          formData.append(
            key,
            JSON.stringify(
              value
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean),
            ),
          );
          return;
        }

        formData.append(key, String(value));
      });

      if (project) {
        await api.put(`/projects/${project.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success(tx('Project updated'));
      } else {
        await api.post('/projects', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success(tx('Project created'));
      }

      onSave();
    } catch (error) {
      toast.error(error.response?.data?.message || tx('Failed to save project'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminModal
      title={project ? tx('Edit project') : tx('New project')}
      description={tx('Define metadata, public copy, links, and publishing state in one place.')}
      onClose={onClose}
      width="920px"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {t('dashboard.cancel')}
          </button>
          <button type="submit" form={formId} className="btn btn-primary" disabled={loading}>
            {loading ? tx('Saving...') : tx('Save project')}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="admin-form-layout">
        <section className="admin-form-section">
          <div className="admin-form-section__header">
            <h3 className="admin-form-section__title">{tx('Identity')}</h3>
            <p className="admin-form-section__description">
              {tx('Basic naming and categorization that appears throughout the admin and public portfolio.')}
            </p>
          </div>

          <div className="admin-form-grid admin-form-grid--2">
            {[
              ['title_en', tx('Title (EN) *'), tx('Project name')],
              ['title_ru', tx('Title (RU)'), tx('Russian title')],
              ['title_kz', tx('Title (KZ)'), tx('Kazakh title')],
              ['category', tx('Category'), tx('Web app / Mobile / API')],
            ].map(([name, label, placeholder]) => (
              <div key={name} className="form-group">
                <label className="input-label">{label}</label>
                <input
                  name={name}
                  className="input-field"
                  placeholder={placeholder}
                  value={form[name]}
                  onChange={handleChange}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="admin-form-section">
          <div className="admin-form-section__header">
            <h3 className="admin-form-section__title">{tx('Portfolio copy')}</h3>
            <p className="admin-form-section__description">
              {tx('Add concise summaries for list views and long-form content for the project detail page.')}
            </p>
          </div>

          <div className="admin-form-grid admin-form-grid--3">
            <div className="form-group">
              <label className="input-label">{tx('Summary (EN)')}</label>
              <textarea
                name="description_en"
                className="input-field"
                rows={3}
                value={form.description_en}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="input-label">{tx('Summary (RU)')}</label>
              <textarea
                name="description_ru"
                className="input-field"
                rows={3}
                value={form.description_ru}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="input-label">{tx('Summary (KZ)')}</label>
              <textarea
                name="description_kz"
                className="input-field"
                rows={3}
                value={form.description_kz}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">{tx('Content (EN)')}</label>
            <textarea
              name="content_en"
              className="input-field"
              rows={7}
              value={form.content_en}
              onChange={handleChange}
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            />
          </div>

          <div className="form-group">
            <label className="input-label">{tx('Content (RU)')}</label>
            <textarea
              name="content_ru"
              className="input-field"
              rows={5}
              value={form.content_ru}
              onChange={handleChange}
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            />
          </div>

          <div className="form-group">
            <label className="input-label">{tx('Content (KZ)')}</label>
            <textarea
              name="content_kz"
              className="input-field"
              rows={5}
              value={form.content_kz}
              onChange={handleChange}
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            />
          </div>
        </section>

        <section className="admin-form-section">
          <div className="admin-form-section__header">
            <h3 className="admin-form-section__title">{tx('Links and publishing')}</h3>
            <p className="admin-form-section__description">
              {tx('Keep outbound links clean and decide how prominently the project should surface.')}
            </p>
          </div>

          <div className="admin-form-grid admin-form-grid--2">
            <div className="form-group">
              <label className="input-label">{tx('Tech stack')}</label>
              <input
                name="tech_stack"
                className="input-field"
                placeholder="React, Node.js, PostgreSQL"
                value={form.tech_stack}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="input-label">{tx('Status')}</label>
              <select
                name="status"
                className="input-field"
                value={form.status}
                onChange={handleChange}
              >
                <option value="completed">{t('projects.status_completed')}</option>
                <option value="in_progress">{t('projects.status_in_progress')}</option>
                <option value="archived">{t('projects.status_archived')}</option>
              </select>
            </div>
          </div>

          <div className="admin-form-grid admin-form-grid--3">
            <div className="form-group">
              <label className="input-label">{tx('Demo URL')}</label>
              <input
                name="demo_url"
                className="input-field"
                placeholder="https://demo.example.com"
                value={form.demo_url}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="input-label">{tx('GitHub URL')}</label>
              <input
                name="github_url"
                className="input-field"
                placeholder="https://github.com/org/repo"
                value={form.github_url}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="input-label">{tx('Sort order')}</label>
              <input
                name="sort_order"
                type="number"
                className="input-field"
                value={form.sort_order}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="admin-form-grid admin-form-grid--2">
            <label className="admin-checkbox">
              <input
                type="checkbox"
                name="is_featured"
                checked={form.is_featured}
                onChange={handleChange}
              />
              <span>
                <span className="admin-checkbox__label">{tx('Feature on the portfolio')}</span>
                <span className="admin-checkbox__description">
                  {tx('Featured projects get higher prominence on public landing sections.')}
                </span>
              </span>
            </label>

            <label className="admin-checkbox">
              <input
                type="checkbox"
                name="is_published"
                checked={form.is_published}
                onChange={handleChange}
              />
              <span>
                <span className="admin-checkbox__label">{tx('Publish publicly')}</span>
                <span className="admin-checkbox__description">
                  {tx("Draft items stay in the admin only and won't be visible on the site.")}
                </span>
              </span>
            </label>
          </div>
        </section>
      </form>
    </AdminModal>
  );
}

function statusTone(status) {
  if (status === 'completed') return 'green';
  if (status === 'in_progress') return 'amber';
  return 'neutral';
}

export default function AdminProjectsPage() {
  const { t, lang } = useApp();
  const tx = useMemo(() => getAdminText(lang), [lang]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editProject, setEditProject] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);

    try {
      const { data } = await api.get('/projects?limit=100');
      setProjects(data.data || []);
    } catch {
      toast.error(tx('Failed to load projects'));
    } finally {
      setLoading(false);
    }
  }, [tx]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = projects.filter((project) => {
    const haystack = [
      project.title_en,
      project.title_ru,
      project.title_kz,
      project.category,
      project.description_en,
      project.description_ru,
      project.description_kz,
      ...(project.tech_stack || []),
    ]
      .join(' ')
      .toLowerCase();

    const matchesSearch = !search.trim() || haystack.includes(search.trim().toLowerCase());

    const matchesFilter = (() => {
      if (filter === 'published') return project.is_published;
      if (filter === 'draft') return !project.is_published;
      if (filter === 'featured') return project.is_featured;
      return true;
    })();

    return matchesSearch && matchesFilter;
  });

  const counts = {
    all: projects.length,
    published: projects.filter((project) => project.is_published).length,
    draft: projects.filter((project) => !project.is_published).length,
    featured: projects.filter((project) => project.is_featured).length,
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`${tx('Delete project')}: "${title}"?`)) return;

    try {
      await api.delete(`/projects/${id}`);
      toast.success(tx('Project deleted'));
      fetchProjects();
    } catch {
      toast.error(tx('Failed to delete project'));
    }
  };

  const handleToggle = async (project, field) => {
    try {
      const formData = new FormData();
      formData.append(field, String(!project[field]));

      await api.put(`/projects/${project.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      fetchProjects();
    } catch {
      toast.error(tx('Failed to update project state'));
    }
  };

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <AdminPageHeader
        eyebrow={tx('Portfolio inventory')}
        title={t('dashboard.projects')}
        description={tx('A single operating surface for every project entry, from draft status to featured placement.')}
        meta={[
          `${projects.length} ${tx('total records')}`,
          `${counts.published} ${tx('published count')}`,
          `${counts.featured} ${tx('featured count')}`,
        ]}
        actions={(
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setEditProject(null);
              setShowForm(true);
            }}
          >
            <Plus size={15} />
            {tx('Add project')}
          </button>
        )}
      />

      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h3 className="admin-panel__title">{tx('Project library')}</h3>
            <p className="admin-panel__description">
              {tx('Search, review visibility, and keep featured work curated without leaving the table.')}
            </p>
          </div>
        </div>

        <AdminToolbar>
          <AdminToolbarGroup style={{ flex: '1 1 280px' }}>
            <AdminSearchField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={tx('Search projects, categories, or tech stack')}
            />
          </AdminToolbarGroup>

          <AdminToolbarGroup>
            <AdminFilterTabs
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: t('projects.all'), count: counts.all },
                { value: 'published', label: t('common.published'), count: counts.published },
                { value: 'draft', label: tx('Drafts'), count: counts.draft },
                { value: 'featured', label: t('common.featured'), count: counts.featured },
              ]}
            />
          </AdminToolbarGroup>
        </AdminToolbar>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <div className="spinner" />
          </div>
        ) : filteredProjects.length ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{tx('Project')}</th>
                  <th>{tx('Category')}</th>
                  <th>{tx('Status')}</th>
                  <th>{tx('Visibility')}</th>
                  <th>{t('common.views')}</th>
                  <th>{tx('Updated')}</th>
                  <th>{tx('Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr key={project.id}>
                    <td style={{ minWidth: 320 }}>
                      <div className="admin-row-title">
                        <div className="admin-row-title__main">
                          {getLocalizedAdminField(project, 'title', lang, project.title_en)}
                        </div>
                        <div className="admin-row-title__sub">
                          {getLocalizedAdminField(project, 'description', lang, project.description_en) || tx('No summary added yet.')}
                        </div>
                        {project.tech_stack?.length > 0 && (
                          <div className="admin-row-meta">
                            {project.tech_stack.slice(0, 3).map((item) => (
                              <span key={item} className="badge badge-neutral">
                                {item}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{project.category || tx('Uncategorized')}</span>
                    </td>
                    <td>
                      <AdminStatusBadge tone={statusTone(project.status)}>
                        {project.status === 'completed'
                          ? t('projects.status_completed')
                          : project.status === 'in_progress'
                            ? t('projects.status_in_progress')
                            : t('projects.status_archived')}
                      </AdminStatusBadge>
                    </td>
                    <td>
                      <div className="admin-inline-actions">
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleToggle(project, 'is_published')}
                          title={project.is_published ? tx('Unpublish project') : tx('Publish project')}
                        >
                          {project.is_published ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleToggle(project, 'is_featured')}
                          title={project.is_featured ? tx('Remove from featured') : tx('Mark as featured')}
                        >
                          <Star
                            size={14}
                            fill={project.is_featured ? 'currentColor' : 'none'}
                            style={{ color: project.is_featured ? 'var(--admin-warning)' : 'currentColor' }}
                          />
                        </button>
                        <AdminStatusBadge tone={project.is_published ? 'green' : 'neutral'}>
                          {project.is_published ? tx('Public') : t('common.draft')}
                        </AdminStatusBadge>
                      </div>
                    </td>
                    <td>{project.views || 0}</td>
                    <td>{formatDate(project.created_at)}</td>
                    <td>
                      <div className="admin-inline-actions">
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => {
                            setEditProject(project);
                            setShowForm(true);
                          }}
                          title={tx('Edit project')}
                        >
                          <Edit2 size={14} />
                        </button>

                        {project.demo_url && (
                          <a
                            href={project.demo_url}
                            className="btn btn-ghost btn-sm"
                            title={tx('Open demo')}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}

                        {project.github_url && (
                          <a
                            href={project.github_url}
                            className="btn btn-ghost btn-sm"
                            title={tx('Open repository')}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Github size={14} />
                          </a>
                        )}

                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{
                            background: 'var(--admin-danger-soft)',
                            color: 'var(--admin-danger)',
                            border: '1px solid rgba(185, 28, 28, 0.14)',
                          }}
                          onClick={() => handleDelete(project.id, getLocalizedAdminField(project, 'title', lang, project.title_en))}
                          title={tx('Delete project')}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <AdminEmptyState
            icon={FolderOpen}
            title={tx('No projects match this view')}
            description={tx('Try a different filter or search phrase, or create a new project entry.')}
            action={(
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setEditProject(null);
                  setShowForm(true);
                }}
              >
                <Plus size={15} />
                {tx('Add project')}
              </button>
            )}
          />
        )}
      </section>

      {showForm && (
        <ProjectForm
          project={editProject}
          onSave={() => {
            setShowForm(false);
            fetchProjects();
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
