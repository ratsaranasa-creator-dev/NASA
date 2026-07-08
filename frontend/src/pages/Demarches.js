import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, FileText, Users, Map, 
  ExternalLink, Download, Clock, Info, 
  CheckCircle, AlertCircle, X, ChevronRight,
  Baby, Heart, Landmark, Trash2, GraduationCap, 
  Construction, MapPin, CreditCard, ShieldCheck
} from 'lucide-react';
import '../styles/Demarches.css';

import { useDemarches } from '../context/DemarchesContext';
import { API_URL } from '../apiConfig';

const iconMap = {
  Search, FileText, Users, Map, 
  ExternalLink, Download, Clock, Info, 
  CheckCircle, AlertCircle, X, ChevronRight,
  Baby, Heart, Landmark, Trash2, GraduationCap, 
  Construction, MapPin, CreditCard, ShieldCheck
};

const getIcon = (name) => {
  const IconCmp = iconMap[name] || FileText;
  return <IconCmp size={24} />;
};

const Demarches = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [selectedDemarche, setSelectedDemarche] = useState(null);

  const categories = ["Tous", "État Civil", "Identité", "Vie Quotidienne", "Urbanisme"];

  const { demarches, loading, fetchDemarches } = useDemarches();

  useEffect(() => {
    fetchDemarches();
  }, [fetchDemarches]);

  const filteredDemarches = useMemo(() => {
    return demarches.filter(d => {
      const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (d.shortDesc && d.shortDesc.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === "Tous" || d.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [demarches, searchTerm, selectedCategory]);

  return (
    <div className="demarches-page">
      <section className="demarches-hero">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>Vos Démarches Administratives</h1>
          <p>Retrouvez toutes les informations, procédures et services en ligne pour faciliter votre quotidien à Dembéni.</p>
        </motion.div>
      </section>

      <div className="demarches-container">
        <div className="search-filter-bar">
          <div className="search-box">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher une démarche (ex: acte de naissance, permis...)" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <motion.div 
          layout
          className="demarches-grid"
        >
          <AnimatePresence>
            {filteredDemarches.map(demarche => (
              <motion.div
                key={demarche._id || demarche.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="demarche-card"
                onClick={() => setSelectedDemarche(demarche)}
              >
                <div className="demarche-icon">
                  {getIcon(demarche.iconName || 'FileText')}
                </div>
                <h3>{demarche.title}</h3>
                <p>{demarche.shortDesc}</p>
                <div className="demarche-footer">
                  <span className="category-badge">{demarche.category}</span>
                  <span className="read-more">Consulter <ChevronRight size={16} /></span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredDemarches.length === 0 && (
          <div className="no-results">
            <Info size={48} />
            <h3>Aucune démarche trouvée</h3>
            <p>Essayez d'ajuster vos critères de recherche ou de filtre.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedDemarche && (
          <div className="demarche-modal-overlay" onClick={() => setSelectedDemarche(null)}>
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="demarche-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setSelectedDemarche(null)}>
                <X size={24} />
              </button>

              <div className="modal-header">
                <span className="category-badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                  {selectedDemarche.category}
                </span>
                <h2>{selectedDemarche.title}</h2>
                <p>{selectedDemarche.shortDesc}</p>
              </div>

              <div className="modal-body">
                {selectedDemarche.fullContent.presentation && (
                  <div className="modal-section">
                    <h4><Info size={20} /> Présentation</h4>
                    <p>{selectedDemarche.fullContent.presentation}</p>
                  </div>
                )}

                {selectedDemarche.fullContent.steps && (
                  <div className="modal-section">
                    <h4><CheckCircle size={20} /> Procédure étape par étape</h4>
                    <div className="step-list">
                      {selectedDemarche.fullContent.steps.map((step, idx) => (
                        <div key={idx} className="step-item">
                          <div className="step-number">{idx + 1}</div>
                          <div>
                            <strong>{step.title}</strong>
                            <p>{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDemarche.fullContent.documents && (
                  <div className="modal-section">
                    <h4><FileText size={20} /> Pièces justificatives</h4>
                    <ul className="custom-list">
                      {selectedDemarche.fullContent.documents.map((doc, idx) => (
                        <li key={idx}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="info-grid">
                  {selectedDemarche.fullContent.delays && (
                    <div className="info-item">
                      <label><Clock size={14} /> Délai moyen</label>
                      <span>{selectedDemarche.fullContent.delays}</span>
                    </div>
                  )}
                  {selectedDemarche.fullContent.fees && (
                    <div className="info-item">
                      <label><CreditCard size={14} /> Tarifs</label>
                      <span>{selectedDemarche.fullContent.fees}</span>
                    </div>
                  )}
                </div>

                <div className="action-buttons">
                  {selectedDemarche.fullContent.onlineLink && (
                    <a href={selectedDemarche.fullContent.onlineLink} target="_blank" rel="noopener noreferrer" className="btn-primary-action">
                      Faire la démarche en ligne <ExternalLink size={18} />
                    </a>
                  )}
                  {selectedDemarche.fullContent.links?.map((link, idx) => (
                    <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="btn-primary-action">
                      {link.label} <ExternalLink size={18} />
                    </a>
                  ))}
                  {selectedDemarche.fullContent.externalLink && (
                    <a href={selectedDemarche.fullContent.externalLink} target="_blank" rel="noopener noreferrer" className="btn-primary-action">
                      Accéder au site officiel <ExternalLink size={18} />
                    </a>
                  )}
                  {selectedDemarche.fullContent.downloads?.map((dl, idx) => (
                    <a 
                      key={idx} 
                      href={dl.url.startsWith('http') ? dl.url : `${API_URL}${dl.url}`} 
                      className="btn-secondary-action"
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                    >
                      {dl.label} <Download size={18} />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Demarches;
