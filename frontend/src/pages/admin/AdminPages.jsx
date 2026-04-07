import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle,
  Edit2,
  ExternalLink,
  Mail,
  Plus,
  Trash2,
  Zap,
} from 'heroicons';
import toast from 'react-hot-toast';
import { useApp } from '../../context/AppContext.jsx';
import { getAdminText } from '../../i18n/adminCopy.js';
import api from '../../services/api.js';
import { formatDate } from '../../utils/format.js';
import AvatarUploadField from '../../components/ui/AvatarUploadField.jsx';
import {
  AdminEmptyState,
  AdminFilterTabs,
  AdminModal,
  AdminPageHeader,
  AdminPanel,
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

function publicationTone(isPublished) {
  return isPublished ? 'green' : 'neutral';
}

function BlogForm({ post, onSave, onClose }) {
  const { t, lang } = useApp();
  const tx = useMemo(() => getAdminText(lang), [lang]);
  const [form, setForm] = useState({
    title_en: '',
    title_ru: '',
    title_kz: '',
    excerpt_en: '',
    excerpt_ru: '',
    excerpt_kz: '',
    content_en: '',
    content_ru: '',
    content_kz: '',
    category: '',
    tags: '',
    is_published: false,
    is_featured: false,
    read_time: 5,
    ...(post ? {
      title_en: post.title_en || '',
      title_ru: post.title_ru || '',
      title_kz: post.title_kz || '',
      excerpt_en: post.excerpt_en || '',
      excerpt_ru: post.excerpt_ru || '',
      excerpt_kz: post.excerpt_kz || '',
      content_en: post.content_en || '',
      content_ru: post.content_ru || '',
      content_kz: post.content_kz || '',
      category: post.category || '',
      tags: (post.tags || []).join(', '),
      is_published: post.is_published || false,
      is_featured: post.is_featured || false,
      read_time: post.read_time || 5,
    } : {}),
  });
  const [loading, setLoading] = useState(false);

  const formId = post ? `blog-form-${post.id}` : 'blog-form-new';

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title_en.trim()) {
      toast.error(tx('English title is required'));
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key === 'tags') {
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

      if (post) {
        await api.put(`/blog/${post.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success(tx('Post updated'));
      } else {
        await api.post('/blog', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success(tx('Post created'));
      }

      onSave();
    } catch {
      toast.error(tx('Failed to save post'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminModal
      title={post ? tx('Edit post') : tx('New post')}
      description={tx('Manage editorial metadata, preview copy, and publishing state from one structured form.')}
      onClose={onClose}
      width="920px"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {t('dashboard.cancel')}
          </button>
          <button type="submit" form={formId} className="btn btn-primary" disabled={loading}>
            {loading ? tx('Saving...') : tx('Save post')}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="admin-form-layout">
        <section className="admin-form-section">
          <div className="admin-form-section__header">
            <h3 className="admin-form-section__title">{tx('Editorial details')}</h3>
            <p className="admin-form-section__description">
              {tx('Titles and excerpts are used in listings, previews, and search results across the site.')}
            </p>
          </div>

          <div className="admin-form-grid admin-form-grid--3">
            {[
              ['title_en', tx('Title (EN) *')],
              ['title_ru', tx('Title (RU)')],
              ['title_kz', tx('Title (KZ)')],
              ['excerpt_en', tx('Excerpt (EN)')],
              ['excerpt_ru', tx('Excerpt (RU)')],
              ['excerpt_kz', tx('Excerpt (KZ)')],
            ].map(([name, label]) => (
              <div key={name} className="form-group">
                <label className="input-label">{label}</label>
                {name.startsWith('excerpt') ? (
                  <textarea
                    name={name}
                    className="input-field"
                    rows={3}
                    value={form[name]}
                    onChange={handleChange}
                  />
                ) : (
                  <input
                    name={name}
                    className="input-field"
                    value={form[name]}
                    onChange={handleChange}
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="admin-form-section">
          <div className="admin-form-section__header">
            <h3 className="admin-form-section__title">{tx('Content')}</h3>
            <p className="admin-form-section__description">
              {tx('Markdown content supports richer article layouts without leaving the admin workflow.')}
            </p>
          </div>

          <div className="form-group">
            <label className="input-label">{tx('Content (EN)')}</label>
            <textarea
              name="content_en"
              className="input-field"
              rows={8}
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
              rows={6}
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
              rows={6}
              value={form.content_kz}
              onChange={handleChange}
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            />
          </div>
        </section>

        <section className="admin-form-section">
          <div className="admin-form-section__header">
            <h3 className="admin-form-section__title">{tx('Metadata and publishing')}</h3>
            <p className="admin-form-section__description">
              {tx('Use tags and categories for organization, then decide whether the post is live or featured.')}
            </p>
          </div>

          <div className="admin-form-grid admin-form-grid--3">
            <div className="form-group">
              <label className="input-label">{tx('Category')}</label>
              <input
                name="category"
                className="input-field"
                value={form.category}
                onChange={handleChange}
                placeholder={tx('Engineering')}
              />
            </div>
            <div className="form-group">
              <label className="input-label">{tx('Tags')}</label>
              <input
                name="tags"
                className="input-field"
                value={form.tags}
                onChange={handleChange}
                placeholder={tx('React, Architecture, UI')}
              />
            </div>
            <div className="form-group">
              <label className="input-label">{tx('Read time')}</label>
              <input
                type="number"
                name="read_time"
                className="input-field"
                value={form.read_time}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="admin-form-grid admin-form-grid--2">
            <label className="admin-checkbox">
              <input
                type="checkbox"
                name="is_published"
                checked={form.is_published}
                onChange={handleChange}
              />
              <span>
                <span className="admin-checkbox__label">{tx('Publish post')}</span>
                <span className="admin-checkbox__description">
                  {tx('Published posts are visible immediately on the public blog.')}
                </span>
              </span>
            </label>

            <label className="admin-checkbox">
              <input
                type="checkbox"
                name="is_featured"
                checked={form.is_featured}
                onChange={handleChange}
              />
              <span>
                <span className="admin-checkbox__label">{tx('Feature post')}</span>
                <span className="admin-checkbox__description">
                  {tx('Featured posts receive additional prominence in blog and landing areas.')}
                </span>
              </span>
            </label>
          </div>
        </section>
      </form>
    </AdminModal>
  );
}

export function AdminBlogPage() {
  const { t, lang } = useApp();
  const tx = useMemo(() => getAdminText(lang), [lang]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editPost, setEditPost] = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/blog?limit=100');
      setPosts(data.data || []);
    } catch {
      toast.error(tx('Failed to load posts'));
    } finally {
      setLoading(false);
    }
  }, [tx]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const filteredPosts = posts.filter((post) => {
    const haystack = [
      post.title_en,
      post.title_ru,
      post.title_kz,
      post.category,
      post.excerpt_en,
      post.excerpt_ru,
      post.excerpt_kz,
      ...(post.tags || []),
    ]
      .join(' ')
      .toLowerCase();

    const matchesSearch = !search.trim() || haystack.includes(search.trim().toLowerCase());

    const matchesFilter = (() => {
      if (filter === 'published') return post.is_published;
      if (filter === 'draft') return !post.is_published;
      if (filter === 'featured') return post.is_featured;
      return true;
    })();

    return matchesSearch && matchesFilter;
  });

  const counts = {
    all: posts.length,
    published: posts.filter((post) => post.is_published).length,
    draft: posts.filter((post) => !post.is_published).length,
    featured: posts.filter((post) => post.is_featured).length,
  };

  const handleDelete = async (id) => {
    if (!confirm(tx('Delete this post?'))) return;

    try {
      await api.delete(`/blog/${id}`);
      toast.success(tx('Post deleted'));
      fetchPosts();
    } catch {
      toast.error(tx('Failed to delete post'));
    }
  };

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <AdminPageHeader
        eyebrow={tx('Editorial workspace')}
        title={t('dashboard.blog')}
        description={tx('Keep articles, thought pieces, and technical notes in a disciplined publishing flow.')}
        meta={[
          `${posts.length} ${tx('total posts')}`,
          `${counts.published} ${tx('published count')}`,
          `${counts.featured} ${tx('featured count')}`,
        ]}
        actions={(
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setEditPost(null);
              setShowForm(true);
            }}
          >
            <Plus size={15} />
            {tx('New post')}
          </button>
        )}
      />

      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h3 className="admin-panel__title">{tx('Content queue')}</h3>
            <p className="admin-panel__description">
              {tx('Search across the article inventory and move quickly between drafts, featured pieces, and live content.')}
            </p>
          </div>
        </div>

        <AdminToolbar>
          <AdminToolbarGroup style={{ flex: '1 1 280px' }}>
            <AdminSearchField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={tx('Search titles, excerpts, categories, or tags')}
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
        ) : filteredPosts.length ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{tx('Post')}</th>
                  <th>{tx('Category')}</th>
                  <th>{tx('Visibility')}</th>
                  <th>{tx('Read time')}</th>
                  <th>{t('common.views')}</th>
                  <th>{tx('Published')}</th>
                  <th>{tx('Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post.id}>
                    <td style={{ minWidth: 320 }}>
                      <div className="admin-row-title">
                        <div className="admin-row-title__main">
                          {getLocalizedAdminField(post, 'title', lang, post.title_en)}
                        </div>
                        <div className="admin-row-title__sub">
                          {getLocalizedAdminField(post, 'excerpt', lang, post.excerpt_en) || tx('No article summary has been added yet.')}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{post.category || tx('General')}</span>
                    </td>
                    <td>
                      <div className="admin-inline-actions">
                        <AdminStatusBadge tone={publicationTone(post.is_published)}>
                          {post.is_published ? t('common.published') : t('common.draft')}
                        </AdminStatusBadge>
                        {post.is_featured && <AdminStatusBadge tone="amber">{t('common.featured')}</AdminStatusBadge>}
                      </div>
                    </td>
                    <td>{post.read_time || 0} {tx('min')}</td>
                    <td>{post.views || 0}</td>
                    <td>{formatDate(post.created_at)}</td>
                    <td>
                      <div className="admin-inline-actions">
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => {
                            setEditPost(post);
                            setShowForm(true);
                          }}
                          title={tx('Edit post')}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{
                            background: 'var(--admin-danger-soft)',
                            color: 'var(--admin-danger)',
                            border: '1px solid rgba(185, 28, 28, 0.14)',
                          }}
                          onClick={() => handleDelete(post.id)}
                          title={tx('Delete post')}
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
            icon={BookOpen}
            title={tx('No posts match the current view')}
            description={tx('Try adjusting filters or create a new post to start filling the editorial queue.')}
          />
        )}
      </section>

      {showForm && (
        <BlogForm
          post={editPost}
          onSave={() => {
            setShowForm(false);
            fetchPosts();
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

export function AdminContactsPage() {
  const { t, lang } = useApp();
  const tx = useMemo(() => getAdminText(lang), [lang]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/contacts?limit=200');
      setContacts(data.data || []);
    } catch {
      toast.error(tx('Failed to load messages'));
    } finally {
      setLoading(false);
    }
  }, [tx]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const filteredContacts = contacts.filter((contact) => {
    const haystack = [contact.name, contact.email, contact.subject, contact.message]
      .join(' ')
      .toLowerCase();

    const matchesSearch = !search.trim() || haystack.includes(search.trim().toLowerCase());
    const matchesFilter = filter === 'all' ? true : contact.status === filter;
    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    if (selected && !filteredContacts.some((item) => item.id === selected.id)) {
      setSelected(null);
    }
  }, [filteredContacts, selected]);

  const counts = {
    all: contacts.length,
    new: contacts.filter((contact) => contact.status === 'new').length,
    read: contacts.filter((contact) => contact.status === 'read').length,
    replied: contacts.filter((contact) => contact.status === 'replied').length,
    archived: contacts.filter((contact) => contact.status === 'archived').length,
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/contacts/${id}/status`, { status });
      const labels = {
        new: tx('New'),
        read: tx('Read'),
        replied: tx('Replied'),
        archived: tx('Archived'),
      };
      toast.success(`${tx('Marked as')} ${labels[status] || status}`);
      fetchContacts();
      if (selected?.id === id) {
        setSelected((current) => (current ? { ...current, status } : null));
      }
    } catch {
      toast.error(tx('Failed to update message status'));
    }
  };

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <AdminPageHeader
        eyebrow={tx('Inbox')}
        title={t('dashboard.contacts')}
        description={tx('Treat inbound messages like a real shared queue: review new requests, reply, and archive what is already handled.')}
        meta={[
          `${contacts.length} ${tx('messages total')}`,
          `${counts.new} ${tx('new count')}`,
          `${counts.replied} ${tx('replied count')}`,
        ]}
      />

      <div className="admin-split-layout">
        <section className="admin-panel">
          <div className="admin-panel__header">
            <div>
              <h3 className="admin-panel__title">{tx('Message queue')}</h3>
              <p className="admin-panel__description">
                {tx('Search by sender, subject, or content, then open the message for full detail and triage.')}
              </p>
            </div>
          </div>

          <AdminToolbar>
            <AdminToolbarGroup style={{ flex: '1 1 280px' }}>
              <AdminSearchField
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={tx('Search messages')}
              />
            </AdminToolbarGroup>
            <AdminToolbarGroup>
              <AdminFilterTabs
                value={filter}
                onChange={setFilter}
                options={[
                  { value: 'all', label: t('projects.all'), count: counts.all },
                  { value: 'new', label: tx('New'), count: counts.new },
                  { value: 'read', label: tx('Read'), count: counts.read },
                  { value: 'replied', label: tx('Replied'), count: counts.replied },
                  { value: 'archived', label: tx('Archived'), count: counts.archived },
                ]}
              />
            </AdminToolbarGroup>
          </AdminToolbar>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
              <div className="spinner" />
            </div>
          ) : filteredContacts.length ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
              <thead>
                <tr>
                  <th>{tx('Sender')}</th>
                  <th>{tx('Subject')}</th>
                  <th>{tx('Status')}</th>
                  <th>{tx('Received')}</th>
                </tr>
              </thead>
                <tbody>
                  {filteredContacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className={selected?.id === contact.id ? 'is-selected' : ''}
                      onClick={() => setSelected(contact)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div className="admin-row-title">
                          <div className="admin-row-title__main">{contact.name}</div>
                          <div className="admin-row-title__sub">{contact.email}</div>
                        </div>
                      </td>
                      <td style={{ minWidth: 260 }}>
                        <div className="admin-row-title">
                          <div className="admin-row-title__main">{contact.subject || tx('No subject')}</div>
                          <div className="admin-row-title__sub">
                            {(contact.message || '').slice(0, 80)}
                            {contact.message?.length > 80 ? '…' : ''}
                          </div>
                        </div>
                      </td>
                      <td>
                        <AdminStatusBadge
                          tone={
                            contact.status === 'new'
                              ? 'red'
                              : contact.status === 'replied'
                                ? 'green'
                                : contact.status === 'read'
                                  ? 'blue'
                                  : 'neutral'
                          }
                        >
                          {contact.status === 'new'
                            ? tx('New')
                            : contact.status === 'read'
                              ? tx('Read')
                              : contact.status === 'replied'
                                ? tx('Replied')
                                : tx('Archived')}
                        </AdminStatusBadge>
                      </td>
                      <td>{formatDate(contact.created_at, 'dd MMM yyyy')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        ) : (
          <AdminEmptyState
            icon={Mail}
            title={tx('No messages in this view')}
            description={tx('Inbox will populate here when visitors submit the contact form.')}
          />
        )}
      </section>

      <AdminPanel
        className="admin-sticky"
        title={selected ? tx('Conversation detail') : tx('Select a message')}
        description={
          selected
            ? tx('Review the full message and update its workflow status.')
            : tx('Choose a row from the queue to open full context and next actions.')
        }
      >
          {selected ? (
            <div className="admin-form-stack">
              <div className="admin-row-title">
                <div className="admin-row-title__main">{selected.name}</div>
                <div className="admin-row-title__sub">{selected.email}</div>
              </div>

              <div className="admin-inline-actions">
                <AdminStatusBadge
                  tone={
                    selected.status === 'new'
                      ? 'red'
                      : selected.status === 'replied'
                        ? 'green'
                        : selected.status === 'read'
                          ? 'blue'
                          : 'neutral'
                  }
                >
                  {selected.status === 'new'
                    ? tx('New')
                    : selected.status === 'read'
                      ? tx('Read')
                      : selected.status === 'replied'
                        ? tx('Replied')
                        : tx('Archived')}
                </AdminStatusBadge>
                <AdminStatusBadge tone="neutral">
                  {formatDate(selected.created_at, 'dd MMM yyyy HH:mm')}
                </AdminStatusBadge>
              </div>

              {selected.subject && (
                <div className="admin-note">
                  <div className="admin-note__title">{selected.subject}</div>
                </div>
              )}

              <div className="admin-note">
                <div className="admin-note__text" style={{ whiteSpace: 'pre-wrap' }}>
                  {selected.message}
                </div>
              </div>

              <div className="admin-form-grid admin-form-grid--2">
                {['new', 'read', 'replied', 'archived'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`btn btn-sm ${selected.status === status ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => updateStatus(selected.id, status)}
                  >
                    {status === 'replied' ? <CheckCircle size={14} /> : <Mail size={14} />}
                    {status === 'new'
                      ? tx('New')
                      : status === 'read'
                        ? tx('Read')
                        : status === 'replied'
                          ? tx('Replied')
                          : tx('Archived')}
                  </button>
                ))}
              </div>

              <a
                href={`mailto:${selected.email}`}
                className="btn btn-secondary"
                style={{ justifyContent: 'center', textDecoration: 'none' }}
              >
                <Mail size={14} />
                {tx('Reply via email')}
              </a>
            </div>
          ) : (
            <AdminEmptyState
              icon={Mail}
              title={tx('Nothing selected')}
              description={tx('Open a conversation from the left-hand queue to see its full message content and action buttons.')}
            />
          )}
        </AdminPanel>
      </div>
    </div>
  );
}

export function AdminSkillsPage() {
  const { t, lang } = useApp();
  const tx = useMemo(() => getAdminText(lang), [lang]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({
    name: '',
    category: 'frontend',
    level: 80,
    icon: '',
    color: '#3157d5',
    is_featured: false,
    sort_order: 0,
  });
  const [editId, setEditId] = useState(null);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/skills');
      setSkills(data.data || []);
    } catch {
      toast.error(tx('Failed to load skills'));
    } finally {
      setLoading(false);
    }
  }, [tx]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const filteredSkills = skills.filter((skill) => {
    if (filter === 'all') return true;
    if (filter === 'featured') return skill.is_featured;
    return skill.category === filter;
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error(tx('Skill name is required'));
      return;
    }

    try {
      if (editId) {
        await api.put(`/skills/${editId}`, form);
        toast.success(tx('Skill updated'));
      } else {
        await api.post('/skills', form);
        toast.success(tx('Skill added'));
      }

      setForm({
        name: '',
        category: 'frontend',
        level: 80,
        icon: '',
        color: '#3157d5',
        is_featured: false,
        sort_order: 0,
      });
      setEditId(null);
      fetchSkills();
    } catch {
      toast.error(tx('Failed to save skill'));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(tx('Delete this skill?'))) return;
    try {
      await api.delete(`/skills/${id}`);
      toast.success(tx('Skill deleted'));
      fetchSkills();
    } catch {
      toast.error(tx('Failed to delete skill'));
    }
  };

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <AdminPageHeader
        eyebrow={tx('Capability matrix')}
        title={t('dashboard.skills')}
        description={tx('Keep the skill catalog practical, current, and aligned with the profile you want to present publicly.')}
        meta={[
          `${skills.length} ${tx('total skills')}`,
          `${skills.filter((skill) => skill.is_featured).length} ${tx('featured count')}`,
        ]}
      />

      <div className="admin-profile-layout">
        <AdminPanel
          title={editId ? tx('Edit skill') : tx('Add skill')}
          description={tx('Use clear categories and realistic levels. This is part of your public credibility, so keep it honest.')}
        >
          <form onSubmit={handleSubmit} className="admin-form-layout">
            <div className="form-group">
              <label className="input-label">{tx('Skill name')}</label>
              <input
                className="input-field"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="React"
              />
            </div>

            <div className="admin-form-grid admin-form-grid--2">
              <div className="form-group">
                <label className="input-label">{tx('Icon or emoji')}</label>
                <input
                  className="input-field"
                  value={form.icon}
                  onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value }))}
                  placeholder="*"
                />
              </div>
              <div className="form-group">
                <label className="input-label">{tx('Sort order')}</label>
                <input
                  type="number"
                  className="input-field"
                  value={form.sort_order}
                  onChange={(event) => setForm((current) => ({ ...current, sort_order: event.target.value }))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">{tx('Category')}</label>
              <select
                className="input-field"
                value={form.category}
                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              >
                {['frontend', 'backend', 'database', 'devops', 'mobile', 'design', 'other'].map((category) => (
                  <option key={category} value={category}>
                    {t(`skills.${category}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="input-label">{tx('Level')}</label>
              <input
                type="range"
                min={1}
                max={100}
                value={form.level}
                onChange={(event) => setForm((current) => ({ ...current, level: Number(event.target.value) }))}
                style={{ width: '100%', accentColor: 'var(--admin-accent)' }}
              />
              <p className="admin-helper" style={{ marginTop: 8 }}>
                {tx('Current level:')} {form.level}%
              </p>
            </div>

            <div className="form-group">
              <label className="input-label">{tx('Accent color')}</label>
              <input
                type="color"
                value={form.color}
                onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))}
                style={{
                  width: '100%',
                  height: 44,
                  borderRadius: 12,
                  border: '1px solid var(--admin-panel-border)',
                  background: 'var(--admin-panel-bg)',
                  cursor: 'pointer',
                }}
              />
            </div>

            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(event) => setForm((current) => ({ ...current, is_featured: event.target.checked }))}
              />
              <span>
                <span className="admin-checkbox__label">{tx('Feature this skill')}</span>
                <span className="admin-checkbox__description">
                  {tx('Featured skills surface more prominently across the public portfolio.')}
                </span>
              </span>
            </label>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary">
                {editId ? tx('Update skill') : tx('Add skill')}
              </button>
              {editId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditId(null);
                    setForm({
                      name: '',
                      category: 'frontend',
                      level: 80,
                      icon: '',
                      color: '#3157d5',
                      is_featured: false,
                      sort_order: 0,
                    });
                  }}
                >
                  {t('dashboard.cancel')}
                </button>
              )}
            </div>
          </form>
        </AdminPanel>

        <section className="admin-panel">
          <div className="admin-panel__header">
            <div>
              <h3 className="admin-panel__title">{tx('Skill inventory')}</h3>
              <p className="admin-panel__description">
                {tx('Review the public skill matrix by category and keep levels internally consistent.')}
              </p>
            </div>
          </div>

          <AdminToolbar>
            <AdminToolbarGroup>
              <AdminFilterTabs
                value={filter}
                onChange={setFilter}
                options={[
                  { value: 'all', label: t('projects.all'), count: skills.length },
                  { value: 'featured', label: t('common.featured'), count: skills.filter((skill) => skill.is_featured).length },
                  { value: 'frontend', label: t('skills.frontend'), count: skills.filter((skill) => skill.category === 'frontend').length },
                  { value: 'backend', label: t('skills.backend'), count: skills.filter((skill) => skill.category === 'backend').length },
                  { value: 'other', label: tx('Other'), count: skills.filter((skill) => !['frontend', 'backend'].includes(skill.category)).length },
                ]}
              />
            </AdminToolbarGroup>
          </AdminToolbar>

          <div className="admin-panel__body">
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                <div className="spinner" />
              </div>
            ) : filteredSkills.length ? (
              <div className="admin-form-stack">
                {filteredSkills.map((skill) => (
                  <div
                    key={skill.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.9rem 1rem',
                      borderRadius: 18,
                      border: '1px solid var(--admin-panel-border)',
                      background: 'var(--admin-panel-alt)',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: skill.color || 'var(--admin-accent-soft)',
                        color: '#fff',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ fontSize: '1rem' }}>{skill.icon || '*'}</span>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div className="admin-row-title">
                          <div className="admin-row-title__main">{skill.name}</div>
                          <div className="admin-row-title__sub">{t(`skills.${skill.category}`) || skill.category}</div>
                        </div>
                        <div className="admin-inline-actions">
                          <AdminStatusBadge tone="blue">{skill.level}%</AdminStatusBadge>
                          {skill.is_featured && <AdminStatusBadge tone="amber">{t('common.featured')}</AdminStatusBadge>}
                        </div>
                      </div>
                      <div className="admin-progress" style={{ marginTop: 10 }}>
                        <div
                          className="admin-progress__fill"
                          style={{ width: `${skill.level}%`, background: skill.color || 'var(--admin-accent)' }}
                        />
                      </div>
                    </div>

                    <div className="admin-inline-actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          setEditId(skill.id);
                          setForm({
                            name: skill.name,
                            category: skill.category,
                            level: skill.level,
                            icon: skill.icon || '',
                            color: skill.color || '#3157d5',
                            is_featured: skill.is_featured,
                            sort_order: skill.sort_order || 0,
                          });
                        }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{
                          background: 'var(--admin-danger-soft)',
                          color: 'var(--admin-danger)',
                          border: '1px solid rgba(185, 28, 28, 0.14)',
                        }}
                        onClick={() => handleDelete(skill.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <AdminEmptyState
                icon={Zap}
                title={tx('No skills in this segment')}
                description={tx('Try another filter or add a new skill to expand the public capability matrix.')}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function CertForm({ onSave, onClose }) {
  const { t, lang } = useApp();
  const tx = useMemo(() => getAdminText(lang), [lang]);
  const [form, setForm] = useState({
    name_kz: '',
    name_en: '',
    name_ru: '',
    issuer: '',
    issue_date: '',
    category: '',
    credential_url: '',
    is_featured: false,
    sort_order: 0,
  });
  const [loading, setLoading] = useState(false);

  const formId = 'certificate-form-new';

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name_en || !form.issuer || !form.issue_date) {
      toast.error(tx('Name, issuer, and issue date are required'));
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, String(value)));

      await api.post('/certificates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(tx('Certificate added'));
      onSave();
    } catch {
      toast.error(tx('Failed to save certificate'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminModal
      title={tx('Add certificate')}
      description={tx('Capture the credential, issuing organization, and public verification link.')}
      onClose={onClose}
      width="760px"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {t('dashboard.cancel')}
          </button>
          <button type="submit" form={formId} className="btn btn-primary" disabled={loading}>
            {loading ? tx('Saving...') : tx('Save certificate')}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="admin-form-layout">
        <section className="admin-form-section">
          <div className="admin-form-section__header">
            <h3 className="admin-form-section__title">{tx('Credential details')}</h3>
            <p className="admin-form-section__description">
              {tx('Use the exact certificate name and issuer so the public record looks trustworthy.')}
            </p>
          </div>

          <div className="admin-form-grid admin-form-grid--2">
            {[
              ['name_kz', tx('Name (KZ)')],
              ['name_en', tx('Name (EN) *')],
              ['name_ru', tx('Name (RU)')],
              ['issuer', tx('Issuer *')],
              ['category', tx('Category')],
            ].map(([name, label]) => (
              <div key={name} className="form-group">
                <label className="input-label">{label}</label>
                <input
                  className="input-field"
                  value={form[name]}
                  onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))}
                />
              </div>
            ))}
          </div>

          <div className="admin-form-grid admin-form-grid--2">
            <div className="form-group">
              <label className="input-label">{tx('Issue date *')}</label>
              <input
                type="date"
                className="input-field"
                value={form.issue_date}
                onChange={(event) => setForm((current) => ({ ...current, issue_date: event.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="input-label">{tx('Verification URL')}</label>
              <input
                className="input-field"
                value={form.credential_url}
                onChange={(event) => setForm((current) => ({ ...current, credential_url: event.target.value }))}
              />
            </div>
          </div>

          <div className="admin-form-grid admin-form-grid--2">
            <div className="form-group">
              <label className="input-label">{tx('Sort order')}</label>
              <input
                type="number"
                className="input-field"
                value={form.sort_order}
                onChange={(event) => setForm((current) => ({ ...current, sort_order: event.target.value }))}
              />
            </div>
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(event) => setForm((current) => ({ ...current, is_featured: event.target.checked }))}
              />
              <span>
                <span className="admin-checkbox__label">{tx('Feature certificate')}</span>
                <span className="admin-checkbox__description">
                  {tx('Featured credentials can be surfaced more prominently on the site.')}
                </span>
              </span>
            </label>
          </div>
        </section>
      </form>
    </AdminModal>
  );
}

export function AdminCertificatesPage() {
  const { t, lang } = useApp();
  const tx = useMemo(() => getAdminText(lang), [lang]);
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/certificates');
      setCerts(data.data || []);
    } catch {
      toast.error(tx('Failed to load certificates'));
    } finally {
      setLoading(false);
    }
  }, [tx]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const filteredCerts = certs.filter((cert) => {
    const haystack = [cert.name_en, cert.name_ru, cert.name_kz, cert.issuer, cert.category].join(' ').toLowerCase();
    const matchesSearch = !search.trim() || haystack.includes(search.trim().toLowerCase());
    const matchesFilter = filter === 'all' ? true : cert.is_featured;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (id) => {
    if (!confirm(tx('Delete this certificate?'))) return;
    try {
      await api.delete(`/certificates/${id}`);
      toast.success(tx('Certificate deleted'));
      fetchCertificates();
    } catch {
      toast.error(tx('Failed to delete certificate'));
    }
  };

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <AdminPageHeader
        eyebrow={tx('Credentials')}
        title={t('dashboard.certificates')}
        description={tx('Keep public certifications tidy, dated correctly, and easy to verify.')}
        meta={[
          `${certs.length} ${tx('certificates')}`,
          `${certs.filter((cert) => cert.is_featured).length} ${tx('featured count')}`,
        ]}
        actions={(
          <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={15} />
            {tx('Add certificate')}
          </button>
        )}
      />

      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h3 className="admin-panel__title">{tx('Certificate archive')}</h3>
            <p className="admin-panel__description">
              {tx('Search credentials, keep dates current, and make sure public verification links stay valid.')}
            </p>
          </div>
        </div>

        <AdminToolbar>
          <AdminToolbarGroup style={{ flex: '1 1 280px' }}>
            <AdminSearchField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={tx('Search name, issuer, or category')}
            />
          </AdminToolbarGroup>
          <AdminToolbarGroup>
            <AdminFilterTabs
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: t('projects.all'), count: certs.length },
                { value: 'featured', label: t('common.featured'), count: certs.filter((cert) => cert.is_featured).length },
              ]}
            />
          </AdminToolbarGroup>
        </AdminToolbar>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <div className="spinner" />
          </div>
        ) : filteredCerts.length ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{tx('Certificate')}</th>
                  <th>{tx('Issuer')}</th>
                  <th>{tx('Issued')}</th>
                  <th>{tx('Category')}</th>
                  <th>{tx('Verification')}</th>
                  <th>{tx('Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredCerts.map((cert) => (
                  <tr key={cert.id}>
                    <td style={{ minWidth: 280 }}>
                      <div className="admin-row-title">
                        <div className="admin-row-title__main">
                          {getLocalizedAdminField(cert, 'name', lang, cert.name_en)}
                        </div>
                        <div className="admin-row-title__sub">
                          {cert.is_featured ? tx('Featured credential') : tx('Standard credential')}
                        </div>
                      </div>
                    </td>
                    <td>{cert.issuer}</td>
                    <td>{formatDate(cert.issue_date)}</td>
                    <td>
                      <span className="badge badge-neutral">{cert.category || tx('General')}</span>
                    </td>
                    <td>
                      {cert.credential_url ? (
                        <a
                          href={cert.credential_url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-ghost btn-sm"
                        >
                          <ExternalLink size={14} />
                          {tx('Open')}
                        </a>
                      ) : (
                        <AdminStatusBadge tone="neutral">{tx('No link')}</AdminStatusBadge>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{
                          background: 'var(--admin-danger-soft)',
                          color: 'var(--admin-danger)',
                          border: '1px solid rgba(185, 28, 28, 0.14)',
                        }}
                        onClick={() => handleDelete(cert.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <AdminEmptyState
            icon={Award}
            title={tx('No certificates match the current view')}
            description={tx('Add a new credential or adjust the search to find an existing one.')}
          />
        )}
      </section>

      {showForm && (
        <CertForm
          onSave={() => {
            setShowForm(false);
            fetchCertificates();
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

export function AdminProfilePage() {
  const { t, user, loadUser, lang } = useApp();
  const tx = useMemo(() => getAdminText(lang), [lang]);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    api.get('/profile')
      .then((response) => {
        const profile = response.data.data;
        setForm({
          avatar_url: profile.avatar_url || '',
          full_name: profile.full_name || '',
          title_en: profile.title_en || '',
          title_ru: profile.title_ru || '',
          title_kz: profile.title_kz || '',
          bio_en: profile.bio_en || '',
          bio_ru: profile.bio_ru || '',
          bio_kz: profile.bio_kz || '',
          location: profile.location || '',
          phone: profile.phone || '',
          website: profile.website || '',
          github: profile.github || '',
          linkedin: profile.linkedin || '',
          instagram: profile.instagram || '',
          twitter: profile.twitter || '',
          telegram: profile.telegram || '',
          years_experience: profile.years_experience || 0,
          available_for_work: profile.available_for_work !== false,
        });
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const profileFormId = 'profile-admin-form';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key !== 'avatar_url') {
          formData.append(key, String(value));
        }
      });

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const response = await api.put('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setForm((current) => ({
        ...current,
        avatar_url: response.data.data?.avatar_url || current.avatar_url,
      }));
      setAvatarFile(null);
      toast.success(tx('Profile updated'));
      loadUser();
    } catch {
      toast.error(tx('Failed to update profile'));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <AdminPageHeader
        eyebrow={tx('Public identity')}
        title={t('dashboard.profile')}
        description={tx('Keep public-facing biography, role labels, and social links accurate across languages.')}
        meta={[
          form.available_for_work ? tx('Available for work') : tx('Not currently available'),
          `${form.years_experience || 0} ${tx('years experience')}`,
        ]}
        actions={(
          <button type="submit" form={profileFormId} className="btn btn-primary" disabled={loading}>
            {loading ? tx('Saving...') : t('dashboard.save')}
          </button>
        )}
      />

      <form id={profileFormId} onSubmit={handleSubmit} className="admin-profile-layout">
        <AdminPanel
          className="admin-sticky"
          title={tx('Public card')}
          description={tx('This is the core identity block that appears across the public site.')}
        >
          <div className="admin-form-stack">
            <AvatarUploadField
              label={tx('Profile photo')}
              name={form.full_name || user?.email || ''}
              currentSrc={form.avatar_url || ''}
              file={avatarFile}
              onFileChange={setAvatarFile}
              hint={tx('Use a clean portrait or profile image that feels consistent with the portfolio tone.')}
              size={128}
            />

            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={form.available_for_work || false}
                onChange={(event) => setForm((current) => ({ ...current, available_for_work: event.target.checked }))}
              />
              <span>
                <span className="admin-checkbox__label">{tx('Available for work')}</span>
                <span className="admin-checkbox__description">
                  {tx(' This state is reflected in public call-to-action sections.')}
                </span>
              </span>
            </label>

            <div className="admin-summary-list">
              <div className="admin-summary-row">
                <span className="admin-summary-row__label">{tx('Primary title')}</span>
                <span className="admin-summary-row__value">{form.title_en || tx('Not set')}</span>
              </div>
              <div className="admin-summary-row">
                <span className="admin-summary-row__label">{tx('Location')}</span>
                <span className="admin-summary-row__value">{form.location || tx('Not set')}</span>
              </div>
              <div className="admin-summary-row">
                <span className="admin-summary-row__label">{tx('Website')}</span>
                <span className="admin-summary-row__value">{form.website || tx('Not set')}</span>
              </div>
            </div>
          </div>
        </AdminPanel>

        <div className="admin-form-layout">
          <AdminPanel
            title={tx('Personal details')}
            description={tx('Use clear role labels and contact details that stay consistent with your portfolio messaging.')}
          >
            <div className="admin-form-grid admin-form-grid--2">
              {[
                ['full_name', tx('Full name')],
                ['title_en', tx('Title (EN)')],
                ['title_ru', tx('Title (RU)')],
                ['title_kz', tx('Title (KZ)')],
                ['location', tx('Location')],
                ['phone', tx('Phone')],
                ['website', tx('Website')],
                ['years_experience', tx('Years of experience')],
              ].map(([name, label]) => (
                <div key={name} className="form-group">
                  <label className="input-label">{label}</label>
                  <input
                    type={name === 'years_experience' ? 'number' : 'text'}
                    className="input-field"
                    value={form[name] || ''}
                    onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))}
                  />
                </div>
              ))}
            </div>
          </AdminPanel>

          <AdminPanel
            title={tx('Biography')}
            description={tx('Longer profile copy helps the portfolio read like a real professional product, not a placeholder.')}
          >
            <div className="admin-form-layout">
              {[
                ['bio_en', tx('Bio (EN)')],
                ['bio_ru', tx('Bio (RU)')],
                ['bio_kz', tx('Bio (KZ)')],
              ].map(([name, label]) => (
                <div key={name} className="form-group">
                  <label className="input-label">{label}</label>
                  <textarea
                    className="input-field"
                    rows={4}
                    value={form[name] || ''}
                    onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))}
                  />
                </div>
              ))}
            </div>
          </AdminPanel>

          <AdminPanel
            title={tx('Social links')}
            description={tx('Only include destinations you actively maintain. Broken or stale links make the portfolio feel abandoned.')}
          >
            <div className="admin-form-grid admin-form-grid--2">
              {[
                ['github', 'GitHub'],
                ['linkedin', 'LinkedIn'],
                ['instagram', 'Instagram'],
                ['twitter', 'Steam'],
                ['telegram', 'Telegram'],
              ].map(([name, label]) => (
                <div key={name} className="form-group">
                  <label className="input-label">{label}</label>
                  <input
                    className="input-field"
                    value={form[name] || ''}
                    onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))}
                    placeholder={`${label} ${tx('URL or handle')}`}
                  />
                </div>
              ))}
            </div>
          </AdminPanel>
        </div>
      </form>
    </div>
  );
}
