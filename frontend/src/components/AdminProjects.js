import React, { useState, useEffect, useCallback } from 'react';
import api, { API_URL } from '../apiConfig';
import { Plus, Edit3, Trash2, MapPin, Calendar, Folder, Save, X, Image as ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCMS } from '../context/CMSContext';
import { toast } from 'react-toastify';

import '../styles/AdminProjects.css';

const AdminProjects = () => {
  const { user } = useAuth();
  const { uploadImage } = useCMS();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null); // holds project to create or edit
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/projects?admin=true');
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const validateField = (name, value) => {
    let errors = { ...validationErrors };
    
    switch (name) {
      case 'title':
        if (!value) errors.title = 'Le titre est obligatoire.';
        else if (value.length < 5) errors.title = 'Le titre doit faire au moins 5 caractères.';
        else delete errors.title;
        break;
      case 'description':
        if (!value) errors.description = 'La description est obligatoire.';
        else if (value.length < 20) errors.description = 'La description doit être plus détaillée (min 20 caractères).';
        else delete errors.description;
        break;
      case 'location':
        if (!value) errors.location = 'La localisation est obligatoire.';
        else delete errors.location;
        break;
      case 'startDate':
        if (!value) errors.startDate = 'Date de début obligatoire.';
        else delete errors.startDate;
        break;
      case 'endDate':
        if (!value) errors.endDate = 'Date de fin obligatoire.';
        else if (editingProject.startDate && value < editingProject.startDate) errors.endDate = 'La date de fin ne peut pas être avant la date de début.';
        else delete errors.endDate;
        break;
      default:
        break;
    }
    
    setValidationErrors(errors);
  };

  const handleInputChange = (name, value) => {
    setEditingProject({ ...editingProject, [name]: value });
    validateField(name, value);
  };

  const handleEditClick = (project) => {
    setEditingProject(project);
    setImageFile(null);
    setValidationErrors({});
  };

  const handleCreateClick = () => {
    setEditingProject({
      title: '',
      description: '',
      location: '',
      startDate: '',
      endDate: '',
      image: '',
      category: 'infra',
      status: 'À venir',
      budget: '',
      fullDescription: '',
      objectives: [],
      timeline: [],
      beneficiaries: '',
      duration: '',
      manager: '',
      progress: 0,
      visibilityStatus: 'brouillon'
    });
    setImageFile(null);
    setValidationErrors({});
    window.scrollTo(0, 0);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      // Basic validation for file type
      if (!file.type.startsWith('image/')) {
        setValidationErrors(prev => ({ ...prev, image: 'Veuillez sélectionner une image valide.' }));
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.image;
          return newErrors;
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!imageFile) return null;
    setUploadingImage(true);
    try {
      const url = await uploadImage(imageFile);
      setUploadingImage(false);
      return url;
    } catch (error) {
      setUploadingImage(false);
      toast.error('Erreur lors du téléchargement de l\'image.');
      return null;
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Final validation
    if (Object.keys(validationErrors).length > 0) {
      toast.error('Veuillez corriger les erreurs avant d\'enregistrer.');
      return;
    }

    let imageUrl = editingProject.image;
    if (imageFile) {
      const uploadedUrl = await handleUpload();
      if (!uploadedUrl) return; 
      imageUrl = uploadedUrl;
    }

    if (!editingProject.title || !editingProject.description || !editingProject.location || !editingProject.startDate || !editingProject.endDate || !imageUrl) {
      toast.error('Tous les champs obligatoires doivent être remplis.');
      return;
    }

    const payload = {
      ...editingProject,
      image: imageUrl
    };

    try {
      if (editingProject.id) {
        await api.put(`/api/projects/${editingProject.id}`, payload);
        toast.success('Projet mis à jour avec succès.');
      } else {
        await api.post('/api/projects', payload);
        toast.success('Projet créé et publié avec succès.');
      }

      setEditingProject(null);
      setImageFile(null);
      fetchProjects();
      window.scrollTo(0, 0);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Une erreur est survenue lors de l\'enregistrement.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.')) return;

    try {
      await api.delete(`/api/projects/${id}`);
      toast.success('Projet supprimé avec succès.');
      fetchProjects();
    } catch (error) {
      toast.error('Erreur lors de la suppression du projet.');
    }
  };

  const handleToggleVisibility = async (project) => {
    try {
      const newStatus = project.visibilityStatus === 'publié' ? 'brouillon' : 'publié';
      await api.put(`/api/projects/${project.id || project._id}`, { visibilityStatus: newStatus });
      toast.success(`Projet ${newStatus === 'publié' ? 'publié' : 'mis en brouillon'} avec succès.`);
      fetchProjects();
    } catch (error) {
      toast.error('Erreur lors du changement de visibilité.');
    }
  };

  if (user?.role !== 'ADMIN') {
    return <div className="forbidden-msg">Accès réservé exclusivement à l'administrateur.</div>;
  }

  return (
    <div className="admin-projects-panel">
      {/* Page Header */}
      {!editingProject && (
        <div className="panel-header">
          <div>
            <h3>Gestion des Projets</h3>
            <p>Ajoutez, modifiez ou supprimez des projets municipaux de Dembéni.</p>
          </div>
          <button className="btn-add-project" onClick={handleCreateClick}>
            <Plus size={18} /> Nouveau Projet
          </button>
        </div>
      )}

      {/* Project Creation/Edition Form View */}
      {editingProject ? (
        <div className="project-form-container">
          <div className="form-header-modern">
            <div className="header-info">
              <Folder className="header-icon" />
              <div>
                <h4>{editingProject.id ? 'Modifier le projet' : 'Créer un nouveau projet'}</h4>
                <p>{editingProject.id ? `Identifiant unique: #${editingProject.id}` : 'Veuillez renseigner les détails du projet ci-dessous.'}</p>
              </div>
            </div>
            <button className="btn-back" onClick={() => setEditingProject(null)}>
              <X size={20} /> <span>Fermer</span>
            </button>
          </div>

          <form onSubmit={handleSave} className="modern-project-form">
            <div className="form-sections-grid">
              {/* Left Column: Détails de l'ouvrage */}
              <div className="form-column">
                <div className="form-section-card details-card">
                  <h5><Edit3 size={18} /> DÉTAILS DE L'OUVRAGE</h5>
                  <div className="form-group">
                    <label>TITRE DU PROJET *</label>
                    <input
                      type="text"
                      value={editingProject.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={validationErrors.title ? 'input-error' : ''}
                      placeholder="Ex: Construction de la nouvelle mairie"
                    />
                    {validationErrors.title && (
                      <span className="error-text"><AlertCircle size={14} /> {validationErrors.title}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>DESCRIPTION DU PROJET *</label>
                    <textarea
                      value={editingProject.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className={validationErrors.description ? 'input-error' : ''}
                      placeholder="Résumé court (apparaît sur la carte)..."
                      rows={4}
                    />
                    {validationErrors.description && (
                      <span className="error-text"><AlertCircle size={14} /> {validationErrors.description}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>PRÉSENTATION DÉTAILLÉE</label>
                    <textarea
                      value={editingProject.fullDescription || ''}
                      onChange={(e) => handleInputChange('fullDescription', e.target.value)}
                      placeholder="Description complète du projet, objectifs détaillés..."
                      rows={8}
                    />
                  </div>

                  <div className="form-group">
                    <label>OBJECTIFS (Un par ligne)</label>
                    <textarea
                      value={editingProject.objectives?.join('\n') || ''}
                      onChange={(e) => handleInputChange('objectives', e.target.value.split('\n'))}
                      placeholder="Objectif 1&#10;Objectif 2&#10;..."
                      rows={4}
                    />
                  </div>

                  <div className="form-group">
                    <label>CHRONOLOGIE (JSON - Expert)</label>
                    <textarea
                      value={JSON.stringify(editingProject.timeline || [], null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          handleInputChange('timeline', parsed);
                        } catch (err) {
                          // Allow typing invalid JSON temporarily
                          setEditingProject({ ...editingProject, timeline_raw: e.target.value });
                        }
                      }}
                      placeholder='[{"phase": "Etudes", "period": "2023", "done": true}]'
                      rows={6}
                    />
                    <small className="help-text">Format: {'[{"phase": "Nom", "period": "Dates", "done": true/false}]'}</small>
                  </div>
                </div>
              </div>

              {/* Right Column: Localisation, Chronologie, Media */}
              <div className="form-column">
                <div className="form-section-card">
                  <h5><MapPin size={18} /> INFOS COMPLÉMENTAIRES</h5>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>LIEU *</label>
                      <input
                        type="text"
                        value={editingProject.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className={validationErrors.location ? 'input-error' : ''}
                        placeholder="Ex: Dembéni Centre"
                      />
                      {validationErrors.location && (
                        <span className="error-text"><AlertCircle size={14} /> {validationErrors.location}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>BUDGET ESTIMÉ</label>
                      <input
                        type="text"
                        value={editingProject.budget || ''}
                        onChange={(e) => handleInputChange('budget', e.target.value)}
                        placeholder="Ex: 2.5M€"
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>CATÉGORIE *</label>
                      <select
                        value={editingProject.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                      >
                        <option value="infra">Infrastructures</option>
                        <option value="education">Éducation</option>
                        <option value="environnement">Environnement</option>
                        <option value="social">Social</option>
                        <option value="culture">Culture</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>RESPONSABLE / DIRECTION</label>
                      <input
                        type="text"
                        value={editingProject.manager || ''}
                        onChange={(e) => handleInputChange('manager', e.target.value)}
                        placeholder="Ex: Direction des Services Techniques"
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>BÉNÉFICIAIRES</label>
                      <input
                        type="text"
                        value={editingProject.beneficiaries || ''}
                        onChange={(e) => handleInputChange('beneficiaries', e.target.value)}
                        placeholder="Ex: 15 000+ habitants"
                      />
                    </div>

                    <div className="form-group">
                      <label>DURÉE ESTIMÉE</label>
                      <input
                        type="text"
                        value={editingProject.duration || ''}
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                        placeholder="Ex: 18 mois"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section-card">
                  <h5><Calendar size={18} /> CHRONOLOGIE & AVANCEMENT</h5>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>DÉBUT DES TRAVAUX *</label>
                      <input
                        type="date"
                        value={editingProject.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        className={validationErrors.startDate ? 'input-error' : ''}
                      />
                      {validationErrors.startDate && (
                        <span className="error-text"><AlertCircle size={14} /> {validationErrors.startDate}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>FIN ESTIMÉE *</label>
                      <input
                        type="date"
                        value={editingProject.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        className={validationErrors.endDate ? 'input-error' : ''}
                      />
                      {validationErrors.endDate && (
                        <span className="error-text"><AlertCircle size={14} /> {validationErrors.endDate}</span>
                      )}
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>ÉTAT D'AVANCEMENT *</label>
                      <select
                        value={editingProject.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="status-select"
                      >
                        <option value="En cours">En cours</option>
                        <option value="À venir">À venir</option>
                        <option value="Terminé">Terminé</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>STATUT DE PUBLICATION *</label>
                      <select
                        value={editingProject.visibilityStatus || 'brouillon'}
                        onChange={(e) => handleInputChange('visibilityStatus', e.target.value)}
                        className="status-select"
                      >
                        <option value="brouillon">Brouillon (Masqué)</option>
                        <option value="publié">Publié (Visible)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>PROGRESSION (%) : {editingProject.progress || 0}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={editingProject.progress || 0}
                        onChange={(e) => handleInputChange('progress', parseInt(e.target.value))}
                        className="progress-slider"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section-card">
                  <h5><ImageIcon size={18} /> MÉDIA</h5>
                  <div className="media-upload-container">
                    <div className="upload-controls">
                      <label className="btn-modern-upload">
                        <ImageIcon size={28} /> 
                        <span>{imageFile ? imageFile.name : (editingProject.image ? 'Changer l\'illustration' : 'Sélectionner une illustration')}</span>
                        <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                        <span className="upload-hint">JPG, PNG ou WebP (max 5MB)</span>
                      </label>
                      {validationErrors.image && (
                        <span className="error-text"><AlertCircle size={14} /> {validationErrors.image}</span>
                      )}
                    </div>
                    {editingProject.image && (
                      <div className="modern-image-preview">
                        <img 
                          src={editingProject.image.startsWith('http') ? editingProject.image : `${API_URL}${editingProject.image}`} 
                          alt="Prévisualisation" 
                        />
                        <div className="image-overlay-info">Aperçu du média actuel</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions-modern">
              <button type="button" className="btn-modern-secondary" onClick={() => setEditingProject(null)}>
                Annuler
              </button>
              <button type="submit" className="btn-modern-primary" disabled={uploadingImage || Object.keys(validationErrors).length > 0}>
                {uploadingImage ? (
                  <>Patientez...</>
                ) : (
                  <>
                    <Save size={20} /> {editingProject.id ? 'Mettre à jour' : 'Publier le projet'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Projects List */
        loading ? (
          <div className="loading-spinner">Chargement des projets...</div>
        ) : (
          <div className="admin-projects-list">
            {projects.length === 0 ? (
              <p className="no-projects">Aucun projet enregistré pour le moment.</p>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Titre</th>
                      <th>Catégorie</th>
                      <th>Avancement</th>
                      <th>Visibilité</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr key={project.id || project._id}>
                        <td data-label="Image">
                          <div className="table-img-container">
                            <img 
                              src={project.image.startsWith('http') ? project.image : `${API_URL}${project.image}`} 
                              alt={project.title} 
                            />
                          </div>
                        </td>
                        <td data-label="Titre">
                          <span className="project-table-title">{project.title}</span>
                          <div className="project-table-loc"><MapPin size={12} /> {project.location}</div>
                        </td>
                        <td data-label="Catégorie">
                          <span className="badge badge-category"><Folder size={12} /> {project.category}</span>
                        </td>
                        <td data-label="Avancement">
                          <span className={`badge-status ${
                            project.status === 'Terminé' ? 'success' : 
                            project.status === 'En cours' ? 'warning' : 'info'
                          }`}>
                            {project.status}
                          </span>
                        </td>
                        <td data-label="Visibilité">
                          <button 
                            className={`badge-status ${project.visibilityStatus === 'publié' ? 'success' : 'warning'}`}
                            onClick={() => handleToggleVisibility(project)}
                            style={{ cursor: 'pointer', border: 'none' }}
                          >
                            {project.visibilityStatus === 'publié' ? 'Publié' : 'Brouillon'}
                          </button>
                        </td>
                        <td data-label="Actions">
                          <div className="action-buttons">
                            <button className="btn-action-edit" title="Modifier" onClick={() => handleEditClick(project)}>
                              <Edit3 size={16} />
                            </button>
                            <button className="btn-action-delete" title="Supprimer" onClick={() => handleDelete(project.id || project._id)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default AdminProjects;
