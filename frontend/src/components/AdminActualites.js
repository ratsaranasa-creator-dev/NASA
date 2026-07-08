import React, { useState, useEffect, useCallback } from 'react';
import api, { API_URL } from '../apiConfig';
import { Plus, Edit3, Trash2, Calendar, Save, X, Image as ImageIcon, AlertCircle, Newspaper } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCMS } from '../context/CMSContext';

import '../styles/AdminProjects.css'; // Reusing the same CSS to maintain consistency

const AdminActualites = () => {
  const { user } = useAuth();
  const { uploadImage } = useCMS();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNews, setEditingNews] = useState(null); 
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [validationErrors, setValidationErrors] = useState({});

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/news?admin=true');
      setNews(data);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const validateField = (name, value) => {
    let errors = { ...validationErrors };
    
    switch (name) {
      case 'title':
        if (!value) errors.title = 'Le titre est obligatoire.';
        else if (value.length < 5) errors.title = 'Le titre doit faire au moins 5 caractères.';
        else delete errors.title;
        break;
      case 'desc':
        if (!value) errors.desc = 'Le résumé est obligatoire.';
        else if (value.length < 10) errors.desc = 'Le résumé doit être plus détaillé.';
        else delete errors.desc;
        break;
      case 'content':
        if (!value) errors.content = 'Le contenu complet est obligatoire.';
        else if (value.length < 20) errors.content = 'Le contenu doit être plus détaillé (min 20 caractères).';
        else delete errors.content;
        break;
      case 'date':
        if (!value) errors.date = 'La date est obligatoire.';
        else delete errors.date;
        break;
      default:
        break;
    }
    
    setValidationErrors(errors);
  };

  const handleInputChange = (name, value) => {
    setEditingNews({ ...editingNews, [name]: value });
    validateField(name, value);
  };

  const handleEditClick = (newsItem) => {
    setEditingNews(newsItem);
    setImageFile(null);
    setValidationErrors({});
  };

  const handleCreateClick = () => {
    const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    
    setEditingNews({
      title: '',
      desc: '',
      content: '',
      date: today,
      image: '',
      category: 'MUNICIPALITÉ',
      status: 'brouillon'
    });
    setImageFile(null);
    setValidationErrors({});
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
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
      console.error('Erreur lors du téléchargement de l\'image.', error);
      return null;
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    let imageUrl = editingNews.image;
    if (imageFile) {
      const uploadedUrl = await handleUpload();
      if (!uploadedUrl) return; 
      imageUrl = uploadedUrl;
    }

    if (!editingNews.title || !editingNews.desc || !editingNews.content || !editingNews.date || !imageUrl) {
      return;
    }

    const payload = {
      ...editingNews,
      image: imageUrl,
      status: editingNews.status || 'brouillon'
    };

    try {
      if (editingNews.id || editingNews._id) {
        await api.put(`/api/news/${editingNews.id || editingNews._id}`, payload);
      } else {
        await api.post('/api/news', payload);
      }

      setEditingNews(null);
      setImageFile(null);
      fetchNews();
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error saving news:', error);
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      const newStatus = item.status === 'publié' ? 'brouillon' : 'publié';
      await api.put(`/api/news/${item.id || item._id}`, { ...item, status: newStatus });
      fetchNews();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette actualité ? Cette action est irréversible.')) return;

    try {
      await api.delete(`/api/news/${id}`);
      fetchNews();
    } catch (error) {
      console.error('Error deleting news:', error);
    }
  };

  if (user?.role !== 'ADMIN') {
    return <div className="forbidden-msg">Accès réservé exclusivement à l'administrateur.</div>;
  }

  return (
    <div className="admin-projects-panel">
      {/* Page Header */}
      {!editingNews && (
        <div className="panel-header">
          <div>
            <h3>Gestion des Actualités</h3>
            <p>Ajoutez, modifiez ou supprimez des actualités de la commune.</p>
          </div>
          <button className="btn-add-project" onClick={handleCreateClick}>
            <Plus size={18} /> Nouvelle Actualité
          </button>
        </div>
      )}

      {/* Form View */}
      {editingNews ? (
        <div className="project-form-container">
          <div className="form-header-modern">
            <div className="header-info">
              <Newspaper className="header-icon" />
              <div>
                <h4>{(editingNews.id || editingNews._id) ? 'Modifier l\'actualité' : 'Créer une nouvelle actualité'}</h4>
                <p>{(editingNews.id || editingNews._id) ? `Identifiant unique: #${editingNews.id || editingNews._id}` : 'Veuillez renseigner les détails ci-dessous.'}</p>
              </div>
            </div>
            <button className="btn-back" onClick={() => setEditingNews(null)}>
              <X size={20} /> <span>Fermer</span>
            </button>
          </div>

          <form onSubmit={handleSave} className="modern-project-form">
            <div className="form-sections-grid">
              <div className="form-column">
                <div className="form-section-card details-card">
                  <h5><Edit3 size={18} /> CONTENU DE L'ACTUALITÉ</h5>
                  <div className="form-group">
                    <label>TITRE *</label>
                    <input
                      type="text"
                      value={editingNews.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={validationErrors.title ? 'input-error' : ''}
                      placeholder="Titre accrocheur..."
                    />
                    {validationErrors.title && (
                      <span className="error-text"><AlertCircle size={14} /> {validationErrors.title}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>RÉSUMÉ COURT *</label>
                    <textarea
                      value={editingNews.desc}
                      onChange={(e) => handleInputChange('desc', e.target.value)}
                      className={validationErrors.desc ? 'input-error' : ''}
                      placeholder="Texte affiché sur la carte (2-3 lignes max)..."
                      rows={3}
                    />
                    {validationErrors.desc && (
                      <span className="error-text"><AlertCircle size={14} /> {validationErrors.desc}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>CONTENU COMPLET *</label>
                    <textarea
                      value={editingNews.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      className={validationErrors.content ? 'input-error' : ''}
                      placeholder="Le texte intégral de l'article..."
                      rows={8}
                    />
                    {validationErrors.content && (
                      <span className="error-text"><AlertCircle size={14} /> {validationErrors.content}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-column">
                <div className="form-section-card">
                  <h5><Newspaper size={18} /> CLASSIFICATION</h5>
                  <div className="form-group">
                    <label>CATÉGORIE *</label>
                    <select
                      value={editingNews.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                    >
                      <option value="MUNICIPALITÉ">Municipalité</option>
                      <option value="TRAVAUX">Travaux</option>
                      <option value="ÉVÉNEMENT">Événement</option>
                      <option value="CULTURE">Culture</option>
                      <option value="SANTÉ">Santé</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>STATUT DE PUBLICATION</label>
                    <select
                      value={editingNews.status || 'brouillon'}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                      <option value="brouillon">Brouillon</option>
                      <option value="publié">Publié</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>DATE D'AFFICHAGE *</label>
                    <input
                      type="text"
                      value={editingNews.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className={validationErrors.date ? 'input-error' : ''}
                      placeholder="Ex: 12 Mai 2026"
                    />
                    {validationErrors.date && (
                      <span className="error-text"><AlertCircle size={14} /> {validationErrors.date}</span>
                    )}
                  </div>
                </div>

                <div className="form-section-card">
                  <h5><ImageIcon size={18} /> IMAGE PRINCIPALE</h5>
                  <div className="media-upload-container">
                    <div className="upload-controls">
                      <label className="btn-modern-upload">
                        <ImageIcon size={28} /> 
                        <span>{imageFile ? imageFile.name : (editingNews.image ? 'Changer l\'illustration' : 'Sélectionner une illustration')}</span>
                        <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                        <span className="upload-hint">JPG, PNG ou WebP (max 5MB)</span>
                      </label>
                      {validationErrors.image && (
                        <span className="error-text"><AlertCircle size={14} /> {validationErrors.image}</span>
                      )}
                    </div>
                    {editingNews.image && (
                      <div className="modern-image-preview">
                        <img 
                          src={editingNews.image.startsWith('http') || editingNews.image.startsWith('/') ? editingNews.image : `${API_URL}${editingNews.image}`} 
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
              <button type="button" className="btn-modern-secondary" onClick={() => setEditingNews(null)}>
                Annuler
              </button>
              <button type="submit" className="btn-modern-primary" disabled={uploadingImage || Object.keys(validationErrors).length > 0}>
                {uploadingImage ? (
                  <>Patientez...</>
                ) : (
                  <>
                    <Save size={20} /> {(editingNews.id || editingNews._id) ? 'Mettre à jour' : 'Publier'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* News List */
        loading ? (
          <div className="loading-spinner">Chargement des actualités...</div>
        ) : (
          <div className="admin-projects-list">
            {news.length === 0 ? (
              <p className="no-projects">Aucune actualité enregistrée pour le moment.</p>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Titre</th>
                      <th>Catégorie</th>
                      <th>Statut</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {news.map((item) => (
                      <tr key={item.id || item._id}>
                        <td data-label="Image">
                          <div className="table-img-container">
                            <img 
                              src={item.image.startsWith('http') || item.image.startsWith('/') ? item.image : `${API_URL}${item.image}`} 
                              alt={item.title} 
                            />
                          </div>
                        </td>
                        <td data-label="Titre">
                          <span className="project-table-title">{item.title}</span>
                          <div className="project-table-loc line-clamp-1">{item.desc}</div>
                        </td>
                        <td data-label="Catégorie">
                          <span className="badge badge-category">{item.category}</span>
                        </td>
                        <td data-label="Statut">
                          <button 
                            className={`badge-status ${item.status === 'publié' ? 'success' : 'warning'}`}
                            onClick={() => handleToggleStatus(item)}
                            style={{ cursor: 'pointer', border: 'none' }}
                            title="Cliquez pour changer la visibilité"
                          >
                            {item.status === 'publié' ? 'Publié' : 'Brouillon'}
                          </button>
                        </td>
                        <td data-label="Date">
                          <div className="table-date"><Calendar size={12} /> {item.date}</div>
                        </td>
                        <td data-label="Actions">
                          <div className="action-buttons">
                            <button className="btn-action-edit" title="Modifier" onClick={() => handleEditClick(item)}>
                              <Edit3 size={16} />
                            </button>
                            <button className="btn-action-delete" title="Supprimer" onClick={() => handleDelete(item.id || item._id)}>
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

export default AdminActualites;
