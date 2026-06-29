import React from 'react';
import { useCMS } from '../../context/CMSContext';
import { useAuth } from '../../context/AuthContext';
import { Settings, EyeOff } from 'lucide-react';

const CMSToggle = () => {
  const { user } = useAuth();
  const { isEditMode, toggleEditMode } = useCMS();

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <button 
      className={`cms-toggle-bar ${isEditMode ? 'active' : ''}`}
      onClick={toggleEditMode}
    >
      {isEditMode ? (
        <>
          <EyeOff size={20} />
          <span>Quitter l'édition</span>
        </>
      ) : (
        <>
          <Settings size={20} />
          <span>Mode Édition</span>
        </>
      )}
    </button>
  );
};

export default CMSToggle;
