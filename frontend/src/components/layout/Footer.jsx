import { Link } from 'react-router-dom';
import { ArrowUpRight, Gamepad2, Github, Instagram, Send } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import BrandLogo from '../ui/BrandLogo.jsx';

export default function Footer() {
  const { t } = useApp();
  const year = new Date().getFullYear();

  const links = {
    pages: [
      { label: t('nav.about'), path: '/about' },
      { label: t('nav.projects'), path: '/projects' },
      { label: t('nav.skills'), path: '/skills' },
      { label: t('nav.experience'), path: '/experience' },
    ],
    more: [
      { label: t('nav.education'), path: '/education' },
      { label: t('nav.certificates'), path: '/certificates' },
      { label: t('nav.blog'), path: '/blog' },
      { label: t('nav.contact'), path: '/contact' },
    ],
  };

  return (
    <footer
      style={{
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        padding: '4rem 0 2rem',
      }}
    >
      <div className="container-app">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem', textDecoration: 'none' }}>
              <BrandLogo
                size={38}
                alt="Bekw logo"
                style={{ filter: 'drop-shadow(0 8px 20px rgba(10,102,255,0.22))' }}
              />
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
                Bekw<span style={{ color: 'var(--color-primary)' }}>.</span>dev
              </span>
            </Link>

            <p style={{ color: 'var(--color-text-3)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              {t('footer.description')}
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { icon: Github, href: 'https://github.com' },
                { icon: Instagram, href: 'https://www.instagram.com/bekw.eg/' },
                { icon: Gamepad2, href: 'https://steamcommunity.com/id/zetsus-q/' },
                { icon: Send, href: 'https://t.me' },
              ].map(({ icon: Icon, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text-3)',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                  className="hover:border-primary-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-text-3)', marginBottom: '1rem' }}>
              {t('footer.navigation')}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {links.pages.map(({ label, path }) => (
                <Link
                  key={path}
                  to={path}
                  style={{ color: 'var(--color-text-2)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
                  className="hover:text-primary-500"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-text-3)', marginBottom: '1rem' }}>
              {t('footer.more')}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {links.more.map(({ label, path }) => (
                <Link
                  key={path}
                  to={path}
                  style={{ color: 'var(--color-text-2)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
                  className="hover:text-primary-500"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-text-3)', marginBottom: '1rem' }}>
              {t('footer.contact')}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="mailto:berdibekegeubai@gmail.com" style={{ color: 'var(--color-text-2)', textDecoration: 'none', fontSize: '0.9rem' }}>
                berdibekegeubai@gmail.com
              </a>
              <span style={{ color: 'var(--color-text-3)', fontSize: '0.875rem' }}>{t('contact.info_location_value')}</span>
              <Link
                to="/contact"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  marginTop: 4,
                }}
              >
                {t('nav.contact')} <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            paddingTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <p style={{ color: 'var(--color-text-3)', fontSize: '0.85rem' }}>
            © {year} Bekw.dev. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
