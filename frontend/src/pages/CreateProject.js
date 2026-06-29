import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';
import ProjectForm from '../components/ProjectForm/ProjectForm';
import './CreateProject.css';

export default function CreateProject() {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const form = new FormData();

      // Ajouter les données du formulaire
      Object.keys(formData).forEach(key => {
        if (key === 'technologies') {
          form.append(key, JSON.stringify(formData[key]));
        } else if (key === 'image') {
          if (formData[key]) form.append('image', formData[key]);
        } else {
          form.append(key, formData[key]);
        }
      });

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: form,
      });

      if (!response.ok) throw new Error('Erreur lors de la création du projet');

      setSuccessMessage('Projet créé avec succès !');
      setTimeout(() => {
        navigate('/admin/projects');
      }, 2000);
    } catch (err) {
      console.error(err);
      alert('Erreur: ' + err.message);
    }
  };

  return (
    <div className="create-project-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Retour">
          <FiArrowLeft /> Retour
        </button>
        <h1>Créer un Nouveau Projet</h1>
      </div>

      {successMessage && (
        <div className="success-banner">
          <FiCheck /> {successMessage}
        </div>
      )}

      <ProjectForm
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
}
