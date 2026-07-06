import React, { useState, useEffect, useCallback } from 'react';
import api, { API_URL } from '../apiConfig';
import { Plus, Edit3, Trash2, Save, X, AlertCircle, CheckCircle2, Image as ImageIcon, MapPin, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

import '../styles/AdminProjects.css';

const AdminCulture = () => {
  const { user } = useAuth();
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStructure, setEditingStructure] = useState(null); 
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const fetchStructures = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/culture');
      setStructures(data);
    } catch (error) {
      console.error('Error fetching structures:', error);
      toast.error('Erreur lors de la récupération des structures');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStructures();
  }, [fetchStructures]);

  const validateField = (name, value) => {
    let errors = { ...validationErrors };
    
    switch (name) {
      case 'nom':
        if (!value) errors.nom = 'Le nom est obligatoire.';
        else delete errors.nom;
        break;
      case 'description':
        if (!value) errors.description = 'La description est obligatoire.';
        else delete errors.description;
        break;
      case 'adresse':
        if (!value) errors.adresse = 'L\'adresse est obligatoire.';
        else delete errors.adresse;
        break;
      case 'horaires':
        if (!value) errors.horaires = 'Les horaires sont obligatoires.';
        else delete errors.horaires;
        break;
      default:
        break;
    }
    
    setValidationErrors(errors);
  };

  const handleInputChange = (name, value) => {
    setEditingStructure({ ...editingStructure, [name]: value });
    validateField(name, value);
  };

  const handleEditClick = (structure) => {
    setEditingStructure(structure);
    setImageFile(null);
    setPreviewUrl(null);
    setValidationErrors({});
  };

  const handleCreateClick = () => {
    setEditingStructure({
      nom: '',
      description: '',
      adresse: '',
      horaires: '',
      modalite_acces: '',
      icone: 'MapPin',
      image: '',
      actif: true
    });
    setImageFile(null);
    setPreviewUrl(null);
    setValidationErrors({});
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype || file.type)) {
        toast.warning('Veuillez sélectionner une image valide (JPG, PNG, WebP).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.warning('L\'image ne doit pas dépasser 5 Mo.');
        return;
      }
      // Revoke previous preview URL to avoid memory leaks
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      // Create local preview
      const localUrl = URL.createObjectURL(file);
      setImageFile(file);
      setPreviewUrl(localUrl);
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.image;
        return newErrors;
      });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // 1. Validate required fields
    if (!editingStructure.nom || !editingStructure.description || !editingStructure.adresse || !editingStructure.horaires) {
      toast.error('Tous les champs obligatoires (*) doivent être remplis.');
      return;
    }

    if (Object.keys(validationErrors).length > 0) {
      toast.error('Veuillez corriger les erreurs avant d\'enregistrer.');
      return;
    }

    setUploadingImage(true);

    try {
      // 2. Upload image first if a new file was selected
      let imageUrl = editingStructure.image || '';
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        try {
          const uploadRes = await api.post('/api/culture/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          imageUrl = uploadRes.data.url;
        } catch (uploadError) {
          console.error('Image upload error:', uploadError.response?.data || uploadError.message);
          toast.error(`Erreur upload image: ${uploadError.response?.data?.message || 'Erreur lors du téléchargement'}`);
          setUploadingImage(false);
          return;
        }
      }

      // 3. Save the structure with the image URL
      const payload = {
        ...editingStructure,
        image: imageUrl
      };

      if (editingStructure.id || editingStructure._id) {
        await api.put(`/api/culture/${editingStructure.id || editingStructure._id}`, payload);
        toast.success('Structure mise à jour avec succès.');
      } else {
        await api.post('/api/culture', payload);
        toast.success('Structure créée et publiée avec succès.');
      }

      setEditingStructure(null);
      setImageFile(null);
      setPreviewUrl(null);
      fetchStructures();
      window.scrollTo(0, 0);

    } catch (error) {
      console.error('Save error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Une erreur est survenue lors de l\'enregistrement.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette structure ? Cette action est irréversible.')) return;

    try {
      await api.delete(`/api/culture/${id}`);
      toast.success('Structure supprimée avec succès.');
      fetchStructures();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression.');
    }
  };

  const handleToggleActive = async (structure) => {
    try {
      const newStatus = !structure.actif;
      await api.put(`/api/culture/${structure.id || structure._id}`, { actif: newStatus });
      toast.info(`Structure ${newStatus ? 'affichée' : 'masquée'} sur le site public.`);
      fetchStructures();
    } catch (error) {
      toast.error('Erreur lors du changement de statut.');
    }
  };

  if (user?.role !== 'ADMIN') {
    return <div className="forbidden-msg">Accès réservé exclusivement à l'administrateur.</div>;
  }

  return (
    <div className="admin-projects-panel">
      {/* Page Header */}
      {!editingStructure && (
        <div className="panel-header">
          <div>
            <h3>Culture, Sport & Loisirs</h3>
            <p>Gérez les structures et équipements de la commune.</p>
          </div>
          <button className="btn-add-project" onClick={handleCreateClick}>
            <Plus size={18} /> Nouvelle Structure
          </button>
        </div>
      )}

      {/* Form View */}
      {editingStructure ? (
        <div className="project-form-container">
          <div className="form-header-modern">
            <div className="header-info">
              <MapPin className="header-icon" />
              <div>
                <h4>{(editingStructure.id || editingStructure._id) ? 'Modifier la structure' : 'Créer une nouvelle structure'}</h4>
                <p>Renseignez les détails pour l'affichage public.</p>
              </div>
            </div>
            <button className="btn-back" onClick={() => setEditingStructure(null)}>
              <X size={20} /> <span>Fermer</span>
            </button>
          </div>

          <form onSubmit={handleSave} className="modern-project-form">
            <div className="form-sections-grid">
              <div className="form-column">
                <div className="form-section-card details-card">
                  <h5><Edit3 size={18} /> INFORMATIONS PRINCIPALES</h5>
                  <div className="form-group">
                    <label>NOM DE LA STRUCTURE *</label>
                    <input
                      type="text"
                      value={editingStructure.nom}
                      onChange={(e) => handleInputChange('nom', e.target.value)}
                      className={validationErrors.nom ? 'input-error' : ''}
                      placeholder="Ex: Médiathèque Municipale..."
                    />
                    {validationErrors.nom && <span className="error-text">{validationErrors.nom}</span>}
                  </div>

                  <div className="form-group">
                    <label>DESCRIPTION *</label>
                    <textarea
                      value={editingStructure.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className={validationErrors.description ? 'input-error' : ''}
                      placeholder="Présentation courte..."
                      rows={4}
                    />
                    {validationErrors.description && <span className="error-text">{validationErrors.description}</span>}
                  </div>

                  <div className="form-group">
                    <label>MODALITÉS D'ACCÈS</label>
                    <input
                      type="text"
                      value={editingStructure.modalite_acces}
                      onChange={(e) => handleInputChange('modalite_acces', e.target.value)}
                      placeholder="Ex: Gratuit pour les résidents, sur réservation..."
                    />
                  </div>
                </div>
              </div>

              <div className="form-column">
                <div className="form-section-card">
                  <h5><Clock size={18} /> INFOS PRATIQUES</h5>
                  <div className="form-group">
                    <label>ADRESSE PHYSIQUE *</label>
                    <input
                      type="text"
                      value={editingStructure.adresse}
                      onChange={(e) => handleInputChange('adresse', e.target.value)}
                      className={validationErrors.adresse ? 'input-error' : ''}
                      placeholder="Ex: 15 Rue de l'Hôtel de Ville..."
                    />
                    {validationErrors.adresse && <span className="error-text">{validationErrors.adresse}</span>}
                  </div>

                  <div className="form-group">
                    <label>HORAIRES D'OUVERTURE *</label>
                    <input
                      type="text"
                      value={editingStructure.horaires}
                      onChange={(e) => handleInputChange('horaires', e.target.value)}
                      className={validationErrors.horaires ? 'input-error' : ''}
                      placeholder="Ex: Lundi-Vendredi: 8h-18h..."
                    />
                    {validationErrors.horaires && <span className="error-text">{validationErrors.horaires}</span>}
                  </div>
                  
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginTop: '10px' }}>
                      <input
                        type="checkbox"
                        checked={editingStructure.actif}
                        onChange={(e) => handleInputChange('actif', e.target.checked)}
                        style={{ marginRight: '10px', width: '18px', height: '18px' }}
                      />
                      <span>Visible sur le site public</span>
                    </label>
                  </div>
                </div>

                <div className="form-section-card">
                  <h5><ImageIcon size={18} /> IMAGE ILLUSTRATIVE</h5>
                  <div className="media-upload-container">
                    <div className="upload-controls">
                      <label className="btn-modern-upload">
                        <ImageIcon size={28} /> 
                        <span>{imageFile ? imageFile.name : (editingStructure.image ? 'Changer l\'image' : 'Sélectionner une image (Optionnel)')}</span>
                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} style={{ display: 'none' }} />
                        <span className="upload-hint">JPG, PNG ou WebP (max 5MB)</span>
                      </label>
                      {validationErrors.image && <span className="error-text"><AlertCircle size={14} /> {validationErrors.image}</span>}
                    </div>
                    {/* Show local preview if a new file is selected, otherwise show existing image */}
                    {(previewUrl || editingStructure.image) && (
                      <div className="modern-image-preview">
                        <img 
                          src={previewUrl || (editingStructure.image.startsWith('http') ? editingStructure.image : `${API_URL}${editingStructure.image.startsWith('/') ? '' : '/'}${editingStructure.image}`)} 
                          alt="Prévisualisation" 
                        />
                        <div className="image-overlay-info">
                          {previewUrl ? 'Nouvelle image sélectionnée (pas encore enregistrée)' : 'Image actuelle'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions-modern">
              <button type="button" className="btn-modern-secondary" onClick={() => setEditingStructure(null)}>
                Annuler
              </button>
              <button type="submit" className="btn-modern-primary" disabled={uploadingImage || Object.keys(validationErrors).length > 0}>
                {uploadingImage ? 'Patientez...' : <><Save size={20} /> Enregistrer</>}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Structures List */
        loading ? (
          <div className="loading-spinner">Chargement des structures...</div>
        ) : (
          <div className="admin-projects-list">
            {structures.length === 0 ? (
              <p className="no-projects">Aucune structure enregistrée pour le moment.</p>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Nom</th>
                      <th>Adresse & Horaires</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {structures.map((item) => (
                      <tr key={item.id || item._id} className={!item.actif ? 'row-inactive' : ''}>
                        <td data-label="Image">
                          <div className="table-img-container">
                            {item.image ? (
                              <img 
                                src={item.image.startsWith('http') ? item.image : `${API_URL}${item.image.startsWith('/') ? '' : '/'}${item.image}`} 
                                alt={item.nom} 
                              />
                            ) : (
                              <div className="no-image-placeholder"><MapPin size={24} color="#aaa" /></div>
                            )}
                          </div>
                        </td>
                        <td data-label="Nom">
                          <span className="project-table-title">{item.nom}</span>
                          <div className="project-table-loc line-clamp-1">{item.description}</div>
                        </td>
                        <td data-label="Infos">
                          <div className="table-date"><MapPin size={12} /> {item.adresse}</div>
                          <div className="table-date" style={{marginTop:'4px'}}><Clock size={12} /> {item.horaires}</div>
                        </td>
                        <td data-label="Statut">
                          <button 
                            onClick={() => handleToggleActive(item)}
                            className={`badge-status ${item.actif ? 'success' : 'danger'}`}
                            style={{ cursor: 'pointer', border: 'none', padding: '5px 10px', borderRadius: '4px' }}
                            title="Cliquez pour changer la visibilité"
                          >
                            {item.actif ? 'Visible' : 'Masqué'}
                          </button>
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

export default AdminCulture;
