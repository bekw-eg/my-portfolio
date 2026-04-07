import { useCallback, useEffect, useMemo, useState } from 'react';
import { Edit2, ExternalLink, GraduationCap, Plus, Trash2 } from 'heroicons';
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

function toDateInputValue(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

function EducationForm({ item, onSave, onClose }) {
  const { t, lang } = useApp();
  const tx = useMemo(() => getAdminText(lang), [lang]);
  const [form, setForm] = useState({
    institution: '',
    degree_en: '',
    degree_ru: '',
    degree_kz: '',
    field_en: '',
    field_ru: '',
    field_kz: '',
    description_en: '',
    description_ru: '',
    description_kz: '',
    start_date: '',
    end_date: '',
    is_current: false,
    gpa: '',
    logo_url: '',
    institution_url: '',
    sort_order: 0,
    ...(item ? {
      institution: item.institution || '',
      degree_en: item.degree_en || '',
      degree_ru: item.degree_ru || '',
      degree_kz: item.degree_kz || '',
      field_en: item.field_en || '',
      field_ru: item.field_ru || '',
      field_kz: item.field_kz || '',
      description_en: item.description_en || '',
      description_ru: item.description_ru || '',
      description_kz: item.description_kz || '',
      start_date: toDateInputValue(item.start_date),
      end_date: toDateInputValue(item.end_date),
      is_current: item.is_current || false,
      gpa: item.gpa || '',
      logo_url: item.logo_url || '',
      institution_url: item.institution_url || '',
      sort_order: item.sort_order || 0,
    } : {}),
  });
  const [loading, setLoading] = useState(false);

  const formId = item ? `education-form-${item.id}` : 'education-form-new';

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

    if (!form.institution.trim()) {
      toast.error(tx('Institution name is required'));
      return;
    }

    if (!form.degree_en.trim()) {
      toast.error(tx('English degree title is required'));
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
      };

      if (item) {
        await api.put(`/education/${item.id}`, payload);
        toast.success(tx('Education entry updated'));
      } else {
        await api.post('/education', payload);
        toast.success(tx('Education entry created'));
      }

      onSave();
    } catch (error) {
      toast.error(error.response?.data?.message || tx('Failed to save education entry'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminModal
      title={item ? tx('Edit education entry') : tx('Add education entry')}
      description={tx('Capture programs, disciplines, and study dates in a clean format that matches the rest of the admin workspace.')}
      onClose={onClose}
      width="920px"
      footer={(
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {t('dashboard.cancel')}
          </button>
          <button type="submit" form={formId} className="btn btn-primary" disabled={loading}>
            {loading ? tx('Saving...') : tx('Save education entry')}
          </button>
        </>
      )}
    >
      <form id={formId} onSubmit={handleSubmit} className="admin-form-layout">
        <section className="admin-form-section">
          <div className="admin-form-section__header">
            <h3 className="admin-form-section__title">{tx('Program details')}</h3>
            <p className="admin-form-section__description">
              {tx('The public education section reads best when the school, degree, and discipline are written clearly and consistently.')}
            </p>
          </div>

          <div className="admin-form-grid admin-form-grid--2">
            {[
              ['institution', tx('Institution *')],
              ['institution_url', tx('Institution URL')],
              ['degree_en', tx('Degree (EN) *')],
              ['degree_ru', tx('Degree (RU)')],
              ['degree_kz', tx('Degree (KZ)')],
              ['field_en', tx('Field of study (EN)')],
              ['field_ru', tx('Field of study (RU)')],
              ['field_kz', tx('Field of study (KZ)')],
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
            <h3 className="admin-form-section__title">{tx('Dates and supporting details')}</h3>
            <p className="admin-form-section__description">
              {tx('Use start and end dates to keep the timeline readable, then add GPA and optional identity links if they matter publicly.')}
            </p>
          </div>

          <div className="admin-form-grid admin-form-grid--3">
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
              <label className="input-label">{tx('GPA')}</label>
              <input
                name="gpa"
                className="input-field"
                value={form.gpa}
                onChange={handleChange}
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
              <span className="admin-checkbox__label">{tx('Current study')}</span>
              <span className="admin-checkbox__description">
                {tx('Current programs stay marked as active on the public education timeline.')}
              </span>
            </span>
          </label>
        </section>

        <section className="admin-form-section">
          <div className="admin-form-section__header">
            <h3 className="admin-form-section__title">{tx('Descriptions')}</h3>
            <p className="admin-form-section__description">
              {tx('Brief descriptions are useful for honors, focus areas, or what made the program worth highlighting.')}
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
          </div>
        </section>
      </form>
    </AdminModal>
  );
}

export default function AdminEducationPage() {
  const { t, lang } = useApp();
  const tx = useMemo(() => getAdminText(lang), [lang]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchEducation = useCallback(async () => {
    setLoading(true);

    try {
      const { data } = await api.get('/education');
      setRecords(data.data || []);
    } catch {
      toast.error(tx('Failed to load education entries'));
    } finally {
      setLoading(false);
    }
  }, [tx]);

  useEffect(() => {
    fetchEducation();
  }, [fetchEducation]);

  const counts = {
    all: records.length,
    current: records.filter((item) => item.is_current).length,
    completed: records.filter((item) => !item.is_current).length,
  };

  const filteredRecords = records.filter((item) => {
    const haystack = [
      item.institution,
      item.degree_en,
      item.degree_ru,
      item.degree_kz,
      item.field_en,
      item.field_ru,
      item.field_kz,
      item.description_en,
      item.description_ru,
      item.description_kz,
      item.gpa,
    ]
      .join(' ')
      .toLowerCase();

    const matchesSearch = !search.trim() || haystack.includes(search.trim().toLowerCase());
    const matchesFilter = filter === 'all' ? true : filter === 'current' ? item.is_current : !item.is_current;

    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (item) => {
    const label = getLocalizedAdminField(item, 'degree', lang, item.degree_en);

    if (!confirm(`${tx('Delete education entry')}: "${label}"?`)) return;

    try {
      await api.delete(`/education/${item.id}`);
      toast.success(tx('Education entry deleted'));
      fetchEducation();
    } catch {
      toast.error(tx('Failed to delete education entry'));
    }
  };

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <AdminPageHeader
        eyebrow={tx('Academic record')}
        title={t('dashboard.education')}
        description={tx('Manage the education section with the same polish as projects, blog posts, and profile content.')}
        meta={[
          `${records.length} ${tx('total records')}`,
          `${counts.current} ${tx('current study')}`,
          `${counts.completed} ${tx('completed programs')}`,
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
            {tx('Add education entry')}
          </button>
        )}
      />

      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h3 className="admin-panel__title">{tx('Education records')}</h3>
            <p className="admin-panel__description">
              {tx('Search schools and programs, review date ranges, and keep the academic history aligned with the rest of the portfolio.')}
            </p>
          </div>
        </div>

        <AdminToolbar>
          <AdminToolbarGroup style={{ flex: '1 1 280px' }}>
            <AdminSearchField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={tx('Search institution, degree, field, or GPA')}
            />
          </AdminToolbarGroup>

          <AdminToolbarGroup>
            <AdminFilterTabs
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: t('projects.all'), count: counts.all },
                { value: 'current', label: tx('Current'), count: counts.current },
                { value: 'completed', label: tx('Completed'), count: counts.completed },
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
                  <th>{tx('Program')}</th>
                  <th>{tx('Institution')}</th>
                  <th>{tx('Status')}</th>
                  <th>{tx('Timeline')}</th>
                  <th>{tx('Details')}</th>
                  <th>{tx('Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((item) => {
                  const degree = getLocalizedAdminField(item, 'degree', lang, item.degree_en);
                  const field = getLocalizedAdminField(item, 'field', lang, item.field_en);
                  const description = getLocalizedAdminField(item, 'description', lang, item.description_en);

                  return (
                    <tr key={item.id}>
                      <td style={{ minWidth: 320 }}>
                        <div className="admin-row-title">
                          <div className="admin-row-title__main">{degree}</div>
                          <div className="admin-row-title__sub">
                            {field || tx('Field of study not set')}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="admin-row-title">
                          <div className="admin-row-title__main">{item.institution}</div>
                          <div className="admin-row-title__sub">{description || tx('No program summary added yet.')}</div>
                        </div>
                      </td>
                      <td>
                        <AdminStatusBadge tone={item.is_current ? 'green' : 'neutral'}>
                          {item.is_current ? tx('Current') : tx('Completed')}
                        </AdminStatusBadge>
                      </td>
                      <td>
                        <div className="admin-row-title">
                          <div className="admin-row-title__main">
                            {formatDate(item.start_date)} - {item.is_current ? t('education.present') : formatDate(item.end_date)}
                          </div>
                          <div className="admin-row-title__sub">
                            {tx('Order')}: {item.sort_order || 0}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="admin-inline-actions">
                          {item.gpa ? (
                            <span className="badge badge-neutral">GPA {item.gpa}</span>
                          ) : (
                            <AdminStatusBadge tone="neutral">{tx('No GPA')}</AdminStatusBadge>
                          )}
                        </div>
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
                            title={tx('Edit education entry')}
                          >
                            <Edit2 size={14} />
                          </button>

                          {item.institution_url && (
                            <a
                              href={item.institution_url}
                              className="btn btn-ghost btn-sm"
                              title={tx('Open institution link')}
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
                            title={tx('Delete education entry')}
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
            icon={GraduationCap}
            title={tx('No education entries match this view')}
            description={tx('Create your first program entry or adjust the current filters to reveal an existing record.')}
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
                {tx('Add education entry')}
              </button>
            )}
          />
        )}
      </section>

      {showForm && (
        <EducationForm
          item={selectedItem}
          onSave={() => {
            setShowForm(false);
            fetchEducation();
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
