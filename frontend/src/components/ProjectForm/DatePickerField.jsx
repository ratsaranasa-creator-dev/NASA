import React from 'react';

export default function DatePickerField({ label, value, onChange }) {
  const id = `date-${label.replace(/\s+/g, '').toLowerCase()}`;
  return (
    <div className="field date-field">
      <label className="field-label" htmlFor={id}>{label}</label>
      <input id={id} type="date" className="date-input" value={value || ''} onChange={e => onChange && onChange(e.target.value)} />
    </div>
  );
}
