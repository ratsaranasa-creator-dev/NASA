import React, { createContext, useState, useContext, useCallback } from 'react';
import axios from 'axios';
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
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/pages/${pageName}`);
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
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const { data } = await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/pages/content`, {
        pageName,
        sectionKey,
        contentValue,
        contentType,
        metadata
      }, config);

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
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const { data } = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/pages/upload`, formData, config);
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
