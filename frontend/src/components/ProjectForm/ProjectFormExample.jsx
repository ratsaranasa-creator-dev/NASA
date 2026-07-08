import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import ProjectForm from '../ProjectForm/ProjectForm';
import api from '../../apiConfig';

import './ProjectFormExample.css';

/**
 * Exemple d'intégration complète du formulaire de création de projet
 * 
 * Ce composant montre comment:
 * 1. Importer et utiliser ProjectForm
 * 2. Gérer la soumission
 * 3. Intégrer avec une navigation
 * 4. Gérer les états de succès/erreur
 */

export default function ProjectFormExample() {
  const navigate = useNavigate();
  const [submitStatus, setSubmitStatus] = React.useState('idle'); // idle, loading, success, error

  const handleFormSubmit = async (formData) => {
    setSubmitStatus('loading');
    try {
      const form = new FormData();

      // Remplir FormData avec les données du formulaire
      Object.keys(formData).forEach(key => {
        if (key === 'technologies') {
          // Les technologies sont un array
          form.append(key, JSON.stringify(formData[key]));
        } else if (key === 'image') {
          // Ajouter l'image si elle existe
          if (formData[key]) {
            form.append('image', formData[key]);
          }
        } else {
          // Autres champs
          form.append(key, formData[key]);
        }
      });

      // Appeler l'API
      const response = await api.post('/api/projects', form);

      const result = response.data;

      setSubmitStatus('success');
      console.log('Projet créé:', result);

      // Rediriger après 2 secondes
      setTimeout(() => {
        navigate('/admin/projects');
      }, 2000);
    } catch (error) {
      console.error('Erreur création projet:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 5000);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler?')) {
      navigate(-1);
    }
  };

  return (
    <div className="project-form-example">
      {/* Header */}
      <div className="example-header">
        <h1>
          <FiPlus /> Créer un Nouveau Projet
        </h1>
        <p>Remplissez les informations ci-dessous pour créer un nouveau projet</p>
      </div>

      {/* État de succès */}
      {submitStatus === 'success' && (
        <div className="success-alert">
          <div className="success-content">
            <span className="success-icon">✓</span>
            <div>
              <h3>Projet créé avec succès!</h3>
              <p>Redirection vers la liste des projets...</p>
            </div>
          </div>
        </div>
      )}

      {/* État d'erreur */}
      {submitStatus === 'error' && (
        <div className="error-alert">
          <div className="error-content">
            <span className="error-icon">✕</span>
            <div>
              <h3>Erreur lors de la création</h3>
              <p>Veuillez vérifier vos informations et réessayer</p>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire */}
      <ProjectForm
        onSubmit={handleFormSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
