// ============================================================
// ABOUT PAGE
// ============================================================
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import api from '../services/api.js';
import { Download, MapPin, Phone, Globe, Github, Instagram, Send, Briefcase, GraduationCap, Award } from 'lucide-react';

export function AboutPage() {
  const { t, lang } = useApp();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get('/profile').then(r => setProfile(r.data.data)).catch(() => {});
  }, []);

  const bio = profile?.[`bio_${lang}`] || profile?.bio_en || t('about.bio_fallback');

  return (
    <div className="page-enter">
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '3rem 0' }}>
        <div className="container-app">
          <div className="section-label">{t('about.subtitle')}</div>
          <h1 className="section-title">{t('about.title')}</h1>
        </div>
      </div>
      <div className="container-app section-padding">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'start' }}>
          {/* Avatar & Info */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{
              width: 220, height: 220, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 20px 60px rgba(37,99,235,0.3)',
              overflow: 'hidden', flexShrink: 0,
            }}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 80, fontWeight: 800, color: 'white' }}>
                  {(profile?.full_name || 'B')[0]}
                </span>
              )}
            </div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.25rem' }}>{profile?.full_name}</h2>
              <p style={{ color: 'var(--color-primary)', fontWeight: 600, marginBottom: '1rem' }}>
                {profile?.[`title_${lang}`] || profile?.title_en || t('hero.default_role')}
              </p>
              {profile?.available_for_work && (
                <span className="badge badge-success" style={{ marginBottom: '1rem' }}>
                  ● {t('about.available_for_work')}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
              {profile?.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-2)', fontSize: '0.9rem' }}>
                  <MapPin size={15} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                  {profile.location}
                </div>
              )}
              {profile?.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-2)', fontSize: '0.9rem' }}>
                  <Phone size={15} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                  {profile.phone}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              {profile?.github && <a href={`https://${profile.github}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm"><Github size={15} /> GitHub</a>}
              {profile?.linkedin && <a href={`https://${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm"><Instagram size={15} /> Instagram</a>}
              {profile?.telegram && <a href={`https://t.me/${profile.telegram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm"><Send size={15} /> Telegram</a>}
            </div>
            {profile?.resume_url && (
              <a href={profile.resume_url} download className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Download size={16} /> {t('about.download_cv')}
              </a>
            )}
          </div>

          {/* Bio & Stats */}
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1rem' }}>{t('about.who_am_i')}</h3>
            <p style={{ color: 'var(--color-text-2)', lineHeight: 1.8, fontSize: '1rem', marginBottom: '2rem', whiteSpace: 'pre-line' }}>
              {bio}
            </p>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { icon: Briefcase, value: `${profile?.years_experience || 5}+`, label: t('about.experience') },
                { icon: Globe, value: '30+', label: t('about.projects_done') },
                { icon: Award, value: '10+', label: t('nav.certificates') },
                { icon: GraduationCap, value: '20+', label: t('about.clients') },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon size={20} style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--color-text)', lineHeight: 1 }}>{value}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-3)', marginTop: 2 }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/projects" className="btn btn-primary">{t('nav.projects')}</Link>
              <Link to="/contact" className="btn btn-secondary">{t('nav.contact')}</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SKILLS PAGE
// ============================================================
import { useInView } from 'react-intersection-observer';

function SkillBar({ skill }) {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });

  return (
    <div ref={ref} style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1.1rem' }}>{skill.icon}</span>
          <span style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--color-text)' }}>{skill.name}</span>
        </div>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>{skill.level}%</span>
      </div>
      <div className="skill-bar-track">
        <div className="skill-bar-fill" style={{ width: inView ? `${skill.level}%` : '0%' }} />
      </div>
    </div>
  );
}

export function SkillsPage() {
  const { t } = useApp();
  const [skills, setSkills] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    api.get('/skills').then(r => setSkills(r.data.data)).catch(() => {});
  }, []);

  const categories = ['all', 'frontend', 'backend', 'database', 'devops', 'design', 'other'];
  const filtered = activeCategory === 'all' ? skills : skills.filter(s => s.category === activeCategory);

  return (
    <div className="page-enter">
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '3rem 0' }}>
        <div className="container-app">
          <div className="section-label">{t('skills.subtitle')}</div>
          <h1 className="section-title">{t('skills.title')}</h1>
        </div>
      </div>
      <div className="container-app section-padding">
        {/* Category filter */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '2.5rem' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
            >
              {cat === 'all' ? t('projects.all') : t(`skills.${cat}`)}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.5rem', color: 'var(--color-text)' }}>
              {activeCategory === 'all' ? t('skills.all_skills') : t(`skills.${activeCategory}`)} ({filtered.length})
            </h3>
            {filtered.map(skill => <SkillBar key={skill.id} skill={skill} />)}
            {filtered.length === 0 && <p style={{ color: 'var(--color-text-3)' }}>{t('skills.no_skills_in_category')}</p>}
          </div>

          {activeCategory === 'all' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {['frontend','backend','database','devops'].map(cat => {
                const catSkills = skills.filter(s => s.category === cat);
                if (!catSkills.length) return null;
                return (
                  <div key={cat} className="glass-card" style={{ padding: '1.5rem' }}>
                    <h4 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)' }}>
                      {t(`skills.${cat}`)}
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {catSkills.map(s => (
                        <div key={s.id} style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '0.4rem 0.75rem', borderRadius: 8,
                          background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
                          fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-2)',
                        }}>
                          <span>{s.icon}</span>
                          <span>{s.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// EXPERIENCE PAGE
// ============================================================
import { formatDate } from '../utils/format.js';

export function ExperiencePage() {
  const { t, lang } = useApp();
  const [exp, setExp] = useState([]);

  useEffect(() => {
    api.get('/experience').then(r => setExp(r.data.data)).catch(() => {});
  }, []);

  return (
    <div className="page-enter">
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '3rem 0' }}>
        <div className="container-app">
          <div className="section-label">{t('experience.subtitle')}</div>
          <h1 className="section-title">{t('experience.title')}</h1>
        </div>
      </div>
      <div className="container-app section-padding">
        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative' }}>
          {/* Timeline line */}
          <div style={{ position: 'absolute', left: 20, top: 0, bottom: 0, width: 2, background: 'var(--color-border)' }} />
          {exp.map((e, i) => (
            <div key={e.id} style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', position: 'relative' }}>
              {/* Dot */}
              <div style={{
                width: 42, height: 42, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                background: e.is_current
                  ? 'linear-gradient(135deg, var(--color-primary), var(--color-accent))'
                  : 'var(--color-surface)',
                border: '2px solid var(--color-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: e.is_current ? '0 0 20px rgba(37,99,235,0.3)' : 'none',
              }}>
                <Briefcase size={16} style={{ color: e.is_current ? 'white' : 'var(--color-primary)' }} />
              </div>

              <div className="glass-card" style={{ flex: 1, padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-text)' }}>
                      {e[`position_${lang}`] || e.position_en}
                    </h3>
                    <p style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem' }}>{e.company}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-3)', fontWeight: 500 }}>
                      {formatDate(e.start_date)} — {e.is_current ? t('experience.present') : formatDate(e.end_date)}
                    </div>
                    {e.location && <div style={{ fontSize: '0.78rem', color: 'var(--color-text-3)' }}>{e.location}</div>}
                    <span className="badge badge-neutral" style={{ marginTop: 4 }}>{e.type}</span>
                  </div>
                </div>
                {e[`description_${lang}`] && (
                  <p style={{ color: 'var(--color-text-2)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1rem' }}>
                    {e[`description_${lang}`] || e.description_en}
                  </p>
                )}
                {e.tech_stack?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {e.tech_stack.map(t => <span key={t} className="tech-tag">{t}</span>)}
                  </div>
                )}
              </div>
            </div>
          ))}
          {exp.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-3)' }}>
              <Briefcase size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>{t('common.data_loading_experience')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// EDUCATION PAGE
// ============================================================
export function EducationPage() {
  const { t, lang } = useApp();
  const [edu, setEdu] = useState([]);

  useEffect(() => {
    api.get('/education').then(r => setEdu(r.data.data)).catch(() => {});
  }, []);

  return (
    <div className="page-enter">
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '3rem 0' }}>
        <div className="container-app">
          <div className="section-label">{t('education.subtitle')}</div>
          <h1 className="section-title">{t('education.title')}</h1>
        </div>
      </div>
      <div className="container-app section-padding">
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {edu.map(e => (
            <div key={e.id} className="glass-card" style={{ padding: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14, flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(14,165,233,0.1))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <GraduationCap size={24} style={{ color: 'var(--color-primary)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{e.institution}</h3>
                    <p style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                      {e[`degree_${lang}`] || e.degree_en} — {e[`field_${lang}`] || e.field_en}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-3)' }}>
                      {formatDate(e.start_date)} — {e.is_current ? t('education.present') : formatDate(e.end_date)}
                    </div>
                    {e.gpa && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-3)', marginTop: 2 }}>GPA: {e.gpa}</div>}
                  </div>
                </div>
                {e[`description_${lang}`] && (
                  <p style={{ color: 'var(--color-text-2)', fontSize: '0.9rem', lineHeight: 1.7, marginTop: '0.75rem' }}>
                    {e[`description_${lang}`] || e.description_en}
                  </p>
                )}
              </div>
            </div>
          ))}
          {edu.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-3)' }}>
              <GraduationCap size={48} style={{ opacity: 0.2 }} />
              <p style={{ marginTop: '1rem' }}>{t('education.loading_data')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CERTIFICATES PAGE
// ============================================================
import { ExternalLink } from 'lucide-react';

export function CertificatesPage() {
  const { t, lang } = useApp();
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    api.get('/certificates').then(r => setCerts(r.data.data)).catch(() => {});
  }, []);

  return (
    <div className="page-enter">
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '3rem 0' }}>
        <div className="container-app">
          <div className="section-label"><Award size={12} /> {t('certificates.subtitle')}</div>
          <h1 className="section-title">{t('certificates.title')}</h1>
        </div>
      </div>
      <div className="container-app section-padding">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {certs.map(c => (
            <div key={c.id} className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(14,165,233,0.1))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
              }}>
                <Award size={22} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.25rem', fontSize: '1rem' }}>
                {c[`name_${lang}`] || c.name_en}
              </h3>
              <p style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                {c.issuer}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-3)' }}>
                  {formatDate(c.issue_date)}
                </span>
                {c.category && <span className="badge badge-neutral">{c.category}</span>}
              </div>
              {c.credential_url && (
                <a href={c.credential_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  <ExternalLink size={13} /> {t('certificates.verify')}
                </a>
              )}
            </div>
          ))}
          {certs.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--color-text-3)' }}>
              <Award size={48} style={{ opacity: 0.2 }} />
              <p style={{ marginTop: '1rem' }}>{t('certificates.loading_data')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
