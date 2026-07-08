import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../apiConfig';
import { toast } from 'react-toastify';

const DemarchesContext = createContext();

export const DemarchesProvider = ({ children }) => {
  const [demarches, setDemarches] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDemarches = useCallback(async (isAdmin = false) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/demarches${isAdmin ? '?admin=true' : ''}`);
      setDemarches(data);
    } catch (error) {
      console.error('Error fetching demarches:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du chargement des démarches');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDemarches();
  }, [fetchDemarches]);

  const addDemarche = async (formData) => {
    try {
      const { data } = await api.post('/api/demarches', formData);
      setDemarches(prev => [data, ...prev]);
      toast.success('Démarche créée avec succès');
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
      throw error;
    }
  };

  const updateDemarche = async (id, formData) => {
    try {
      const { data } = await api.put(`/api/demarches/${id}`, formData);
      setDemarches(prev => prev.map(d => d._id === id ? data : d));
      toast.success('Démarche mise à jour avec succès');
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
      throw error;
    }
  };

  const deleteDemarche = async (id) => {
    try {
      await api.delete(`/api/demarches/${id}`);
      setDemarches(prev => prev.filter(d => d._id !== id));
      toast.success('Démarche supprimée avec succès');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
      throw error;
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await api.post('/api/demarches/upload', formData);
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du téléchargement');
      throw error;
    }
  };

  return (
    <DemarchesContext.Provider value={{ 
      demarches, 
      loading, 
      fetchDemarches, 
      addDemarche, 
      updateDemarche, 
      deleteDemarche,
      uploadFile
    }}>
      {children}
    </DemarchesContext.Provider>
  );
};

export const useDemarches = () => useContext(DemarchesContext);

