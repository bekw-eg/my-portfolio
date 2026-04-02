import { useCallback, useEffect, useState } from 'react';
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

function ProjectForm({ project, onSave, onClose }) {
  const [form, setForm] = useState({
    title_en: '',
    title_ru: '',
    title_kz: '',
    description_en: '',
    description_ru: '',
    content_en: '',
    content_ru: '',
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
      content_en: project.content_en || '',
      content_ru: project.content_ru || '',
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
      toast.error('English project title is required');
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
        toast.success('Project updated');
      } else {
        await api.post('/projects', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Project created');
      }

      onSave();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminModal
      title={project ? 'Edit project' : 'New project'}
      description="Define metadata, public copy, links, and publishing state in one place."
      onClose={onClose}
      width="920px"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form={formId} className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save project'}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="admin-form-layout">
        <section className="admin-form-section">
          <div className="admin-form-section__header">
            <h3 className="admin-form-section__title">Identity</h3>
            <p className="admin-form-section__description">
              Basic naming and categorization that appears throughout the admin and public portfolio.
            </p>
          </div>

          <div className="admin-form-grid admin-form-grid--2">
            {[
              ['title_en', 'Title (EN) *', 'Project name'],
              ['title_ru', 'Title (RU)', 'Russian title'],
              ['title_kz', 'Title (KZ)', 'Kazakh title'],
              ['category', 'Category', 'Web app / Mobile / API'],
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
            <h3 className="admin-form-section__title">Portfolio copy</h3>
            <p className="admin-form-section__description">
              Add concise summaries for list views and long-form content for the project detail page.
            </p>
          </div>

          <div className="admin-form-grid admin-form-grid--2">
            <div className="form-group">
              <label className="input-label">Summary (EN)</label>
              <textarea
                name="description_en"
                className="input-field"
                rows={3}
                value={form.description_en}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="input-label">Summary (RU)</label>
              <textarea
                name="description_ru"
                className="input-field"
                rows={3}
                value={form.description_ru}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Content (EN)</label>
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
            <label className="input-label">Content (RU)</label>
            <textarea
              name="content_ru"
              className="input-field"
              rows={5}
              value={form.content_ru}
              onChange={handleChange}
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            />
          </div>
        </section>

        <section className="admin-form-section">
          <div className="admin-form-section__header">
            <h3 className="admin-form-section__title">Links and publishing</h3>
            <p className="admin-form-section__description">
              Keep outbound links clean and decide how prominently the project should surface.
            </p>
          </div>

          <div className="admin-form-grid admin-form-grid--2">
            <div className="form-group">
              <label className="input-label">Tech stack</label>
              <input
                name="tech_stack"
                className="input-field"
                placeholder="React, Node.js, PostgreSQL"
                value={form.tech_stack}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="input-label">Status</label>
              <select
                name="status"
                className="input-field"
                value={form.status}
                onChange={handleChange}
              >
                <option value="completed">Completed</option>
                <option value="in_progress">In progress</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="admin-form-grid admin-form-grid--3">
            <div className="form-group">
              <label className="input-label">Demo URL</label>
              <input
                name="demo_url"
                className="input-field"
                placeholder="https://demo.example.com"
                value={form.demo_url}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="input-label">GitHub URL</label>
              <input
                name="github_url"
                className="input-field"
                placeholder="https://github.com/org/repo"
                value={form.github_url}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="input-label">Sort order</label>
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
                <span className="admin-checkbox__label">Feature on the portfolio</span>
                <span className="admin-checkbox__description">
                  Featured projects get higher prominence on public landing sections.
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
                <span className="admin-checkbox__label">Publish publicly</span>
                <span className="admin-checkbox__description">
                  Draft items stay in the admin only and won’t be visible on the site.
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
  const { t } = useApp();
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
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = projects.filter((project) => {
    const haystack = [
      project.title_en,
      project.category,
      project.description_en,
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
    if (!confirm(`Delete "${title}"?`)) return;

    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      fetchProjects();
    } catch {
      toast.error('Failed to delete project');
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
      toast.error('Failed to update project state');
    }
  };

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <AdminPageHeader
        eyebrow="Portfolio inventory"
        title={t('dashboard.projects')}
        description="A single operating surface for every project entry, from draft status to featured placement."
        meta={[
          `${projects.length} total records`,
          `${counts.published} published`,
          `${counts.featured} featured`,
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
            {t('dashboard.add_new')}
          </button>
        )}
      />

      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h3 className="admin-panel__title">Project library</h3>
            <p className="admin-panel__description">
              Search, review visibility, and keep featured work curated without leaving the table.
            </p>
          </div>
        </div>

        <AdminToolbar>
          <AdminToolbarGroup style={{ flex: '1 1 280px' }}>
            <AdminSearchField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search projects, categories, or tech stack"
            />
          </AdminToolbarGroup>

          <AdminToolbarGroup>
            <AdminFilterTabs
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: 'All', count: counts.all },
                { value: 'published', label: 'Published', count: counts.published },
                { value: 'draft', label: 'Drafts', count: counts.draft },
                { value: 'featured', label: 'Featured', count: counts.featured },
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
                  <th>Project</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Visibility</th>
                  <th>Views</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr key={project.id}>
                    <td style={{ minWidth: 320 }}>
                      <div className="admin-row-title">
                        <div className="admin-row-title__main">{project.title_en}</div>
                        <div className="admin-row-title__sub">
                          {project.description_en || 'No summary added yet.'}
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
                      <span className="badge badge-neutral">{project.category || 'Uncategorized'}</span>
                    </td>
                    <td>
                      <AdminStatusBadge tone={statusTone(project.status)}>
                        {project.status === 'in_progress' ? 'In progress' : project.status}
                      </AdminStatusBadge>
                    </td>
                    <td>
                      <div className="admin-inline-actions">
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleToggle(project, 'is_published')}
                          title={project.is_published ? 'Unpublish project' : 'Publish project'}
                        >
                          {project.is_published ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleToggle(project, 'is_featured')}
                          title={project.is_featured ? 'Remove from featured' : 'Mark as featured'}
                        >
                          <Star
                            size={14}
                            fill={project.is_featured ? 'currentColor' : 'none'}
                            style={{ color: project.is_featured ? 'var(--admin-warning)' : 'currentColor' }}
                          />
                        </button>
                        <AdminStatusBadge tone={project.is_published ? 'green' : 'neutral'}>
                          {project.is_published ? 'Public' : 'Draft'}
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
                          title="Edit project"
                        >
                          <Edit2 size={14} />
                        </button>

                        {project.demo_url && (
                          <a
                            href={project.demo_url}
                            className="btn btn-ghost btn-sm"
                            title="Open demo"
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
                            title="Open repository"
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
                          onClick={() => handleDelete(project.id, project.title_en)}
                          title="Delete project"
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
            title="No projects match this view"
            description="Try a different filter or search phrase, or create a new project entry."
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
                Add project
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
