import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { ArrowRight, ArrowDown, ExternalLink, Github, Star, Zap, Code2, Globe } from 'lucide-react';
import api from '../services/api.js';

// ─── Animated Particle Background ─────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef([]);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;

    const resize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };

    const initParticles = () => {
      const count = Math.floor((width * height) / 14000);
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: Math.random() > 0.6 ? '#3b82f6' : Math.random() > 0.5 ? '#0ea5e9' : '#a78bfa',
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Mouse repulsion
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120;
          p.vx += (dx / dist) * force * 0.03;
          p.vy += (dy / dist) * force * 0.03;
          const maxV = 2;
          p.vx = Math.max(-maxV, Math.min(maxV, p.vx));
          p.vy = Math.max(-maxV, Math.min(maxV, p.vy));
        } else {
          p.vx *= 0.99;
          p.vy *= 0.99;
          p.vx += (Math.random() - 0.5) * 0.02;
          p.vy += (Math.random() - 0.5) * 0.02;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });

      // Draw connections
      ctx.globalAlpha = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = '#3b82f6';
            ctx.globalAlpha = (1 - dist / 100) * 0.12;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      animRef.current = requestAnimationFrame(draw);
    };

    resize();
    draw();

    const handleMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', handleMouse);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouse);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        opacity: 0.7, zIndex: 1,
      }}
    />
  );
}

// ─── Floating Code Snippet ─────────────────────────────────
function FloatingCard({ children, style }) {
  return (
    <div style={{
      position: 'absolute',
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.9)',
      borderRadius: 14,
      padding: '0.75rem 1rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      zIndex: 5,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Stat Counter ──────────────────────────────────────────
function StatItem({ value, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.04em' }}>{value}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-3)', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

// ─── Project Card Preview ──────────────────────────────────
function ProjectCard({ project, lang, t }) {
  const title = project[`title_${lang}`] || project.title_en;
  const desc = project[`description_${lang}`] || project.description_en;

  return (
    <Link to={`/projects/${project.slug}`} style={{ textDecoration: 'none' }}>
      <div className="glass-card" style={{ padding: '1.5rem', cursor: 'pointer' }}>
        <div style={{
          height: 180, borderRadius: 12,
          background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(14,165,233,0.05))',
          marginBottom: '1.25rem', overflow: 'hidden', position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {project.cover_image ? (
            <img src={project.cover_image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Code2 size={48} style={{ color: 'var(--color-primary)', opacity: 0.3 }} />
          )}
          {project.is_featured && (
            <div style={{ position: 'absolute', top: 10, right: 10 }}>
              <span className="badge badge-primary"><Star size={10} /> {t('common.featured')}</span>
            </div>
          )}
        </div>
        <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>{title}</h3>
        <p style={{ color: 'var(--color-text-3)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{desc}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(project.tech_stack || []).slice(0, 4).map(t => (
            <span key={t} className="tech-tag">{t}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}

// ─── Main HomePage ─────────────────────────────────────────
export default function HomePage() {
  const { t, lang } = useApp();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/profile'),
      api.get('/projects?featured=true&limit=3'),
    ]).then(([profileRes, projectsRes]) => {
      setProfile(profileRes.data.data);
      setProjects(projectsRes.data.data);
    }).catch(() => {});
  }, []);

  const name = profile?.full_name || 'Egeubay Berdibek';
  const title = profile?.[`title_${lang}`] || profile?.title_en || t('hero.default_role');

  return (
    <div className="page-enter">
      {/* ── Hero ────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        minHeight: 'calc(100vh - var(--nav-height))',
        display: 'flex', alignItems: 'center',
        overflow: 'hidden',
        background: 'var(--color-bg)',
      }}>
        {/* Gradient orbs */}
        <div className="hero-mesh">
          <div className="mesh-orb mesh-orb-1" />
          <div className="mesh-orb mesh-orb-2" />
          <div className="mesh-orb mesh-orb-3" />
        </div>

        {/* Particles */}
        <ParticleCanvas />

        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          backgroundImage: `
            linear-gradient(rgba(37,99,235,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,99,235,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }} />

        {/* Floating cards */}
        <FloatingCard style={{ top: '18%', right: '12%', display: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', fontWeight: 600 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            <span style={{ color: '#10b981' }}>{t('hero.available')}</span>
          </div>
        </FloatingCard>

        {/* Content */}
        <div className="container-app" style={{ position: 'relative', zIndex: 10, paddingTop: '2rem', paddingBottom: '2rem' }}>
          <div style={{ maxWidth: 750 }}>
            {/* Available badge */}
            <div style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.45rem 1rem', borderRadius: 50, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'pulse-glow 2s infinite' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>{t('hero.available')}</span>
            </div>

            {/* Greeting */}
            <p style={{ color: 'var(--color-text-3)', fontSize: '1.1rem', fontWeight: 500, marginBottom: '0.5rem', letterSpacing: '0.01em' }}>
              {t('hero.greeting')}
            </p>

            {/* Name */}
            <h1 className="display-text" style={{ marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--color-text)' }}>{name.split(' ')[0]} </span>
              <span className="gradient-text">{name.split(' ').slice(1).join(' ')}</span>
            </h1>

            {/* Title */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 600, color: 'var(--color-text-2)', letterSpacing: '-0.02em' }}>
                {title}
              </p>
            </div>

            {/* Tagline */}
            <p style={{ color: 'var(--color-text-3)', fontSize: '1.1rem', lineHeight: 1.7, maxWidth: 520, marginBottom: '2.5rem' }}>
              {t('hero.tagline')}
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              <Link to="/projects" className="btn btn-primary btn-lg">
                {t('hero.cta_primary')}
                <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className="btn btn-secondary btn-lg">
                {t('hero.cta_secondary')}
              </Link>
              {profile?.github && (
                <a href={`https://${profile.github}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-lg">
                  <Github size={18} />
                  {t('social.github')}
                </a>
              )}
            </div>

            {/* Stats */}
            <div style={{
              marginTop: '3.5rem',
              display: 'flex', flexWrap: 'wrap', gap: '2.5rem',
              paddingTop: '2rem',
              borderTop: '1px solid var(--color-border)',
            }}>
              <StatItem value={`${profile?.years_experience || 5}+`} label={t('about.experience')} />
              <StatItem value="5+" label={t('about.projects_done')} />
              <StatItem value="3+" label={t('about.clients')} />
              <StatItem value="99   %" label={t('common.client_satisfaction')} />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
          zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          animation: 'float 2s ease-in-out infinite',
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
            {t('hero.scroll')}
          </span>
          <ArrowDown size={18} style={{ color: 'var(--color-text-3)' }} />
        </div>
      </section>

      {/* ── Featured Projects ──────────────────────────── */}
      <section className="section-padding" style={{ background: 'var(--color-surface)' }}>
        <div className="container-app">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>
              <Star size={12} /> {t('projects.featured')}
            </div>
            <h2 className="section-title">{t('projects.subtitle')}</h2>
          </div>

          {projects.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {projects.map(p => <ProjectCard key={p.id} project={p} lang={lang} t={t} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-3)' }}>
              <Code2 size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>{t('common.loading_projects')}</p>
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <Link to="/projects" className="btn btn-secondary">
              {t('projects.view_all')} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────── */}
      <section className="section-padding">
        <div className="container-app">
          <div style={{
            borderRadius: 24,
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            padding: 'clamp(2.5rem, 6vw, 4rem)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '-50%', right: '-10%',
              width: 400, height: 400, borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
            }} />
            <div style={{
              position: 'absolute', bottom: '-40%', left: '-10%',
              width: 300, height: 300, borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '0.4rem 1rem', borderRadius: 50,
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                marginBottom: '1.5rem',
              }}>
                <Globe size={14} style={{ color: 'white' }} />
                <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: 700 }}>{t('common.open_to_remote')}</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, color: 'white', marginBottom: '1rem', letterSpacing: '-0.03em' }}>
                {t('common.lets_build_together')}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem', marginBottom: '2rem', maxWidth: 480, margin: '0 auto 2rem' }}>
                {t('common.available_for_projects')}
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/contact" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '0.875rem 2rem', borderRadius: 12,
                  background: 'white', color: 'var(--color-primary)',
                  fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  transition: 'all 0.2s',
                }}>
                  {t('hero.cta_secondary')} <ArrowRight size={16} />
                </Link>
                <Link to="/about" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '0.875rem 2rem', borderRadius: 12,
                  border: '2px solid rgba(255,255,255,0.4)',
                  color: 'white', fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem',
                  transition: 'all 0.2s',
                }}>
                  {t('nav.about')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
