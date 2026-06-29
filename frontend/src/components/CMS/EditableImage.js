import React, { useState, useEffect } from 'react';
import { useCMS } from '../../context/CMSContext';
import { Upload } from 'lucide-react';

const EditableImage = ({ pageName, sectionKey, defaultSrc, className = '', alt = '' }) => {
  const { isEditMode, pageContent, updateContent, uploadImage, fetchPageContent } = useCMS();

  const content = pageContent[pageName]?.[sectionKey];
  const currentSrc = content ? (content.contentValue.startsWith('http') ? content.contentValue : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${content.contentValue}`) : defaultSrc;

  useEffect(() => {
    if (!pageContent[pageName]) {
      fetchPageContent(pageName);
    }
  }, [pageName, fetchPageContent, pageContent]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Format non supporté. Utilisez JPG, PNG, WEBP ou GIF.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image est trop volumineuse (max 5Mo).');
      return;
    }

    try {
      const url = await uploadImage(file);
      await updateContent(pageName, sectionKey, url, 'image');
    } catch (error) {
      alert('Erreur lors du téléchargement');
    }
  };

  if (!isEditMode) {
    return <img src={currentSrc} alt={alt} className={className} />;
  }

  return (
    <div className={`editable-image-container ${className}`}>
      <img src={currentSrc} alt={alt} />
      <div className="editable-image-overlay">
        <label className="btn-upload-cms">
          <Upload size={20} />
          <input type="file" onChange={handleFileChange} style={{ display: 'none' }} />
        </label>
      </div>
    </div>
  );
};

export default EditableImage;
