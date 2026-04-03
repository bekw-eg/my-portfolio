import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { Home, ArrowLeft } from 'heroicons';

export default function NotFoundPage() {
  const { t } = useApp();
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-bg)', padding: '2rem', textAlign: 'center', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.06), transparent 70%)', filter: 'blur(80px)' }} />
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          fontSize: 'clamp(6rem, 20vw, 12rem)', fontWeight: 900,
          lineHeight: 1, letterSpacing: '-0.06em', marginBottom: '0.5rem',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent), #a78bfa)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          404
        </div>
        <h1 style={{ fontWeight: 700, fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', marginBottom: '0.75rem', color: 'var(--color-text)' }}>
          {t('common.page_not_found')}
        </h1>
        <p style={{ color: 'var(--color-text-3)', maxWidth: 400, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          {t('not_found.description')}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => window.history.back()} className="btn btn-secondary">
            <ArrowLeft size={16} /> {t('common.go_back')}
          </button>
          <Link to="/" className="btn btn-primary">
            <Home size={16} /> {t('common.go_home')}
          </Link>
        </div>
      </div>
    </div>
  );
}
