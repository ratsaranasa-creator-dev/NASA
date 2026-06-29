import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Edit2, Trash2, 
  CheckCircle, Clock, AlertTriangle, 
  User, Calendar, BarChart3, FileText, X, Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemarches } from '../context/DemarchesContext';
import '../styles/AdminDemarches.css';

const AdminDemarches = () => {
  const { demarches, addDemarche, updateDemarche, deleteDemarche } = useDemarches();
  const [activeTab, setActiveTab] = useState('list'); 
  const [searchTerm, setSearchTerm] = useState('');
  
  // CRUD State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({
    title: '', category: 'État Civil', status: 'À jour', assignedTo: '', deadline: '', progress: 0, shortDesc: ''
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "À jour": return <span className="status-badge-green">À jour</span>;
      case "En révision": return <span className="status-badge-blue">En révision</span>;
      case "Obsolète": return <span className="status-badge-red">Obsolète</span>;
      default: return <span className="status-badge-gray">{status}</span>;
    }
  };

  const filteredDemarches = useMemo(() => {
    return demarches.filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [demarches, searchTerm]);

  const handleDelete = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette démarche ?")) {
      deleteDemarche(id);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData({ title: '', category: 'État Civil', status: 'À jour', assignedTo: '', deadline: '', progress: 0, shortDesc: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (demarche) => {
    setModalMode('edit');
    setFormData({ ...demarche });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === 'add') {
      addDemarche(formData);
    } else {
      updateDemarche(formData);
    }
    setIsModalOpen(false);
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
                      key={item.id}
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
                      <td>{getStatusBadge(item.status)}</td>
                      <td>
                        <div className="assignee">
                          <User size={14} /> {item.assignedTo || 'Non assigné'}
                        </div>
                      </td>
                      <td>
                        <div className="deadline">
                          <Calendar size={14} /> {item.deadline || 'Aucune'}
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
                          <button className="btn-icon red" title="Supprimer" onClick={() => handleDelete(item.id)}>
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
