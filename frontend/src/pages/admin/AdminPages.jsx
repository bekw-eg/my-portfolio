import { useCallback, useEffect, useState } from 'react';
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
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../../context/AppContext.jsx';
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

function publicationTone(isPublished) {
  return isPublished ? 'green' : 'neutral';
}

function BlogForm({ post, onSave, onClose }) {
  const [form, setForm] = useState({
    title_en: '',
    title_ru: '',
    excerpt_en: '',
    excerpt_ru: '',
    content_en: '',
    content_ru: '',
    category: '',
    tags: '',
    is_published: false,
    is_featured: false,
    read_time: 5,
    ...(post ? {
      title_en: post.title_en || '',
      title_ru: post.title_ru || '',
      excerpt_en: post.excerpt_en || '',
      excerpt_ru: post.excerpt_ru || '',
      content_en: post.content_en || '',
      content_ru: post.content_ru || '',
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
      toast.error('English title is required');
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
        toast.success('Post updated');
      } else {
        await api.post('/blog', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Post created');
      }

      onSave();
    } catch {
      toast.error('Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminModal
      title={post ? 'Edit post' : 'New post'}
      description="Manage editorial metadata, preview copy, and publishing state from one structured form."
      onClose={onClose}
      width="920px"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form={formId} className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save post'}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="admin-form-layout">
        <section className="admin-form-section">
          <div className="admin-form-section__header">
            <h3 className="admin-form-section__title">Editorial details</h3>
            <p className="admin-form-section__description">
              Titles and excerpts are used in listings, previews, and search results across the site.
            </p>
          </div>

          <div className="admin-form-grid admin-form-grid--2">
            {[
              ['title_en', 'Title (EN) *'],
              ['title_ru', 'Title (RU)'],
              ['excerpt_en', 'Excerpt (EN)'],
              ['excerpt_ru', 'Excerpt (RU)'],
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
            <h3 className="admin-form-section__title">Content</h3>
            <p className="admin-form-section__description">
              Markdown content supports richer article layouts without leaving the admin workflow.
            </p>
          </div>

          <div className="form-group">
            <label className="input-label">Content (EN)</label>
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
            <label className="input-label">Content (RU)</label>
            <textarea
              name="content_ru"
              className="input-field"
              rows={6}
              value={form.content_ru}
              onChange={handleChange}
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            />
          </div>
        </section>

        <section className="admin-form-section">
          <div className="admin-form-section__header">
            <h3 className="admin-form-section__title">Metadata and publishing</h3>
            <p className="admin-form-section__description">
              Use tags and categories for organization, then decide whether the post is live or featured.
            </p>
          </div>

          <div className="admin-form-grid admin-form-grid--3">
            <div className="form-group">
              <label className="input-label">Category</label>
              <input
                name="category"
                className="input-field"
                value={form.category}
                onChange={handleChange}
                placeholder="Engineering"
              />
            </div>
            <div className="form-group">
              <label className="input-label">Tags</label>
              <input
                name="tags"
                className="input-field"
                value={form.tags}
                onChange={handleChange}
                placeholder="React, Architecture, UI"
              />
            </div>
            <div className="form-group">
              <label className="input-label">Read time</label>
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
                <span className="admin-checkbox__label">Publish post</span>
                <span className="admin-checkbox__description">
                  Published posts are visible immediately on the public blog.
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
                <span className="admin-checkbox__label">Feature post</span>
                <span className="admin-checkbox__description">
                  Featured posts receive additional prominence in blog and landing areas.
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
  const { t } = useApp();
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
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const filteredPosts = posts.filter((post) => {
    const haystack = [
      post.title_en,
      post.category,
      post.excerpt_en,
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
    if (!confirm('Delete this post?')) return;

    try {
      await api.delete(`/blog/${id}`);
      toast.success('Post deleted');
      fetchPosts();
    } catch {
      toast.error('Failed to delete post');
    }
  };

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <AdminPageHeader
        eyebrow="Editorial workspace"
        title={t('dashboard.blog')}
        description="Keep articles, thought pieces, and technical notes in a disciplined publishing flow."
        meta={[
          `${posts.length} total posts`,
          `${counts.published} published`,
          `${counts.featured} featured`,
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
            New post
          </button>
        )}
      />

      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h3 className="admin-panel__title">Content queue</h3>
            <p className="admin-panel__description">
              Search across the article inventory and move quickly between drafts, featured pieces, and live content.
            </p>
          </div>
        </div>

        <AdminToolbar>
          <AdminToolbarGroup style={{ flex: '1 1 280px' }}>
            <AdminSearchField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search titles, excerpts, categories, or tags"
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
        ) : filteredPosts.length ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Post</th>
                  <th>Category</th>
                  <th>Visibility</th>
                  <th>Read time</th>
                  <th>Views</th>
                  <th>Published</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post.id}>
                    <td style={{ minWidth: 320 }}>
                      <div className="admin-row-title">
                        <div className="admin-row-title__main">{post.title_en}</div>
                        <div className="admin-row-title__sub">
                          {post.excerpt_en || 'No article summary has been added yet.'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{post.category || 'General'}</span>
                    </td>
                    <td>
                      <div className="admin-inline-actions">
                        <AdminStatusBadge tone={publicationTone(post.is_published)}>
                          {post.is_published ? 'Published' : 'Draft'}
                        </AdminStatusBadge>
                        {post.is_featured && <AdminStatusBadge tone="amber">Featured</AdminStatusBadge>}
                      </div>
                    </td>
                    <td>{post.read_time || 0} min</td>
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
                          title="Edit post"
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
                          title="Delete post"
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
            title="No posts match the current view"
            description="Try adjusting filters or create a new post to start filling the editorial queue."
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
  const { t } = useApp();
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
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

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
      toast.success(`Marked as ${status}`);
      fetchContacts();
      if (selected?.id === id) {
        setSelected((current) => (current ? { ...current, status } : null));
      }
    } catch {
      toast.error('Failed to update message status');
    }
  };

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <AdminPageHeader
        eyebrow="Inbox"
        title={t('dashboard.contacts')}
        description="Treat inbound messages like a real shared queue: review new requests, reply, and archive what is already handled."
        meta={[
          `${contacts.length} messages total`,
          `${counts.new} new`,
          `${counts.replied} replied`,
        ]}
      />

      <div className="admin-split-layout">
        <section className="admin-panel">
          <div className="admin-panel__header">
            <div>
              <h3 className="admin-panel__title">Message queue</h3>
              <p className="admin-panel__description">
                Search by sender, subject, or content, then open the message for full detail and triage.
              </p>
            </div>
          </div>

          <AdminToolbar>
            <AdminToolbarGroup style={{ flex: '1 1 280px' }}>
              <AdminSearchField
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search messages"
              />
            </AdminToolbarGroup>
            <AdminToolbarGroup>
              <AdminFilterTabs
                value={filter}
                onChange={setFilter}
                options={[
                  { value: 'all', label: 'All', count: counts.all },
                  { value: 'new', label: 'New', count: counts.new },
                  { value: 'read', label: 'Read', count: counts.read },
                  { value: 'replied', label: 'Replied', count: counts.replied },
                  { value: 'archived', label: 'Archived', count: counts.archived },
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
                    <th>Sender</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Received</th>
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
                          <div className="admin-row-title__main">{contact.subject || 'No subject'}</div>
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
                          {contact.status}
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
              title="No messages in this view"
              description="Inbox will populate here when visitors submit the contact form."
            />
          )}
        </section>

        <AdminPanel
          className="admin-sticky"
          title={selected ? 'Conversation detail' : 'Select a message'}
          description={
            selected
              ? 'Review the full message and update its workflow status.'
              : 'Choose a row from the queue to open full context and next actions.'
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
                  {selected.status}
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
                    {status}
                  </button>
                ))}
              </div>

              <a
                href={`mailto:${selected.email}`}
                className="btn btn-secondary"
                style={{ justifyContent: 'center', textDecoration: 'none' }}
              >
                <Mail size={14} />
                Reply via email
              </a>
            </div>
          ) : (
            <AdminEmptyState
              icon={Mail}
              title="Nothing selected"
              description="Open a conversation from the left-hand queue to see its full message content and action buttons."
            />
          )}
        </AdminPanel>
      </div>
    </div>
  );
}

export function AdminSkillsPage() {
  const { t } = useApp();
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
      toast.error('Failed to load skills');
    } finally {
      setLoading(false);
    }
  }, []);

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
      toast.error('Skill name is required');
      return;
    }

    try {
      if (editId) {
        await api.put(`/skills/${editId}`, form);
        toast.success('Skill updated');
      } else {
        await api.post('/skills', form);
        toast.success('Skill added');
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
      toast.error('Failed to save skill');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this skill?')) return;
    try {
      await api.delete(`/skills/${id}`);
      toast.success('Skill deleted');
      fetchSkills();
    } catch {
      toast.error('Failed to delete skill');
    }
  };

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <AdminPageHeader
        eyebrow="Capability matrix"
        title={t('dashboard.skills')}
        description="Keep the skill catalog practical, current, and aligned with the profile you want to present publicly."
        meta={[
          `${skills.length} total skills`,
          `${skills.filter((skill) => skill.is_featured).length} featured`,
        ]}
      />

      <div className="admin-profile-layout">
        <AdminPanel
          title={editId ? 'Edit skill' : 'Add skill'}
          description="Use clear categories and realistic levels. This is part of your public credibility, so keep it honest."
        >
          <form onSubmit={handleSubmit} className="admin-form-layout">
            <div className="form-group">
              <label className="input-label">Skill name</label>
              <input
                className="input-field"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="React"
              />
            </div>

            <div className="admin-form-grid admin-form-grid--2">
              <div className="form-group">
                <label className="input-label">Icon or emoji</label>
                <input
                  className="input-field"
                  value={form.icon}
                  onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value }))}
                  placeholder="⚛"
                />
              </div>
              <div className="form-group">
                <label className="input-label">Sort order</label>
                <input
                  type="number"
                  className="input-field"
                  value={form.sort_order}
                  onChange={(event) => setForm((current) => ({ ...current, sort_order: event.target.value }))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Category</label>
              <select
                className="input-field"
                value={form.category}
                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              >
                {['frontend', 'backend', 'database', 'devops', 'mobile', 'design', 'other'].map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="input-label">Level</label>
              <input
                type="range"
                min={1}
                max={100}
                value={form.level}
                onChange={(event) => setForm((current) => ({ ...current, level: Number(event.target.value) }))}
                style={{ width: '100%', accentColor: 'var(--admin-accent)' }}
              />
              <p className="admin-helper" style={{ marginTop: 8 }}>
                Current level: {form.level}%
              </p>
            </div>

            <div className="form-group">
              <label className="input-label">Accent color</label>
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
                <span className="admin-checkbox__label">Feature this skill</span>
                <span className="admin-checkbox__description">
                  Featured skills surface more prominently across the public portfolio.
                </span>
              </span>
            </label>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary">
                {editId ? 'Update skill' : 'Add skill'}
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
                  Cancel
                </button>
              )}
            </div>
          </form>
        </AdminPanel>

        <section className="admin-panel">
          <div className="admin-panel__header">
            <div>
              <h3 className="admin-panel__title">Skill inventory</h3>
              <p className="admin-panel__description">
                Review the public skill matrix by category and keep levels internally consistent.
              </p>
            </div>
          </div>

          <AdminToolbar>
            <AdminToolbarGroup>
              <AdminFilterTabs
                value={filter}
                onChange={setFilter}
                options={[
                  { value: 'all', label: 'All', count: skills.length },
                  { value: 'featured', label: 'Featured', count: skills.filter((skill) => skill.is_featured).length },
                  { value: 'frontend', label: 'Frontend', count: skills.filter((skill) => skill.category === 'frontend').length },
                  { value: 'backend', label: 'Backend', count: skills.filter((skill) => skill.category === 'backend').length },
                  { value: 'other', label: 'Other', count: skills.filter((skill) => !['frontend', 'backend'].includes(skill.category)).length },
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
                      <span style={{ fontSize: '1rem' }}>{skill.icon || '•'}</span>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div className="admin-row-title">
                          <div className="admin-row-title__main">{skill.name}</div>
                          <div className="admin-row-title__sub">{skill.category}</div>
                        </div>
                        <div className="admin-inline-actions">
                          <AdminStatusBadge tone="blue">{skill.level}%</AdminStatusBadge>
                          {skill.is_featured && <AdminStatusBadge tone="amber">Featured</AdminStatusBadge>}
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
                title="No skills in this segment"
                description="Try another filter or add a new skill to expand the public capability matrix."
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function CertForm({ onSave, onClose }) {
  const [form, setForm] = useState({
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
      toast.error('Name, issuer, and issue date are required');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, String(value)));

      await api.post('/certificates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Certificate added');
      onSave();
    } catch {
      toast.error('Failed to save certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminModal
      title="Add certificate"
      description="Capture the credential, issuing organization, and public verification link."
      onClose={onClose}
      width="760px"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form={formId} className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save certificate'}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="admin-form-layout">
        <section className="admin-form-section">
          <div className="admin-form-section__header">
            <h3 className="admin-form-section__title">Credential details</h3>
            <p className="admin-form-section__description">
              Use the exact certificate name and issuer so the public record looks trustworthy.
            </p>
          </div>

          <div className="admin-form-grid admin-form-grid--2">
            {[
              ['name_en', 'Name (EN) *'],
              ['name_ru', 'Name (RU)'],
              ['issuer', 'Issuer *'],
              ['category', 'Category'],
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
              <label className="input-label">Issue date *</label>
              <input
                type="date"
                className="input-field"
                value={form.issue_date}
                onChange={(event) => setForm((current) => ({ ...current, issue_date: event.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="input-label">Verification URL</label>
              <input
                className="input-field"
                value={form.credential_url}
                onChange={(event) => setForm((current) => ({ ...current, credential_url: event.target.value }))}
              />
            </div>
          </div>

          <div className="admin-form-grid admin-form-grid--2">
            <div className="form-group">
              <label className="input-label">Sort order</label>
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
                <span className="admin-checkbox__label">Feature certificate</span>
                <span className="admin-checkbox__description">
                  Featured credentials can be surfaced more prominently on the site.
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
  const { t } = useApp();
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
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const filteredCerts = certs.filter((cert) => {
    const haystack = [cert.name_en, cert.issuer, cert.category].join(' ').toLowerCase();
    const matchesSearch = !search.trim() || haystack.includes(search.trim().toLowerCase());
    const matchesFilter = filter === 'all' ? true : cert.is_featured;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (id) => {
    if (!confirm('Delete this certificate?')) return;
    try {
      await api.delete(`/certificates/${id}`);
      toast.success('Certificate deleted');
      fetchCertificates();
    } catch {
      toast.error('Failed to delete certificate');
    }
  };

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <AdminPageHeader
        eyebrow="Credentials"
        title={t('dashboard.certificates')}
        description="Keep public certifications tidy, dated correctly, and easy to verify."
        meta={[
          `${certs.length} certificates`,
          `${certs.filter((cert) => cert.is_featured).length} featured`,
        ]}
        actions={(
          <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={15} />
            Add certificate
          </button>
        )}
      />

      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h3 className="admin-panel__title">Certificate archive</h3>
            <p className="admin-panel__description">
              Search credentials, keep dates current, and make sure public verification links stay valid.
            </p>
          </div>
        </div>

        <AdminToolbar>
          <AdminToolbarGroup style={{ flex: '1 1 280px' }}>
            <AdminSearchField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, issuer, or category"
            />
          </AdminToolbarGroup>
          <AdminToolbarGroup>
            <AdminFilterTabs
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: 'All', count: certs.length },
                { value: 'featured', label: 'Featured', count: certs.filter((cert) => cert.is_featured).length },
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
                  <th>Certificate</th>
                  <th>Issuer</th>
                  <th>Issued</th>
                  <th>Category</th>
                  <th>Verification</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCerts.map((cert) => (
                  <tr key={cert.id}>
                    <td style={{ minWidth: 280 }}>
                      <div className="admin-row-title">
                        <div className="admin-row-title__main">{cert.name_en}</div>
                        <div className="admin-row-title__sub">
                          {cert.is_featured ? 'Featured credential' : 'Standard credential'}
                        </div>
                      </div>
                    </td>
                    <td>{cert.issuer}</td>
                    <td>{formatDate(cert.issue_date)}</td>
                    <td>
                      <span className="badge badge-neutral">{cert.category || 'General'}</span>
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
                          Open
                        </a>
                      ) : (
                        <AdminStatusBadge tone="neutral">No link</AdminStatusBadge>
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
            title="No certificates match the current view"
            description="Add a new credential or adjust the search to find an existing one."
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
  const { t, user, loadUser } = useApp();
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
      toast.success('Profile updated');
      loadUser();
    } catch {
      toast.error('Failed to update profile');
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
        eyebrow="Public identity"
        title={t('dashboard.profile')}
        description="Keep public-facing biography, role labels, and social links accurate across languages."
        meta={[
          form.available_for_work ? 'Available for work' : 'Not currently available',
          `${form.years_experience || 0} years experience`,
        ]}
        actions={(
          <button type="submit" form={profileFormId} className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : t('dashboard.save')}
          </button>
        )}
      />

      <form id={profileFormId} onSubmit={handleSubmit} className="admin-profile-layout">
        <AdminPanel
          className="admin-sticky"
          title="Public card"
          description="This is the core identity block that appears across the public site."
        >
          <div className="admin-form-stack">
            <AvatarUploadField
              label="Profile photo"
              name={form.full_name || user?.email || ''}
              currentSrc={form.avatar_url || ''}
              file={avatarFile}
              onFileChange={setAvatarFile}
              hint="Use a clean portrait or profile image that feels consistent with the portfolio tone."
              size={128}
            />

            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={form.available_for_work || false}
                onChange={(event) => setForm((current) => ({ ...current, available_for_work: event.target.checked }))}
              />
              <span>
                <span className="admin-checkbox__label">Available for work</span>
                <span className="admin-checkbox__description">
                  This state is reflected in public call-to-action sections.
                </span>
              </span>
            </label>

            <div className="admin-summary-list">
              <div className="admin-summary-row">
                <span className="admin-summary-row__label">Primary title</span>
                <span className="admin-summary-row__value">{form.title_en || 'Not set'}</span>
              </div>
              <div className="admin-summary-row">
                <span className="admin-summary-row__label">Location</span>
                <span className="admin-summary-row__value">{form.location || 'Not set'}</span>
              </div>
              <div className="admin-summary-row">
                <span className="admin-summary-row__label">Website</span>
                <span className="admin-summary-row__value">{form.website || 'Not set'}</span>
              </div>
            </div>
          </div>
        </AdminPanel>

        <div className="admin-form-layout">
          <AdminPanel
            title="Personal details"
            description="Use clear role labels and contact details that stay consistent with your portfolio messaging."
          >
            <div className="admin-form-grid admin-form-grid--2">
              {[
                ['full_name', 'Full name'],
                ['title_en', 'Title (EN)'],
                ['title_ru', 'Title (RU)'],
                ['title_kz', 'Title (KZ)'],
                ['location', 'Location'],
                ['phone', 'Phone'],
                ['website', 'Website'],
                ['years_experience', 'Years of experience'],
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
            title="Biography"
            description="Longer profile copy helps the portfolio read like a real professional product, not a placeholder."
          >
            <div className="admin-form-layout">
              {[
                ['bio_en', 'Bio (EN)'],
                ['bio_ru', 'Bio (RU)'],
                ['bio_kz', 'Bio (KZ)'],
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
            title="Social links"
            description="Only include destinations you actively maintain. Broken or stale links make the portfolio feel abandoned."
          >
            <div className="admin-form-grid admin-form-grid--2">
              {[
                ['github', 'GitHub'],
                ['linkedin', 'Instagram'],
                ['twitter', 'Steam'],
                ['telegram', 'Telegram'],
              ].map(([name, label]) => (
                <div key={name} className="form-group">
                  <label className="input-label">{label}</label>
                  <input
                    className="input-field"
                    value={form[name] || ''}
                    onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))}
                    placeholder={`${label} URL or handle`}
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
