import React, { useRef, useEffect } from 'react';

export default function FormTextarea({ label, name, value, onChange, error, required }) {
  const id = `textarea-${name}`;
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = 'auto';
    ref.current.style.height = Math.min(ref.current.scrollHeight, 500) + 'px';
  }, [value]);

  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <div className="textarea-wrap">
        <textarea
          id={id}
          name={name}
          ref={ref}
          className="text-area"
          value={value || ''}
          onChange={e => onChange && onChange(e.target.value)}
          aria-required={required}
          aria-invalid={!!error}
          placeholder=""
        />
        <label htmlFor={id} className={`floating ${value ? 'filled' : ''}`}>{label}{required ? ' *' : ''}</label>
      </div>
      {error && <div className="field-error" role="alert">{error}</div>}
    </div>
  );
}
