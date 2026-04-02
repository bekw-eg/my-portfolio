import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { Search } from 'lucide-react';

export function AdminPageHeader({
  eyebrow = 'Control center',
  title,
  description,
  meta = [],
  actions,
}) {
  return (
    <div className="admin-page-header">
      <div className="admin-page-header__copy">
        {eyebrow && <span className="admin-page-header__eyebrow">{eyebrow}</span>}
        <div className="admin-page-header__heading">
          <h2 className="admin-page-header__title">{title}</h2>
          {description && <p className="admin-page-header__description">{description}</p>}
        </div>
        {meta.length > 0 && (
          <div className="admin-page-header__meta">
            {meta.map((item) => (
              <span key={item} className="admin-meta-pill">
                {item}
              </span>
            ))}
          </div>
        )}
      </div>
      {actions && <div className="admin-page-header__actions">{actions}</div>}
    </div>
  );
}

export function AdminPanel({
  title,
  description,
  action,
  className,
  bodyClassName,
  children,
}) {
  return (
    <section className={clsx('admin-panel', className)}>
      {(title || description || action) && (
        <div className="admin-panel__header">
          <div>
            {title && <h3 className="admin-panel__title">{title}</h3>}
            {description && <p className="admin-panel__description">{description}</p>}
          </div>
          {action && <div className="admin-panel__action">{action}</div>}
        </div>
      )}
      <div className={clsx('admin-panel__body', bodyClassName)}>{children}</div>
    </section>
  );
}

export function AdminToolbar({ className, children, ...props }) {
  return (
    <div className={clsx('admin-toolbar', className)} {...props}>
      {children}
    </div>
  );
}

export function AdminToolbarGroup({ className, children, ...props }) {
  return (
    <div className={clsx('admin-toolbar__group', className)} {...props}>
      {children}
    </div>
  );
}

export function AdminSearchField({
  value,
  onChange,
  placeholder = 'Search',
  className,
  ...props
}) {
  return (
    <label className={clsx('admin-search', className)}>
      <Search size={16} className="admin-search__icon" />
      <input
        className="admin-search__input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
      />
    </label>
  );
}

export function AdminFilterTabs({ options, value, onChange, className }) {
  return (
    <div className={clsx('admin-filter-tabs', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={clsx('admin-filter-tab', value === option.value && 'is-active')}
        >
          <span>{option.label}</span>
          {option.count !== undefined && <strong>{option.count}</strong>}
        </button>
      ))}
    </div>
  );
}

export function AdminMetricCard({
  icon: Icon,
  label,
  value,
  detail,
  action,
  tone = 'neutral',
}) {
  return (
    <section className={clsx('admin-metric-card', `is-${tone}`)}>
      <div className="admin-metric-card__top">
        <div className="admin-metric-card__icon">
          <Icon size={18} />
        </div>
        {action && <div className="admin-metric-card__action">{action}</div>}
      </div>
      <div className="admin-metric-card__value">{value}</div>
      <div className="admin-metric-card__label">{label}</div>
      {detail && <div className="admin-metric-card__detail">{detail}</div>}
    </section>
  );
}

export function AdminStatusBadge({ children, tone = 'neutral', className }) {
  return (
    <span className={clsx('admin-status-badge', `is-${tone}`, className)}>
      {children}
    </span>
  );
}

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  action,
}) {
  return (
    <div className="admin-empty-state">
      {Icon && (
        <div className="admin-empty-state__icon">
          <Icon size={22} />
        </div>
      )}
      <div className="admin-empty-state__title">{title}</div>
      {description && <p className="admin-empty-state__description">{description}</p>}
      {action && <div className="admin-empty-state__action">{action}</div>}
    </div>
  );
}

export function AdminModal({
  title,
  description,
  onClose,
  children,
  footer,
  width = '760px',
}) {
  useEffect(() => {
    const { body, documentElement } = document;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    body.classList.add('admin-modal-open');
    documentElement.classList.add('admin-modal-open');
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      body.classList.remove('admin-modal-open');
      documentElement.classList.remove('admin-modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const modal = (
    <div className="admin-modal" role="dialog" aria-modal="true">
      <div className="admin-modal__backdrop" onClick={onClose} />
      <div className="admin-modal__surface" style={{ maxWidth: width }}>
        <div className="admin-modal__header">
          <div>
            <h2 className="admin-modal__title">{title}</h2>
            {description && <p className="admin-modal__description">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="admin-icon-button"
            aria-label="Close dialog"
          >
            <span aria-hidden="true" style={{ fontSize: '1.15rem', lineHeight: 1 }}>&times;</span>
          </button>
        </div>
        <div className="admin-modal__body">{children}</div>
        {footer && <div className="admin-modal__footer">{footer}</div>}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
