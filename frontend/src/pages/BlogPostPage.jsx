import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { ArrowLeft, Clock, Eye, Tag, Calendar, BookOpen } from 'lucide-react';
import { formatDate } from '../utils/format.js';
import api from '../services/api.js';
import ReactMarkdown from 'react-markdown';

export default function BlogPostPage() {
  const { slug } = useParams();
  const { t, lang } = useApp();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/blog/${slug}`)
      .then(r => setPost(r.data.data))
      .catch(err => setError(err.response?.status === 404 ? 'not_found' : 'error'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><div className="spinner" /></div>;

  if (error || !post) return (
    <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--color-text-3)' }}>
      <BookOpen size={60} style={{ opacity: 0.2, marginBottom: '1rem' }} />
      <h2 style={{ marginBottom: '1rem' }}>{t('blog.post_not_found')}</h2>
      <Link to="/blog" className="btn btn-primary"><ArrowLeft size={16} /> {t('blog.title')}</Link>
    </div>
  );

  const title = post[`title_${lang}`] || post.title_en;
  const content = post[`content_${lang}`] || post.content_en;

  return (
    <div className="page-enter">
      {/* Hero */}
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '3rem 0' }}>
        <div className="container-app" style={{ maxWidth: 800 }}>
          <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-text-3)', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '1.5rem', transition: 'color 0.2s' }} className="hover:text-primary-500">
            <ArrowLeft size={16} /> {t('common.back')}
          </Link>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1rem' }}>
            {post.category && <span className="badge badge-neutral">{post.category}</span>}
            {post.is_featured && <span className="badge badge-primary"><Eye size={10} /> {t('common.featured')}</span>}
          </div>
          <h1 style={{ fontWeight: 800, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', lineHeight: 1.2, letterSpacing: '-0.03em', marginBottom: '1.25rem', color: 'var(--color-text)' }}>
            {title}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', color: 'var(--color-text-3)', fontSize: '0.875rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={14} /> {formatDate(post.published_at, 'dd MMM yyyy')}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={14} /> {post.read_time} {t('blog.min_read')}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Eye size={14} /> {post.views} {t('common.views').toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Cover image */}
      {post.cover_image && (
        <div style={{ height: 400, overflow: 'hidden' }}>
          <img src={post.cover_image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {/* Content */}
      <div className="container-app" style={{ maxWidth: 800, paddingTop: '3rem', paddingBottom: '4rem' }}>
        <div style={{
          color: 'var(--color-text-2)', lineHeight: 1.8, fontSize: '1.05rem',
        }}>
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-text)' }}>{children}</h1>,
              h2: ({ children }) => <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.75rem', color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>{children}</h2>,
              h3: ({ children }) => <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>{children}</h3>,
              p: ({ children }) => <p style={{ marginBottom: '1.25rem' }}>{children}</p>,
              ul: ({ children }) => <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.25rem' }}>{children}</ul>,
              ol: ({ children }) => <ol style={{ paddingLeft: '1.5rem', marginBottom: '1.25rem' }}>{children}</ol>,
              li: ({ children }) => <li style={{ marginBottom: '0.4rem' }}>{children}</li>,
              code: ({ inline, children }) => inline
                ? <code style={{ background: 'var(--color-surface-2)', padding: '0.15rem 0.4rem', borderRadius: 6, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875em', color: 'var(--color-primary)' }}>{children}</code>
                : <pre style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '1.25rem', overflowX: 'auto', marginBottom: '1.25rem' }}><code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem' }}>{children}</code></pre>,
              blockquote: ({ children }) => <blockquote style={{ borderLeft: '4px solid var(--color-primary)', paddingLeft: '1.25rem', marginBottom: '1.25rem', color: 'var(--color-text-3)', fontStyle: 'italic' }}>{children}</blockquote>,
              a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline', textDecorationColor: 'rgba(37,99,235,0.3)' }}>{children}</a>,
            }}
          >
            {content || `*${t('blog.no_content_lang')}*`}
          </ReactMarkdown>
        </div>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)' }}>
            <p style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-text-3)', marginBottom: '0.75rem' }}>{t('blog.tags')}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {post.tags.map(tag => (
                <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.35rem 0.75rem', borderRadius: 50, background: 'rgba(37,99,235,0.08)', color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 600 }}>
                  <Tag size={11} /> {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Back link */}
        <div style={{ marginTop: '3rem' }}>
          <Link to="/blog" className="btn btn-secondary">
            <ArrowLeft size={16} /> {t('blog.back_to_blog')}
          </Link>
        </div>
      </div>
    </div>
  );
}
