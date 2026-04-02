import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { Search, Clock, Eye, Tag, BookOpen, Star, ArrowRight } from 'lucide-react';
import { formatDate } from '../utils/format.js';
import api from '../services/api.js';

function BlogCard({ post, lang, t }) {
  const title = post[`title_${lang}`] || post.title_en;
  const excerpt = post[`excerpt_${lang}`] || post.excerpt_en;

  return (
    <Link to={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
      <article className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer' }}>
        {post.cover_image && (
          <div style={{ height: 200, overflow: 'hidden', borderRadius: '20px 20px 0 0' }}>
            <img src={post.cover_image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }} />
          </div>
        )}
        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            {post.is_featured && <span className="badge badge-primary"><Star size={10} /> {t('common.featured')}</span>}
            {post.category && <span className="badge badge-neutral">{post.category}</span>}
          </div>
          <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.6rem', color: 'var(--color-text)', lineHeight: 1.4 }}>
            {title}
          </h3>
          <p style={{
            color: 'var(--color-text-3)', fontSize: '0.875rem', lineHeight: 1.65,
            flex: 1, marginBottom: '1.25rem',
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {excerpt}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1rem' }}>
            {(post.tags || []).slice(0, 3).map(tag => (
              <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 500 }}>
                <Tag size={10} /> {tag}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-3)' }}>{formatDate(post.published_at, 'dd MMM yyyy')}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={11} /> {post.read_time} {t('blog.min_read')}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Eye size={11} /> {post.views}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function BlogPage() {
  const { t, lang } = useApp();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 9, lang, ...(search && { search }), ...(category && { category }) });
      const { data } = await api.get(`/blog?${params}`);
      setPosts(data.data);
      setPagination(data.pagination);
      const cats = [...new Set(data.data.map(p => p.category).filter(Boolean))];
      if (cats.length) setCategories(cats);
    } catch {}
    setLoading(false);
  }, [page, search, category, lang]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);
  useEffect(() => { setPage(1); }, [search, category]);

  return (
    <div className="page-enter">
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '3rem 0' }}>
        <div className="container-app">
          <div className="section-label"><BookOpen size={12} /> {t('blog.subtitle')}</div>
          <h1 className="section-title">{t('blog.title')}</h1>
          <p style={{ color: 'var(--color-text-3)', marginTop: '0.75rem', fontSize: '1.05rem' }}>
            {t('blog.intro')}
          </p>
        </div>
      </div>

      <div className="container-app" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        {/* Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', padding: '1.25rem', background: 'var(--color-surface)', borderRadius: 16, border: '1px solid var(--color-border)' }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-3)' }} />
            <input className="input-field" placeholder={t('blog.search')} value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button onClick={() => setCategory('')} className={`btn btn-sm ${!category ? 'btn-primary' : 'btn-secondary'}`}>
              {t('blog.all_categories')}
            </button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-secondary'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--color-text-3)' }}>
            <BookOpen size={60} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>{t('blog.no_posts')}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {posts.map(p => <BlogCard key={p.id} post={p} lang={lang} t={t} />)}
          </div>
        )}

        {pagination && pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '2.5rem' }}>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`btn btn-sm ${page === p ? 'btn-primary' : 'btn-secondary'}`}>{p}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
