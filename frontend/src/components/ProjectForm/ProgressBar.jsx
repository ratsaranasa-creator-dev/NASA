import React from 'react';

export default function ProgressBar({ percent = 0 }) {
  return (
    <div className="progress-wrap" aria-hidden>
      <div className="progress-info">Progression: {percent}%</div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
