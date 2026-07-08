import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Calendar, TrendingUp, X, ArrowRight,
  Wallet, Clock, Users, Target, ChevronRight, Edit, Trash2, Share2, ChevronLeft
} from 'lucide-react';
import api, { API_URL } from '../apiConfig';
import { useAuth } from '../context/AuthContext';
import '../styles/ProjectsPage.css';
import img1 from '../images/001.jpg';
import img2 from '../images/002.jpg';
import img3 from '../images/003.jpg';
import img4 from '../images/004.jpg';
import heroImg from '../images/13.jpg';

export default function ProjectsPage() {
  const [query, setQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('Toutes');
  const [filterState, setFilterState] = useState('Tous');
  const [openFaq, setOpenFaq] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Get user from auth context

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/api/projects');
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setSelectedProject(null);
      }
    };

    if (selectedProject) {
      document.addEventListener('keydown', handleEscape);
    } else {
      document.removeEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [selectedProject]);

  const categories = ['Toutes', 'Infrastructures', 'Éducation', 'Environnement', 'Social', 'Urbanisme'];
  const states = ['Tous', 'En cours', 'À venir', 'Réalisé'];

  const filtered = projects.filter(p => {
    if (filterCategory !== 'Toutes' && p.category.toLowerCase() !== filterCategory.toLowerCase()) return false;
    if (filterState !== 'Tous' && p.status !== filterState) return false;
    if (query && !(p.title.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase()))) return false;
    return true;
  });

  const getProjectKey = (project) => project._id || project.id;

  const goToPreviousProject = () => {
    if (!selectedProject) return;
    const currentIndex = filtered.findIndex(p => getProjectKey(p) === getProjectKey(selectedProject));
    if (currentIndex > 0) {
      setSelectedProject(filtered[currentIndex - 1]);
    }
  };

  const goToNextProject = () => {
    if (!selectedProject) return;
    const currentIndex = filtered.findIndex(p => getProjectKey(p) === getProjectKey(selectedProject));
    if (currentIndex < filtered.length - 1) {
      setSelectedProject(filtered[currentIndex + 1]);
    }
  };

  const handleEditProject = (project) => {
    alert(`Modifier le projet: ${project.title}`);
    // TODO: Implement actual edit functionality (e.g., open an edit form)
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      try {
        await api.delete(`/api/projects/${projectId}`);
        // Refresh projects list or remove from state
        setSelectedProject(null); // Close modal
        alert('Projet supprimé avec succès !');
        // In a real app, you would refetch the projects list here
        // For now, we'll just close the modal and rely on a page refresh or state management
      } catch (error) {
        console.error('Erreur lors de la suppression du projet:', error);
        alert('Échec de la suppression du projet.');
      }
    }
  };

  return (
    <div className="projects-page">
      {/* HERO SECTION */}
      <section className="hero" style={{ backgroundImage: `url(${heroImg})` }}>
        <div className="hero-overlay" />
        <div className="hero-particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
        <div className="hero-inner">
          <span className="badge">✨ PROJETS COMMUNAUX</span>
          <h1 className="hero-title">Les projets de la commune de Dembéni</h1>
          <p className="hero-subtitle">Découvrez nos actions en cours, à venir et déjà accomplies pour un avenir durable et prospère.</p>
          <div className="hero-actions">
            <a href="#all-projects" className="btn primary-btn">
              <span>Voir les projets</span>
              <span className="icon">→</span>
            </a>
            <a href="#participation" className="btn secondary-btn">Participer à la vie locale</a>
          </div>
        </div>
      </section>

      {/* QUICK STATS */}
      <section className="quick-stats">
        <div className="stats-item">
          <div className="stat-number">45</div>
          <div className="stat-label">Projets lancés</div>
        </div>
        <div className="stats-item">
          <div className="stat-number">18.5M€</div>
          <div className="stat-label">Investis</div>
        </div>
        <div className="stats-item">
          <div className="stat-number">12</div>
          <div className="stat-label">En cours</div>
        </div>
        <div className="stats-item">
          <div className="stat-number">25+</div>
          <div className="stat-label">Réalisés</div>
        </div>
      </section>

      {/* FILTERS SECTION */}
      <section className="filters-section">
        <div className="container-filters">
          <div className="filter-wrapper">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                placeholder="Rechercher un projet..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-controls">
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="select-input">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={filterState} onChange={e => setFilterState(e.target.value)} className="select-input">
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="results-count">
              {filtered.length} projet{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </section>

      {/* PROJECTS GRID */}
      <section id="all-projects" className="projects-section">
        <div className="section-header">
          <h2>Tous les projets</h2>
          <p>Explorez les initiatives qui transforment notre commune</p>
        </div>

        {filtered.length > 0 ? (
          <div className="projects-grid">
            {filtered.map(p => (
              <article key={getProjectKey(p)} className="project-card" data-state={p.status}>
                <div className="card-image-wrapper">
                  <div className="card-image" style={{ backgroundImage: `url(${p.image.startsWith('http') ? p.image : `${API_URL}${p.image}`})` }}>
                    <div className="image-overlay"></div>
                  </div>
                  <span className={`state-badge state-${p.status.toLowerCase().replace(' ', '-')}`}>
                    {p.status}
                  </span>
                </div>

                <div className="card-content">
                  <h3 className="card-title">{p.title}</h3>
                  <p className="card-description">{p.description}</p>

                  {p.progress > 0 && (
                    <div className="progress-container">
                      <div className="progress-label">
                        <span>Avancement</span>
                        <span className="progress-value">{p.progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${p.progress}%` }}></div>
                      </div>
                    </div>
                  )}

                  <div className="card-footer">
                    <div className="card-meta">
                      <span className="category-tag">{p.category}</span>
                      <span className="date-tag">📅 {p.startDate}</span>
                    </div>
                    <span className="budget-badge">{p.budget}</span>
                  </div>

                  <button className="card-button" onClick={() => setSelectedProject(p)}>
                    Voir les détails <ArrowRight size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>Aucun projet trouvé</h3>
            <p>Essayez de modifier vos filtres pour voir d'autres projets.</p>
          </div>
        )}
      </section>

      {/* ========================= */}
      {/* PROJECT DETAIL MODAL      */}
      {/* ========================= */}
      <AnimatePresence>
        {selectedProject && (
          <div className="project-detail-overlay" onClick={() => setSelectedProject(null)}>
            <motion.div
              className="project-detail-modal"
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.95 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button className="detail-close-btn" onClick={() => setSelectedProject(null)}>
                <X size={24} />
              </button>

              {/* Navigation Buttons */}
              <div className="detail-navigation">
                <button
                  className="nav-btn prev"
                  onClick={goToPreviousProject}
                  disabled={filtered.indexOf(selectedProject) === 0}
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  className="nav-btn next"
                  onClick={goToNextProject}
                  disabled={filtered.indexOf(selectedProject) === filtered.length - 1}
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              {/* Hero Image Banner */}
              <div className="detail-hero" style={{ backgroundImage: `url(${selectedProject.image.startsWith('http') ? selectedProject.image : `${API_URL}${selectedProject.image}`})` }}>
                <div className="detail-hero-overlay" />
                <div className="detail-hero-content">
                  <span className={`detail-state-pill state-${selectedProject.status.toLowerCase().replace(' ', '-')}`}>
                    {selectedProject.status}
                  </span>
                  <h2>{selectedProject.title}</h2>
                  <div className="detail-hero-meta">
                    <span><MapPin size={16} /> {selectedProject.category}</span>
                    <span><Calendar size={16} /> {selectedProject.startDate}</span>
                    <span><Wallet size={16} /> {selectedProject.budget}</span>
                  </div>
                </div>
              </div>

              {/* Stats Strip */}
              <div className="detail-stats-strip">
                <div className="detail-stat-item">
                  <Wallet size={22} />
                  <div>
                    <span className="detail-stat-value">{selectedProject.budget}</span>
                    <span className="detail-stat-label">Budget alloué</span>
                  </div>
                </div>
                <div className="detail-stat-item">
                  <Clock size={22} />
                  <div>
                    <span className="detail-stat-value">{selectedProject.duration}</span>
                    <span className="detail-stat-label">Durée estimée</span>
                  </div>
                </div>
                <div className="detail-stat-item">
                  <Users size={22} />
                  <div>
                    <span className="detail-stat-value">{selectedProject.beneficiaries}</span>
                    <span className="detail-stat-label">Bénéficiaires</span>
                  </div>
                </div>
                <div className="detail-stat-item">
                  <TrendingUp size={22} />
                  <div>
                    <span className="detail-stat-value">{selectedProject.progress}%</span>
                    <span className="detail-stat-label">Avancement</span>
                  </div>
                </div>
              </div>

              {/* Content Body */}
              <div className="detail-body">
                {/* Main Description */}
                <section className="detail-section">
                  <h3><Target size={22} /> Présentation du projet</h3>
                  <div className="detail-section-content">
                    <p className="detail-full-desc">{selectedProject.fullDescription}</p>
                  </div>
                </section>

                {/* Objectives */}
                <section className="detail-section">
                  <h3><ChevronRight size={22} /> Objectifs clés</h3>
                  <div className="detail-section-content">
                    <div className="detail-objectives">
                      {selectedProject.objectives.map((obj, idx) => (
                        <motion.div
                          key={idx}
                          className="objective-item"
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <div className="objective-number">{idx + 1}</div>
                          <span>{obj}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Progress Bar */}
                <section className="detail-section">
                  <h3><TrendingUp size={22} /> Progression globale</h3>
                  <div className="detail-section-content">
                    <div className="detail-progress-block">
                      <div className="detail-progress-header">
                        <span>Avancement du projet</span>
                        <span className="detail-progress-pct">{selectedProject.progress}%</span>
                      </div>
                      <div className="detail-progress-bar">
                        <motion.div
                          className="detail-progress-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${selectedProject.progress}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Timeline */}
                <section className="detail-section">
                  <h3><Calendar size={22} /> Chronologie</h3>
                  <div className="detail-section-content">
                    <div className="detail-timeline">
                      {selectedProject.timeline.map((t, idx) => (
                        <motion.div
                          key={idx}
                          className={`timeline-step ${t.done ? 'done' : ''}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.12 }}
                        >
                          <div className="timeline-step-dot" />
                          <div className="timeline-step-content">
                            <strong>{t.phase}</strong>
                            <span>{t.period}</span>
                          </div>
                          {t.done && <span className="timeline-done-badge">✓ Terminé</span>}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Responsible */}
                <section className="detail-section detail-footer-info">
                  <h3><Users size={22} /> Responsable du projet</h3>
                  <div className="detail-section-content">
                    <div className="detail-manager">
                      <span className="manager-label">Responsable du projet</span>
                      <span className="manager-value">{selectedProject.manager}</span>
                    </div>
                  </div>
                </section>

                {/* Action Buttons */}
                {user && user.role === 'ADMIN' && (
                  <div className="detail-actions">
                    <button className="btn-action edit" onClick={() => handleEditProject(selectedProject)}><Edit size={18} /> Modifier</button>
                    <button className="btn-action delete" onClick={() => handleDeleteProject(getProjectKey(selectedProject))}><Trash2 size={18} /> Supprimer</button>
                    <button className="btn-action share" onClick={() => alert('Fonctionnalité de partage à implémenter')}><Share2 size={18} /> Partager</button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FEATURED PROJECT */}
      {projects.length > 0 && (
        <section className="featured-project">
          <div className="featured-container">
            <div className="featured-image" style={{ backgroundImage: `url(${projects[0].image.startsWith('http') ? projects[0].image : `${API_URL}${projects[0].image}`})` }}>
              <div className="featured-overlay"></div>
              <div className="featured-badge">🌟 PROJET PHARE</div>
            </div>
            <div className="featured-content">
              <h2>{projects[0].title}</h2>
              <p className="featured-description">{projects[0].description}</p>

              <div className="featured-stats">
                <div className="featured-stat">
                  <span className="stat-label">Budget</span>
                  <span className="stat-value">{projects[0].budget || 'N/A'}</span>
                </div>
                <div className="featured-stat">
                  <span className="stat-label">Durée</span>
                  <span className="stat-value">{projects[0].duration || 'N/A'}</span>
                </div>
                <div className="featured-stat">
                  <span className="stat-label">Bénéficiaires</span>
                  <span className="stat-value">{projects[0].beneficiaries || 'N/A'}</span>
                </div>
              </div>

              <div className="featured-progress">
                <div className="progress-header">
                  <span>Avancement du projet</span>
                  <span className="progress-percentage">{projects[0].progress || 0}%</span>
                </div>
                <div className="progress-bar large">
                  <div className="progress-fill" style={{ width: `${projects[0].progress || 0}%` }}></div>
                </div>
              </div>

              <button className="btn primary-btn" onClick={() => setSelectedProject(projects[0])}>
                <span>Découvrir le projet →</span>
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="stats">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="num">{projects.filter(p => p.status === 'En cours').length}</div>
            <div className="label">Projets en cours</div>
          </div>
          <div className="stat-card">
            <div className="num">{projects.filter(p => p.status === 'Terminé').length}</div>
            <div className="label">Projets réalisés</div>
          </div>
          <div className="stat-card">
            <div className="num">{projects.filter(p => p.status === 'À venir').length}</div>
            <div className="label">Projets à venir</div>
          </div>
          <div className="stat-card">
            <div className="num">
              {projects.reduce((acc, p) => {
                const val = parseFloat(p.budget?.replace(/[^\d.]/g, '') || 0);
                return acc + val;
              }, 0).toFixed(1)} M€
            </div>
            <div className="label">Budget total estimé</div>
          </div>
        </div>
      </section>

      <section className="gallery">
        <h3>Suivi en images</h3>
        <div className="gallery-row">
          {projects.slice(0, 4).map((p, i) => (
            <div
              key={i}
              className="img"
              style={{ backgroundImage: `url(${p.image.startsWith('http') ? p.image : `${API_URL}${p.image}`})` }}
            />
          ))}
          {projects.length === 0 && <p>Aucune image disponible.</p>}
        </div>
      </section>

      <section className="domains">
        <h3>Nos domaines d'intervention</h3>
        <div className="domains-grid">
          <div className="domain-card">Infrastructures</div>
          <div className="domain-card">Éducation</div>
          <div className="domain-card">Environnement</div>
          <div className="domain-card">Social & Cohésion</div>
        </div>
      </section>

      <section className="timeline">
        <h3>Nos grandes réalisations</h3>
        <div className="timeline-list">
          <div className="item"><div className="dot" /> <div className="content"><strong>2024</strong> Réhabilitation de la route principale</div></div>
          <div className="item"><div className="dot" /> <div className="content"><strong>2022</strong> Construction de l'école primaire</div></div>
          <div className="item"><div className="dot" /> <div className="content"><strong>2021</strong> Aménagement de parcs et jardins</div></div>
        </div>
      </section>

      <section id="participation" className="participation">
        <h3>Participez à la vie de votre commune</h3>
        <div className="participation-grid">
          <div className="part-card">Proposez un projet</div>
          <div className="part-card">Consulter les documents</div>
          <div className="part-card">Donner votre avis</div>
          <div className="part-card">Budget participatif</div>
        </div>
      </section>

      <section className="faq">
        <h3>Questions fréquentes</h3>
        <div className="faq-list">
          {[
            { q: 'Comment suivre l\'avancement d\'un projet ?', a: 'Chaque projet dispose d\'une page dédiée avec son état et ses documents.' },
            { q: 'Comment signaler un problème dans ma quartier ?', a: 'Contactez la mairie via la page contact ou utilisez l\'option participer.' }
          ].map((f, i) => (
            <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div className="q">{f.q}</div>
              <div className="a">{openFaq === i ? f.a : ''}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="newsletter">
        <div className="newsletter-inner">
          <h3>Restez informé des actualités et projets de Dembéni</h3>
          <div className="newsletter-form">
            <input placeholder="Votre adresse e-mail" />
            <button className="btn primary">S'abonner</button>
          </div>
        </div>
      </section>

    </div>
  );
}
