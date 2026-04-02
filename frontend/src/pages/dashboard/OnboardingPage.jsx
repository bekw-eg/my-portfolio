import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Sparkles, User } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import Icon from '../../components/ui/Icon.jsx';
import AvatarUploadField from '../../components/ui/AvatarUploadField.jsx';
import LanguageSwitcher from '../../components/ui/LanguageSwitcher.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { onboardingCopy } from '../../i18n/onboardingCopy.js';

const twoColumnGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
  gap: 12,
};

const splitWorkbenchGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
  gap: 16,
};

const compactGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
  gap: 12,
};

const entryCardStyle = {
  border: '1px solid var(--color-border)',
  borderRadius: 14,
  padding: '0.85rem',
  background: 'var(--color-surface)',
};

function StepPill({ index, title, active, done, stepWord }) {
  return (
    <div className={`studio-step-pill${active ? ' is-active' : ''}${done ? ' is-done' : ''}`}>
      <div className="studio-step-pill__index">
        {done ? <Icon name="check" size={16} /> : index}
      </div>
      <div>
        <div className="studio-step-pill__eyebrow">{stepWord} {index}</div>
        <div className="studio-step-pill__title">{title}</div>
      </div>
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <div className="form-group studio-field" style={{ marginBottom: '1rem' }}>
      <label className="input-label">{label}</label>
      {children}
      {hint ? <div className="studio-field__hint">{hint}</div> : null}
    </div>
  );
}

export default function OnboardingPage() {
  const { user, applyPrimaryColor, lang } = useApp();
  const copy = onboardingCopy[lang] || onboardingCopy.kz;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [step, setStep] = useState(1);
  const [profileAvatarFile, setProfileAvatarFile] = useState(null);
  const activeTitleField = `title_${lang}`;
  const activeBioField = `bio_${lang}`;

  const steps = useMemo(
    () => Object.entries(copy.stepInfo).map(([id, item]) => ({ id: Number(id), ...item })),
    [copy.stepInfo],
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [profileResponse, settingsResponse] = await Promise.all([
          api.get('/me/profile'),
          api.get('/me/settings'),
        ]);

        if (!mounted) {
          return;
        }

        setProfile(profileResponse.data.data);
        setSettings(settingsResponse.data.data);

        const currentStep = Number(settingsResponse.data.data?.onboarding_step || 1);
        setStep(Math.min(9, Math.max(1, currentStep)));
      } catch {
        // ignore initial setup errors here
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const updateSettings = async (patch) => {
    const response = await api.put('/me/settings', patch);
    setSettings(response.data.data);
    return response.data.data;
  };

  const bumpStep = async (nextStep) => {
    const target = Math.min(9, Math.max(1, nextStep));
    setStep(target);

    try {
      await updateSettings({ onboarding_step: target });
    } catch {
      // ignore step sync failures in UI
    }
  };

  const saveProfile = async (patch, avatarFile = null) => {
    const formData = new FormData();

    Object.entries(patch).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    const response = await api.put('/me/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    setProfile(response.data.data);
    setProfileAvatarFile(null);
    return response.data.data;
  };

  const submitStep1 = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const activeTitle = profile?.[activeTitleField] || profile?.profession || '';
      const activeBio = profile?.[activeBioField] || profile?.bio_kz || profile?.intro_kz || '';

      await saveProfile({
        full_name: profile?.full_name || '',
        profession: activeTitle,
        title_kz: profile?.title_kz || '',
        title_ru: profile?.title_ru || '',
        title_en: profile?.title_en || '',
        bio_kz: profile?.bio_kz || '',
        bio_ru: profile?.bio_ru || '',
        bio_en: profile?.bio_en || '',
        intro_kz: profile?.intro_kz || profile?.bio_kz || activeBio,
        location: profile?.location || '',
        phone: profile?.phone || '',
      }, profileAvatarFile);

      toast.success(copy.profile.saved);
      await bumpStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || copy.profile.saveError);
    } finally {
      setSaving(false);
    }
  };

  const submitStep2 = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      await saveProfile({
        website: profile?.website || '',
        github: profile?.github || '',
        linkedin: profile?.linkedin || '',
        telegram: profile?.telegram || '',
        instagram: profile?.instagram || '',
      });

      toast.success(copy.links.saved);
      await bumpStep(3);
    } catch (error) {
      toast.error(error.response?.data?.message || copy.links.saveError);
    } finally {
      setSaving(false);
    }
  };

  const [myProjects, setMyProjects] = useState([]);
  const [projForm, setProjForm] = useState({ title: '', description: '', tech: '', demo_url: '', github_url: '' });
  const [mySkills, setMySkills] = useState([]);
  const [skillForm, setSkillForm] = useState({ name: '', category: 'frontend', level: 80, icon: '' });
  const [myExp, setMyExp] = useState([]);
  const [expForm, setExpForm] = useState({ company: '', position: '', start_date: '', end_date: '', is_current: true, description: '' });
  const [myEdu, setMyEdu] = useState([]);
  const [eduForm, setEduForm] = useState({ institution: '', degree: '', field: '', start_date: '', end_date: '', is_current: false, description: '' });
  const [myCerts, setMyCerts] = useState([]);
  const [certForm, setCertForm] = useState({ name: '', issuer: '', issue_date: '', credential_url: '' });
  const [themeChoice, setThemeChoice] = useState({ primary_color: 'blue', primary_color_hex: '' });

  const loadMyProjects = async () => {
    const response = await api.get('/me/projects');
    setMyProjects(response.data.data || []);
  };

  const addProject = async () => {
    const formData = new FormData();
    formData.append('title_kz', projForm.title);
    formData.append('title_ru', projForm.title);
    formData.append('title_en', projForm.title);
    formData.append('description_kz', projForm.description);
    formData.append('description_ru', projForm.description);
    formData.append('description_en', projForm.description);
    formData.append('tech_stack', JSON.stringify(projForm.tech.split(',').map((item) => item.trim()).filter(Boolean)));
    formData.append('demo_url', projForm.demo_url);
    formData.append('github_url', projForm.github_url);
    formData.append('is_published', 'true');
    await api.post('/me/projects', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    setProjForm({ title: '', description: '', tech: '', demo_url: '', github_url: '' });
    await loadMyProjects();
  };

  const deleteProject = async (id) => {
    await api.delete(`/me/projects/${id}`);
    await loadMyProjects();
  };

  const loadMySkills = async () => {
    const response = await api.get('/me/skills');
    setMySkills(response.data.data || []);
  };

  const addSkill = async () => {
    await api.post('/me/skills', {
      name: skillForm.name,
      category: skillForm.category,
      level: Number(skillForm.level),
      icon: skillForm.icon,
      sort_order: 0,
      is_featured: 'true',
    });
    setSkillForm({ name: '', category: 'frontend', level: 80, icon: '' });
    await loadMySkills();
  };

  const deleteSkill = async (id) => {
    await api.delete(`/me/skills/${id}`);
    await loadMySkills();
  };

  const loadMyExp = async () => {
    const response = await api.get('/me/experience');
    setMyExp(response.data.data || []);
  };

  const addExp = async () => {
    await api.post('/me/experience', {
      company: expForm.company,
      position_kz: expForm.position,
      position_ru: expForm.position,
      position_en: expForm.position,
      description_kz: expForm.description,
      description_ru: expForm.description,
      description_en: expForm.description,
      start_date: expForm.start_date,
      end_date: expForm.is_current ? null : (expForm.end_date || null),
      is_current: expForm.is_current ? 'true' : 'false',
      location: profile?.location || '',
      type: 'full-time',
      tech_stack: JSON.stringify([]),
      sort_order: 0,
    });
    setExpForm({ company: '', position: '', start_date: '', end_date: '', is_current: true, description: '' });
    await loadMyExp();
  };

  const deleteExp = async (id) => {
    await api.delete(`/me/experience/${id}`);
    await loadMyExp();
  };

  const loadMyEdu = async () => {
    const response = await api.get('/me/education');
    setMyEdu(response.data.data || []);
  };

  const addEdu = async () => {
    await api.post('/me/education', {
      institution: eduForm.institution,
      degree_kz: eduForm.degree,
      degree_ru: eduForm.degree,
      degree_en: eduForm.degree,
      field_kz: eduForm.field,
      field_ru: eduForm.field,
      field_en: eduForm.field,
      description_kz: eduForm.description,
      description_ru: eduForm.description,
      description_en: eduForm.description,
      start_date: eduForm.start_date,
      end_date: eduForm.is_current ? null : (eduForm.end_date || null),
      is_current: eduForm.is_current ? 'true' : 'false',
      sort_order: 0,
    });
    setEduForm({ institution: '', degree: '', field: '', start_date: '', end_date: '', is_current: false, description: '' });
    await loadMyEdu();
  };

  const deleteEdu = async (id) => {
    await api.delete(`/me/education/${id}`);
    await loadMyEdu();
  };

  const loadMyCerts = async () => {
    const response = await api.get('/me/certificates');
    setMyCerts(response.data.data || []);
  };

  const addCert = async () => {
    const formData = new FormData();
    formData.append('name_kz', certForm.name);
    formData.append('name_ru', certForm.name);
    formData.append('name_en', certForm.name);
    formData.append('issuer', certForm.issuer);
    formData.append('issue_date', certForm.issue_date);
    formData.append('credential_url', certForm.credential_url);
    formData.append('is_featured', 'true');
    formData.append('sort_order', '0');
    await api.post('/me/certificates', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    setCertForm({ name: '', issuer: '', issue_date: '', credential_url: '' });
    await loadMyCerts();
  };

  const deleteCert = async (id) => {
    await api.delete(`/me/certificates/${id}`);
    await loadMyCerts();
  };

  useEffect(() => {
    if (step === 3) loadMyProjects().catch(() => {});
    if (step === 4) loadMySkills().catch(() => {});
    if (step === 5) loadMyExp().catch(() => {});
    if (step === 6) loadMyEdu().catch(() => {});
    if (step === 7) loadMyCerts().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    if (!settings) {
      return;
    }

    setThemeChoice({
      primary_color: settings.primary_color || 'blue',
      primary_color_hex: settings.primary_color_hex || '',
    });
  }, [settings]);

  const saveTheme = async () => {
    setSaving(true);

    try {
      const response = await updateSettings({
        primary_color: themeChoice.primary_color,
        primary_color_hex: themeChoice.primary_color === 'custom' ? themeChoice.primary_color_hex : null,
      });
      applyPrimaryColor(response);
      toast.success(copy.theme.saved);
      await bumpStep(9);
    } catch (error) {
      toast.error(error.response?.data?.message || copy.theme.saveError);
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    setSaving(true);

    try {
      const response = await updateSettings({
        is_published: true,
        onboarding_completed: true,
        onboarding_step: 9,
      });
      setSettings(response);
      toast.success(copy.publish.published);
    } catch (error) {
      toast.error(error.response?.data?.message || copy.publish.error);
    } finally {
      setSaving(false);
    }
  };

  const currentStep = steps.find((item) => item.id === step) || steps[0];
  const completedSteps = settings?.onboarding_completed ? steps.length : Math.max((settings?.onboarding_step || 1) - 1, 0);
  const progress = Math.max(12, Math.round((step / steps.length) * 100));
  const publicPath = `/u/${user?.username || ''}`;

  if (loading) {
    return (
      <div className="studio-shell studio-onboarding">
        <div
          className="container-app studio-frame"
          style={{ minHeight: '60vh', justifyContent: 'center', alignItems: 'center' }}
        >
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="studio-shell studio-onboarding">
      <div className="container-app studio-frame">
        <div className="studio-card studio-card--paper studio-onboarding__hero">
          <div>
            <div className="studio-eyebrow">{copy.heroEyebrow}</div>
            <h1 className="studio-display" style={{ marginTop: 12 }}>
              {copy.heroTitleLead} <em>{copy.heroTitleEmphasis}</em> {copy.heroTitleTail}
            </h1>
            <p className="studio-lede">
              {copy.heroDescription}
            </p>
            <div className="studio-chip-row">
              <span className="studio-chip">
                <Sparkles size={14} />
                {step} / {steps.length} {copy.stepCounterSuffix}
              </span>
              <span className="studio-chip">
                <CheckCircle size={14} />
                {settings?.is_published ? copy.published : copy.draft}
              </span>
              <span className="studio-chip">
                <User size={14} />
                {publicPath}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <LanguageSwitcher compact label={copy.languageLabel} />
            <Link to="/dashboard" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
              {copy.backToDashboard}
            </Link>
          </div>
        </div>

        <div className="studio-onboarding__layout">
          <aside className="studio-onboarding__sidebar">
            <div className="studio-card studio-card--ink">
              <div className="studio-eyebrow">{copy.progress}</div>
              <div style={{ marginTop: 10, fontSize: '2.4rem', fontWeight: 800, lineHeight: 0.92, letterSpacing: '-0.06em' }}>
                {step}/{steps.length}
              </div>
              <p style={{ marginTop: 10, color: 'rgba(239,244,255,0.78)', lineHeight: 1.75 }}>
                {currentStep.title}
              </p>
              <div className="studio-progress" style={{ marginTop: 18 }}>
                <div className="studio-progress__fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="studio-meta-grid">
                <div className="studio-meta">
                  <div className="studio-meta__label">{copy.completed}</div>
                  <div className="studio-meta__value">{completedSteps}</div>
                </div>
                <div className="studio-meta">
                  <div className="studio-meta__label">{copy.publicLink}</div>
                  <div className="studio-meta__value">{publicPath}</div>
                </div>
              </div>
            </div>

            <div className="studio-card">
              <div className="studio-eyebrow">{copy.stepsTitle}</div>
              <div className="studio-onboarding__steps" style={{ marginTop: 12 }}>
                {steps.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="studio-onboarding__step-trigger"
                    onClick={() => setStep(item.id)}
                  >
                    <StepPill
                      index={item.id}
                      title={item.title}
                      active={item.id === step}
                      done={settings?.onboarding_completed ? true : (item.id < (settings?.onboarding_step || 1))}
                      stepWord={copy.stepWord}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="studio-card studio-card--paper">
              <div className="studio-eyebrow">{copy.note}</div>
              <div className="studio-onboarding__guide-text">{currentStep.cue}</div>
            </div>
          </aside>

          <section className="studio-card studio-card--paper">
            <div className="studio-onboarding__sheet-head">
              <div className="studio-onboarding__sheet-copy">
                <div className="studio-eyebrow">{copy.currentStep}</div>
                <h2 className="studio-onboarding__sheet-title" style={{ marginTop: 10 }}>
                  {currentStep.title} <em>{copy.sheetTitleEmphasis}</em>
                </h2>
                <p className="studio-onboarding__sheet-description">{currentStep.description}</p>
              </div>

              <div className="studio-onboarding__sheet-note">
                <div className="studio-onboarding__sheet-note-title">{copy.whyItMatters}</div>
                <div className="studio-onboarding__sheet-note-body">
                  {copy.whyItMattersBody}
                </div>
              </div>
            </div>

            <div className="studio-divider" />

            {step === 1 && (
              <form onSubmit={submitStep1}>
                <AvatarUploadField
                  label={copy.profile.photo}
                  name={profile?.full_name || user?.username || ''}
                  currentSrc={profile?.avatar_url || ''}
                  file={profileAvatarFile}
                  onFileChange={setProfileAvatarFile}
                  hint={copy.profile.photoHint}
                  size={136}
                />

                <Field label={copy.profile.fullName}>
                  <input
                    className="input-field"
                    value={profile?.full_name || ''}
                    onChange={(event) => setProfile((current) => ({ ...current, full_name: event.target.value }))}
                  />
                </Field>

                <Field label={copy.profile.role} hint={copy.profile.roleHint}>
                  <input
                    className="input-field"
                    value={profile?.[activeTitleField] || profile?.profession || ''}
                    onChange={(event) => setProfile((current) => ({
                      ...current,
                      [activeTitleField]: event.target.value,
                      profession: event.target.value,
                    }))}
                  />
                </Field>

                <Field label={copy.profile.intro}>
                  <textarea
                    className="input-field"
                    value={profile?.[activeBioField] || (lang === 'kz' ? profile?.intro_kz : '') || ''}
                    onChange={(event) => setProfile((current) => ({
                      ...current,
                      [activeBioField]: event.target.value,
                      ...(lang === 'kz' ? { intro_kz: event.target.value } : {}),
                    }))}
                  />
                </Field>

                <div style={twoColumnGrid}>
                  <Field label={copy.profile.location}>
                    <input
                      className="input-field"
                      value={profile?.location || ''}
                      onChange={(event) => setProfile((current) => ({ ...current, location: event.target.value }))}
                    />
                  </Field>
                  <Field label={copy.profile.phone}>
                    <input
                      className="input-field"
                      value={profile?.phone || ''}
                      onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))}
                    />
                  </Field>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button className="btn btn-primary" disabled={saving}>
                    <Icon name="arrowRight" size={16} color="white" />
                    {copy.saveAndContinue}
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={submitStep2}>
                <div style={twoColumnGrid}>
                  <Field label={copy.links.website}>
                    <input
                      className="input-field"
                      value={profile?.website || ''}
                      onChange={(event) => setProfile((current) => ({ ...current, website: event.target.value }))}
                    />
                  </Field>
                  <Field label={copy.links.github}>
                    <input
                      className="input-field"
                      value={profile?.github || ''}
                      onChange={(event) => setProfile((current) => ({ ...current, github: event.target.value }))}
                    />
                  </Field>
                  <Field label={copy.links.linkedin}>
                    <input
                      className="input-field"
                      value={profile?.linkedin || ''}
                      onChange={(event) => setProfile((current) => ({ ...current, linkedin: event.target.value }))}
                    />
                  </Field>
                  <Field label={copy.links.telegram}>
                    <input
                      className="input-field"
                      value={profile?.telegram || ''}
                      onChange={(event) => setProfile((current) => ({ ...current, telegram: event.target.value }))}
                    />
                  </Field>
                  <Field label={copy.links.instagram}>
                    <input
                      className="input-field"
                      value={profile?.instagram || ''}
                      onChange={(event) => setProfile((current) => ({ ...current, instagram: event.target.value }))}
                    />
                  </Field>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => bumpStep(1)} disabled={saving}>
                    <Icon name="arrowLeft" size={16} />
                    {copy.back}
                  </button>
                  <button className="btn btn-primary" disabled={saving}>
                    <Icon name="arrowRight" size={16} color="white" />
                    {copy.saveAndContinue}
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <div>
                <div style={splitWorkbenchGrid}>
                  <div>
                    <h3 style={{ fontWeight: 800, marginBottom: 10 }}>{copy.projects.addTitle}</h3>
                    <Field label={copy.projects.title}>
                      <input
                        className="input-field"
                        value={projForm.title}
                        onChange={(event) => setProjForm((current) => ({ ...current, title: event.target.value }))}
                      />
                    </Field>
                    <Field label={copy.projects.description}>
                      <textarea
                        className="input-field"
                        value={projForm.description}
                        onChange={(event) => setProjForm((current) => ({ ...current, description: event.target.value }))}
                      />
                    </Field>
                    <Field label={copy.projects.tech} hint={copy.projects.techHint}>
                      <input
                        className="input-field"
                        value={projForm.tech}
                        onChange={(event) => setProjForm((current) => ({ ...current, tech: event.target.value }))}
                      />
                    </Field>
                    <div style={twoColumnGrid}>
                      <Field label={copy.projects.demo}>
                        <input
                          className="input-field"
                          value={projForm.demo_url}
                          onChange={(event) => setProjForm((current) => ({ ...current, demo_url: event.target.value }))}
                        />
                      </Field>
                      <Field label={copy.projects.github}>
                        <input
                          className="input-field"
                          value={projForm.github_url}
                          onChange={(event) => setProjForm((current) => ({ ...current, github_url: event.target.value }))}
                        />
                      </Field>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      type="button"
                      onClick={() => addProject().then(() => toast.success(copy.projects.added)).catch(() => toast.error(copy.projects.addError))}
                    >
                      <Icon name="add" size={16} />
                      {copy.projects.add}
                    </button>
                  </div>

                  <div>
                    <h3 style={{ fontWeight: 800, marginBottom: 10 }}>{copy.projects.current}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {myProjects.length ? myProjects.map((project) => (
                        <div key={project.id} style={entryCardStyle}>
                          <div style={{ fontWeight: 800 }}>{project.title_kz || project.title_en}</div>
                          <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
                            <button
                              className="btn btn-ghost btn-sm"
                              type="button"
                              onClick={() => deleteProject(project.id).then(() => toast.success(copy.projects.deleted)).catch(() => toast.error(copy.projects.deleteError))}
                            >
                              <Icon name="delete" size={16} />
                              {copy.projects.delete}
                            </button>
                          </div>
                        </div>
                      )) : (
                        <div style={{ color: 'var(--color-text-3)' }}>
                          {copy.projects.empty}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 16 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => bumpStep(2)}>
                    <Icon name="arrowLeft" size={16} />
                    {copy.back}
                  </button>
                  <button type="button" className="btn btn-primary" onClick={() => bumpStep(4)}>
                    <Icon name="arrowRight" size={16} color="white" />
                    {copy.nextStep}
                  </button>
                </div>
              </div>
            )}

            {step === 7 && (
              <div>
                <h3 style={{ fontWeight: 800, marginBottom: 10 }}>{copy.certificates.title}</h3>
                <div style={splitWorkbenchGrid}>
                  <div>
                    <Field label={copy.certificates.name}>
                      <input
                        className="input-field"
                        value={certForm.name}
                        onChange={(event) => setCertForm((current) => ({ ...current, name: event.target.value }))}
                      />
                    </Field>
                    <Field label={copy.certificates.issuer}>
                      <input
                        className="input-field"
                        value={certForm.issuer}
                        onChange={(event) => setCertForm((current) => ({ ...current, issuer: event.target.value }))}
                      />
                    </Field>
                    <Field label={copy.certificates.issueDate}>
                      <input
                        className="input-field"
                        type="date"
                        value={certForm.issue_date}
                        onChange={(event) => setCertForm((current) => ({ ...current, issue_date: event.target.value }))}
                      />
                    </Field>
                    <Field label={copy.certificates.url}>
                      <input
                        className="input-field"
                        value={certForm.credential_url}
                        onChange={(event) => setCertForm((current) => ({ ...current, credential_url: event.target.value }))}
                      />
                    </Field>
                    <button
                      className="btn btn-secondary btn-sm"
                      type="button"
                      onClick={() => addCert().then(() => toast.success(copy.certificates.added)).catch(() => toast.error(copy.certificates.addError))}
                    >
                      <Icon name="add" size={16} />
                      {copy.certificates.add}
                    </button>
                  </div>

                  <div>
                    <h4 style={{ fontWeight: 800, marginBottom: 10 }}>{copy.certificates.current}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {myCerts.length ? myCerts.map((item) => (
                        <div key={item.id} style={entryCardStyle}>
                          <div style={{ fontWeight: 800 }}>{item.name_kz || item.name_en || ''}</div>
                          <div style={{ color: 'var(--color-text-3)', fontSize: '0.85rem', marginTop: 2 }}>{item.issuer}</div>
                          <button
                            className="btn btn-ghost btn-sm"
                            type="button"
                            style={{ marginTop: 8 }}
                            onClick={() => deleteCert(item.id).then(() => toast.success(copy.certificates.deleted)).catch(() => toast.error(copy.certificates.deleteError))}
                          >
                            <Icon name="delete" size={16} />
                            {copy.certificates.delete}
                          </button>
                        </div>
                      )) : (
                        <div style={{ color: 'var(--color-text-3)' }}>{copy.certificates.empty}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 16 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => bumpStep(6)}>
                    <Icon name="arrowLeft" size={16} />
                    {copy.back}
                  </button>
                  <button type="button" className="btn btn-primary" onClick={() => bumpStep(8)}>
                    <Icon name="arrowRight" size={16} color="white" />
                    {copy.nextStep}
                  </button>
                </div>
              </div>
            )}

            {step === 8 && (
              <div>
                <h3 style={{ fontWeight: 900, marginBottom: 8 }}>{copy.theme.title}</h3>
                <p style={{ color: 'var(--color-text-3)', marginBottom: 14 }}>
                  {copy.theme.description}
                </p>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[
                    { key: 'blue', label: copy.theme.colors.blue, sw: '#2563eb' },
                    { key: 'purple', label: copy.theme.colors.purple, sw: '#7c3aed' },
                    { key: 'green', label: copy.theme.colors.green, sw: '#16a34a' },
                    { key: 'red', label: copy.theme.colors.red, sw: '#dc2626' },
                    { key: 'orange', label: copy.theme.colors.orange, sw: '#ea580c' },
                    { key: 'teal', label: copy.theme.colors.teal, sw: '#0f766e' },
                    { key: 'custom', label: copy.theme.colors.custom, sw: themeChoice.primary_color_hex || '#111827' },
                  ].map((colorOption) => (
                    <button
                      key={colorOption.key}
                      type="button"
                      onClick={() => setThemeChoice((current) => ({ ...current, primary_color: colorOption.key }))}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '0.65rem 0.85rem',
                        borderRadius: 14,
                        border: '1px solid var(--color-border)',
                        background: themeChoice.primary_color === colorOption.key ? 'rgba(37,99,235,0.10)' : 'var(--color-surface)',
                        cursor: 'pointer',
                        fontWeight: 800,
                        color: themeChoice.primary_color === colorOption.key ? 'var(--color-primary)' : 'var(--color-text-2)',
                      }}
                    >
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 999,
                          background: colorOption.sw,
                          border: '1px solid var(--color-border)',
                        }}
                      />
                      {colorOption.label}
                    </button>
                  ))}
                </div>

                {themeChoice.primary_color === 'custom' && (
                  <div style={{ marginTop: 14, maxWidth: 320 }}>
                    <Field label={copy.theme.customLabel} hint={copy.theme.customHint}>
                      <input
                        className="input-field"
                        value={themeChoice.primary_color_hex}
                        onChange={(event) => setThemeChoice((current) => ({ ...current, primary_color_hex: event.target.value }))}
                      />
                    </Field>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 16 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => bumpStep(7)} disabled={saving}>
                    <Icon name="arrowLeft" size={16} />
                    {copy.back}
                  </button>
                  <button type="button" className="btn btn-primary" onClick={saveTheme} disabled={saving}>
                    <Icon name="check" size={16} color="white" />
                    {copy.saveTheme}
                  </button>
                </div>
              </div>
            )}

            {step === 9 && (
              <div>
                <h3 style={{ fontWeight: 900, marginBottom: 8 }}>{copy.previewAndPublish}</h3>
                <p style={{ color: 'var(--color-text-3)', marginBottom: 14 }}>
                  {copy.publish.publicPathPrefix} <b style={{ color: 'var(--color-text)' }}>{publicPath}</b>.
                </p>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Link className="btn btn-secondary" to={publicPath} style={{ textDecoration: 'none' }}>
                    {copy.publicVersion}
                  </Link>
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={publish}
                    disabled={saving || settings?.is_published}
                  >
                    <Icon name="check" size={16} color="white" />
                    {copy.publishPortfolio}
                  </button>
                </div>

                <div style={{ marginTop: 14, color: 'var(--color-text-3)', fontSize: '0.9rem' }}>
                  {copy.publishNote}
                </div>
              </div>
            )}
            {step === 4 && (
              <div>
                <div style={splitWorkbenchGrid}>
                  <div>
                    <h3 style={{ fontWeight: 800, marginBottom: 10 }}>{copy.skills.addTitle}</h3>
                    <Field label={copy.skills.name}>
                      <input
                        className="input-field"
                        value={skillForm.name}
                        onChange={(event) => setSkillForm((current) => ({ ...current, name: event.target.value }))}
                      />
                    </Field>
                    <div style={twoColumnGrid}>
                      <Field label={copy.skills.category}>
                        <select
                          className="input-field"
                          value={skillForm.category}
                          onChange={(event) => setSkillForm((current) => ({ ...current, category: event.target.value }))}
                        >
                          <option value="frontend">{copy.skills.categories.frontend}</option>
                          <option value="backend">{copy.skills.categories.backend}</option>
                          <option value="database">{copy.skills.categories.database}</option>
                          <option value="devops">{copy.skills.categories.devops}</option>
                          <option value="mobile">{copy.skills.categories.mobile}</option>
                          <option value="design">{copy.skills.categories.design}</option>
                          <option value="other">{copy.skills.categories.other}</option>
                        </select>
                      </Field>
                      <Field label={copy.skills.level}>
                        <input
                          className="input-field"
                          type="number"
                          min="0"
                          max="100"
                          value={skillForm.level}
                          onChange={(event) => setSkillForm((current) => ({ ...current, level: event.target.value }))}
                        />
                      </Field>
                    </div>
                    <Field label={copy.skills.icon}>
                      <input
                        className="input-field"
                        value={skillForm.icon}
                        onChange={(event) => setSkillForm((current) => ({ ...current, icon: event.target.value }))}
                      />
                    </Field>
                    <button
                      className="btn btn-secondary btn-sm"
                      type="button"
                      onClick={() => addSkill().then(() => toast.success(copy.skills.added)).catch(() => toast.error(copy.skills.addError))}
                    >
                      <Icon name="add" size={16} />
                      {copy.skills.add}
                    </button>
                  </div>

                  <div>
                    <h3 style={{ fontWeight: 800, marginBottom: 10 }}>{copy.skills.current}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {mySkills.length ? mySkills.map((skill) => (
                        <div key={skill.id} style={entryCardStyle}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                            <div>
                              <div style={{ fontWeight: 800 }}>{skill.name}</div>
                              <div style={{ color: 'var(--color-text-3)', fontSize: '0.85rem', marginTop: 2 }}>
                                {skill.category} · {skill.level}%
                              </div>
                            </div>
                            <button
                              className="btn btn-ghost btn-sm"
                              type="button"
                              onClick={() => deleteSkill(skill.id).then(() => toast.success(copy.skills.deleted)).catch(() => toast.error(copy.skills.deleteError))}
                            >
                              <Icon name="delete" size={16} />
                              {copy.skills.delete}
                            </button>
                          </div>
                        </div>
                      )) : (
                        <div style={{ color: 'var(--color-text-3)' }}>
                          {copy.skills.empty}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 16 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => bumpStep(3)}>
                    <Icon name="arrowLeft" size={16} />
                    {copy.back}
                  </button>
                  <button type="button" className="btn btn-primary" onClick={() => bumpStep(5)}>
                    <Icon name="arrowRight" size={16} color="white" />
                    {copy.nextStep}
                  </button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <h3 style={{ fontWeight: 800, marginBottom: 10 }}>{copy.experience.title}</h3>
                <div style={splitWorkbenchGrid}>
                  <div>
                    <Field label={copy.experience.company}>
                      <input
                        className="input-field"
                        value={expForm.company}
                        onChange={(event) => setExpForm((current) => ({ ...current, company: event.target.value }))}
                      />
                    </Field>
                    <Field label={copy.experience.role}>
                      <input
                        className="input-field"
                        value={expForm.position}
                        onChange={(event) => setExpForm((current) => ({ ...current, position: event.target.value }))}
                      />
                    </Field>
                    <div style={compactGrid}>
                      <Field label={copy.experience.startDate}>
                        <input
                          className="input-field"
                          type="date"
                          value={expForm.start_date}
                          onChange={(event) => setExpForm((current) => ({ ...current, start_date: event.target.value }))}
                        />
                      </Field>
                      <Field label={copy.experience.endDate}>
                        <input
                          className="input-field"
                          type="date"
                          value={expForm.end_date}
                          onChange={(event) => setExpForm((current) => ({ ...current, end_date: event.target.value }))}
                          disabled={expForm.is_current}
                        />
                      </Field>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <input
                        type="checkbox"
                        checked={expForm.is_current}
                        onChange={(event) => setExpForm((current) => ({ ...current, is_current: event.target.checked }))}
                        style={{ accentColor: 'var(--color-primary)' }}
                      />
                      {copy.experience.currentRole}
                    </label>
                    <Field label={copy.experience.description}>
                      <textarea
                        className="input-field"
                        value={expForm.description}
                        onChange={(event) => setExpForm((current) => ({ ...current, description: event.target.value }))}
                      />
                    </Field>
                    <button
                      className="btn btn-secondary btn-sm"
                      type="button"
                      onClick={() => addExp().then(() => toast.success(copy.experience.added)).catch(() => toast.error(copy.experience.addError))}
                    >
                      <Icon name="add" size={16} />
                      {copy.experience.add}
                    </button>
                  </div>

                  <div>
                    <h4 style={{ fontWeight: 800, marginBottom: 10 }}>{copy.experience.current}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {myExp.length ? myExp.map((item) => (
                        <div key={item.id} style={entryCardStyle}>
                          <div style={{ fontWeight: 800 }}>{item.company}</div>
                          <div style={{ color: 'var(--color-text-3)', fontSize: '0.85rem', marginTop: 2 }}>
                            {item.position_kz || item.position_en || ''}
                          </div>
                          <button
                            className="btn btn-ghost btn-sm"
                            type="button"
                            style={{ marginTop: 8 }}
                            onClick={() => deleteExp(item.id).then(() => toast.success(copy.experience.deleted)).catch(() => toast.error(copy.experience.deleteError))}
                          >
                            <Icon name="delete" size={16} />
                            {copy.experience.delete}
                          </button>
                        </div>
                      )) : (
                        <div style={{ color: 'var(--color-text-3)' }}>{copy.experience.empty}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 16 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => bumpStep(4)}>
                    <Icon name="arrowLeft" size={16} />
                    {copy.back}
                  </button>
                  <button type="button" className="btn btn-primary" onClick={() => bumpStep(6)}>
                    <Icon name="arrowRight" size={16} color="white" />
                    {copy.nextStep}
                  </button>
                </div>
              </div>
            )}

            {step === 6 && (
              <div>
                <h3 style={{ fontWeight: 800, marginBottom: 10 }}>{copy.education.title}</h3>
                <div style={splitWorkbenchGrid}>
                  <div>
                    <Field label={copy.education.institution}>
                      <input
                        className="input-field"
                        value={eduForm.institution}
                        onChange={(event) => setEduForm((current) => ({ ...current, institution: event.target.value }))}
                      />
                    </Field>
                    <Field label={copy.education.degree}>
                      <input
                        className="input-field"
                        value={eduForm.degree}
                        onChange={(event) => setEduForm((current) => ({ ...current, degree: event.target.value }))}
                      />
                    </Field>
                    <Field label={copy.education.field}>
                      <input
                        className="input-field"
                        value={eduForm.field}
                        onChange={(event) => setEduForm((current) => ({ ...current, field: event.target.value }))}
                      />
                    </Field>
                    <div style={compactGrid}>
                      <Field label={copy.education.startDate}>
                        <input
                          className="input-field"
                          type="date"
                          value={eduForm.start_date}
                          onChange={(event) => setEduForm((current) => ({ ...current, start_date: event.target.value }))}
                        />
                      </Field>
                      <Field label={copy.education.endDate}>
                        <input
                          className="input-field"
                          type="date"
                          value={eduForm.end_date}
                          onChange={(event) => setEduForm((current) => ({ ...current, end_date: event.target.value }))}
                          disabled={eduForm.is_current}
                        />
                      </Field>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <input
                        type="checkbox"
                        checked={eduForm.is_current}
                        onChange={(event) => setEduForm((current) => ({ ...current, is_current: event.target.checked }))}
                        style={{ accentColor: 'var(--color-primary)' }}
                      />
                      {copy.education.currentStudy}
                    </label>
                    <Field label={copy.education.description}>
                      <textarea
                        className="input-field"
                        value={eduForm.description}
                        onChange={(event) => setEduForm((current) => ({ ...current, description: event.target.value }))}
                      />
                    </Field>
                    <button
                      className="btn btn-secondary btn-sm"
                      type="button"
                      onClick={() => addEdu().then(() => toast.success(copy.education.added)).catch(() => toast.error(copy.education.addError))}
                    >
                      <Icon name="add" size={16} />
                      {copy.education.add}
                    </button>
                  </div>

                  <div>
                    <h4 style={{ fontWeight: 800, marginBottom: 10 }}>{copy.education.current}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {myEdu.length ? myEdu.map((item) => (
                        <div key={item.id} style={entryCardStyle}>
                          <div style={{ fontWeight: 800 }}>{item.institution}</div>
                          <div style={{ color: 'var(--color-text-3)', fontSize: '0.85rem', marginTop: 2 }}>
                            {item.degree_kz || ''} · {item.field_kz || ''}
                          </div>
                          <button
                            className="btn btn-ghost btn-sm"
                            type="button"
                            style={{ marginTop: 8 }}
                            onClick={() => deleteEdu(item.id).then(() => toast.success(copy.education.deleted)).catch(() => toast.error(copy.education.deleteError))}
                          >
                            <Icon name="delete" size={16} />
                            {copy.education.delete}
                          </button>
                        </div>
                      )) : (
                        <div style={{ color: 'var(--color-text-3)' }}>{copy.education.empty}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 16 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => bumpStep(5)}>
                    <Icon name="arrowLeft" size={16} />
                    {copy.back}
                  </button>
                  <button type="button" className="btn btn-primary" onClick={() => bumpStep(7)}>
                    <Icon name="arrowRight" size={16} color="white" />
                    {copy.nextStep}
                  </button>
                </div>
              </div>
            )}

          </section>
        </div>
      </div>
    </div>
  );
}
