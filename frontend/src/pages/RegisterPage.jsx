import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import AvatarUploadField from '../components/ui/AvatarUploadField.jsx';
import Icon from '../components/ui/Icon.jsx';
import { useApp } from '../context/AppContext.jsx';

const initialForm = {
  fullName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  whoAreYou: 'resume',
};

export default function RegisterPage() {
  const { register, user, authLoading, t } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  const roleHint = useMemo(() => {
    if (form.whoAreYou === 'resume') {
      return t('register.role_hint_resume');
    }

    return t('register.role_hint_work');
  }, [form.whoAreYou, t]);

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = t('register.full_name_required');
    }

    if (!form.username.trim()) {
      nextErrors.username = t('register.username_required');
    } else if (form.username.trim().length < 3) {
      nextErrors.username = t('register.username_min');
    }

    if (!form.email.trim()) {
      nextErrors.email = t('register.email_required');
    }

    if (!form.password) {
      nextErrors.password = t('register.password_required');
    } else if (form.password.length < 6) {
      nextErrors.password = t('register.password_min');
    }

    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = t('register.password_mismatch');
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      await register(form.email, form.password, form.fullName, {
        username: form.username,
        whoAreYou: form.whoAreYou,
      });

      if (avatarFile) {
        try {
          const avatarData = new FormData();
          avatarData.append('avatar', avatarFile);
          await api.put('/me/profile', avatarData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } catch (avatarError) {
          toast.error(avatarError.response?.data?.message || t('register.upload_failed'));
        }
      }

      toast.success(t('register.success'));
      navigate(form.whoAreYou === 'resume' ? '/dashboard/onboarding' : '/');
    } catch (error) {
      const message = error.response?.data?.message || t('register.generic_error');

      if (message.toLowerCase().includes('email')) {
        setErrors((current) => ({ ...current, email: message }));
      } else if (message.toLowerCase().includes('username') || message.includes('пайдаланушы')) {
        setErrors((current) => ({ ...current, username: message }));
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-120px', left: '-120px', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.14), transparent 70%)', filter: 'blur(24px)' }} />
        <div style={{ position: 'absolute', right: '-120px', bottom: '-120px', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.12), transparent 70%)', filter: 'blur(24px)' }} />
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--color-text-3)', textDecoration: 'none', fontSize: '0.9rem' }}>
            <Icon name="arrowLeft" size={16} />
            {t('register.back_to_site')}
          </Link>
        </div>

        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="section-label">{t('register.badge')}</div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 900, letterSpacing: '-0.03em' }}>{t('register.title')}</h1>
            <p style={{ marginTop: 8, color: 'var(--color-text-3)' }}>
              {t('register.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <AvatarUploadField
              label={t('register.photo_label')}
              name={form.fullName}
              file={avatarFile}
              onFileChange={setAvatarFile}
              hint={t('register.photo_hint')}
            />

            <div className="form-group">
              <label className="input-label">{t('register.full_name')}</label>
              <input name="fullName" className="input-field" value={form.fullName} onChange={handleChange} placeholder={t('register.full_name_placeholder')} />
              {errors.fullName ? <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 6 }}>{errors.fullName}</p> : null}
            </div>

            <div className="form-group">
              <label className="input-label">{t('register.username')}</label>
              <input name="username" className="input-field" value={form.username} onChange={handleChange} placeholder={t('register.username_placeholder')} />
              <p style={{ color: 'var(--color-text-3)', fontSize: '0.78rem', marginTop: 6 }}>
                {t('register.username_hint').replace('{username}', form.username || 'username')}
              </p>
              {errors.username ? <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 6 }}>{errors.username}</p> : null}
            </div>

            <div className="form-group">
              <label className="input-label">{t('auth.email')}</label>
              <input
                name="email"
                type="email"
                className="input-field"
                value={form.email}
                onChange={handleChange}
                placeholder={t('contact.email_placeholder')}
              />
              {errors.email ? <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 6 }}>{errors.email}</p> : null}
            </div>

            <div className="form-group">
              <label className="input-label">{t('register.who_are_you')}</label>
              <select name="whoAreYou" className="input-field" value={form.whoAreYou} onChange={handleChange}>
                <option value="resume">{t('register.who_are_you_resume')}</option>
                <option value="work">{t('register.who_are_you_work')}</option>
              </select>
              <div style={{ marginTop: 10, padding: '0.9rem 1rem', borderRadius: 14, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-2)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                {roleHint}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="input-label">{t('auth.password')}</label>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  value={form.password}
                  onChange={handleChange}
                  placeholder={t('register.password_placeholder')}
                />
                {errors.password ? <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 6 }}>{errors.password}</p> : null}
              </div>

              <div className="form-group">
                <label className="input-label">{t('register.confirm_password')}</label>
                <input
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder={t('register.confirm_password_placeholder')}
                />
                {errors.confirmPassword ? <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 6 }}>{errors.confirmPassword}</p> : null}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              style={{ marginBottom: '1rem', background: 'transparent', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 700 }}
            >
              {showPassword ? t('register.hide_password') : t('register.show_password')}
            </button>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? t('register.submitting') : t('register.submit')}
            </button>
          </form>

          <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)', textAlign: 'center', color: 'var(--color-text-3)' }}>
            {t('register.have_account')}{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>
              {t('register.login')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
