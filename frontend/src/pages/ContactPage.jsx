import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { Mail, Send, MapPin, Phone, Github, Instagram, CheckCircle, AlertCircle } from 'heroicons';
import api from '../services/api.js';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const { t } = useApp();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = t('contact.name_required');
    if (!form.email.trim()) e.email = t('contact.email_required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t('contact.email_invalid');
    if (!form.message.trim()) e.message = t('contact.message_required');
    else if (form.message.length < 10) e.message = t('contact.message_too_short');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/contacts', form);
      setSuccess(true);
      setForm({ name: '', email: '', subject: '', message: '' });
      toast.success(t('contact.success'));
    } catch {
      toast.error(t('contact.error'));
    }
    setLoading(false);
  };

  const contactInfo = [
    { icon: Mail, label: t('contact.info_email'), value: 'berdibekegeubai@gmail.com', href: 'mailto:berdibekegeubai@gmail.com' },
    { icon: MapPin, label: t('contact.info_location'), value: t('contact.info_location_value') },
    { icon: Phone, label: t('contact.info_phone'), value: '+7 (777) 215-7449', href: 'tel:+77000000000' },
  ];

  return (
    <div className="page-enter">
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '3rem 0' }}>
        <div className="container-app">
          <div className="section-label"><Mail size={12} /> {t('contact.subtitle')}</div>
          <h1 className="section-title">{t('contact.title')}</h1>
          <p style={{ color: 'var(--color-text-3)', marginTop: '0.75rem', fontSize: '1.05rem' }}>
            {t('contact.hero_text')}
          </p>
        </div>
      </div>

      <div className="container-app section-padding">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'start' }}>
          {/* Info */}
          <div>
            <h2 style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: '1rem' }}>{t('contact.connect_title')}</h2>
            <p style={{ color: 'var(--color-text-2)', lineHeight: 1.8, marginBottom: '2rem' }}>
              {t('contact.connect_text')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {contactInfo.map(({ icon: Icon, label, value, href }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={18} style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                    {href
                      ? <a href={href} style={{ color: 'var(--color-text)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }} className="hover:text-primary-500">{value}</a>
                      : <p style={{ color: 'var(--color-text)', fontWeight: 500 }}>{value}</p>
                    }
                  </div>
                </div>
              ))}
            </div>

            {/* Social */}
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-3)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('contact.find_online')}</p>
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { icon: Github, href: 'https://github.com', label: t('social.github') },
                  { icon: Instagram, href: 'https://www.instagram.com/bekw.eg/', label: t('social.instagram') },
                ].map(({ icon: Icon, href, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                    <Icon size={14} /> {label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            {success ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  <CheckCircle size={32} style={{ color: '#10b981' }} />
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{t('contact.sent_title')}</h3>
                <p style={{ color: 'var(--color-text-3)' }}>{t('contact.success')}</p>
                <button onClick={() => setSuccess(false)} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                  {t('contact.send_another')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ gridColumn: '1' }}>
                    <label className="input-label">{t('contact.name')} *</label>
                    <input
                      name="name"
                      className="input-field"
                      placeholder={t('contact.name_placeholder')}
                      value={form.name}
                      onChange={handleChange}
                      style={{ borderColor: errors.name ? '#ef4444' : undefined }}
                    />
                    {errors.name && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 4 }}>{errors.name}</p>}
                  </div>
                  <div className="form-group" style={{ gridColumn: '2' }}>
                    <label className="input-label">{t('contact.email')} *</label>
                    <input
                      name="email"
                      type="email"
                      className="input-field"
                      placeholder={t('contact.email_placeholder')}
                      value={form.email}
                      onChange={handleChange}
                      style={{ borderColor: errors.email ? '#ef4444' : undefined }}
                    />
                    {errors.email && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 4 }}>{errors.email}</p>}
                  </div>
                </div>
                <div className="form-group">
                  <label className="input-label">{t('contact.subject')}</label>
                  <input
                    name="subject"
                    className="input-field"
                      placeholder={t('contact.subject_placeholder')}
                    value={form.subject}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="input-label">{t('contact.message')} *</label>
                  <textarea
                    name="message"
                    className="input-field"
                    placeholder={t('contact.message_placeholder')}
                    rows={6}
                    value={form.message}
                    onChange={handleChange}
                    style={{ borderColor: errors.message ? '#ef4444' : undefined }}
                  />
                  {errors.message && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 4 }}>{errors.message}</p>}
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
                  {loading ? (
                    <>{t('contact.sending')} <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></>
                  ) : (
                    <><Send size={16} /> {t('contact.send')}</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
