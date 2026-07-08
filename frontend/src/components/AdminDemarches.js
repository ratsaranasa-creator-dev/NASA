import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, 
  CheckCircle, Clock, AlertTriangle, 
  User, Calendar, BarChart3, FileText, X, Save, Upload, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemarches } from '../context/DemarchesContext';
import { API_URL } from '../apiConfig';
import '../styles/AdminDemarches.css';

const AdminDemarches = () => {
  const { demarches, loading, fetchDemarches, addDemarche, updateDemarche, deleteDemarche, uploadFile } = useDemarches();
  const [activeTab, setActiveTab] = useState('list'); 
  const [searchTerm, setSearchTerm] = useState('');
  
  // CRUD State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({
    title: '', 
    category: 'État Civil', 
    status: 'publié', 
    assignedTo: '', 
    deadline: '', 
    progress: 0, 
    shortDesc: '',
    fullContent: {
      presentation: '',
      steps: [],
      documents: [],
      delays: '',
      fees: '',
      onlineLink: '',
      downloads: []
    }
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDemarches(true);
  }, [fetchDemarches]);

  const getStatusBadge = (item) => {
    const status = item.status;
    const handleToggle = async (e) => {
      e.stopPropagation();
      const newStatus = status === 'publié' ? 'brouillon' : 'publié';
      try {
        await updateDemarche(item._id || item.id, { ...item, status: newStatus });
      } catch (err) {
        console.error("Erreur toggle status:", err);
      }
    };

    switch (status) {
      case "À jour":
      case "publié": 
        return (
          <span 
            className="badge-status success" 
            onClick={handleToggle} 
            style={{ cursor: 'pointer' }}
            title="Cliquez pour passer en brouillon"
          >
            Publié
          </span>
        );
      case "En révision":
      case "brouillon": 
        return (
          <span 
            className="badge-status warning" 
            onClick={handleToggle} 
            style={{ cursor: 'pointer' }}
            title="Cliquez pour publier"
          >
            Brouillon
          </span>
        );
      case "Obsolète": 
        return (
          <span 
            className="badge-status danger" 
            onClick={handleToggle}
            style={{ cursor: 'pointer' }}
            title="Cliquez pour publier"
          >
            Obsolète
          </span>
        );
      default: 
        return (
          <span 
            className="badge-status info" 
            onClick={handleToggle}
            style={{ cursor: 'pointer' }}
          >
            {status}
          </span>
        );
    }
  };

  const filteredDemarches = useMemo(() => {
    return demarches.filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [demarches, searchTerm]);

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette démarche ? Cette action est irréversible.")) {
      await deleteDemarche(id);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      title: '', 
      category: 'État Civil', 
      status: 'publié', 
      assignedTo: '', 
      deadline: '', 
      progress: 0, 
      shortDesc: '',
      fullContent: {
        presentation: '',
        steps: [],
        documents: [],
        delays: '',
        fees: '',
        onlineLink: '',
        downloads: []
      }
    });
    setIsModalOpen(true);
  };

  const openEditModal = (demarche) => {
    setModalMode('edit');
    setFormData({ 
      ...demarche,
      deadline: demarche.deadline ? demarche.deadline.split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadFile(file);
      setFormData(prev => ({
        ...prev,
        fullContent: {
          ...prev.fullContent,
          downloads: [...(prev.fullContent.downloads || []), { label: result.label, url: result.url }]
        }
      }));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        await addDemarche(formData);
      } else {
        await updateDemarche(formData._id, formData);
      }
      setIsModalOpen(false);
    } catch (err) {
      // toast is already handled in context
    }
  };

  return (
    <div className="admin-demarches">
      <header className="main-header">
        <div className="header-info">
          <h2>Gestion des Démarches</h2>
          <p>Outil de suivi et de mise à jour des procédures administratives.</p>
        </div>
        <div className="header-actions">
          <button className="btn-reports" onClick={() => setActiveTab(activeTab === 'list' ? 'reports' : 'list')}>
            {activeTab === 'list' ? <BarChart3 size={18} /> : <FileText size={18} />}
            {activeTab === 'list' ? "Rapports d'audience" : "Liste des démarches"}
          </button>
          <button className="btn-add" onClick={openAddModal}>
            <Plus size={18} /> Nouvelle démarche
          </button>
        </div>
      </header>

      {activeTab === 'list' ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="admin-stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue"><FileText size={24} /></div>
              <div className="stat-content">
                <span className="stat-label">Total Démarches</span>
                <span className="stat-value">{demarches.length}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><CheckCircle size={24} /></div>
              <div className="stat-content">
                <span className="stat-label">À jour</span>
                <span className="stat-value">{demarches.filter(d => d.status === 'À jour').length}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange"><Clock size={24} /></div>
              <div className="stat-content">
                <span className="stat-label">En révision</span>
                <span className="stat-value">{demarches.filter(d => d.status === 'En révision').length}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon red"><AlertTriangle size={24} /></div>
              <div className="stat-content">
                <span className="stat-label">Obsolètes</span>
                <span className="stat-value">{demarches.filter(d => d.status === 'Obsolète').length}</span>
              </div>
            </div>
          </div>

          <div className="management-controls">
            <div className="search-bar">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Rechercher une démarche..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="tasks-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Démarche / Procédure</th>
                  <th>État</th>
                  <th>Assigné à</th>
                  <th>Échéance</th>
                  <th>Avancement</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredDemarches.length > 0 ? filteredDemarches.map(item => (
                    <motion.tr 
                      key={item._id || item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      layout
                    >
                      <td>
                        <div className="demarche-info">
                          <strong>{item.title}</strong>
                          <span>{item.category}</span>
                        </div>
                      </td>
                      <td>{getStatusBadge(item)}</td>
                      <td>
                        <div className="assignee">
                          <User size={14} /> {item.assignedTo || 'Non assigné'}
                        </div>
                      </td>
                      <td>
                        <div className="deadline">
                          <Calendar size={14} /> {item.deadline ? new Date(item.deadline).toLocaleDateString('fr-FR') : 'Aucune'}
                        </div>
                      </td>
                      <td>
                        <div className="progress-container">
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${item.progress}%` }}></div>
                          </div>
                          <span>{item.progress}%</span>
                        </div>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="btn-icon" title="Modifier" onClick={() => openEditModal(item)}>
                            <Edit2 size={16} />
                          </button>
                          <button className="btn-icon red" title="Supprimer" onClick={() => handleDelete(item._id || item.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>Aucune démarche trouvée.</td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        <motion.div className="audience-reports" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="report-grid">
            <div className="report-card main-chart">
              <h3>Consultations par démarche (Top 5)</h3>
              <div className="chart-placeholder">
                {[...demarches].sort((a,b) => (b.views || 0) - (a.views || 0)).slice(0, 5).map(d => (
                  <div key={d.id} className="chart-bar-row">
                    <span className="bar-label" title={d.title}>{d.title}</span>
                    <div className="bar-container">
                      <div className="bar-fill" style={{ width: `${((d.views || 0)/Math.max(...demarches.map(x=>x.views||1)))*100}%` }}></div>
                    </div>
                    <span className="bar-value">{d.views || 0} vues</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="report-card mini-stats">
              <h3>Répartition par catégorie</h3>
              <div className="pie-placeholder">
                <div className="pie-segment blue" style={{ flex: demarches.filter(d=>d.category==='État Civil').length || 1 }}>État Civil</div>
                <div className="pie-segment green" style={{ flex: demarches.filter(d=>d.category==='Vie Quotidienne').length || 1 }}>Vie Quotidienne</div>
                <div className="pie-segment orange" style={{ flex: demarches.filter(d=>d.category==='Urbanisme').length || 1 }}>Urbanisme</div>
                <div className="pie-segment gray" style={{ flex: demarches.filter(d=>d.category==='Identité').length || 1 }}>Identité</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* CRUD Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
            <motion.div 
              className="admin-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-modal-header">
                <h3>{modalMode === 'add' ? 'Créer une nouvelle démarche' : 'Modifier la démarche'}</h3>
                <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="admin-modal-body">
                <div className="form-group">
                  <label>Titre de la démarche</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="Ex: Demande de passeport..."
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Catégorie</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      <option>État Civil</option>
                      <option>Identité</option>
                      <option>Vie Quotidienne</option>
                      <option>Urbanisme</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Statut</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option>À jour</option>
                      <option>En révision</option>
                      <option>Obsolète</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description courte (Affichée au public)</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.shortDesc} 
                    onChange={e => setFormData({...formData, shortDesc: e.target.value})}
                    placeholder="Ex: Permet de faire la demande de passeport..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Assigné à</label>
                    <input 
                      type="text" 
                      value={formData.assignedTo} 
                      onChange={e => setFormData({...formData, assignedTo: e.target.value})}
                      placeholder="Ex: M. Dubois"
                    />
                  </div>
                  <div className="form-group">
                    <label>Échéance de révision</label>
                    <input 
                      type="date" 
                      value={formData.deadline} 
                      onChange={e => setFormData({...formData, deadline: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Avancement de la révision ({formData.progress}%)</label>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={formData.progress} 
                    onChange={e => setFormData({...formData, progress: parseInt(e.target.value)})}
                  />
                </div>

                <div className="form-group">
                  <label>Présentation (Détails complets)</label>
                  <textarea 
                    value={formData.fullContent?.presentation || ''} 
                    onChange={e => setFormData({
                      ...formData, 
                      fullContent: { ...formData.fullContent, presentation: e.target.value }
                    })}
                    placeholder="Texte complet de présentation..."
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label>Documents à télécharger (PDF, JPG, PNG)</label>
                  <div className="upload-zone">
                    <input 
                      type="file" 
                      id="file-upload" 
                      onChange={handleFileUpload} 
                      disabled={uploading}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="file-upload" className="btn-upload">
                      {uploading ? <Clock className="animate-spin" size={18} /> : <Upload size={18} />}
                      {uploading ? 'Téléchargement...' : 'Ajouter un document'}
                    </label>
                  </div>
                  <div className="uploaded-files">
                    {formData.fullContent?.downloads?.map((file, idx) => (
                      <div key={idx} className="file-tag">
                        <FileText size={14} />
                        <span>{file.label}</span>
                        <button 
                          type="button" 
                          onClick={() => {
                            const newDownloads = [...formData.fullContent.downloads];
                            newDownloads.splice(idx, 1);
                            setFormData({
                              ...formData,
                              fullContent: { ...formData.fullContent, downloads: newDownloads }
                            });
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="admin-modal-footer">
                  <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Annuler</button>
                  <button type="submit" className="btn-save">
                    <Save size={18} /> {modalMode === 'add' ? 'Créer' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDemarches;
