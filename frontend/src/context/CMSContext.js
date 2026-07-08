import React, { createContext, useState, useContext, useCallback } from 'react';
import api, { API_URL } from '../apiConfig';
import { useAuth } from './AuthContext';

const CMSContext = createContext();

export const CMSProvider = ({ children }) => {
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [pageContent, setPageContent] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchPageContent = useCallback(async (pageName) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/pages/${pageName}`);
      const contentMap = {};
      data.forEach(item => {
        contentMap[item.sectionKey] = item;
      });
      setPageContent(prev => ({ ...prev, [pageName]: contentMap }));
    } catch (error) {
      console.error(`Error fetching content for ${pageName}:`, error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateContent = async (pageName, sectionKey, contentValue, contentType = 'text', metadata = {}) => {
    try {
      const { data } = await api.put('/api/pages/content', {
        pageName,
        sectionKey,
        contentValue,
        contentType,
        metadata
      });

      setPageContent(prev => ({
        ...prev,
        [pageName]: {
          ...prev[pageName],
          [sectionKey]: data
        }
      }));
      return data;
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await api.post('/api/pages/upload', formData);
      return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const toggleEditMode = () => {
    if (user && user.role === 'ADMIN') {
      setIsEditMode(!isEditMode);
    }
  };

  return (
    <CMSContext.Provider value={{
      isEditMode,
      toggleEditMode,
      pageContent,
      fetchPageContent,
      updateContent,
      uploadImage,
      loading
    }}>
      {children}
    </CMSContext.Provider>
  );
};

export const useCMS = () => useContext(CMSContext);
