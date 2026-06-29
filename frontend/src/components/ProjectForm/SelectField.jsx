import React from 'react';

export default function SelectField({ label, value, onChange, options = [] }) {
  const id = `select-${label.replace(/\s+/g, '').toLowerCase()}`;
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>{label}</label>
      <select id={id} className="select" value={value || ''} onChange={e => onChange && onChange(e.target.value)}>
        <option value="">-- Sélectionner --</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
