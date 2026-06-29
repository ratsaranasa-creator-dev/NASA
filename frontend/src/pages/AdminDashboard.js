import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Users, Clock, ShieldCheck, Layout, Folder, UserCheck, FileText, Newspaper, MapPin } from 'lucide-react';
import AdminCMS from '../components/CMS/AdminCMS';
import AdminProjects from '../components/AdminProjects';
import AdminDemarches from '../components/AdminDemarches';
import AdminUsers from '../components/AdminUsers';
import AdminActualites from '../components/AdminActualites';
import AdminCulture from '../components/AdminCulture';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingCitizens, setPendingCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchPendingCitizens();

    const handleToggle = () => setMobileMenuOpen(prev => !prev);
    document.addEventListener('toggleAdminSidebar', handleToggle);
    return () => document.removeEventListener('toggleAdminSidebar', handleToggle);
  }, []);

  // Close mobile menu when tab changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeTab]);

  const fetchPendingCitizens = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:5000/api/admin/pending-citizens', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingCitizens(data);
    } catch (error) {
      console.error('Error fetching citizens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/admin/citizen-status/${id}`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingCitizens(pendingCitizens.filter(c => c.id !== id));
    } catch (error) {
      alert('Erreur lors de la mise à jour');
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="admin-dashboard">
      <div 
        className={`sidebar-overlay ${mobileMenuOpen ? 'show' : ''}`} 
        onClick={() => setMobileMenuOpen(false)}
      ></div>

      <aside className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <ShieldCheck size={32} />
          <h3>Espace Admin</h3>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={activeTab === 'pending' ? 'active' : ''} 
            onClick={() => setActiveTab('pending')}
          >
            <UserCheck size={20} /> Citoyens en attente
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''} 
            onClick={() => setActiveTab('users')}
          >
            <Users size={20} /> Gestion des Comptes
          </button>
          <button 
            className={activeTab === 'cms' ? 'active' : ''} 
            onClick={() => setActiveTab('cms')}
          >
            <Layout size={20} /> Gestion du Contenu
          </button>
          <button 
            className={activeTab === 'projects' ? 'active' : ''} 
            onClick={() => setActiveTab('projects')}
          >
            <Folder size={20} /> Gestion des Projets
          </button>
          <button 
            className={activeTab === 'actualites' ? 'active' : ''} 
            onClick={() => setActiveTab('actualites')}
          >
            <Newspaper size={20} /> Gestion des Actualités
          </button>
          <button 
            className={activeTab === 'demarches' ? 'active' : ''} 
            onClick={() => setActiveTab('demarches')}
          >
            <FileText size={20} /> Gestion des Démarches
          </button>
          <button 
            className={activeTab === 'culture' ? 'active' : ''} 
            onClick={() => setActiveTab('culture')}
          >
            <MapPin size={20} /> Culture & Sport
          </button>
          <button 
            className={activeTab === 'history' ? 'active' : ''} 
            onClick={() => setActiveTab('history')}
          >
            <Clock size={20} /> Historique
          </button>
        </nav>
      </aside>

      <main className="admin-main">
        <AnimatePresence mode="wait">
          {activeTab === 'pending' && (
            <motion.div key="pending" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <header className="main-header">
                <h2>Validation des Citoyens</h2>
                <p>Vous avez {pendingCitizens.length} demande(s) en attente d'approbation.</p>
              </header>

              {loading ? (
                <div className="loader">Chargement...</div>
              ) : (
                <div className="citizen-grid">
                   {pendingCitizens.length === 0 ? (
                     <p className="no-data">Aucune demande en attente.</p>
                   ) : (
                     pendingCitizens.map((citizen, idx) => (
                       <motion.div 
                         key={citizen.id} 
                         className="citizen-card"
                         initial={{ opacity: 0, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         transition={{ delay: idx * 0.1, duration: 0.3 }}
                       >
                         <div className="citizen-info">
                           <h4>{citizen.firstName} {citizen.lastName}</h4>
                           <p>{citizen.email}</p>
                           <span className="status-badge pending">EN ATTENTE</span>
                         </div>
                         <div className="citizen-actions">
                           <button 
                             onClick={() => handleStatusUpdate(citizen.id, 'APPROVED')}
                             className="btn-approve"
                           >
                             <Check size={20} /> Accepter
                           </button>
                           <button 
                             onClick={() => handleStatusUpdate(citizen.id, 'REJECTED')}
                             className="btn-reject"
                           >
                             <X size={20} /> Refuser
                           </button>
                         </div>
                       </motion.div>
                     ))
                   )}
                 </div>
              )}
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div key="users" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <AdminUsers onRefreshNotification={fetchPendingCitizens} />
            </motion.div>
          )}

          {activeTab === 'cms' && (
            <motion.div key="cms" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <header className="main-header">
                <h2>Gestion du Contenu (CMS)</h2>
                <p>Modifiez les textes et images de toutes les pages du site facilement.</p>
              </header>
              <AdminCMS />
            </motion.div>
          )}

          {activeTab === 'projects' && (
            <motion.div key="projects" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <AdminProjects />
            </motion.div>
          )}
          
          {activeTab === 'actualites' && (
            <motion.div key="actualites" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <AdminActualites />
            </motion.div>
          )}

          {activeTab === 'demarches' && (
            <motion.div key="demarches" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <AdminDemarches />
            </motion.div>
          )}
          
          {activeTab === 'culture' && (
            <motion.div key="culture" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <AdminCulture />
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div key="history" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <header className="main-header">
                <h2>Historique des Actions</h2>
                <p>Historique complet des modifications et validations effectuées sur la plateforme.</p>
              </header>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminDashboard;
