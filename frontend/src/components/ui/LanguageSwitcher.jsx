import { Globe } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';

const LANGS = [
  { code: 'kz', label: 'KZ' },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
];

export default function LanguageSwitcher({
  label,
  compact = false,
  style = {},
  className = '',
}) {
  const { lang, changeLang, t } = useApp();
  const resolvedLabel = label || t('common.lang');

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap',
        ...style,
      }}
    >
      {!compact ? (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--color-text-3)',
          }}
        >
          <Globe size={14} />
          {resolvedLabel}
        </span>
      ) : null}

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: 4,
          borderRadius: 999,
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
        }}
      >
        {LANGS.map((item) => {
          const active = lang === item.code;

          return (
            <button
              key={item.code}
              type="button"
              onClick={() => changeLang(item.code)}
              aria-pressed={active}
              style={{
                minWidth: 48,
                padding: compact ? '0.45rem 0.7rem' : '0.5rem 0.8rem',
                borderRadius: 999,
                border: 'none',
                background: active ? 'var(--color-primary)' : 'transparent',
                color: active ? 'white' : 'var(--color-text-2)',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                transition: 'all 0.2s ease',
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
