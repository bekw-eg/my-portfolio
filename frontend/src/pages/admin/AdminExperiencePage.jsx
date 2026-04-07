import { useCallback, useEffect, useMemo, useState } from 'react';
import { Briefcase, Edit2, ExternalLink, Plus, Trash2 } from 'heroicons';
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

const EXPERIENCE_TYPES = [
  'full-time',
  'part-time',
  'contract',
  'freelance',
  'internship',
];

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

function toDateInputValue(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

function ExperienceForm({ item, onSave, onClose }) {
  const { t, lang } = useApp();
  const tx = useMemo(() => getAdminText(lang), [lang]);
  const [form, setForm] = useState({
    company: '',
    position_en: '',
    position_ru: '',
    position_kz: '',
    description_en: '',
    description_ru: '',
    description_kz: '',
    location: '',
    type: 'full-time',
    start_date: '',
    end_date: '',
    is_current: false,
    logo_url: '',
    company_url: '',
    tech_stack: '',
    sort_order: 0,
    ...(item ? {
      company: item.company || '',
      position_en: item.position_en || '',
      position_ru: item.position_ru || '',
      position_kz: item.position_kz || '',
      description_en: item.description_en || '',
      description_ru: item.description_ru || '',
      description_kz: item.description_kz || '',
      location: item.location || '',
      type: item.type || 'full-time',
      start_date: toDateInputValue(item.start_date),
      end_date: toDateInputValue(item.end_date),
      is_current: item.is_current || false,
      logo_url: item.logo_url || '',
      company_url: item.company_url || '',
      tech_stack: (item.tech_stack || []).join(', '),
      sort_order: item.sort_order || 0,
    } : {}),
  });
  const [loading, setLoading] = useState(false);

  const formId = item ? `experience-form-${item.id}` : 'experience-form-new';

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'is_current' && checked ? { end_date: '' } : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.company.trim()) {
      toast.error(tx('Company name is required'));
      return;
    }

    if (!form.position_en.trim()) {
      toast.error(tx('English role title is required'));
      return;
    }

    if (!form.start_date) {
      toast.error(tx('Start date is required'));
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...form,
        end_date: form.is_current ? null : (form.end_date || null),
        is_current: Boolean(form.is_current),
        sort_order: Number(form.sort_order) || 0,
        tech_stack: form.tech_stack
          .split(',')
          .map((entry) => entry.trim())
          .filter(Boolean),
      };

      if (item) {
        await api.put(`/experience/${item.id}`, payload);
        toast.success(tx('Experience entry updated'));
      } else {
        await api.post('/experience', payload);
        toast.success(tx('Experience entry created'));
      }

      onSave();
    } catch (error) {
      toast.error(error.response?.data?.message || tx('Failed to save experience entry'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminModal
      title={item ? tx('Edit experience entry') : tx('Add experience entry')}
      description={tx('Keep your timeline polished with clear role names, date ranges, and supporting detail in every language.')}
      onClose={onClose}
      width="920px"
      footer={(
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {t('dashboard.cancel')}
          </button>
          <button type="submit" form={formId} className="btn btn-primary" disabled={loading}>
            {loading ? tx('Saving...') : tx('Save experience entry')}
          </button>
        </>
      )}
    >
      <form id={formId} onSubmit={handleSubmit} className="admin-form-layout">
        <section className="admin-form-section">
          <div className="admin-form-section__header">
            <h3 className="admin-form-section__title">{tx('Role details')}</h3>
            <p className="admin-form-section__description">
              {tx('Use a precise company name and clear role titles so the timeline reads like a strong professional record.')}
            </p>
          </div>

          <div className="admin-form-grid admin-form-grid--2">
            {[
              ['company', tx('Company *')],
              ['location', tx('Location')],
              ['position_en', tx('Role title (EN) *')],
              ['position_ru', tx('Role title (RU)')],
              ['position_kz', tx('Role title (KZ)')],
              ['company_url', tx('Company URL')],
            ].map(([name, label]) => (
              <div key={name} className="form-group">
                <label className="input-label">{label}</label>
                <input
                  name={name}
                  className="input-field"
                  value={form[name]}
                  onChange={handleChange}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="admin-form-section">
          <div className="admin-form-section__header">
            <h3 className="admin-form-section__title">{tx('Timeline and metadata')}</h3>
            <p className="admin-form-section__description">
              {tx('Dates, employment type, and sort order control how the public story of your work history is presented.')}
            </p>
          </div>

          <div className="admin-form-grid admin-form-grid--3">
            <div className="form-group">
              <label className="input-label">{tx('Employment type')}</label>
              <select
                name="type"
                className="input-field"
                value={form.type}
                onChange={handleChange}
              >
                {EXPERIENCE_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="input-label">{tx('Start date *')}</label>
              <input
                type="date"
                name="start_date"
                className="input-field"
                value={form.start_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="input-label">{tx('End date')}</label>
              <input
                type="date"
                name="end_date"
                className="input-field"
                value={form.end_date}
                onChange={handleChange}
                disabled={form.is_current}
              />
            </div>

            <div className="form-group">
              <label className="input-label">{tx('Sort order')}</label>
              <input
                type="number"
                name="sort_order"
                className="input-field"
                value={form.sort_order}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="input-label">{tx('Logo URL')}</label>
              <input
                name="logo_url"
                className="input-field"
                value={form.logo_url}
                onChange={handleChange}
              />
            </div>
          </div>

          <label className="admin-checkbox">
            <input
              type="checkbox"
              name="is_current"
              checked={form.is_current}
              onChange={handleChange}
            />
            <span>
              <span className="admin-checkbox__label">{tx('Current role')}</span>
              <span className="admin-checkbox__description">
                {tx('Current positions display a live status on the public timeline and hide the end date.')}
              </span>
            </span>
          </label>
        </section>

        <section className="admin-form-section">
          <div className="admin-form-section__header">
            <h3 className="admin-form-section__title">{tx('Descriptions and stack')}</h3>
            <p className="admin-form-section__description">
              {tx('Use the description fields for impact, scope, and outcomes, then list the main technologies that supported the work.')}
            </p>
          </div>

          <div className="admin-form-layout">
            {[
              ['description_en', tx('Description (EN)')],
              ['description_ru', tx('Description (RU)')],
              ['description_kz', tx('Description (KZ)')],
            ].map(([name, label]) => (
              <div key={name} className="form-group">
                <label className="input-label">{label}</label>
                <textarea
                  name={name}
                  className="input-field"
                  rows={4}
                  value={form[name]}
                  onChange={handleChange}
                />
              </div>
            ))}

            <div className="form-group">
              <label className="input-label">{tx('Tech stack')}</label>
              <input
                name="tech_stack"
                className="input-field"
                value={form.tech_stack}
                onChange={handleChange}
                placeholder="React, Node.js, PostgreSQL"
              />
            </div>
          </div>
        </section>
      </form>
    </AdminModal>
  );
}

export default function AdminExperiencePage() {
  const { t, lang } = useApp();
  const tx = useMemo(() => getAdminText(lang), [lang]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchExperience = useCallback(async () => {
    setLoading(true);

    try {
      const { data } = await api.get('/experience');
      setRecords(data.data || []);
    } catch {
      toast.error(tx('Failed to load experience entries'));
    } finally {
      setLoading(false);
    }
  }, [tx]);

  useEffect(() => {
    fetchExperience();
  }, [fetchExperience]);

  const counts = {
    all: records.length,
    current: records.filter((item) => item.is_current).length,
    past: records.filter((item) => !item.is_current).length,
  };

  const filteredRecords = records.filter((item) => {
    const haystack = [
      item.company,
      item.position_en,
      item.position_ru,
      item.position_kz,
      item.description_en,
      item.description_ru,
      item.description_kz,
      item.location,
      item.type,
      ...(item.tech_stack || []),
    ]
      .join(' ')
      .toLowerCase();

    const matchesSearch = !search.trim() || haystack.includes(search.trim().toLowerCase());
    const matchesFilter = filter === 'all' ? true : filter === 'current' ? item.is_current : !item.is_current;

    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (item) => {
    const label = getLocalizedAdminField(item, 'position', lang, item.position_en);

    if (!confirm(`${tx('Delete experience entry')}: "${label}"?`)) return;

    try {
      await api.delete(`/experience/${item.id}`);
      toast.success(tx('Experience entry deleted'));
      fetchExperience();
    } catch {
      toast.error(tx('Failed to delete experience entry'));
    }
  };

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <AdminPageHeader
        eyebrow={tx('Career timeline')}
        title={t('dashboard.experience')}
        description={tx('Shape the professional story shown in the public portfolio, from current roles to past milestones.')}
        meta={[
          `${records.length} ${tx('total records')}`,
          `${counts.current} ${tx('current roles')}`,
          `${counts.past} ${tx('past roles')}`,
        ]}
        actions={(
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setSelectedItem(null);
              setShowForm(true);
            }}
          >
            <Plus size={15} />
            {tx('Add experience entry')}
          </button>
        )}
      />

      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h3 className="admin-panel__title">{tx('Experience records')}</h3>
            <p className="admin-panel__description">
              {tx('Search roles, review timeline order, and keep the story of your work history tidy and current.')}
            </p>
          </div>
        </div>

        <AdminToolbar>
          <AdminToolbarGroup style={{ flex: '1 1 280px' }}>
            <AdminSearchField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={tx('Search company, role, location, or stack')}
            />
          </AdminToolbarGroup>

          <AdminToolbarGroup>
            <AdminFilterTabs
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: t('projects.all'), count: counts.all },
                { value: 'current', label: tx('Current'), count: counts.current },
                { value: 'past', label: tx('Past'), count: counts.past },
              ]}
            />
          </AdminToolbarGroup>
        </AdminToolbar>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <div className="spinner" />
          </div>
        ) : filteredRecords.length ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{tx('Role')}</th>
                  <th>{tx('Company')}</th>
                  <th>{tx('Status')}</th>
                  <th>{tx('Timeline')}</th>
                  <th>{tx('Stack')}</th>
                  <th>{tx('Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((item) => {
                  const title = getLocalizedAdminField(item, 'position', lang, item.position_en);
                  const description = getLocalizedAdminField(item, 'description', lang, item.description_en);
                  const stack = item.tech_stack || [];

                  return (
                    <tr key={item.id}>
                      <td style={{ minWidth: 300 }}>
                        <div className="admin-row-title">
                          <div className="admin-row-title__main">{title}</div>
                          <div className="admin-row-title__sub">
                            {description || tx('No role summary added yet.')}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="admin-row-title">
                          <div className="admin-row-title__main">{item.company}</div>
                          <div className="admin-row-title__sub">{item.location || tx('Location not set')}</div>
                        </div>
                      </td>
                      <td>
                        <div className="admin-inline-actions">
                          <AdminStatusBadge tone={item.is_current ? 'green' : 'neutral'}>
                            {item.is_current ? tx('Current') : tx('Past')}
                          </AdminStatusBadge>
                          <span className="badge badge-neutral">{item.type || tx('Not set')}</span>
                        </div>
                      </td>
                      <td>
                        <div className="admin-row-title">
                          <div className="admin-row-title__main">
                            {formatDate(item.start_date)} - {item.is_current ? t('experience.present') : formatDate(item.end_date)}
                          </div>
                          <div className="admin-row-title__sub">
                            {tx('Order')}: {item.sort_order || 0}
                          </div>
                        </div>
                      </td>
                      <td style={{ minWidth: 180 }}>
                        {stack.length ? (
                          <div className="admin-inline-actions">
                            {stack.slice(0, 3).map((entry) => (
                              <span key={entry} className="badge badge-neutral">
                                {entry}
                              </span>
                            ))}
                            {stack.length > 3 && (
                              <span className="badge badge-neutral">+{stack.length - 3}</span>
                            )}
                          </div>
                        ) : (
                          <AdminStatusBadge tone="neutral">{tx('No stack')}</AdminStatusBadge>
                        )}
                      </td>
                      <td>
                        <div className="admin-inline-actions">
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => {
                              setSelectedItem(item);
                              setShowForm(true);
                            }}
                            title={tx('Edit experience entry')}
                          >
                            <Edit2 size={14} />
                          </button>

                          {item.company_url && (
                            <a
                              href={item.company_url}
                              className="btn btn-ghost btn-sm"
                              title={tx('Open company link')}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <ExternalLink size={14} />
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
                            onClick={() => handleDelete(item)}
                            title={tx('Delete experience entry')}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <AdminEmptyState
            icon={Briefcase}
            title={tx('No experience entries match this view')}
            description={tx('Add your first role or adjust the filters to bring an existing entry back into view.')}
            action={(
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setSelectedItem(null);
                  setShowForm(true);
                }}
              >
                <Plus size={15} />
                {tx('Add experience entry')}
              </button>
            )}
          />
        )}
      </section>

      {showForm && (
        <ExperienceForm
          item={selectedItem}
          onSave={() => {
            setShowForm(false);
            fetchExperience();
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
