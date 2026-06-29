import React from 'react';

export default function ActionButtons({ onCancel, loading, disabled }) {
  return (
    <div className="action-buttons">
      <button type="button" className="btn ghost" onClick={onCancel}>Annuler</button>
      <button type="submit" className={`btn primary ${loading ? 'loading' : ''}`} disabled={disabled || loading}>
        {loading ? <span className="spinner" aria-hidden /> : 'Créer le projet'}
      </button>
    </div>
  );
}
