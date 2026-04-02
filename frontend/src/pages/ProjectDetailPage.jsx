import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { ArrowLeft, ExternalLink, Github, Eye, Star, Calendar, Code2 } from 'lucide-react';
import { formatDate } from '../utils/format.js';
import api from '../services/api.js';
import ReactMarkdown from 'react-markdown';

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const { t, lang } = useApp();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/projects/${slug}`)
      .then(r => setProject(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><div className="spinner" /></div>;

  if (!project) return (
    <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--color-text-3)' }}>
      <Code2 size={60} style={{ opacity: 0.2, marginBottom: '1rem' }} />
      <h2 style={{ marginBottom: '1rem' }}>{t('projects.project_not_found')}</h2>
      <Link to="/projects" className="btn btn-primary"><ArrowLeft size={16} /> {t('nav.projects')}</Link>
    </div>
  );

  const title = project[`title_${lang}`] || project.title_en;
  const description = project[`description_${lang}`] || project.description_en;
  const content = project[`content_${lang}`] || project.content_en;
  const statusLabel = project.status ? t(`projects.status_${project.status}`) : '';

  return (
    <div className="page-enter">
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '3rem 0' }}>
        <div className="container-app">
          <Link to="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-text-3)', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '1.5rem', transition: 'color 0.2s' }} className="hover:text-primary-500">
            <ArrowLeft size={16} /> {t('nav.projects')}
          </Link>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1rem' }}>
            {project.is_featured && <span className="badge badge-primary"><Star size={10} /> {t('common.featured')}</span>}
            {project.category && <span className="badge badge-neutral">{project.category}</span>}
            <span className={`badge ${project.status === 'completed' ? 'badge-success' : project.status === 'in_progress' ? 'badge-warning' : 'badge-neutral'}`}>
              {statusLabel || project.status}
            </span>
          </div>
          <h1 style={{ fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 3rem)', lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '1rem', color: 'var(--color-text)' }}>
            {title}
          </h1>
          <p style={{ color: 'var(--color-text-2)', fontSize: '1.1rem', lineHeight: 1.7, maxWidth: 700, marginBottom: '1.5rem' }}>
            {description}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            {project.demo_url && (
              <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <ExternalLink size={16} /> {t('projects.view_demo')}
              </a>
            )}
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                <Github size={16} /> {t('projects.view_code')}
              </a>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-3)', fontSize: '0.875rem' }}>
              <Eye size={14} /> {project.views} {t('common.views').toLowerCase()}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-3)', fontSize: '0.875rem' }}>
              <Calendar size={14} /> {formatDate(project.created_at, 'MMM yyyy')}
            </span>
          </div>
        </div>
      </div>

      {project.cover_image && (
        <div style={{ maxHeight: 480, overflow: 'hidden' }}>
          <img src={project.cover_image} alt={title} style={{ width: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      <div className="container-app" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(200px, 280px)', gap: '2.5rem', alignItems: 'start' }}>
          {/* Content */}
          <div style={{ color: 'var(--color-text-2)', lineHeight: 1.8, fontSize: '1rem' }}>
            <ReactMarkdown
              components={{
                h2: ({ children }) => <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.75rem', color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>{children}</h2>,
                h3: ({ children }) => <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>{children}</h3>,
                p: ({ children }) => <p style={{ marginBottom: '1.25rem' }}>{children}</p>,
                ul: ({ children }) => <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.25rem' }}>{children}</ul>,
                li: ({ children }) => <li style={{ marginBottom: '0.4rem' }}>{children}</li>,
                code: ({ inline, children }) => inline
                  ? <code style={{ background: 'var(--color-surface-2)', padding: '0.15rem 0.4rem', borderRadius: 6, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875em', color: 'var(--color-primary)' }}>{children}</code>
                  : <pre style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '1.25rem', overflowX: 'auto', marginBottom: '1.25rem' }}><code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem' }}>{children}</code></pre>,
              }}
            >
              {content || `*${t('projects.detailed_coming')}*`}
            </ReactMarkdown>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'sticky', top: 'calc(var(--nav-height) + 1.5rem)' }}>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-text-3)', marginBottom: '1rem' }}>{t('projects.tech_stack')}</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {(project.tech_stack || []).map(t => (
                  <span key={t} className="tech-tag">{t}</span>
                ))}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-text-3)', marginBottom: '0.75rem' }}>{t('projects.links')}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {project.demo_url && (
                  <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" style={{ justifyContent: 'center' }}>
                    <ExternalLink size={13} /> {t('projects.live_demo')}
                  </a>
                )}
                {project.github_url && (
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ justifyContent: 'center' }}>
                    <Github size={13} /> {t('projects.source_code')}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
