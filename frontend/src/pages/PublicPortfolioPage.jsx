import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowUpRight,
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  Clock,
  Code2,
  ExternalLink,
  Eye,
  FolderOpen,
  Github,
  Globe,
  GraduationCap,
  Home,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Send,
  Star,
  Tag,
  User,
} from 'lucide-react';
import LanguageSwitcher from '../components/ui/LanguageSwitcher.jsx';
import { publicPortfolioCopy } from '../i18n/publicPortfolioCopy.js';
import api from '../services/api.js';
import { useApp } from '../context/AppContext.jsx';

const LOCALES = {
  kz: 'kk-KZ',
  ru: 'ru-RU',
  en: 'en-US',
};

const createMetaTag = (selector, attrs) => {
  let tag = document.head.querySelector(selector);

  if (!tag) {
    tag = document.createElement('meta');
    Object.entries(attrs).forEach(([key, value]) => tag.setAttribute(key, value));
    document.head.appendChild(tag);
  }

  return tag;
};

const updateMeta = (title, description, fallbackDescription, fallbackTitle) => {
  if (title) {
    document.title = title;
  }

  const descTag = createMetaTag('meta[name="description"]', { name: 'description' });
  descTag.setAttribute('content', description || fallbackDescription);

  const ogTitle = createMetaTag('meta[property="og:title"]', { property: 'og:title' });
  ogTitle.setAttribute('content', title || fallbackTitle);

  const ogDescription = createMetaTag('meta[property="og:description"]', { property: 'og:description' });
  ogDescription.setAttribute('content', description || fallbackDescription);
};

const getText = (...values) => {
  const found = values.find((value) => typeof value === 'string' && value.trim());
  return found ? found.trim() : '';
};

const getLocalizedField = (item, field, lang, fallback = '') => {
  const order = lang === 'ru' ? ['ru', 'kz', 'en'] : lang === 'en' ? ['en', 'kz', 'ru'] : ['kz', 'ru', 'en'];
  return getText(...order.map((suffix) => item?.[`${field}_${suffix}`]), fallback);
};

const resolveImage = (value) => {
  if (!value) {
    return null;
  }

  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
    return value;
  }

  return `/${value.replace(/^\/+/, '')}`;
};

const hexToRgba = (hex, alpha) => {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) {
    return `rgba(37, 99, 235, ${alpha})`;
  }

  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const formatDate = (value, lang, includeDay = false) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(LOCALES[lang] || LOCALES.kz, {
    year: 'numeric',
    month: 'long',
    ...(includeDay ? { day: 'numeric' } : {}),
  }).format(date);
};

const formatRange = (start, end, isCurrent, lang, currentLabel) => {
  const startText = formatDate(start, lang);
  const endText = isCurrent ? currentLabel : formatDate(end, lang);

  if (!startText && !endText) {
    return '';
  }

  if (!startText) {
    return endText;
  }

  if (!endText) {
    return startText;
  }

  return `${startText} - ${endText}`;
};

const normalizeTags = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (!value) {
    return [];
  }

  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return [];
};

function Panel({ children, className = '', style = {} }) {
  return (
    <div className={`human-panel ${className}`.trim()} style={style}>
      <div className="human-panel__inner">{children}</div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, detail }) {
  return (
    <div className="human-section__head">
      <div>
        <div className="human-section__eyebrow">{eyebrow}</div>
        <h2 className="human-section__title">{title}</h2>
      </div>
      {detail ? <div className="human-section__detail">{detail}</div> : null}
    </div>
  );
}

function EmptyBlock({ children }) {
  return <div className="human-empty">{children}</div>;
}

export default function PublicPortfolioPage() {
  const { username } = useParams();
  const { lang } = useApp();
  const copy = publicPortfolioCopy[lang] || publicPortfolioCopy.kz;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactSending, setContactSending] = useState(false);
  const [contactSuccess, setContactSuccess] = useState('');
  const [contactStatus, setContactStatus] = useState('');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get(`/public/u/${username}`);

        if (!mounted) {
          return;
        }

        setData(response.data.data);
      } catch (err) {
        if (!mounted) {
          return;
        }

        setError(err.response?.data?.message || copy.errorDescription);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [copy.errorDescription, username]);

  useEffect(() => {
    if (!data) {
      return undefined;
    }

    const title = data.settings?.seoTitle || `${data.profile?.full_name || data.user?.publicHandle} | ${copy.metaDefaultTitle}`;
    const localizedBio = getLocalizedField(data.profile || {}, 'bio', lang, '');
    const localizedIntro = getText(data.profile?.[`intro_${lang}`], data.sections?.hero?.intro, localizedBio);
    const description = data.settings?.seoDescription || localizedIntro || copy.metaDefaultDescription;
    const previousTitle = document.title;

    updateMeta(title, description, copy.metaDefaultDescription, copy.metaDefaultTitle);
    api.post('/analytics/track', { page: `/u/${data.user?.publicHandle || username}` }).catch(() => {});

    return () => {
      document.title = previousTitle;
    };
  }, [copy.metaDefaultDescription, copy.metaDefaultTitle, data, lang, username]);

  const themeColor = data?.settings?.theme?.resolved || '#2563eb';
  const themeStyle = useMemo(() => ({
    '--portfolio-primary': themeColor,
    '--portfolio-soft': hexToRgba(themeColor, 0.12),
    '--portfolio-soft-strong': hexToRgba(themeColor, 0.24),
    '--portfolio-border': hexToRgba(themeColor, 0.18),
    '--portfolio-glow': hexToRgba(themeColor, 0.32),
  }), [themeColor]);

  const settings = data?.settings || {};
  const profile = data?.profile || {};
  const hero = data?.sections?.hero || {};
  const contact = data?.sections?.contact || {};
  const projects = data?.sections?.projects || [];
  const skills = data?.sections?.skills || [];
  const experience = data?.sections?.experience || [];
  const education = data?.sections?.education || [];
  const certificates = data?.sections?.certificates || [];
  const blogPosts = data?.sections?.blog || [];
  const heroProfession = getLocalizedField(profile, 'title', lang, hero.profession || copy.defaultProfession);
  const heroAbout = getLocalizedField(profile, 'bio', lang, hero.about || copy.defaultIntro);
  const heroIntro = getText(profile?.[`intro_${lang}`], hero.intro, heroAbout, copy.defaultIntro);

  const groupedSkills = useMemo(() => (
    skills.reduce((accumulator, skill) => {
      const category = skill.category || 'other';
      if (!accumulator[category]) {
        accumulator[category] = [];
      }
      accumulator[category].push(skill);
      return accumulator;
    }, {})
  ), [skills]);

  const orderedProjects = useMemo(() => (
    [...projects].sort((left, right) => Number(Boolean(right.is_featured)) - Number(Boolean(left.is_featured)))
  ), [projects]);

  const featuredProject = orderedProjects[0] || null;
  const secondaryProjects = orderedProjects.slice(1);
  const sectionItems = useMemo(() => ([
    { id: 'home', label: copy.nav.home, icon: Home },
    { id: 'projects', label: copy.nav.projects, icon: FolderOpen },
    { id: 'skills', label: copy.nav.skills, icon: Code2 },
    { id: 'experience', label: copy.nav.experience, icon: Briefcase },
    { id: 'education', label: copy.nav.education, icon: GraduationCap },
    { id: 'certificates', label: copy.nav.certificates, icon: Award },
    { id: 'blog', label: copy.nav.blog, icon: BookOpen },
    { id: 'contact', label: copy.nav.contact, icon: Mail },
  ]), [copy]);
  const categoryLabels = copy.categories;

  const socialLinks = useMemo(() => ([
    contact.website ? { label: copy.linksWebsite || 'Website', href: contact.website, icon: Globe } : null,
    contact.github ? { label: copy.linksGithub || 'GitHub', href: contact.github, icon: Github } : null,
    contact.linkedin ? { label: copy.linksLinkedin || 'LinkedIn', href: contact.linkedin, icon: Briefcase } : null,
    contact.telegram ? { label: copy.linksTelegram || 'Telegram', href: contact.telegram, icon: Send } : null,
    contact.instagram ? { label: copy.linksInstagram || 'Instagram', href: contact.instagram, icon: Instagram } : null,
  ].filter(Boolean)), [contact, copy.linksGithub, copy.linksInstagram, copy.linksLinkedin, copy.linksTelegram, copy.linksWebsite]);

  const contactChannels = useMemo(() => ([
    contact.email ? { label: copy.email, value: contact.email, href: `mailto:${contact.email}`, icon: Mail } : null,
    contact.phone ? { label: copy.phone, value: contact.phone, href: `tel:${contact.phone}`, icon: Phone } : null,
    contact.location ? { label: copy.location, value: contact.location, icon: MapPin } : null,
  ].filter(Boolean)), [contact, copy.email, copy.location, copy.phone]);

  const publicUrl = `${window.location.origin}/u/${data?.user?.publicHandle || username}`;

  const handleContactChange = (event) => {
    const { name, value } = event.target;
    setContactForm((current) => ({ ...current, [name]: value }));
  };

  const handleContactSubmit = async (event) => {
    event.preventDefault();
    setContactSuccess('');
    setContactStatus('');
    setContactSending(true);

    try {
      await api.post('/contacts', {
        portfolioHandle: data?.user?.publicHandle,
        ...contactForm,
      });
      setContactStatus('success');
      setContactSuccess(copy.success);
      setContactForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setContactStatus('error');
      setContactSuccess(err.response?.data?.message || copy.sendError);
    } finally {
      setContactSending(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container-app" style={{ padding: '4rem 0' }}>
        <Panel>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900 }}>{copy.errorTitle}</h1>
          <p style={{ marginTop: 8, color: 'var(--color-text-3)' }}>{error || copy.errorDescription}</p>
          <Link to="/" className="btn btn-secondary" style={{ marginTop: 16, textDecoration: 'none' }}>
            {copy.returnHome}
          </Link>
        </Panel>
      </div>
    );
  }

  return (
    <div className="human-portfolio" style={themeStyle}>
      <div className="container-app human-portfolio__frame">
        <aside className="human-portfolio__rail">
          <Panel>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div className="human-mini-label">{copy.madeLabel}</div>
              <LanguageSwitcher compact label={copy.languageLabel} />
            </div>
            <div className="human-portfolio__brand-title" style={{ marginTop: 8 }}>
              {hero.fullName || data.user?.publicHandle}
            </div>
            <div className="human-portfolio__brand-slug">/u/{data.user?.publicHandle}</div>
            <div className="human-portfolio__brand-copy">
              {copy.madeCopy}
            </div>
          </Panel>

          <Panel>
            <div className="human-mini-label">{copy.navigate}</div>
            <nav className="human-nav" style={{ marginTop: 12 }}>
              {sectionItems.map(({ id, label, icon: SectionIcon }) => (
                <a key={id} href={`#${id}`} className="human-nav__link">
                  <SectionIcon size={16} />
                  {label}
                </a>
              ))}
            </nav>
          </Panel>

          <Panel>
            <div className="human-portfolio__rail-meta">
              <div>
                <div className="human-mini-label">{copy.publicUrl}</div>
                <div className="human-url">{publicUrl}</div>
              </div>
              {socialLinks.length ? (
                <div>
                  <div className="human-mini-label">{copy.links}</div>
                  <div className="human-social-list">
                    {socialLinks.map(({ label, href, icon: SocialIcon }) => (
                      <a key={label} href={href} target="_blank" rel="noreferrer">
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                          <SocialIcon size={16} color={themeColor} />
                          {label}
                        </span>
                        <ArrowUpRight size={15} color={themeColor} />
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </Panel>
        </aside>

        <main className="human-main">
          <section id="home" className="human-hero">
            <Panel className="human-hero__main">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <div className="human-kicker">{copy.heroKicker}</div>
                <Link to="/" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
                  <Home size={15} />
                  {copy.returnHome}
                </Link>
              </div>
              <h1 className="human-display">
                {hero.fullName || data.user?.publicHandle} <em>{copy.heroTitleEmphasis}</em> {copy.heroTitleTail}
              </h1>

              <div className="human-hero__profession">
                <Briefcase size={16} />
                {heroProfession}
              </div>

              <p className="human-lede">
                {heroIntro}
              </p>

              <div className="human-action-row">
                <a
                  href="#projects"
                  className="btn"
                  style={{
                    background: `linear-gradient(135deg, ${themeColor}, ${hexToRgba(themeColor, 0.78)})`,
                    color: 'white',
                    boxShadow: `0 18px 32px ${hexToRgba(themeColor, 0.28)}`,
                  }}
                >
                  {copy.selectedWork}
                  <ArrowUpRight size={16} />
                </a>
                <a href="#contact" className="btn btn-secondary">
                  {copy.startConversation}
                </a>
              </div>

              <div className="human-chip-row">
                <span className="human-chip">
                  <FolderOpen size={14} />
                  {data.stats?.projects || projects.length} {copy.projectsCount}
                </span>
                <span className="human-chip">
                  <Code2 size={14} />
                  {data.stats?.skills || skills.length} {copy.skillsCount}
                </span>
                <span className="human-chip">
                  <BookOpen size={14} />
                  {data.stats?.blogPosts || blogPosts.length} {copy.notesCount}
                </span>
              </div>
            </Panel>

            <div className="human-hero__side">
              <Panel>
                <div className="human-portrait__figure">
                  {resolveImage(profile.avatar_url) ? (
                    <img src={resolveImage(profile.avatar_url)} alt={hero.fullName || data.user?.publicHandle} />
                  ) : (
                    <div className="human-avatar-fallback">
                      <div>
                        <div className="human-avatar-fallback__mark">
                          <User size={34} />
                        </div>
                        {copy.portraitMissing}
                      </div>
                    </div>
                  )}
                </div>

                <div className="human-fact-grid">
                  <div className="human-fact">
                    <div className="human-fact__label">{copy.status}</div>
                    <div className="human-fact__value">{settings?.is_published ? copy.live : copy.draft}</div>
                  </div>
                  <div className="human-fact">
                    <div className="human-fact__label">{copy.handle}</div>
                    <div className="human-fact__value">@{data.user?.publicHandle}</div>
                  </div>
                  <div className="human-fact">
                    <div className="human-fact__label">{copy.experience}</div>
                    <div className="human-fact__value">{experience.length}</div>
                  </div>
                  <div className="human-fact">
                    <div className="human-fact__label">{copy.location}</div>
                    <div className="human-fact__value">{contact.location || profile.location || copy.remote}</div>
                  </div>
                </div>
              </Panel>

              <Panel>
                <div className="human-mini-label">{copy.directLines}</div>
                {contactChannels.length ? (
                  <div className="human-contact-list">
                    {contactChannels.map(({ label, value, href, icon: ContactIcon }) => {
                      const Wrapper = href ? 'a' : 'div';
                      const wrapperProps = href ? { href } : {};

                      return (
                        <Wrapper key={label} {...wrapperProps} className="human-contact-row">
                          <span className="human-contact-row__meta">
                            <span className="human-contact-row__icon">
                              <ContactIcon size={16} />
                            </span>
                            <span>
                              <span className="human-mini-label" style={{ display: 'block' }}>{label}</span>
                              <span style={{ display: 'block', marginTop: 4, fontWeight: 800 }}>{value}</span>
                            </span>
                          </span>
                          {href ? <ArrowUpRight size={15} color={themeColor} /> : null}
                        </Wrapper>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyBlock>{copy.contactMissing}</EmptyBlock>
                )}
              </Panel>
            </div>
          </section>

          {heroAbout ? (
            <section className="human-section">
              <Panel>
                <SectionHeading
                  eyebrow={copy.aboutEyebrow}
                  title={<>{copy.aboutTitleLead} <em>{copy.aboutTitleEmphasis}</em> {copy.aboutTitleTail}</>}
                  detail={copy.aboutDetail}
                />
                <div style={{ marginTop: 18, color: 'var(--color-text-2)', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>
                  {heroAbout}
                </div>
              </Panel>
            </section>
          ) : null}

          <section id="projects" className="human-section">
            <SectionHeading
              eyebrow={copy.projectsEyebrow}
              title={<>{copy.projectsTitleLead} <em>{copy.projectsTitleEmphasis}</em></>}
              detail={copy.projectsDetail(projects.length)}
            />

            {featuredProject ? (
              <div className="human-stack">
                <div className="human-project-feature">
                  <div className="human-panel">
                    <div className="human-panel__inner">
                      <div className="human-project-feature__layout">
                        <div className="human-project-feature__media">
                          {resolveImage(featuredProject.cover_image) ? (
                            <img
                              src={resolveImage(featuredProject.cover_image)}
                              alt={getLocalizedField(featuredProject, 'title', lang, copy.featuredProject)}
                            />
                          ) : (
                            <FolderOpen size={40} color={themeColor} />
                          )}
                        </div>
                        <div className="human-project-feature__body">
                          <div className="human-chip">
                            <Star size={14} />
                            {copy.featuredCase}
                          </div>
                          <div className="human-project-feature__title" style={{ marginTop: 16 }}>
                            {getLocalizedField(featuredProject, 'title', lang, copy.untitledProject)}
                          </div>
                          <div className="human-project-feature__copy">
                            {getLocalizedField(featuredProject, 'description', lang, copy.projectMissing)}
                          </div>

                          {normalizeTags(featuredProject.tech_stack).length ? (
                            <div className="human-tag-row">
                              {normalizeTags(featuredProject.tech_stack).slice(0, 6).map((tech) => (
                                <span key={tech} className="human-tag">{tech}</span>
                              ))}
                            </div>
                          ) : null}

                          <div className="human-action-row">
                            {featuredProject.demo_url ? (
                              <a href={featuredProject.demo_url} target="_blank" rel="noreferrer" className="btn btn-secondary">
                                <ExternalLink size={15} />
                                {copy.liveDemo}
                              </a>
                            ) : null}
                            {featuredProject.github_url ? (
                              <a href={featuredProject.github_url} target="_blank" rel="noreferrer" className="btn btn-ghost">
                                <Github size={15} />
                                {copy.source}
                              </a>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {secondaryProjects.length ? (
                  <div className="human-project-grid">
                    {secondaryProjects.map((project) => (
                      <Panel key={project.id}>
                        <div className="human-project-card__media">
                          {resolveImage(project.cover_image) ? (
                            <img
                              src={resolveImage(project.cover_image)}
                              alt={getLocalizedField(project, 'title', lang, copy.untitledProject)}
                            />
                          ) : (
                            <FolderOpen size={28} color={themeColor} />
                          )}
                        </div>
                        <div className="human-project-card__title">
                          {getLocalizedField(project, 'title', lang, copy.untitledProject)}
                        </div>
                        <div className="human-project-card__copy">
                          {getLocalizedField(project, 'description', lang, copy.projectMissing)}
                        </div>

                        {normalizeTags(project.tech_stack).length ? (
                          <div className="human-tag-row">
                            {normalizeTags(project.tech_stack).slice(0, 4).map((tech) => (
                              <span key={tech} className="human-tag">{tech}</span>
                            ))}
                          </div>
                        ) : null}

                        <div className="human-action-row">
                          {project.demo_url ? (
                            <a href={project.demo_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                              <ExternalLink size={15} />
                              {copy.demo}
                            </a>
                          ) : null}
                          {project.github_url ? (
                            <a href={project.github_url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                              <Github size={15} />
                              {copy.source}
                            </a>
                          ) : null}
                        </div>
                      </Panel>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <EmptyBlock>{copy.noProjects}</EmptyBlock>
            )}
          </section>

          <div className="human-two-col">
            <section id="skills" className="human-section">
              <SectionHeading
                eyebrow={copy.skillsEyebrow}
                title={<>{copy.skillsTitleLead} <em>{copy.skillsTitleEmphasis}</em></>}
                detail={copy.skillsDetail}
              />

              {skills.length ? (
                <div className="human-skill-stack">
                  {Object.entries(groupedSkills).map(([category, categorySkills]) => (
                    <Panel key={category}>
                      <div className="human-skill-group__head">
                        <div className="human-skill-group__title">{categoryLabels[category] || copy.other}</div>
                        <div className="human-chip">{categorySkills.length} {copy.skillItems}</div>
                      </div>
                      <div className="human-skill-list">
                        {categorySkills.map((skill) => (
                          <div key={skill.id}>
                            <div className="human-skill-item__top">
                              <strong>{skill.name}</strong>
                              <span>{skill.level || 0}%</span>
                            </div>
                            <div className="human-skill-bar">
                              <span style={{ width: `${skill.level || 0}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </Panel>
                  ))}
                </div>
              ) : (
                <EmptyBlock>{copy.noSkills}</EmptyBlock>
              )}
            </section>

            <section id="experience" className="human-section">
              <SectionHeading
                eyebrow={copy.experienceEyebrow}
                title={<>{copy.experienceTitleLead} <em>{copy.experienceTitleEmphasis}</em></>}
                detail={copy.experienceDetail}
              />

              {experience.length ? (
                <div className="human-timeline">
                  {experience.map((item) => (
                    <div key={item.id} className="human-timeline__item">
                      <div className="human-timeline__card">
                        <div className="human-date-pill">
                          <Calendar size={14} />
                          {formatRange(item.start_date, item.end_date, item.is_current, lang, copy.present)}
                        </div>
                        <h3 style={{ marginTop: 14, fontWeight: 800, fontSize: '1.08rem' }}>
                          {getLocalizedField(item, 'position', lang, copy.untitledRole)}
                        </h3>
                        <div className="human-meta-line">
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <Briefcase size={14} />
                            {item.company}
                          </span>
                          {item.location ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              <MapPin size={14} />
                              {item.location}
                            </span>
                          ) : null}
                        </div>
                        {getLocalizedField(item, 'description', lang) ? (
                          <div style={{ marginTop: 12, color: 'var(--color-text-2)', lineHeight: 1.8 }}>
                            {getLocalizedField(item, 'description', lang)}
                          </div>
                        ) : null}
                        {normalizeTags(item.tech_stack).length ? (
                          <div className="human-tag-row">
                            {normalizeTags(item.tech_stack).map((tech) => (
                              <span key={tech} className="human-tag">{tech}</span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyBlock>{copy.noExperience}</EmptyBlock>
              )}
            </section>
          </div>

          <div className="human-two-col">
            <section id="education" className="human-section">
              <SectionHeading
                eyebrow={copy.educationEyebrow}
                title={<>{copy.educationTitleLead} <em>{copy.educationTitleEmphasis}</em></>}
                detail={copy.educationDetail}
              />

              {education.length ? (
                <div className="human-card-grid">
                  {education.map((item) => (
                    <Panel key={item.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1.02rem' }}>{item.institution}</div>
                          <div style={{ marginTop: 8, color: 'var(--color-text-2)' }}>
                            {getLocalizedField(item, 'degree', lang)}
                          </div>
                          <div style={{ color: 'var(--color-text-3)', marginTop: 4 }}>
                            {getLocalizedField(item, 'field', lang)}
                          </div>
                        </div>
                        <GraduationCap size={18} color={themeColor} />
                      </div>
                      <div className="human-meta-line">
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Calendar size={14} />
                          {formatRange(item.start_date, item.end_date, item.is_current, lang, copy.inProgress)}
                        </span>
                      </div>
                    </Panel>
                  ))}
                </div>
              ) : (
                <EmptyBlock>{copy.noEducation}</EmptyBlock>
              )}
            </section>

            <section id="certificates" className="human-section">
              <SectionHeading
                eyebrow={copy.certificatesEyebrow}
                title={<>{copy.certificatesTitleLead} <em>{copy.certificatesTitleEmphasis}</em></>}
                detail={copy.certificatesDetail}
              />

              {certificates.length ? (
                <div className="human-card-grid">
                  {certificates.map((certificate) => (
                    <Panel key={certificate.id}>
                      <div className="human-credential-media">
                        {resolveImage(certificate.image_url) ? (
                          <img
                            src={resolveImage(certificate.image_url)}
                            alt={getLocalizedField(certificate, 'name', lang, copy.certificate)}
                          />
                        ) : (
                          <Award size={28} color={themeColor} />
                        )}
                      </div>
                      <div style={{ marginTop: 16, fontWeight: 800, fontSize: '1.02rem' }}>
                        {getLocalizedField(certificate, 'name', lang, copy.certificate)}
                      </div>
                      <div style={{ marginTop: 8, color: 'var(--color-text-2)' }}>{certificate.issuer}</div>
                      <div className="human-meta-line">
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Calendar size={14} />
                          {formatDate(certificate.issue_date, lang, true)}
                        </span>
                      </div>
                      {certificate.credential_url ? (
                        <div className="human-action-row">
                          <a href={certificate.credential_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                            <ExternalLink size={14} />
                            {copy.openCredential}
                          </a>
                        </div>
                      ) : null}
                    </Panel>
                  ))}
                </div>
              ) : (
                <EmptyBlock>{copy.noCertificates}</EmptyBlock>
              )}
            </section>
          </div>

          <div className="human-two-col">
            <section id="blog" className="human-section">
              <SectionHeading
                eyebrow={copy.blogEyebrow}
                title={<>{copy.blogTitleLead} <em>{copy.blogTitleEmphasis}</em></>}
                detail={copy.blogDetail}
              />

              {blogPosts.length ? (
                <div className="human-blog-list">
                  {blogPosts.map((post) => (
                    <div key={post.id} className="human-blog-item">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                        <div className="human-chip">
                          <BookOpen size={14} />
                          {copy.article}
                        </div>
                        {post.is_featured ? (
                          <div className="human-chip">
                            <Star size={14} />
                            {copy.featured}
                          </div>
                        ) : null}
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                        {getLocalizedField(post, 'title', lang, copy.untitledArticle)}
                      </div>
                      <div style={{ color: 'var(--color-text-3)', lineHeight: 1.8 }}>
                        {getLocalizedField(post, 'excerpt', lang, copy.noExcerpt)}
                      </div>
                      <div className="human-blog-item__meta">
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={14} />
                          {post.read_time || 5} {copy.minRead}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Eye size={14} />
                          {post.views || 0}
                        </span>
                        {post.published_at ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <Calendar size={14} />
                            {formatDate(post.published_at, lang, true)}
                          </span>
                        ) : null}
                      </div>
                      {normalizeTags(post.tags).length ? (
                        <div className="human-tag-row">
                          {normalizeTags(post.tags).slice(0, 4).map((tag) => (
                            <span key={tag} className="human-tag">
                              <Tag size={12} />
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyBlock>{copy.noWriting}</EmptyBlock>
              )}
            </section>

            <section id="contact" className="human-section">
              <SectionHeading
                eyebrow={copy.contactEyebrow}
                title={<>{copy.contactTitleLead} <em>{copy.contactTitleEmphasis}</em></>}
                detail={copy.contactDetail}
              />

              <Panel>
                {contactChannels.length ? (
                  <div className="human-contact-list">
                    {contactChannels.map(({ label, value, href, icon: ContactIcon }) => {
                      const Wrapper = href ? 'a' : 'div';
                      const wrapperProps = href ? { href } : {};

                      return (
                        <Wrapper key={label} {...wrapperProps} className="human-contact-row">
                          <span className="human-contact-row__meta">
                            <span className="human-contact-row__icon">
                              <ContactIcon size={16} />
                            </span>
                            <span>
                              <span className="human-mini-label" style={{ display: 'block' }}>{label}</span>
                              <span style={{ display: 'block', marginTop: 4, fontWeight: 800 }}>{value}</span>
                            </span>
                          </span>
                          {href ? <ArrowUpRight size={15} color={themeColor} /> : null}
                        </Wrapper>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyBlock>{copy.noDirectChannels}</EmptyBlock>
                )}

                <form className="human-form" onSubmit={handleContactSubmit} style={{ marginTop: 18 }}>
                  <div className="form-group">
                    <label className="input-label">{copy.name}</label>
                    <input
                      name="name"
                      className="input-field"
                      value={contactForm.name}
                      onChange={handleContactChange}
                      placeholder={copy.yourName}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="input-label">{copy.email}</label>
                    <input
                      name="email"
                      type="email"
                      className="input-field"
                      value={contactForm.email}
                      onChange={handleContactChange}
                      placeholder={copy.yourEmail}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="input-label">{copy.subject}</label>
                    <input
                      name="subject"
                      className="input-field"
                      value={contactForm.subject}
                      onChange={handleContactChange}
                      placeholder={copy.projectInquiry}
                    />
                  </div>
                  <div className="form-group">
                    <label className="input-label">{copy.message}</label>
                    <textarea
                      name="message"
                      className="input-field"
                      value={contactForm.message}
                      onChange={handleContactChange}
                      placeholder={copy.messagePlaceholder}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn"
                    disabled={contactSending}
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      background: `linear-gradient(135deg, ${themeColor}, ${hexToRgba(themeColor, 0.78)})`,
                      color: 'white',
                      boxShadow: `0 18px 32px ${hexToRgba(themeColor, 0.28)}`,
                    }}
                  >
                    {contactSending ? copy.sending : copy.sendMessage}
                  </button>
                </form>

                {contactSuccess ? (
                  <div
                    style={{
                      marginTop: 14,
                      padding: '0.95rem 1rem',
                      borderRadius: 16,
                      background: contactStatus === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      color: contactStatus === 'success' ? '#047857' : '#b91c1c',
                      border: `1px solid ${contactStatus === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    }}
                  >
                    {contactSuccess}
                  </div>
                ) : null}
              </Panel>
            </section>
          </div>

        </main>
      </div>
    </div>
  );
}
