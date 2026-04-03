import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { Search, ExternalLink, Github, Star, Filter, SlidersHorizontal, Code2, Eye } from 'heroicons';
import api from '../services/api.js';

const CATEGORIES = [
  { value: 'Web', labels: { kz: 'Веб', ru: 'Веб', en: 'Web' } },
  { value: 'Mobile', labels: { kz: 'Мобильді', ru: 'Мобильные', en: 'Mobile' } },
  { value: 'API', labels: { kz: 'API', ru: 'API', en: 'API' } },
  { value: 'Design', labels: { kz: 'Дизайн', ru: 'Дизайн', en: 'Design' } },
  { value: 'Other', labels: { kz: 'Басқа', ru: 'Другое', en: 'Other' } },
];

function ProjectCard({ project, lang, t }) {
  const title = project[`title_${lang}`] || project.title_en;
  const desc = project[`description_${lang}`] || project.description_en;

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Cover */}
      <div style={{
        height: 200, background: 'linear-gradient(135deg, rgba(37,99,235,0.06), rgba(14,165,233,0.04))',
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {project.cover_image ? (
          <img src={project.cover_image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Code2 size={56} style={{ color: 'var(--color-primary)', opacity: 0.2 }} />
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)',
          opacity: 0, transition: 'opacity 0.3s',
        }}
          className="project-overlay"
        />
        {project.is_featured && (
          <div style={{ position: 'absolute', top: 10, left: 10 }}>
            <span className="badge badge-primary"><Star size={10} /> {t('common.featured')}</span>
          </div>
        )}
        {project.category && (
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <span className="badge badge-neutral">{project.category}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>{title}</h3>
        <p style={{
          color: 'var(--color-text-3)', fontSize: '0.875rem', lineHeight: 1.65, marginBottom: '1rem',
          flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {desc}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1.25rem' }}>
          {(project.tech_stack || []).slice(0, 5).map(t => (
            <span key={t} className="tech-tag">{t}</span>
          ))}
          {(project.tech_stack || []).length > 5 && (
            <span className="tech-tag">+{project.tech_stack.length - 5}</span>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to={`/projects/${project.slug}`} className="btn btn-primary btn-sm">
              <Eye size={13} /> {t('projects.details')}
            </Link>
            {project.demo_url && (
              <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                <ExternalLink size={13} /> {t('projects.demo')}
              </a>
            )}
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                <Github size={13} />
              </a>
            )}
          </div>
          <span style={{ color: 'var(--color-text-3)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Eye size={12} /> {project.views}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { t, lang } = useApp();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [featured, setFeatured] = useState(false);
  const [sort, setSort] = useState('sort_order');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, limit: 9, lang,
        ...(search && { search }),
        ...(category && { category }),
        ...(featured && { featured: 'true' }),
        sort,
      });
      const { data } = await api.get(`/projects?${params}`);
      setProjects(data.data);
      setPagination(data.pagination);
    } catch {}
    setLoading(false);
  }, [page, search, category, featured, sort, lang]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);
  useEffect(() => { setPage(1); }, [search, category, featured, sort]);

  return (
    <div className="page-enter">
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '3rem 0 2.5rem' }}>
        <div className="container-app">
          <div className="section-label"><Code2 size={12} /> {t('projects.title')}</div>
          <h1 className="section-title">{t('projects.subtitle')}</h1>
          <p style={{ color: 'var(--color-text-3)', marginTop: '0.75rem', fontSize: '1.05rem' }}>
            {t('projects.intro')}
          </p>
        </div>
      </div>

      <div className="container-app" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        {/* Filters */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem',
          padding: '1.25rem',
          background: 'var(--color-surface)',
          borderRadius: 16, border: '1px solid var(--color-border)',
        }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-3)' }} />
            <input
              className="input-field"
              placeholder={t('blog.search')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 40 }}
            />
          </div>

          <select
            className="input-field"
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{ flex: '0 1 150px' }}
          >
            <option value="">{t('projects.all')}</option>
            {CATEGORIES.map((categoryItem) => (
              <option key={categoryItem.value} value={categoryItem.value}>
                {categoryItem.labels[lang] || categoryItem.value}
              </option>
            ))}
          </select>

          <select
            className="input-field"
            value={sort}
            onChange={e => setSort(e.target.value)}
            style={{ flex: '0 1 160px' }}
          >
            <option value="sort_order">{t('projects.default_sort')}</option>
            <option value="created_at">{t('projects.newest')}</option>
            <option value="views">{t('projects.most_viewed')}</option>
          </select>

          <button
            onClick={() => setFeatured(f => !f)}
            className={`btn btn-sm ${featured ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Star size={14} /> {t('projects.featured')}
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="spinner" />
          </div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--color-text-3)' }}>
            <Code2 size={60} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{t('projects.no_projects')}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {projects.map(p => <ProjectCard key={p.id} project={p} lang={lang} t={t} />)}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '2.5rem' }}>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`btn btn-sm ${page === p ? 'btn-primary' : 'btn-secondary'}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
