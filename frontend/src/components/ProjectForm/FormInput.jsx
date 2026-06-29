import React, { useRef, useEffect } from 'react';

export default function FormInput({ label, name, value, onChange, placeholder = '', icon, required, error }) {
  const id = `input-${name}`;
  const inputRef = useRef(null);

  useEffect(() => {
    if (error && inputRef.current) {
      inputRef.current.setAttribute('aria-invalid', 'true');
    }
  }, [error]);

  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <div className="input-wrap">
        {icon && <span className="icon" aria-hidden="true">{icon}</span>}
        <input
          ref={inputRef}
          id={id}
          name={name}
          className="text-input"
          type="text"
          value={value || ''}
          onChange={e => onChange && onChange(e.target.value)}
          placeholder={placeholder}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          autoComplete="off"
        />
        <label htmlFor={id} className={`floating ${value ? 'filled' : ''}`}>
          {label}
          {required && <span className="required" aria-label="obligatoire">*</span>}
        </label>
      </div>
      {error && (
        <div id={`${id}-error`} className="field-error" role="alert">
          <span aria-hidden="true">✕</span> {error}
        </div>
      )}
    </div>
  );
}

