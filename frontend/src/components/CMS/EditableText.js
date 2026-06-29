import React, { useState, useEffect } from 'react';
import { useCMS } from '../../context/CMSContext';
import { Edit2, Check, X, History } from 'lucide-react';
import VersionHistory from './VersionHistory';

const EditableText = ({ pageName, sectionKey, defaultText, tagName: Tag = 'p', className = '' }) => {
  const { isEditMode, pageContent, updateContent, fetchPageContent } = useCMS();
  const [isEditing, setIsEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [text, setText] = useState(defaultText);

  const content = pageContent[pageName]?.[sectionKey];
  const currentText = content ? content.contentValue : defaultText;

  useEffect(() => {
    if (!pageContent[pageName]) {
      fetchPageContent(pageName);
    }
  }, [pageName, fetchPageContent, pageContent]);

  useEffect(() => {
    setText(currentText);
  }, [currentText]);

  const handleSave = async () => {
    try {
      await updateContent(pageName, sectionKey, text, 'text');
      setIsEditing(false);
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleCancel = () => {
    setText(currentText);
    setIsEditing(false);
  };

  const handleRollbackSuccess = (newContent) => {
    setText(newContent.contentValue);
    setShowHistory(false);
  };

  if (!isEditMode) {
    return <Tag className={className}>{currentText}</Tag>;
  }

  if (isEditing) {
    return (
      <div className={`editable-text-container editing ${className}`}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="editable-textarea"
          autoFocus
        />
        <div className="editable-controls">
          <button onClick={handleSave} className="btn-save-cms"><Check size={16} /></button>
          <button onClick={handleCancel} className="btn-cancel-cms"><X size={16} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className={`editable-text-container ${className}`}>
      <Tag className="editable-tag">{currentText}</Tag>
      <div className="editable-text-actions">
        <button onClick={() => setIsEditing(true)} className="btn-edit-cms" title="Modifier">
          <Edit2 size={14} />
        </button>
        {content && (
          <button onClick={() => setShowHistory(true)} className="btn-history-cms" title="Historique">
            <History size={14} />
          </button>
        )}
      </div>

      {showHistory && (
        <VersionHistory 
          contentId={content.id} 
          onRollback={handleRollbackSuccess}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
};

export default EditableText;
