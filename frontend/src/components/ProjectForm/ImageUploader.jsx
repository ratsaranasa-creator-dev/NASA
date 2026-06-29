import React, { useState, useEffect, useRef } from 'react';

export default function ImageUploader({ label, file, onFileChange, icon }) {
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);
  const dropZoneRef = useRef(null);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleDrag = e => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) onFileChange(f);
  };

  const handleFile = e => {
    const f = e.target.files && e.target.files[0];
    if (f && f.type.startsWith('image/')) onFileChange(f);
  };

  return (
    <div className="field image-uploader">
      <label className="field-label">{label}</label>
      <div
        ref={dropZoneRef}
        className={`dropzone ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label={`Déposer une image ou cliquer pour ${label}`}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <div className="drop-content">
          <div className="drop-icon">{icon}</div>
          <div className="drop-text">
            {file ? `${file.name} sélectionné` : <>Déposer une image ou<button
              type="button"
              className="btn-link"
              onClick={() => inputRef.current?.click()}
            > sélectionner</button></>}
          </div>
        </div>
        <input
          ref={inputRef}
          className="hidden-file"
          type="file"
          accept="image/*"
          onChange={handleFile}
          aria-label="Sélectionner une image du projet"
        />
      </div>

      {preview && (
        <div className="image-preview">
          <img src={preview} alt="Aperçu du projet" loading="lazy" />
          <div className="image-confirm">
            <span aria-hidden="true">✓</span> Image prête à être envoyée
          </div>
        </div>
      )}
    </div>
  );
}

