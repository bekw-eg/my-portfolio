import { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { getAdminText } from '../../i18n/adminCopy.js';

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function AvatarUploadField({
  label = 'Profile Photo',
  name = '',
  currentSrc = '',
  file = null,
  onFileChange,
  hint = 'PNG, JPG, WEBP or GIF up to 5 MB.',
  size = 128,
}) {
  const { lang } = useApp();
  const tx = getAdminText(lang);
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return undefined;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (!ALLOWED_TYPES.has(selectedFile.type)) {
      setError('Only PNG, JPG, WEBP and GIF images are supported.');
      event.target.value = '';
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('The image must be 5 MB or smaller.');
      event.target.value = '';
      return;
    }

    setError('');
    onFileChange?.(selectedFile);
  };

  const handleClear = () => {
    setError('');
    onFileChange?.(null);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const imageSrc = previewUrl || currentSrc || '';
  const fallbackChar = (name || 'P').trim().charAt(0).toUpperCase() || 'P';

  return (
    <div className="form-group" style={{ marginBottom: '1rem' }}>
      <label className="input-label">{tx(label)}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            overflow: 'hidden',
            border: '1px solid var(--color-border)',
            background: 'linear-gradient(135deg, rgba(37,99,235,0.14), rgba(14,165,233,0.12))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={name || tx('Profile photo preview')}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ fontSize: Math.round(size * 0.34), fontWeight: 800, color: 'white' }}>
              {fallbackChar}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', width: 'fit-content' }}>
            {imageSrc ? tx('Choose Another Photo') : tx('Upload Photo')}
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
              onChange={handleChange}
              style={{ display: 'none' }}
            />
          </label>

          {file ? (
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleClear} style={{ width: 'fit-content' }}>
              {tx('Clear Selection')}
            </button>
          ) : null}

          {currentSrc && !file ? (
            <div style={{ color: 'var(--color-text-3)', fontSize: '0.82rem' }}>
              {tx('Current photo is already saved.')}
            </div>
          ) : null}

          <div style={{ color: 'var(--color-text-3)', fontSize: '0.82rem' }}>{tx(hint)}</div>

          {error ? (
            <div style={{ color: '#ef4444', fontSize: '0.82rem' }}>{tx(error)}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
